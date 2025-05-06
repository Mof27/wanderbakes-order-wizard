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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

  // Get button size class based on compact mode
  const getButtonSizeClass = () => {
    return compact ? "h-7 w-7" : "h-8 w-8"; 
  };

  // Get icon size class based on compact mode
  const getIconSizeClass = () => {
    return compact ? "h-3.5 w-3.5" : "h-4 w-4";
  };

  // Pending approval -> open approval dialog
  if (isPendingApproval) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              size="icon"
              className={`bg-indigo-600 hover:bg-indigo-700 text-white ${isUpdating ? 'opacity-70' : ''} ${getButtonSizeClass()}`}
              onClick={openApprovalDialog}
            >
              <CheckSquare2 className={getIconSizeClass()} /> 
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Review</p>
          </TooltipContent>
        </Tooltip>
        
        <CakePhotoApprovalDialog 
          open={showApprovalDialog} 
          onClose={() => setShowApprovalDialog(false)} 
          order={order}
          onSuccess={onStatusChange}
        />
      </TooltipProvider>
    );
  }
  
  // Needs revision -> handle differently
  if (isNeedsRevision) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              size="icon"
              className={`bg-amber-600 hover:bg-amber-700 text-white ${isUpdating ? 'opacity-70' : ''} ${getButtonSizeClass()}`}
              disabled={true} // This button is disabled since the action happens elsewhere
            >
              <XCircle className={getIconSizeClass()} /> 
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Upload</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Ready to deliver -> show driver assignment or start delivery buttons
  if (isReady) {
    // If we have a driver assignment, show start delivery button
    if (hasDriverAssignment) {
      // If it's a preliminary assignment, convert it to final
      if (hasPreliminaryAssignment) {
        return (
          <TooltipProvider>
            <div className="flex items-center gap-0.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    size="icon"
                    variant="outline"
                    className={getButtonSizeClass()}
                    onClick={() => openDriverDialog(false)}
                  >
                    <User className={getIconSizeClass()} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Change Driver</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    size="icon"
                    className={`bg-orange-600 hover:bg-orange-700 text-white ${isUpdating ? 'opacity-70' : ''} ${getButtonSizeClass()}`}
                    disabled={isUpdating}
                    onClick={() => updateStatus('in-delivery')}
                  >
                    <Truck className={getIconSizeClass()} /> 
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Start Delivery</p>
                </TooltipContent>
              </Tooltip>
            </div>
            
            <DriverAssignmentDialog 
              open={showDriverDialog}
              onOpenChange={setShowDriverDialog}
              order={order}
              onSuccess={onStatusChange}
              isPreliminary={isPreliminary}
            />
          </TooltipProvider>
        );
      } else {
        return (
          <TooltipProvider>
            <div className="flex items-center gap-0.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    size="icon"
                    variant="outline"
                    className={getButtonSizeClass()}
                    onClick={() => openDriverDialog(false)}
                  >
                    <User className={getIconSizeClass()} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Change Driver</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    size="icon"
                    className={`bg-orange-600 hover:bg-orange-700 text-white ${isUpdating ? 'opacity-70' : ''} ${getButtonSizeClass()}`}
                    disabled={isUpdating}
                    onClick={() => updateStatus('in-delivery')}
                  >
                    <Truck className={getIconSizeClass()} /> 
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Start Delivery</p>
                </TooltipContent>
              </Tooltip>
            </div>
            
            <DriverAssignmentDialog 
              open={showDriverDialog}
              onOpenChange={setShowDriverDialog}
              order={order}
              onSuccess={onStatusChange}
              isPreliminary={isPreliminary}
            />
          </TooltipProvider>
        );
      }
    }
    
    // No driver assignment yet, show assign driver button
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              size="icon"
              className={`bg-blue-600 hover:bg-blue-700 text-white ${isUpdating ? 'opacity-70' : ''} ${getButtonSizeClass()}`}
              onClick={() => openDriverDialog(false)}
            >
              <User className={getIconSizeClass()} /> 
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Assign Driver</p>
          </TooltipContent>
        </Tooltip>
        
        <DriverAssignmentDialog 
          open={showDriverDialog}
          onOpenChange={setShowDriverDialog}
          order={order}
          onSuccess={onStatusChange}
          isPreliminary={isPreliminary}
        />
      </TooltipProvider>
    );
  }
  
  // In delivery -> Complete delivery button
  if (isInTransit) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              size="icon"
              className={`bg-green-600 hover:bg-green-700 text-white ${isUpdating ? 'opacity-70' : ''} ${getButtonSizeClass()}`}
              disabled={isUpdating}
              onClick={openDeliveryInfoDialog}
            >
              <CheckCircle2 className={getIconSizeClass()} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Complete Delivery</p>
          </TooltipContent>
        </Tooltip>
        
        <DeliveryInfoDialog 
          open={showInfoDialog} 
          onOpenChange={setShowInfoDialog} 
          order={order}
          onSaved={onStatusChange}
        />
      </TooltipProvider>
    );
  }
  
  // Waiting feedback -> Add feedback button 
  if (isWaitingFeedback) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              size="icon"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={openFeedbackDialog}
            >
              <MessageSquare className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Add Feedback</p>
          </TooltipContent>
        </Tooltip>
        
        <FeedbackDialog 
          open={showFeedbackDialog} 
          onOpenChange={setShowFeedbackDialog} 
          order={order}
          onSaved={onStatusChange}
        />
      </TooltipProvider>
    );
  }
  
  // If we should show pre-assign option (for early statuses)
  if (showPreAssign) {
    // Show different UI based on whether there's already a pre-assignment
    if (hasPreliminaryAssignment) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="icon"
                variant="outline"
                onClick={() => openDriverDialog(true)}
              >
                <User className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Change Pre-Assignment</p>
            </TooltipContent>
          </Tooltip>
          
          <DriverAssignmentDialog 
            open={showDriverDialog}
            onOpenChange={setShowDriverDialog}
            order={order}
            onSuccess={onStatusChange}
            isPreliminary={isPreliminary}
          />
        </TooltipProvider>
      );
    } else {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="icon"
                variant="outline"
                onClick={() => openDriverDialog(true)}
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <User className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Pre-Assign Driver</p>
            </TooltipContent>
          </Tooltip>
          
          <DriverAssignmentDialog 
            open={showDriverDialog}
            onOpenChange={setShowDriverDialog}
            order={order}
            onSuccess={onStatusChange}
            isPreliminary={isPreliminary}
          />
        </TooltipProvider>
      );
    }
  }
  
  // For any other status, show a button to open the info dialog
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            size="icon"
            variant="outline"
            className={getButtonSizeClass()}
            onClick={openDeliveryInfoDialog}
          >
            <Clock className={getIconSizeClass()} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Delivery Details</p>
        </TooltipContent>
      </Tooltip>
      
      <DeliveryInfoDialog 
        open={showInfoDialog} 
        onOpenChange={setShowInfoDialog} 
        order={order}
        onSaved={onStatusChange}
      />
    </TooltipProvider>
  );
};

export default DeliveryStatusManager;
