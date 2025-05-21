import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { GalleryPhoto, CustomTag } from "@/types/gallery";
import { OrderTag, SettingItem } from "@/types";
import { dataService } from "@/services";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { X, Upload, Loader } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { currentMode } from "@/services";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertTitle } from "@/components/ui/alert";

interface PhotoUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPhotoUploaded: () => void;
}

// Form schema for validation
const photoUploadSchema = z.object({
  imageFile: z.instanceof(File).optional(),
  imageUrl: z.string().min(1, "Image is required"),
  cakeShape: z.string().min(1, "Cake shape is required"),
  cakeSize: z.string().min(1, "Cake size is required"),
  cakeFlavor: z.string().min(1, "Cake flavor is required"),
  cakeDesign: z.string().min(1, "Design description is required"),
  customerName: z.string().optional(),
  tags: z.array(z.string())
});

type PhotoUploadFormValues = z.infer<typeof photoUploadSchema>;

const PhotoUploadDialog = ({ open, onOpenChange, onPhotoUploaded }: PhotoUploadDialogProps) => {
  const { toast } = useToast();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState<string>("");
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Form definition
  const form = useForm<PhotoUploadFormValues>({
    resolver: zodResolver(photoUploadSchema),
    defaultValues: {
      imageUrl: "",
      cakeShape: "",
      cakeSize: "",
      cakeFlavor: "",
      cakeDesign: "",
      customerName: "",
      tags: []
    }
  });

  // Fetch available cake options from settings
  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: () => dataService.settings.getAll()
  });

  // Extract shape, size, and flavor settings from the settings data
  const cakeShapes = settingsData?.cakeShapes || [];
  const cakeSizes = settingsData?.cakeSizes || [];
  const cakeFlavors = settingsData?.cakeFlavors || [];

  // Fetch all available tags
  const { data: allTags = [] } = useQuery({
    queryKey: ['galleryTags'],
    queryFn: () => dataService.gallery.getAllTags()
  });

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Reset any previous errors
    setUploadError(null);
    
    // Validate file size
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setUploadError(`File is too large. Maximum size is ${maxSize / (1024 * 1024)}MB`);
      event.target.value = '';
      return;
    }
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Invalid file type. Only JPEG, PNG, WebP, and GIF are supported');
      event.target.value = '';
      return;
    }
    
    // Store the file in the form
    form.setValue("imageFile", file);
    
    // Generate preview using object URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewImage(objectUrl);
    
    // In mock mode, we'll create a data URL as before
    // In Supabase mode, we'll upload the file only on form submission
    if (currentMode === 'mock') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        form.setValue("imageUrl", dataUrl);
      };
      reader.readAsDataURL(file);
    } else {
      // Just set a temporary value here, real URL will be set after upload
      form.setValue("imageUrl", "pending-upload");
    }
  };

  // Handle tag selection
  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      const updatedTags = [...selectedTags, tag];
      setSelectedTags(updatedTags);
      form.setValue("tags", updatedTags);
    }
  };

  const removeTag = (tag: string) => {
    const updatedTags = selectedTags.filter(t => t !== tag);
    setSelectedTags(updatedTags);
    form.setValue("tags", updatedTags);
  };

  // Handle new tag creation
  const handleCreateTag = async () => {
    if (!newTagInput.trim()) return;
    
    try {
      const createdTag = await dataService.gallery.createCustomTag(newTagInput.trim());
      addTag(createdTag.value);
      setNewTagInput("");
      // Use the toast object directly
      toast({
        title: "Tag created successfully",
        variant: "default",
      });
    } catch (error) {
      // Use the toast object directly
      toast({
        title: "Failed to create tag",
        variant: "destructive",
      });
    }
  };

  // Form submission handler
  const onSubmit = async (data: PhotoUploadFormValues) => {
    setIsUploading(true);
    setUploadError(null);
    
    try {
      let finalImageUrl = data.imageUrl;
      
      // If we have a file, upload it
      if (data.imageFile) {
        const imageFile = data.imageFile;
        
        try {
          // For Supabase mode, use the uploadImage method
          const galleryRepo = dataService.gallery as any;
          
          if (galleryRepo.uploadImage) {
            // Update progress as the upload proceeds
            finalImageUrl = await galleryRepo.uploadImage(
              imageFile, 
              (progress) => {
                setUploadProgress(progress);
              }
            );
          } else {
            // Fallback to mock mode behavior
            finalImageUrl = data.imageUrl;
            setUploadProgress(100);
          }
        } catch (error) {
          setUploadError(error instanceof Error ? error.message : 'Failed to upload image');
          console.error('Image upload error:', error);
          setIsUploading(false);
          return;
        }
      }
      
      // Create gallery photo object and convert string tags to OrderTag type
      const photo: Omit<GalleryPhoto, 'id' | 'orderId' | 'createdAt'> = {
        imageUrl: finalImageUrl,
        tags: data.tags as OrderTag[], // Type assertion since OrderTag is a string literal type
        orderInfo: {
          cakeShape: data.cakeShape,
          cakeSize: data.cakeSize,
          cakeFlavor: data.cakeFlavor,
          cakeDesign: data.cakeDesign,
          customerName: data.customerName || undefined
        },
      };
      
      // Send to service
      await dataService.gallery.addPhoto(photo);
      
      toast({
        title: "Photo uploaded successfully!",
        variant: "default",
      });
      onPhotoUploaded();
      handleClose();
    } catch (error) {
      console.error("Error uploading photo:", error);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload photo');
      toast({
        title: "Failed to upload photo",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Reset form state when dialog is closed
  const handleClose = () => {
    form.reset();
    setSelectedTags([]);
    setPreviewImage(null);
    setUploadProgress(0);
    setUploadError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={open => open ? null : handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Cake Photo</DialogTitle>
          <DialogDescription>
            Add a new cake design photo to the gallery
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Image Upload */}
            <div className="space-y-2">
              <FormLabel>Cake Image</FormLabel>
              <div className="flex items-center gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => imageInputRef.current?.click()}
                  className="flex items-center gap-2"
                  disabled={isUploading}
                >
                  <Upload className="h-4 w-4" />
                  Choose Image
                </Button>
                <Input 
                  ref={imageInputRef}
                  type="file" 
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isUploading}
                />
                <p className="text-xs text-muted-foreground">
                  Max 10MB (JPEG, PNG, WebP, GIF)
                </p>
              </div>
              
              {uploadError && (
                <Alert variant="destructive" className="mt-2">
                  <AlertTitle>{uploadError}</AlertTitle>
                </Alert>
              )}
              
              {previewImage && (
                <div className="mt-2 relative">
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    className="max-h-40 max-w-full rounded-md object-cover" 
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => {
                      setPreviewImage(null);
                      form.setValue("imageUrl", "");
                      form.unregister("imageFile");
                      setUploadProgress(0);
                      setUploadError(null);
                    }}
                    disabled={isUploading}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              
              {/* Upload Progress Bar */}
              {uploadProgress > 0 && (
                <div className="w-full space-y-1">
                  <Progress 
                    value={uploadProgress} 
                    className="h-2" 
                    aria-label="Upload progress"
                  />
                  <p className="text-xs text-right text-muted-foreground">
                    {uploadProgress === 100 ? 'Upload complete' : `Uploading: ${uploadProgress}%`}
                  </p>
                </div>
              )}
            </div>

            {/* Cake Shape */}
            <FormField
              control={form.control}
              name="cakeShape"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cake Shape</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={isUploading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select cake shape" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cakeShapes.map((shape: SettingItem) => (
                        <SelectItem key={shape.id} value={shape.value}>
                          {shape.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cake Size */}
            <FormField
              control={form.control}
              name="cakeSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cake Size</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={isUploading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select cake size" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cakeSizes.map((size: SettingItem) => (
                        <SelectItem key={size.id} value={size.value}>
                          {size.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cake Flavor */}
            <FormField
              control={form.control}
              name="cakeFlavor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cake Flavor</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={isUploading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select cake flavor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cakeFlavors.map((flavor: SettingItem) => (
                        <SelectItem key={flavor.id} value={flavor.value}>
                          {flavor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cake Design */}
            <FormField
              control={form.control}
              name="cakeDesign"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Design Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the cake design" 
                      {...field}
                      disabled={isUploading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Customer Name (Optional) */}
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Customer name" 
                      {...field}
                      disabled={isUploading}
                    />
                  </FormControl>
                  <FormDescription>
                    Only include if you want to credit a specific customer
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tags Section */}
            <div className="space-y-2">
              <FormLabel>Tags</FormLabel>
              
              {/* Selected Tags */}
              <div className="flex flex-wrap gap-2">
                {selectedTags.map(tag => (
                  <Badge 
                    key={tag} 
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {tag.replace(/-/g, ' ')}
                    <button
                      type="button"
                      className="ml-1 rounded-full hover:bg-muted"
                      onClick={() => removeTag(tag)}
                      disabled={isUploading}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              
              {/* Available Tags */}
              <div className="mt-2">
                <div className="text-sm font-medium mb-1">Available Tags:</div>
                <div className="flex flex-wrap gap-2">
                  {allTags
                    .filter(tag => !selectedTags.includes(tag.value))
                    .map(tag => (
                      <Badge 
                        key={tag.id} 
                        variant="outline"
                        className={`cursor-pointer hover:bg-secondary ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                        onClick={() => !isUploading && addTag(tag.value)}
                      >
                        {tag.label}
                      </Badge>
                    ))
                  }
                </div>
              </div>
              
              {/* Create New Tag */}
              <div className="flex items-center gap-2 mt-2">
                <Input 
                  placeholder="New tag name" 
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  className="flex-1"
                  disabled={isUploading}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={handleCreateTag}
                  disabled={!newTagInput.trim() || isUploading}
                >
                  Add
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isUploading || !form.formState.isValid || !previewImage}
                className="flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : "Upload Photo"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PhotoUploadDialog;
