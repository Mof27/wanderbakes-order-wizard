
import {
  Dialog,
  DialogContent,
  DialogFooter
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { GalleryPhoto } from "@/types/gallery";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tag, Info, Calendar, User, ArrowRight, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { dataService } from "@/services";

interface PhotoDetailDialogProps {
  photo: GalleryPhoto;
  relatedPhotos: GalleryPhoto[];
  isLoading: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PhotoDetailDialog = ({
  photo,
  relatedPhotos,
  isLoading,
  open,
  onOpenChange
}: PhotoDetailDialogProps) => {
  // Fetch all available tags to get the labels
  const { data: allTags = [] } = useQuery({
    queryKey: ['galleryTags'],
    queryFn: () => dataService.gallery.getAllTags(),
  });

  // Get the label for a tag value
  const getTagLabel = (tagValue: string) => {
    const tag = allTags.find(t => t.value === tagValue);
    return tag?.label || tagValue;
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-96" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Photo section */}
          <div>
            <div className="rounded-lg overflow-hidden mb-4">
              <img 
                src={photo.imageUrl} 
                alt="Cake design"
                className="w-full object-cover max-h-[500px]"
              />
            </div>
            
            {/* Created date */}
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1" />
              Added on {formatDate(photo.createdAt)}
            </div>
          </div>
          
          {/* Details section */}
          <div className="space-y-5">
            {/* Cake design info */}
            <div>
              <h2 className="text-2xl font-semibold">
                {photo.orderInfo?.cakeDesign || 'Custom Cake Design'}
              </h2>
              <p className="text-muted-foreground">
                {photo.orderInfo?.cakeSize} {photo.orderInfo?.cakeShape}
                {photo.orderInfo?.cakeFlavor && ` • ${photo.orderInfo.cakeFlavor} flavor`}
              </p>
            </div>
            
            {/* Tags */}
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-sm font-medium">
                <Tag className="h-4 w-4" />
                Tags
              </div>
              
              <div className="flex flex-wrap gap-2">
                {photo.tags.length > 0 ? (
                  photo.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="py-1 px-2">
                      {getTagLabel(tag)}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No tags added</p>
                )}
              </div>
            </div>
            
            {/* Customer info (if available) */}
            {photo.orderInfo?.customerName && (
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-sm font-medium">
                  <User className="h-4 w-4" />
                  Customer
                </div>
                <p className="text-sm">{photo.orderInfo.customerName}</p>
              </div>
            )}
            
            {/* View order button */}
            <div className="pt-2">
              <Button asChild variant="outline" className="w-full">
                <Link to={`/orders/${photo.orderId}`}>
                  <Info className="h-4 w-4 mr-2" />
                  View Order Details
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Related photos section */}
        {relatedPhotos.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Similar Designs</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {relatedPhotos.map((relatedPhoto) => (
                <div 
                  key={relatedPhoto.id}
                  className="relative h-36 rounded-md overflow-hidden cursor-pointer group"
                  onClick={() => {
                    onOpenChange(false);
                    // Small timeout to allow the dialog to close before opening the new one
                    setTimeout(() => {
                      onOpenChange(true);
                    }, 100);
                  }}
                >
                  <img 
                    src={relatedPhoto.imageUrl} 
                    alt={`Related design ${relatedPhoto.id}`}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="h-6 w-6 text-white" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PhotoDetailDialog;
