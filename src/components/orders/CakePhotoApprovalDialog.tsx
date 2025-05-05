
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { CakeRevision, Order } from "@/types";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/input";
import { CheckCircle2, XCircle, Clock, History } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import RevisionHistoryView from "./RevisionHistoryView";

interface CakePhotoApprovalDialogProps {
  order: Order;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CakePhotoApprovalDialog = ({ order, open, onClose, onSuccess }: CakePhotoApprovalDialogProps) => {
  const { updateOrder } = useApp();
  const [activeTab, setActiveTab] = useState("review");
  const [revisionNotes, setRevisionNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const hasRevisionHistory = order.revisionHistory && order.revisionHistory.length > 0;
  const photos = order.finishedCakePhotos || [];
  const revisionCount = order.revisionCount || 0;

  const handleApprove = async () => {
    setLoading(true);
    try {
      // Update to ready-to-deliver status with approval info
      const updatedOrder = await updateOrder({
        ...order,
        status: "ready-to-deliver",
        approvedBy: "Manager", // In a real app, this would come from the logged-in user
        approvalDate: new Date()
      });
      
      // Add log entry
      await updateOrder({
        ...updatedOrder,
        orderLogs: [
          ...(updatedOrder.orderLogs || []),
          {
            id: `log_${Date.now()}`,
            timestamp: new Date(),
            type: 'status-change',
            previousStatus: 'pending-approval',
            newStatus: 'ready-to-deliver',
            note: 'Cake photos approved',
            user: "Manager" // In a real app, this would come from the logged-in user
          }
        ]
      });
      
      toast.success(`Cake photos approved. Order ${order.id} is now ready for delivery.`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to approve cake photos", error);
      toast.error("Failed to approve cake photos");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!revisionNotes.trim()) {
      toast.error("Please provide revision notes explaining what needs to be fixed.");
      return;
    }

    setLoading(true);
    try {
      // Update to needs-revision status with notes
      const updatedOrder = await updateOrder({
        ...order,
        status: "needs-revision",
        revisionNotes: revisionNotes
      });
      
      // Add log entry
      await updateOrder({
        ...updatedOrder,
        orderLogs: [
          ...(updatedOrder.orderLogs || []),
          {
            id: `log_${Date.now()}`,
            timestamp: new Date(),
            type: 'status-change',
            previousStatus: 'pending-approval',
            newStatus: 'needs-revision',
            note: `Revision requested: ${revisionNotes}`,
            user: "Manager" // In a real app, this would come from the logged-in user
          }
        ]
      });
      
      toast.info(`Revision requested for order ${order.id}.`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to request revision", error);
      toast.error("Failed to request revision");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Review Cake Photos - Order {order.id}</span>
            {revisionCount > 0 && (
              <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                Revision #{revisionCount}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="review">Review Photos</TabsTrigger>
            <TabsTrigger value="history" disabled={!hasRevisionHistory}>
              Revision History {hasRevisionHistory && `(${order.revisionHistory?.length})`}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="review" className="flex-1 overflow-auto p-1">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={photo} 
                      alt={`Cake photo ${index + 1}`}
                      className="w-full object-cover rounded-md"
                    />
                  </div>
                ))}
              </div>
              
              <div className="bg-muted p-3 rounded-md">
                <h3 className="font-medium mb-2">Order Details</h3>
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Size:</span> {order.cakeSize}</p>
                  <p><span className="font-medium">Flavor:</span> {order.cakeFlavor}</p>
                  <p><span className="font-medium">Design:</span> {order.cakeDesign}</p>
                  {order.cakeText && (
                    <p><span className="font-medium">Text:</span> "{order.cakeText}"</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Request Revision</h3>
                <Textarea 
                  placeholder="Describe what needs to be fixed or changed..."
                  value={revisionNotes}
                  onChange={(e) => setRevisionNotes(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="flex-1 overflow-auto p-1">
            {order.revisionHistory && (
              <RevisionHistoryView revisions={order.revisionHistory} />
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={loading}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          
          <div className="flex gap-2 flex-1 sm:flex-none">
            <Button 
              variant="outline" 
              className="bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200 flex-1"
              onClick={handleRequestRevision} 
              disabled={loading || !revisionNotes.trim()}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Request Revision
            </Button>
            
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white flex-1"
              onClick={handleApprove} 
              disabled={loading}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CakePhotoApprovalDialog;
