
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
import Pagination from "@/components/gallery/Pagination";
import { Button } from "@/components/ui/button";
import { Settings, Upload, AlertTriangle, Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

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
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12; // Number of photos per page
  
  // Fetch gallery photos based on current filter, sort and pagination
  const { 
    data: photos = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['galleryPhotos', filter, sort, currentPage, pageSize],
    queryFn: () => dataService.gallery.getPhotosByFilter(filter, sort, currentPage, pageSize),
    retryDelay: attempt => Math.min(attempt > 1 ? 2 ** attempt * 1000 : 1000, 30 * 1000), // Exponential backoff
    retry: 3,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Fetch selected photo details when a photo is selected
  const {
    data: selectedPhoto,
    isLoading: isLoadingDetail,
    isError: isErrorDetail
  } = useQuery({
    queryKey: ['photoDetail', selectedPhotoId],
    queryFn: () => selectedPhotoId 
      ? dataService.gallery.getPhotoDetail(selectedPhotoId) 
      : Promise.resolve(undefined),
    enabled: !!selectedPhotoId,
    retry: 2,
  });
  
  // Fetch related photos when a photo is selected
  const {
    data: relatedPhotos = [],
    isLoading: isLoadingRelated
  } = useQuery({
    queryKey: ['relatedPhotos', selectedPhotoId],
    queryFn: () => selectedPhotoId 
      ? dataService.gallery.getRelatedPhotos(selectedPhotoId, 4) 
      : Promise.resolve([]),
    enabled: !!selectedPhotoId,
    retry: 2,
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
    setCurrentPage(1); // Reset to first page when filter changes
  };
  
  // Handle sort changes
  const handleSortChange = (newSort: GallerySort) => {
    setSort(newSort);
    setCurrentPage(1); // Reset to first page when sort changes
  };
  
  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Handle photo upload completion
  const handlePhotoUploaded = () => {
    toast({
      title: "Photo was successfully added to the gallery!",
      variant: "default",
    });
    refetch();
  };
  
  // Handle error retry
  const handleRetry = () => {
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
        
        {isError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error loading gallery</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : "Failed to load gallery photos"}
              <Button 
                variant="outline"
                size="sm"
                onClick={handleRetry}
                className="ml-2"
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader className="h-8 w-8 animate-spin mb-4 text-primary" />
            <p className="text-muted-foreground">Loading gallery photos...</p>
          </div>
        ) : (
          <>
            <PhotoGallery 
              photos={photos} 
              isLoading={isLoading} 
              onPhotoClick={handlePhotoClick}
            />
            
            {photos.length > 0 ? (
              <Pagination 
                currentPage={currentPage}
                pageSize={pageSize}
                totalItems={100} // This should be dynamic based on total count from API
                onPageChange={handlePageChange}
              />
            ) : !isLoading && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No photos match your search criteria.</p>
                <Button 
                  variant="link" 
                  className="mt-2"
                  onClick={() => {
                    setFilter({ tags: [], shapes: [], flavors: [] });
                    setSort('newest');
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </>
        )}
        
        {selectedPhotoId && selectedPhoto && (
          <PhotoDetailDialog
            photo={selectedPhoto}
            relatedPhotos={relatedPhotos}
            isLoading={isLoadingDetail || isLoadingRelated}
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
