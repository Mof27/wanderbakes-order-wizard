
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

interface OrderStatusDropdownProps {
  order: Order;
}

// Status color mapping function - reused from OrderCard and OrderTableRow
const getStatusColor = (status: string) => {
  switch (status) {
    case "incomplete":
      return "bg-gray-200 text-gray-800";
    case "in-kitchen":
      return "bg-yellow-100 text-yellow-800";
    case "waiting-photo":
      return "bg-purple-100 text-purple-800";
    case "ready":
      return "bg-green-100 text-green-800";
    case "delivered":
      return "bg-purple-100 text-purple-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// All available status options
const statusOptions: OrderStatus[] = [
  "incomplete",
  "in-kitchen",
  "waiting-photo",
  "ready",
  "delivered", 
  "cancelled"
];

const OrderStatusDropdown = ({ order }: OrderStatusDropdownProps) => {
  const { updateOrder } = useApp();
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Determine if status change is locked based on current status
  const isStatusLocked = ['in-kitchen', 'waiting-photo', 'ready'].includes(order.status);
  
  // Function to determine if a status is allowed to change to based on current status
  const canChangeTo = (targetStatus: OrderStatus): boolean => {
    if (!isStatusLocked) return true;
    
    // If status is locked, only allow changing to cancelled or incomplete
    return targetStatus === 'cancelled' || targetStatus === 'incomplete';
  };
  
  const handleStatusChange = async (status: OrderStatus) => {
    if (status === order.status || isUpdating || !canChangeTo(status)) return;
    
    setIsUpdating(true);
    try {
      await updateOrder({
        ...order,
        status
      });
    } finally {
      setIsUpdating(false);
    }
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
          {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace("-", " ")}
          <ChevronDown className="h-3 w-3 opacity-70" />
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-40 bg-white">
        {statusOptions.map((status) => (
          <DropdownMenuItem
            key={status}
            className={cn(
              "flex items-center gap-2 cursor-pointer",
              order.status === status ? "bg-accent" : "",
              !canChangeTo(status) && status !== order.status ? "opacity-50 cursor-not-allowed" : ""
            )}
            disabled={!canChangeTo(status) && status !== order.status}
            onClick={() => handleStatusChange(status)}
          >
            {order.status === status && <Check className="h-4 w-4 text-primary" />}
            <span className={order.status === status ? "ml-0" : "ml-6"}>
              {status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default OrderStatusDropdown;
