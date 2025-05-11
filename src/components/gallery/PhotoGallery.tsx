
import { GalleryPhoto } from "@/types/gallery";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Tag } from "lucide-react";

interface PhotoGalleryProps {
  photos: GalleryPhoto[];
  isLoading: boolean;
  onPhotoClick: (photoId: string) => void;
}

const PhotoGallery = ({ photos, isLoading, onPhotoClick }: PhotoGalleryProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <div className="h-48 bg-gray-200 animate-pulse"></div>
            <CardContent className="p-2">
              <div className="h-4 w-2/3 bg-gray-200 animate-pulse mb-2"></div>
              <div className="h-4 w-1/3 bg-gray-200 animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-gray-50">
        <h3 className="text-lg font-semibold mb-2">No photos found</h3>
        <p className="text-muted-foreground">
          Try adjusting your filters or adding cake photos to the gallery
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {photos.map((photo) => (
        <Card 
          key={photo.id} 
          className="overflow-hidden group cursor-pointer hover:shadow-md transition-all"
          onClick={() => onPhotoClick(photo.id)}
        >
          <div className="relative h-48">
            <img 
              src={photo.imageUrl} 
              alt={`Cake design ${photo.id}`}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
              <div className="p-2 text-white">
                <p className="font-medium truncate">{photo.orderInfo?.cakeDesign || 'Custom Design'}</p>
                <p className="text-xs">{formatDate(photo.createdAt)}</p>
              </div>
            </div>
          </div>
          <CardContent className="p-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium truncate">
                {photo.orderInfo?.cakeSize} {photo.orderInfo?.cakeShape}
              </p>
              {photo.tags.length > 0 && (
                <Badge variant="outline" className="flex items-center gap-1 text-xs">
                  <Tag className="h-3 w-3" />
                  {photo.tags.length}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PhotoGallery;
