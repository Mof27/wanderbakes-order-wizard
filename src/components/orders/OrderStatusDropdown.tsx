
import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Order, OrderStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";

interface OrderStatusDropdownProps {
  order: Order;
}

// Status color mapping function - reused from OrderCard and OrderTableRow
const getStatusColor = (status: string) => {
  switch (status) {
    case "incomplete":
      return "bg-gray-200 text-gray-800";
    case "in-queue":
      return "bg-blue-100 text-blue-800";
    case "in-kitchen":
      return "bg-yellow-100 text-yellow-800";
    case "waiting-photo":
      return "bg-purple-100 text-purple-800";
    case "ready-to-deliver":
      return "bg-green-100 text-green-800";
    case "in-delivery":
      return "bg-orange-100 text-orange-800";
    case "delivery-confirmed":
      return "bg-teal-100 text-teal-800";
    case "waiting-feedback":
      return "bg-indigo-100 text-indigo-800";
    case "finished":
      return "bg-lime-100 text-lime-800";
    case "archived":
      return "bg-slate-100 text-slate-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// All available status options
const statusOptions: OrderStatus[] = [
  "incomplete",
  "in-queue",
  "in-kitchen",
  "waiting-photo",
  "ready-to-deliver",
  "in-delivery",
  "delivery-confirmed",
  "waiting-feedback",
  "finished",
  "archived",
  "cancelled"
];

const OrderStatusDropdown = ({ order }: OrderStatusDropdownProps) => {
  const { updateOrder } = useApp();
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Determine if status change is locked based on current status
  // Updated to include 'ready-to-deliver' in locked statuses
  const isStatusLocked = ['in-kitchen', 'waiting-photo', 'in-delivery', 'ready-to-deliver', 'archived'].includes(order.status);
  
  // Function to determine if a status is allowed to change to based on current status
  const canChangeTo = (targetStatus: OrderStatus): boolean => {
    // If trying to change to 'incomplete', only allow it if already 'incomplete'
    if (targetStatus === 'incomplete') {
      return order.status === 'incomplete';
    }
    
    // If the order is archived, only allow restoration to 'finished'
    if (order.status === 'archived') {
      return targetStatus === 'finished';
    }
    
    // If not in a locked status, we can change to any other status
    if (!isStatusLocked) {
      return true;
    }
    
    // Define allowed status transitions
    const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
      'incomplete': ['in-queue', 'cancelled'],
      'in-queue': ['in-kitchen', 'cancelled'],
      'in-kitchen': ['waiting-photo', 'cancelled'],
      'waiting-photo': ['ready-to-deliver', 'cancelled'],
      'ready-to-deliver': ['cancelled'], // Can only cancel from Orders page once ready to deliver
      'in-delivery': ['delivery-confirmed', 'cancelled'],
      'delivery-confirmed': ['waiting-feedback', 'cancelled'],
      'waiting-feedback': ['finished', 'cancelled'],
      'finished': ['archived', 'cancelled'],
      'archived': ['finished'], // Can restore from archived to finished
      'cancelled': []
    };
    
    // Check if the target status is allowed for the current status
    return allowedTransitions[order.status]?.includes(targetStatus) || false;
  };
  
  const handleStatusChange = async (status: OrderStatus) => {
    if (status === order.status || isUpdating || !canChangeTo(status)) return;
    
    setIsUpdating(true);
    try {
      // Special handling for archiving - add archivedDate
      if (status === 'archived') {
        await updateOrder({
          ...order,
          status,
          archivedDate: new Date()
        });
      } else {
        await updateOrder({
          ...order,
          status
        });
      }
      toast.success(`Status updated to ${status.replace('-', ' ')}`);
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  // Helper function to format status for display
  const formatStatusLabel = (status: string): string => {
    return status
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Add message for locked statuses that need to be managed elsewhere
  const getLockedStatusMessage = (status: OrderStatus): string | null => {
    if (status === 'ready-to-deliver' || status === 'in-delivery') {
      return 'Manage from Delivery page';
    } else if (status === 'in-kitchen' || status === 'waiting-photo') {
      return 'Manage from Kitchen page';
    } else if (status === 'archived') {
      return 'Manage from Archived page';
    }
    return null;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger 
        disabled={isUpdating}
        className="cursor-pointer focus:outline-none"
      >
        <Badge 
          className={cn(
            "flex items-center gap-1", 
            getStatusColor(order.status),
            isUpdating ? "opacity-70" : ""
          )}
        >
          {formatStatusLabel(order.status)}
          <ChevronDown className="h-3 w-3 opacity-70" />
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48 bg-white">
        {statusOptions.map((status) => {
          const isLocked = !canChangeTo(status) && status !== order.status;
          const lockedMessage = getLockedStatusMessage(status);
          
          return (
            <DropdownMenuItem
              key={status}
              className={cn(
                "flex items-center gap-2 cursor-pointer",
                order.status === status ? "bg-accent" : "",
                isLocked ? "opacity-50 cursor-not-allowed" : ""
              )}
              disabled={isLocked}
              onClick={() => handleStatusChange(status)}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  {order.status === status && <Check className="h-4 w-4 text-primary mr-1" />}
                  <span className={order.status === status ? "ml-0" : "ml-0"}>
                    {formatStatusLabel(status)}
                  </span>
                </div>
                
                {isLocked && lockedMessage && (
                  <span className="text-xs text-muted-foreground ml-1">
                    {lockedMessage}
                  </span>
                )}
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default OrderStatusDropdown;
