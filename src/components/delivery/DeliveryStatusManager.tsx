
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Order, OrderStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Truck, CheckCircle2, MessageSquare, Clock, CheckSquare2, XCircle, User } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { matchesStatus } from "@/lib/statusHelpers";
import DeliveryInfoDialog from "./DeliveryInfoDialog";
import FeedbackDialog from "@/components/orders/FeedbackDialog";
import CakePhotoApprovalDialog from "@/components/orders/CakePhotoApprovalDialog";
import DriverAssignmentDialog from "./DriverAssignmentDialog";

interface DeliveryStatusManagerProps {
  order: Order;
  onStatusChange?: () => void; // Optional callback for when status changes
  compact?: boolean; // For more compact UI in table view
}

const DeliveryStatusManager = ({ 
  order, 
  onStatusChange,
  compact = false 
}: DeliveryStatusManagerProps) => {
  const { updateOrder } = useApp();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showDriverDialog, setShowDriverDialog] = useState(false);
  
  // Get current status
  const isReady = matchesStatus(order.status, 'ready-to-deliver');
  const isInTransit = matchesStatus(order.status, 'in-delivery');
  const isWaitingFeedback = matchesStatus(order.status, 'waiting-feedback');
  const isPendingApproval = matchesStatus(order.status, 'pending-approval');
  const isNeedsRevision = matchesStatus(order.status, 'needs-revision');
  
  // Check if driver is assigned
  const hasDriverAssignment = !!order.deliveryAssignment;
  
  // Function to update the status
  const updateStatus = async (newStatus: OrderStatus) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      // Create a complete Order object with the new status
      const updatedOrder: Order = { 
        ...order, 
        status: newStatus 
      };
      
      // If transitioning to waiting-feedback, automatically set delivery time if not set
      if (newStatus === 'waiting-feedback' && !order.actualDeliveryTime) {
        updatedOrder.actualDeliveryTime = new Date();
      }
      
      await updateOrder(updatedOrder);
      toast.success(`Order ${order.id} status updated to ${newStatus.replace(/-/g, ' ')}`);
      
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      toast.error("Failed to update order status");
      console.error("Error updating order status:", error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Handle dialogs
  const openDeliveryInfoDialog = () => setShowInfoDialog(true);
  const openFeedbackDialog = () => setShowFeedbackDialog(true);
  const openApprovalDialog = () => setShowApprovalDialog(true);
  const openDriverDialog = () => setShowDriverDialog(true);
  
  // Pending approval -> open approval dialog
  if (isPendingApproval) {
    return (
      <>
        <Button 
          size={compact ? "sm" : "default"}
          className={`bg-indigo-600 hover:bg-indigo-700 text-white ${isUpdating ? 'opacity-70' : ''}`}
          onClick={openApprovalDialog}
        >
          <CheckSquare2 className={`h-4 w-4 ${compact ? '' : 'mr-1'}`} /> 
          {!compact && "Review Photos"}
        </Button>
        
        <CakePhotoApprovalDialog 
          open={showApprovalDialog} 
          onClose={() => setShowApprovalDialog(false)} 
          order={order}
          onSuccess={onStatusChange}
        />
      </>
    );
  }
  
  // Needs revision -> handle differently (will be handled by CakePhotoUploadDialog in OrderCard)
  if (isNeedsRevision) {
    return (
      <>
        <Button 
          size={compact ? "sm" : "default"}
          className={`bg-amber-600 hover:bg-amber-700 text-white ${isUpdating ? 'opacity-70' : ''}`}
          disabled={true} // This button is disabled since the action happens elsewhere
        >
          <XCircle className={`h-4 w-4 ${compact ? '' : 'mr-1'}`} /> 
          {!compact && "Needs Revision"}
        </Button>
      </>
    );
  }

  // Ready to deliver -> show driver assignment or start delivery buttons
  if (isReady) {
    // If we have a driver assignment, show start delivery button
    if (hasDriverAssignment) {
      return (
        <>
          <div className="flex items-center gap-2">
            <Button 
              size={compact ? "sm" : "default"}
              variant="outline"
              onClick={openDriverDialog}
            >
              <User className={`h-4 w-4 ${compact ? '' : 'mr-1'}`} />
              {!compact && "Change Driver"}
            </Button>
            
            <Button 
              size={compact ? "sm" : "default"}
              className={`bg-orange-600 hover:bg-orange-700 text-white ${isUpdating ? 'opacity-70' : ''}`}
              disabled={isUpdating}
              onClick={() => updateStatus('in-delivery')}
            >
              <Truck className={`h-4 w-4 ${compact ? '' : 'mr-1'}`} /> 
              {!compact && "Start Delivery"}
            </Button>
          </div>
          
          <DriverAssignmentDialog 
            open={showDriverDialog}
            onOpenChange={setShowDriverDialog}
            order={order}
            onSuccess={onStatusChange}
          />
        </>
      );
    }
    
    // No driver assignment yet, show assign driver button
    return (
      <>
        <Button 
          size={compact ? "sm" : "default"}
          className={`bg-blue-600 hover:bg-blue-700 text-white ${isUpdating ? 'opacity-70' : ''}`}
          onClick={openDriverDialog}
        >
          <User className={`h-4 w-4 ${compact ? '' : 'mr-1'}`} /> 
          {!compact && "Assign Driver"}
        </Button>
        
        <DriverAssignmentDialog 
          open={showDriverDialog}
          onOpenChange={setShowDriverDialog}
          order={order}
          onSuccess={onStatusChange}
        />
      </>
    );
  }
  
  // In delivery -> Complete delivery button
  if (isInTransit) {
    return (
      <>
        <Button 
          size={compact ? "sm" : "default"}
          className={`bg-green-600 hover:bg-green-700 text-white ${isUpdating ? 'opacity-70' : ''}`}
          disabled={isUpdating}
          onClick={openDeliveryInfoDialog}
        >
          <CheckCircle2 className={`h-4 w-4 ${compact ? '' : 'mr-1'}`} />
          {!compact && "Complete Delivery"}
        </Button>
        
        <DeliveryInfoDialog 
          open={showInfoDialog} 
          onOpenChange={setShowInfoDialog} 
          order={order}
          onSaved={onStatusChange}
        />
      </>
    );
  }
  
  // Waiting feedback -> Add feedback button (now using FeedbackDialog)
  if (isWaitingFeedback) {
    return (
      <>
        <Button 
          size={compact ? "sm" : "default"}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
          onClick={openFeedbackDialog}
        >
          <MessageSquare className={`h-4 w-4 ${compact ? '' : 'mr-1'}`} />
          {!compact && "Add Feedback"}
        </Button>
        
        <FeedbackDialog 
          open={showFeedbackDialog} 
          onOpenChange={setShowFeedbackDialog} 
          order={order}
          onSaved={onStatusChange}
        />
      </>
    );
  }
  
  // For any other status, show a button to open the info dialog
  return (
    <>
      <Button 
        size={compact ? "sm" : "default"}
        variant="outline"
        onClick={openDeliveryInfoDialog}
      >
        <Clock className={`h-4 w-4 ${compact ? '' : 'mr-1'}`} />
        {!compact && "Delivery Details"}
      </Button>
      
      <DeliveryInfoDialog 
        open={showInfoDialog} 
        onOpenChange={setShowInfoDialog} 
        order={order}
        onSaved={onStatusChange}
      />
    </>
  );
};

export default DeliveryStatusManager;
