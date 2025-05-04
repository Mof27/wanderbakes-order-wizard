
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Order, OrderStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Truck, CheckCircle2, MessageSquare, Clock } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { matchesStatus } from "@/lib/statusHelpers";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Get current status
  const isReady = matchesStatus(order.status, 'ready-to-deliver');
  const isInTransit = matchesStatus(order.status, 'in-delivery');
  const isDelivered = matchesStatus(order.status, 'delivery-confirmed');
  
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
      
      // If transitioning to delivery confirmed, automatically set delivery time if not set
      if (newStatus === 'delivery-confirmed' && !order.actualDeliveryTime) {
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
  
  // Handle navigation to recap section for collecting data
  const navigateToRecap = () => {
    navigate(`/orders/${order.id}?tab=delivery-recap`);
  };
  
  // Ready to deliver -> Start delivery button
  if (isReady) {
    return (
      <Button 
        size={compact ? "sm" : "default"}
        className={`bg-orange-600 hover:bg-orange-700 text-white ${isUpdating ? 'opacity-70' : ''}`}
        disabled={isUpdating}
        onClick={() => updateStatus('in-delivery')}
      >
        <Truck className={`h-4 w-4 ${compact ? '' : 'mr-1'}`} /> 
        {!compact && "Start Delivery"}
      </Button>
    );
  }
  
  // In delivery -> Complete delivery button
  if (isInTransit) {
    return (
      <Button 
        size={compact ? "sm" : "default"}
        className={`bg-green-600 hover:bg-green-700 text-white ${isUpdating ? 'opacity-70' : ''}`}
        disabled={isUpdating}
        onClick={() => updateStatus('delivery-confirmed')}
      >
        <CheckCircle2 className={`h-4 w-4 ${compact ? '' : 'mr-1'}`} />
        {!compact && "Complete Delivery"}
      </Button>
    );
  }
  
  // Delivered -> Add data button (navigate to recap)
  if (isDelivered) {
    return (
      <Button 
        size={compact ? "sm" : "default"}
        className="bg-indigo-600 hover:bg-indigo-700 text-white"
        onClick={navigateToRecap}
      >
        <MessageSquare className={`h-4 w-4 ${compact ? '' : 'mr-1'}`} />
        {!compact && "Add Delivery Data"}
      </Button>
    );
  }
  
  // For any other status, show a button to navigate to recap
  return (
    <Button 
      size={compact ? "sm" : "default"}
      variant="outline"
      onClick={navigateToRecap}
    >
      <Clock className={`h-4 w-4 ${compact ? '' : 'mr-1'}`} />
      {!compact && "Delivery Details"}
    </Button>
  );
};

export default DeliveryStatusManager;
