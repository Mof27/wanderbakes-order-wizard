import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { dataService } from '@/services';
import { OrderTag } from '@/types';
import { AlertCircle, Upload, Check, Loader2, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PhotoUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPhotoUploaded?: () => void;
}

const PhotoUploadDialog = ({
  open,
  onOpenChange,
  onPhotoUploaded,
}: PhotoUploadDialogProps) => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [tags, setTags] = useState<OrderTag[]>([]);
  const [isTagInputActive, setIsTagInputActive] = useState(false);
  const [tagInputValue, setTagInputValue] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Using a simpler check since dataService.auth doesn't exist
        // This could be replaced with actual auth check once implemented
        setIsAuthenticated(true); // Default to true for now
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsAuthenticated(false);
      }
    };
    
    if (open) {
      checkAuth();
    }
  }, [open]);

  // Reset state when dialog is opened/closed
  useEffect(() => {
    if (!open) {
      // Reset state after dialog closes with a small delay
      const timer = setTimeout(() => {
        setFile(null);
        setPreviewUrl(null);
        setUploadProgress(0);
        setTags([]);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Fetch available tags
  const { data: availableTags = [] } = useQuery({
    queryKey: ['galleryTags'],
    queryFn: () => dataService.gallery.getAllTags(),
    staleTime: 60000, // 1 minute
    enabled: open, // Only fetch when dialog is open
  });

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file size
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Please select an image under 10MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(selectedFile.type)) {
      toast({
        title: "Invalid file type",
        description: "Please select a JPG, PNG, WebP or GIF image",
        variant: "destructive",
      });
      return;
    }

    // Create a preview
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    setFile(selectedFile);

    // Cleanup the object URL when done
    return () => URL.revokeObjectURL(objectUrl);
  };

  // Handle tag input
  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInputValue(e.target.value);
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInputValue.trim()) {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Escape') {
      setIsTagInputActive(false);
      setTagInputValue('');
    }
  };

  const addTag = () => {
    if (!tagInputValue.trim()) return;
    
    // Convert input to tag format (lowercase-with-dashes)
    const newTag = tagInputValue.trim().toLowerCase().replace(/\s+/g, '-') as OrderTag;
    
    // Check if tag already exists
    if (!tags.includes(newTag)) {
      setTags([...tags, newTag]);
    }
    
    // Clear input
    setTagInputValue('');
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Select a tag from available tags
  const handleSelectTag = (tag: OrderTag) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    } else {
      removeTag(tag);
    }
  };

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error('No file selected');
      
      // First upload the image
      const imageUrl = await dataService.gallery.uploadImage(
        file, 
        (progress) => setUploadProgress(progress)
      );
      
      // Then add the photo to gallery
      return await dataService.gallery.addPhoto({
        imageUrl,
        tags,
        orderInfo: {
          cakeShape: 'custom',
          cakeSize: 'custom',
          cakeFlavor: 'custom',
          cakeDesign: 'Gallery Upload'
        }
      });
    },
    onSuccess: () => {
      toast({
        title: 'Success!',
        description: 'Photo has been added to the gallery',
      });
      onOpenChange(false);
      if (onPhotoUploaded) onPhotoUploaded();
    },
    onError: (error) => {
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
      setUploadProgress(0);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Upload Photo to Gallery</span>
            {!isAuthenticated && (
              <Badge variant="outline" className="flex items-center gap-1 ml-2">
                <Lock className="h-3 w-3" />
                Limited Mode
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!isAuthenticated && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-600" />
              <div>
                <p className="font-medium">Limited functionality</p>
                <p>You're not signed in. Some gallery features may be restricted.</p>
              </div>
            </div>
          )}

          {/* File upload section */}
          <div className="space-y-2">
            <Label htmlFor="photo" className="text-sm font-medium">
              Photo
            </Label>
            
            {previewUrl ? (
              <div className="relative aspect-square max-h-[200px] w-full overflow-hidden rounded-md border">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="h-full w-full object-cover" 
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute right-2 top-2"
                  onClick={() => {
                    setFile(null);
                    setPreviewUrl(null);
                  }}
                >
                  Change
                </Button>
              </div>
            ) : (
              <div
                className="flex aspect-square max-h-[200px] cursor-pointer flex-col items-center justify-center rounded-md border border-dashed text-muted-foreground hover:bg-muted/50"
                onClick={() => document.getElementById('photo-upload')?.click()}
              >
                <Upload className="mb-2 h-8 w-8" />
                <p className="text-sm">Click to select an image</p>
                <p className="text-xs text-muted-foreground">JPG, PNG, WebP or GIF, up to 10MB</p>
              </div>
            )}
            
            <input
              id="photo-upload"
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
            />
          </div>

          {/* Popular Tags section */}
          {availableTags.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Popular Tags</Label>
              <div className="flex flex-wrap gap-2">
                {availableTags
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 8)
                  .map(tag => (
                    <Badge 
                      key={tag.id}
                      variant={tags.includes(tag.value as OrderTag) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleSelectTag(tag.value as OrderTag)}
                    >
                      {tag.label}
                    </Badge>
                  ))}
              </div>
            </div>
          )}

          {/* Tags section */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Tags</Label>
            
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <span 
                  key={tag} 
                  className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs text-primary"
                >
                  {tag.replace(/-/g, ' ')}
                  <button 
                    className="ml-1 text-primary hover:text-primary/80"
                    onClick={() => removeTag(tag)}
                  >
                    ×
                  </button>
                </span>
              ))}
              
              {isTagInputActive ? (
                <Input
                  type="text"
                  value={tagInputValue}
                  onChange={handleTagInputChange}
                  onKeyDown={handleTagInputKeyDown}
                  onBlur={() => {
                    addTag();
                    setIsTagInputActive(false);
                  }}
                  autoFocus
                  className="h-8 w-32 min-w-20"
                  placeholder="Add tag..."
                />
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsTagInputActive(true)}
                  className="h-8 px-2 text-xs"
                >
                  + Add tag
                </Button>
              )}
            </div>
          </div>

          {/* Progress bar */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-1">
              <Progress value={uploadProgress} className="h-2 w-full" />
              <p className="text-xs text-muted-foreground text-center">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-start">
          <Button
            type="submit"
            onClick={() => uploadMutation.mutate()}
            disabled={!file || uploadMutation.isPending}
            className="w-full sm:w-auto"
          >
            {uploadMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload to Gallery
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PhotoUploadDialog;
