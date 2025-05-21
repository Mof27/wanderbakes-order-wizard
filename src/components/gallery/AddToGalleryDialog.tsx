
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { dataService } from "@/services";
import { Order, OrderTag } from "@/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GalleryHorizontal, PlusCircle, Loader2 } from "lucide-react";

interface AddToGalleryDialogProps {
  order: Order;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const AddToGalleryDialog = ({
  order,
  open,
  onOpenChange,
  onSuccess
}: AddToGalleryDialogProps) => {
  const { toast } = useToast();
  const [selectedTags, setSelectedTags] = useState<OrderTag[]>([]);
  const [selectedPhotoIndexes, setSelectedPhotoIndexes] = useState<number[]>([]);

  // Reset state when dialog is opened
  useEffect(() => {
    if (open) {
      // Auto-select all photos by default
      const allIndexes = order.finishedCakePhotos 
        ? Array.from({ length: order.finishedCakePhotos.length }, (_, i) => i)
        : [];
      setSelectedPhotoIndexes(allIndexes);

      // Auto-select some tags based on the order
      const autoTags: OrderTag[] = [];
      
      // Add tags based on cake type
      if (order.cakeShape) {
        // Convert shape to a valid OrderTag if possible
        const shapeToTagMap: Record<string, OrderTag | undefined> = {
          'round': 'other',
          'square': 'other',
          'rectangle': 'other',
          'heart': 'other',
          'custom': 'other'
        };
        
        const shape = order.cakeShape.toLowerCase();
        if (shape in shapeToTagMap && shapeToTagMap[shape]) {
          autoTags.push(shapeToTagMap[shape]!);
        }
      }
      
      // Check if it's a birthday cake from the design or text
      if (
        (order.cakeDesign && order.cakeDesign.toLowerCase().includes("birthday")) ||
        (order.cakeText && order.cakeText.toLowerCase().includes("birthday"))
      ) {
        autoTags.push("birthday");
      }
      
      setSelectedTags(autoTags);
    }
  }, [open, order]);

  // Helper function to check if a tag is a valid OrderTag
  const isValidOrderTag = (tag: string): tag is OrderTag => {
    const validTags: OrderTag[] = [
      "for-kids", "for-man", "for-woman", "birthday", 
      "anniversary", "wedding", "other"
    ];
    return validTags.includes(tag as OrderTag);
  };

  // Fetch available tags
  const { data: availableTags = [] } = useQuery({
    queryKey: ['galleryTags'],
    queryFn: () => dataService.gallery.getAllTags(),
    staleTime: 60000, // 1 minute
  });

  // Handle tag selection
  const handleTagChange = (tag: OrderTag, checked: boolean) => {
    if (checked) {
      setSelectedTags(prev => [...prev, tag]);
    } else {
      setSelectedTags(prev => prev.filter(t => t !== tag));
    }
  };

  // Handle photo selection
  const handlePhotoSelection = (index: number, checked: boolean) => {
    if (checked) {
      setSelectedPhotoIndexes(prev => [...prev, index]);
    } else {
      setSelectedPhotoIndexes(prev => prev.filter(i => i !== index));
    }
  };

  // Add to gallery mutation
  const addToGalleryMutation = useMutation({
    mutationFn: async () => {
      if (!order.finishedCakePhotos || selectedPhotoIndexes.length === 0) {
        throw new Error("No photos selected");
      }
      
      // Get the selected photos
      const selectedPhotos = selectedPhotoIndexes.map(index => order.finishedCakePhotos![index]);
      
      // Process each selected photo
      const promises = selectedPhotos.map(photoUrl => {
        return dataService.gallery.addPhoto({
          imageUrl: photoUrl,
          tags: selectedTags,
          orderInfo: {
            cakeShape: order.cakeShape,
            cakeSize: order.cakeSize,
            cakeFlavor: order.cakeFlavor,
            cakeDesign: order.cakeDesign,
            customerName: order.customer.name
          }
        });
      });
      
      return Promise.all(promises);
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: `${selectedPhotoIndexes.length} photo${selectedPhotoIndexes.length > 1 ? 's' : ''} added to gallery`,
      });
      if (onSuccess) onSuccess();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to add photos to gallery",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    },
  });

  // No photos available
  if (!order.finishedCakePhotos || order.finishedCakePhotos.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Gallery</DialogTitle>
          </DialogHeader>
          <Alert>
            <AlertDescription>
              This order doesn't have any approved cake photos yet.
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GalleryHorizontal className="h-5 w-5" />
            Add to Gallery
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Select Photos</Label>
            <div className="grid grid-cols-2 gap-2">
              {order.finishedCakePhotos.map((photo, index) => (
                <div key={index} className="relative">
                  <img 
                    src={photo} 
                    alt={`Cake photo ${index + 1}`}
                    className={`w-full h-32 object-cover rounded-md ${
                      !selectedPhotoIndexes.includes(index) ? "opacity-50" : ""
                    }`}
                  />
                  <div className="absolute top-2 right-2">
                    <Checkbox 
                      id={`photo-${index}`}
                      checked={selectedPhotoIndexes.includes(index)}
                      onCheckedChange={(checked) => handlePhotoSelection(index, !!checked)}
                      className="h-5 w-5 bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Tags</Label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <div key={tag.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={tag.id}
                    checked={selectedTags.includes(tag.value as OrderTag)}
                    onCheckedChange={(checked) => handleTagChange(tag.value as OrderTag, !!checked)}
                  />
                  <label
                    htmlFor={tag.id}
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {tag.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={addToGalleryMutation.isPending}>
            Cancel
          </Button>
          <Button 
            onClick={() => addToGalleryMutation.mutate()}
            disabled={addToGalleryMutation.isPending || selectedPhotoIndexes.length === 0}
          >
            {addToGalleryMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add to Gallery
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddToGalleryDialog;
