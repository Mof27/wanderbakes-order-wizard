
import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { GalleryPhoto, CustomTag } from "@/types/gallery";
import { dataService } from "@/services";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { X, Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface PhotoUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPhotoUploaded: () => void;
}

// Form schema for validation
const photoUploadSchema = z.object({
  imageUrl: z.string().min(1, "Image URL is required"),
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
  const { data: cakeShapes = [] } = useQuery({
    queryKey: ['cakeShapes'],
    queryFn: () => dataService.settings.getShapes()
  });

  const { data: cakeSizes = [] } = useQuery({
    queryKey: ['cakeSizes'],
    queryFn: () => dataService.settings.getSizes()
  });

  const { data: cakeFlavors = [] } = useQuery({
    queryKey: ['cakeFlavors'],
    queryFn: () => dataService.settings.getFlavors()
  });

  // Fetch all available tags
  const { data: allTags = [] } = useQuery({
    queryKey: ['galleryTags'],
    queryFn: () => dataService.gallery.getAllTags()
  });

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Here we would typically upload to a storage service
    // But for this demo, we'll create a data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreviewImage(dataUrl);
      form.setValue("imageUrl", dataUrl);
    };
    reader.readAsDataURL(file);
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
      toast.success("Tag created successfully");
    } catch (error) {
      toast.error("Failed to create tag");
    }
  };

  // Form submission handler
  const onSubmit = async (data: PhotoUploadFormValues) => {
    setIsUploading(true);
    
    try {
      // Create gallery photo object
      const photo: Omit<GalleryPhoto, 'id' | 'orderId' | 'createdAt'> = {
        imageUrl: data.imageUrl,
        tags: data.tags,
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
      
      toast.success("Photo uploaded successfully!");
      onPhotoUploaded();
      handleClose();
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast.error("Failed to upload photo");
    } finally {
      setIsUploading(false);
    }
  };

  // Reset form state when dialog is closed
  const handleClose = () => {
    form.reset();
    setSelectedTags([]);
    setPreviewImage(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                >
                  <Upload className="h-4 w-4" />
                  Choose Image
                </Button>
                <Input 
                  ref={imageInputRef}
                  type="file" 
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
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
                    size="icon-xs"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setPreviewImage(null);
                      form.setValue("imageUrl", "");
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
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
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select cake shape" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cakeShapes.map(shape => (
                        <SelectItem key={shape.value} value={shape.value}>
                          {shape.label}
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
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select cake size" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cakeSizes.map(size => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label}
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
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select cake flavor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cakeFlavors.map(flavor => (
                        <SelectItem key={flavor.value} value={flavor.value}>
                          {flavor.label}
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
                        className="cursor-pointer hover:bg-secondary"
                        onClick={() => addTag(tag.value)}
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
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={handleCreateTag}
                  disabled={!newTagInput.trim()}
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
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isUploading || !form.formState.isValid || !previewImage}
              >
                {isUploading ? "Uploading..." : "Upload Photo"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PhotoUploadDialog;
