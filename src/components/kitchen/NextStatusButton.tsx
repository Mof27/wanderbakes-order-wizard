
import { useState, useEffect } from "react";
import { Check, Timer, X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { KitchenOrderStatus, Order } from "@/types";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/sonner";

interface NextStatusButtonProps {
  order: Order;
  currentKitchenStatus: KitchenOrderStatus;
}

// Function to determine the next kitchen status based on the current one
const getNextKitchenStatus = (currentStatus: KitchenOrderStatus): KitchenOrderStatus | null => {
  switch (currentStatus) {
    case 'waiting-baker':
      return 'waiting-crumbcoat';
    case 'waiting-crumbcoat':
      return 'waiting-cover';
    case 'waiting-cover':
      return 'in-progress';
    case 'in-progress':
      return 'done-waiting-approval';
    case 'done-waiting-approval':
      return null; // No next status
    default:
      return null;
  }
};

// Function to map kitchen status to order status
const mapKitchenStatusToOrderStatus = (kitchenStatus: KitchenOrderStatus) => {
  switch (kitchenStatus) {
    case 'waiting-baker':
    case 'waiting-crumbcoat':
    case 'waiting-cover':
    case 'in-progress':
      return 'in-progress';
    case 'done-waiting-approval':
      return 'waiting-photo';
  }
};

// Function to get a nice display name for the status
const getStatusDisplayName = (status: KitchenOrderStatus): string => {
  switch (status) {
    case 'waiting-baker': 
      return 'Waiting Baker';
    case 'waiting-crumbcoat': 
      return 'Waiting Crumbcoat';
    case 'waiting-cover': 
      return 'Waiting Cover';
    case 'in-progress': 
      return 'In Progress';
    case 'done-waiting-approval': 
      return 'Done, Waiting Approval';
    default:
      return 'Unknown Status';
  }
};

const NextStatusButton: React.FC<NextStatusButtonProps> = ({ order, currentKitchenStatus }) => {
  const { updateOrder } = useApp();
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const nextStatus = getNextKitchenStatus(currentKitchenStatus);
  
  // Handle countdown effect
  useEffect(() => {
    if (!isCountingDown) return;
    
    if (countdown === 0) {
      // Time to update the status
      handleStatusUpdate();
      return;
    }
    
    const timer = setTimeout(() => {
      setCountdown(prev => prev - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [isCountingDown, countdown]);
  
  // Reset countdown when component unmounts or when button is reset
  const resetCountdown = () => {
    setIsCountingDown(false);
    setCountdown(3);
  };
  
  // Handle the start of countdown
  const startCountdown = () => {
    setIsCountingDown(true);
  };
  
  // Cancel the countdown
  const cancelCountdown = () => {
    resetCountdown();
    toast.info("Status change cancelled");
  };
  
  // Perform the actual status update
  const handleStatusUpdate = async () => {
    if (!nextStatus || isProcessing) return;
    
    setIsProcessing(true);
    try {
      // Map the kitchen status to the appropriate order status
      const newOrderStatus = mapKitchenStatusToOrderStatus(nextStatus);
      
      console.log(`Updating order ${order.id} from ${currentKitchenStatus} to ${nextStatus}`);
      
      await updateOrder({
        ...order,
        status: newOrderStatus,
        kitchenStatus: nextStatus // Set the kitchenStatus field directly
      });
      
      toast.success(`Updated status to ${getStatusDisplayName(nextStatus)}`);
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status");
    } finally {
      setIsProcessing(false);
      resetCountdown();
    }
  };
  
  // If there's no next status, don't render the button
  if (!nextStatus) return null;
  
  // Calculate progress percentage for the countdown
  const progressPercentage = ((3 - countdown) / 3) * 100;
  
  return (
    <div className="relative">
      {!isCountingDown ? (
        <Button
          variant="outline"
          className="bg-purple-100 hover:bg-purple-200 text-purple-800 border-purple-300"
          onClick={startCountdown}
          disabled={isProcessing}
        >
          {isProcessing ? "Processing..." : `Move to ${getStatusDisplayName(nextStatus)}`}
        </Button>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="bg-red-100 hover:bg-red-200 text-red-800 border-red-300"
              onClick={cancelCountdown}
            >
              <X className="mr-1 h-4 w-4" />
              Cancel ({countdown})
            </Button>
            <Button
              variant="outline"
              className="bg-green-100 hover:bg-green-200 text-green-800 border-green-300"
              onClick={handleStatusUpdate}
            >
              <Check className="mr-1 h-4 w-4" />
              Confirm Now
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-blue-500" />
            <Progress 
              value={progressPercentage} 
              className="h-2 w-full bg-blue-100"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default NextStatusButton;
