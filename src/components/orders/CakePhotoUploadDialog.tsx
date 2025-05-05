
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { CakeRevision, Order } from "@/types";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, X, Plus, AlertTriangle } from "lucide-react";
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
  
  // Check if we're in revision mode
  const isRevisionMode = order.status === "needs-revision";
  const revisionCount = order.revisionCount || 0;

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
      // Create a revision record if we have existing photos
      let revisionHistory = [...(order.revisionHistory || [])];
      
      // If we have existing photos and this is not the first upload,
      // save them to revision history
      if (order.finishedCakePhotos && order.finishedCakePhotos.length > 0) {
        const newRevision: CakeRevision = {
          id: `rev_${Date.now()}`,
          timestamp: new Date(),
          photos: order.finishedCakePhotos,
          notes: order.revisionNotes
        };
        revisionHistory.push(newRevision);
      }

      // Calculate the new revision count - only increment if we're submitting a revision
      const newRevisionCount = isRevisionMode ? revisionCount + 1 : revisionCount;
      
      // Update order with new photos and change status to pending-approval
      await updateOrder({
        ...order,
        finishedCakePhotos: photos,
        status: "pending-approval",
        revisionCount: newRevisionCount,
        revisionHistory: revisionHistory,
        // Clear revision notes if we're uploading a new version
        revisionNotes: isRevisionMode ? "" : order.revisionNotes
      });
      
      const revisionText = isRevisionMode ? `Revision #${newRevisionCount} ` : '';
      toast.success(`${revisionText}Cake photos uploaded successfully. Awaiting approval.`);
      
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
          <DialogTitle>
            {isRevisionMode ? `Re-upload Cake Photos (Revision ${revisionCount + 1})` : "Upload Cake Photos"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {isRevisionMode && order.revisionNotes && (
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-md space-y-2">
              <div className="flex items-center text-amber-800">
                <AlertTriangle className="h-4 w-4 mr-2" />
                <span className="font-medium">Revision Requested</span>
              </div>
              <p className="text-sm text-amber-700">{order.revisionNotes}</p>
            </div>
          )}
          
          <p className="text-sm text-muted-foreground">
            Upload photos of the finished cake. These will be reviewed before proceeding to delivery.
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
                {isRevisionMode ? "Submit Revision" : "Submit for Approval"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CakePhotoUploadDialog;
