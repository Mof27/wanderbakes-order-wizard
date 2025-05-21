
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { dataService } from "@/services";
import { GalleryFilter, GallerySort, GalleryPhoto } from "@/types/gallery";
import PhotoGallery from "@/components/gallery/PhotoGallery";
import GalleryFilters from "@/components/gallery/GalleryFilters";
import PhotoDetailDialog from "@/components/gallery/PhotoDetailDialog";
import TagManagementDialog from "@/components/gallery/TagManagementDialog";
import PhotoUploadDialog from "@/components/gallery/PhotoUploadDialog";
import { Button } from "@/components/ui/button";
import { Settings, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const GalleryPage = () => {
  const { toast } = useToast();
  // State for filters, sorting, and selected photo
  const [filter, setFilter] = useState<GalleryFilter>({
    tags: [],
    shapes: [],
    flavors: []
  });
  const [sort, setSort] = useState<GallerySort>('newest');
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const [isManagingTags, setIsManagingTags] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  
  // Fetch gallery photos based on current filter and sort
  const { 
    data: photos = [],
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['galleryPhotos', filter, sort],
    queryFn: () => dataService.gallery.getPhotosByFilter(filter, sort),
  });
  
  // Fetch selected photo details when a photo is selected
  const {
    data: selectedPhoto,
    isLoading: isLoadingDetail
  } = useQuery({
    queryKey: ['photoDetail', selectedPhotoId],
    queryFn: () => selectedPhotoId 
      ? dataService.gallery.getPhotoDetail(selectedPhotoId) 
      : Promise.resolve(undefined),
    enabled: !!selectedPhotoId
  });
  
  // Fetch related photos when a photo is selected
  const {
    data: relatedPhotos = []
  } = useQuery({
    queryKey: ['relatedPhotos', selectedPhotoId],
    queryFn: () => selectedPhotoId 
      ? dataService.gallery.getRelatedPhotos(selectedPhotoId, 4) 
      : Promise.resolve([]),
    enabled: !!selectedPhotoId
  });
  
  // Handle photo click to open detail view
  const handlePhotoClick = (photoId: string) => {
    setSelectedPhotoId(photoId);
  };
  
  // Handle closing the detail dialog
  const handleCloseDetail = () => {
    setSelectedPhotoId(null);
  };
  
  // Handle filter changes
  const handleFilterChange = (newFilter: Partial<GalleryFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
  };
  
  // Handle sort changes
  const handleSortChange = (newSort: GallerySort) => {
    setSort(newSort);
  };
  
  // Handle photo upload completion
  const handlePhotoUploaded = () => {
    toast({
      title: "Photo was successfully added to the gallery!",
      variant: "default",
    });
    refetch();
  };
  
  return (
    <>
      <Helmet>
        <title>Design Gallery | Cake Shop</title>
      </Helmet>
      
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold">Cake Design Gallery</h1>
            <p className="text-muted-foreground">
              Browse and search completed cake designs
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="default" 
              className="flex items-center gap-2"
              onClick={() => setIsUploadingPhoto(true)}
            >
              <Upload className="h-4 w-4" />
              Upload Photo
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setIsManagingTags(true)}
            >
              <Settings className="h-4 w-4" />
              Manage Tags
            </Button>
          </div>
        </div>
        
        <GalleryFilters 
          filter={filter} 
          onFilterChange={handleFilterChange}
          sort={sort}
          onSortChange={handleSortChange}
        />
        
        <PhotoGallery 
          photos={photos} 
          isLoading={isLoading} 
          onPhotoClick={handlePhotoClick}
        />
        
        {selectedPhotoId && selectedPhoto && (
          <PhotoDetailDialog
            photo={selectedPhoto}
            relatedPhotos={relatedPhotos}
            isLoading={isLoadingDetail}
            open={!!selectedPhotoId}
            onOpenChange={(open) => !open && handleCloseDetail()}
          />
        )}
        
        <TagManagementDialog
          open={isManagingTags}
          onOpenChange={setIsManagingTags}
          onTagsUpdated={() => refetch()}
        />
        
        <PhotoUploadDialog
          open={isUploadingPhoto}
          onOpenChange={setIsUploadingPhoto}
          onPhotoUploaded={handlePhotoUploaded}
        />
      </div>
    </>
  );
};

export default GalleryPage;
