
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Order } from "@/types";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, X, Plus, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface CakePhotoUploadDialogProps {
  order: Order;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CakePhotoUploadDialog = ({ order, open, onClose, onSuccess }: CakePhotoUploadDialogProps) => {
  const { updateOrder } = useApp();
  const [photos, setPhotos] = useState<string[]>(order.finishedCakePhotos || []);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotos(prev => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (photos.length === 0) {
      toast.error("Please upload at least one photo of the finished cake");
      return;
    }

    setLoading(true);
    try {
      const updatedOrder = await updateOrder({
        ...order,
        finishedCakePhotos: photos,
        status: "ready-to-deliver"
      });
      
      toast.success("Cake photos uploaded successfully");
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to upload cake photos", error);
      toast.error("Failed to upload cake photos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Cake Photos</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Upload photos of the finished cake. These will be shown to the customer and delivery staff.
          </p>
          
          <div className="grid grid-cols-2 gap-2">
            {photos.map((photo, index) => (
              <div key={index} className="relative">
                <img 
                  src={photo} 
                  alt={`Cake photo ${index + 1}`}
                  className="w-full h-32 object-cover rounded-md"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="absolute top-1 right-1 h-6 w-6"
                  onClick={() => removePhoto(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
            
            <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-md p-4 h-32 cursor-pointer hover:bg-accent/10">
              <input 
                type="file" 
                accept="image/*" 
                multiple 
                className="hidden" 
                onChange={handleFileChange}
              />
              <Plus className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">Add Photo</span>
            </label>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || photos.length === 0} className="gap-2">
            {loading ? "Uploading..." : (
              <>
                <Upload className="h-4 w-4" />
                Upload & Mark Ready
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CakePhotoUploadDialog;
