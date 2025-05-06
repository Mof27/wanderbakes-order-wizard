
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Order, OrderStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Truck, CheckCircle2, MessageSquare, Clock, CheckSquare2, XCircle, User, Eye } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { matchesStatus } from "@/lib/statusHelpers";
import DeliveryInfoDialog from "./DeliveryInfoDialog";
import FeedbackDialog from "@/components/orders/FeedbackDialog";
import CakePhotoApprovalDialog from "@/components/orders/CakePhotoApprovalDialog";
import DriverAssignmentDialog from "./DriverAssignmentDialog";
import NotesSection from "../orders/OrderFormComponents/NotesSection";

interface DeliveryStatusManagerProps {
  order: Order;
  onStatusChange?: () => void; // Optional callback for when status changes
  compact?: boolean; // For more compact UI in table view
  showPreAssign?: boolean; // New prop to show pre-assignment option
}

const DeliveryStatusManager = ({ 
  order, 
  onStatusChange,
  compact = false,
  showPreAssign = false
}: DeliveryStatusManagerProps) => {
  const { updateOrder } = useApp();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showDriverDialog, setShowDriverDialog] = useState(false);
  const [isPreliminary, setIsPreliminary] = useState(false);
  
  // Get current status
  const isReady = matchesStatus(order.status, 'ready-to-deliver');
  const isInTransit = matchesStatus(order.status, 'in-delivery');
  const isWaitingFeedback = matchesStatus(order.status, 'waiting-feedback');
  const isPendingApproval = matchesStatus(order.status, 'pending-approval');
  const isNeedsRevision = matchesStatus(order.status, 'needs-revision');
  const isInKitchen = matchesStatus(order.status, 'in-kitchen') || 
                     matchesStatus(order.status, 'waiting-photo');
  
  // Check if driver is assigned
  const hasDriverAssignment = !!order.deliveryAssignment;
  const hasPreliminaryAssignment = hasDriverAssignment && order.deliveryAssignment?.isPreliminary;
  
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
  
  // Open driver dialog with preliminary flag
  const openDriverDialog = (preliminary = false) => {
    setIsPreliminary(preliminary);
    setShowDriverDialog(true);
  };

  // Handle chat button click
  const handleChatClick = () => {
    toast.info(`Chat for order ${order.id} - to be implemented`);
  };

  // Pending approval -> open approval dialog
  if (isPendingApproval) {
    return (
      <>
        <Button 
          size={compact ? "sm" : "default"}
          className={`bg-indigo-600 hover:bg-indigo-700 text-white ${isUpdating ? 'opacity-70' : ''}`}
          onClick={openApprovalDialog}
        >
          <CheckSquare2 className="h-4 w-4 mr-1" /> 
          {!compact && "Review"}
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
  
  // Needs revision -> handle differently
  if (isNeedsRevision) {
    return (
      <>
        <Button 
          size={compact ? "sm" : "default"}
          className={`bg-amber-600 hover:bg-amber-700 text-white ${isUpdating ? 'opacity-70' : ''}`}
          disabled={true} // This button is disabled since the action happens elsewhere
        >
          <XCircle className="h-4 w-4 mr-1" /> 
          {!compact && "Upload"}
        </Button>
      </>
    );
  }

  // Ready to deliver -> show driver assignment or start delivery buttons
  if (isReady) {
    // If we have a driver assignment, show start delivery button
    if (hasDriverAssignment) {
      // If it's a preliminary assignment, convert it to final
      if (hasPreliminaryAssignment) {
        return (
          <>
            <div className="flex items-center gap-2">
              <Button 
                size={compact ? "sm" : "default"}
                variant="outline"
                onClick={() => openDriverDialog(false)}
              >
                <User className="h-4 w-4 mr-1" />
                {!compact && "Change"}
              </Button>
              
              <Button 
                size={compact ? "sm" : "default"}
                className={`bg-orange-600 hover:bg-orange-700 text-white ${isUpdating ? 'opacity-70' : ''}`}
                disabled={isUpdating}
                onClick={() => updateStatus('in-delivery')}
              >
                <Truck className="h-4 w-4 mr-1" /> 
                {!compact && "Start"}
              </Button>
            </div>
            
            <DriverAssignmentDialog 
              open={showDriverDialog}
              onOpenChange={setShowDriverDialog}
              order={order}
              onSuccess={onStatusChange}
              isPreliminary={isPreliminary}
            />
          </>
        );
      } else {
        return (
          <>
            <div className="flex items-center gap-2">
              <Button 
                size={compact ? "sm" : "default"}
                variant="outline"
                onClick={() => openDriverDialog(false)}
              >
                <User className="h-4 w-4 mr-1" />
                {!compact && "Change"}
              </Button>
              
              <Button 
                size={compact ? "sm" : "default"}
                className={`bg-orange-600 hover:bg-orange-700 text-white ${isUpdating ? 'opacity-70' : ''}`}
                disabled={isUpdating}
                onClick={() => updateStatus('in-delivery')}
              >
                <Truck className="h-4 w-4 mr-1" /> 
                {!compact && "Start"}
              </Button>
            </div>
            
            <DriverAssignmentDialog 
              open={showDriverDialog}
              onOpenChange={setShowDriverDialog}
              order={order}
              onSuccess={onStatusChange}
              isPreliminary={isPreliminary}
            />
          </>
        );
      }
    }
    
    // No driver assignment yet, show assign driver button
    return (
      <>
        <Button 
          size={compact ? "sm" : "default"}
          className={`bg-blue-600 hover:bg-blue-700 text-white ${isUpdating ? 'opacity-70' : ''}`}
          onClick={() => openDriverDialog(false)}
        >
          <User className="h-4 w-4 mr-1" /> 
          {!compact && "Assign"}
        </Button>
        
        <DriverAssignmentDialog 
          open={showDriverDialog}
          onOpenChange={setShowDriverDialog}
          order={order}
          onSuccess={onStatusChange}
          isPreliminary={isPreliminary}
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
          <CheckCircle2 className="h-4 w-4 mr-1" />
          {!compact && "Complete"}
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
  
  // Waiting feedback -> Add feedback button 
  if (isWaitingFeedback) {
    return (
      <>
        <Button 
          size={compact ? "sm" : "default"}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
          onClick={openFeedbackDialog}
        >
          <MessageSquare className="h-4 w-4 mr-1" />
          {!compact && "Feedback"}
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
  
  // If we should show pre-assign option (for early statuses)
  if (showPreAssign) {
    // Show different UI based on whether there's already a pre-assignment
    if (hasPreliminaryAssignment) {
      return (
        <>
          <Button 
            size={compact ? "sm" : "default"}
            variant="outline"
            onClick={() => openDriverDialog(true)}
            className="gap-2"
          >
            <User className="h-4 w-4" />
            {!compact ? "Change" : "Change"}
          </Button>
          
          <DriverAssignmentDialog 
            open={showDriverDialog}
            onOpenChange={setShowDriverDialog}
            order={order}
            onSuccess={onStatusChange}
            isPreliminary={isPreliminary}
          />
        </>
      );
    } else {
      return (
        <>
          <Button 
            size={compact ? "sm" : "default"}
            variant="outline"
            onClick={() => openDriverDialog(true)}
            className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            <User className="h-4 w-4" />
            {!compact ? "Pre-Assign" : "Pre-Assign"}
          </Button>
          
          <DriverAssignmentDialog 
            open={showDriverDialog}
            onOpenChange={setShowDriverDialog}
            order={order}
            onSuccess={onStatusChange}
            isPreliminary={isPreliminary}
          />
        </>
      );
    }
  }
  
  // For any other status, show a button to open the info dialog
  return (
    <>
      <Button 
        size={compact ? "sm" : "default"}
        variant="outline"
        onClick={openDeliveryInfoDialog}
      >
        <Clock className="h-4 w-4 mr-1" />
        {!compact && "Details"}
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
