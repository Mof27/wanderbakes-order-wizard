
import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Order, KitchenOrderStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";

interface KitchenStatusDropdownProps {
  order: Order;
}

// Kitchen status color mapping
const getKitchenStatusColor = (status: string) => {
  switch (status) {
    case "waiting-baker":
      return "bg-orange-100 text-orange-800";
    case "waiting-crumbcoat":
      return "bg-yellow-100 text-yellow-800";
    case "waiting-cover":
      return "bg-blue-100 text-blue-800";
    case "decorating":
      return "bg-purple-100 text-purple-800";
    case "done-waiting-approval":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Function to derive kitchen status from order status
const deriveKitchenStatus = (order: Order): KitchenOrderStatus => {
  // Eventually this will use a dedicated kitchenStatus field
  // For now, infer it based on the order status
  switch (order.status) {
    case 'in-queue':
      return 'waiting-baker';
    case 'waiting-photo':
      return 'done-waiting-approval';
    case 'in-kitchen':
      // Default to decorating, but this is where we would
      // look at the kitchenStatus property once implemented
      return 'decorating';
    default:
      return 'waiting-baker';
  }
};

// All available kitchen status options
const kitchenStatusOptions: KitchenOrderStatus[] = [
  "waiting-baker",
  "waiting-crumbcoat",
  "waiting-cover",
  "decorating",
  "done-waiting-approval"
];

// Function to map kitchen status to order status
const mapKitchenStatusToOrderStatus = (kitchenStatus: KitchenOrderStatus) => {
  switch (kitchenStatus) {
    case 'waiting-baker':
    case 'waiting-crumbcoat':
    case 'waiting-cover':
    case 'decorating':
      return 'in-kitchen';
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
    case 'decorating': 
      return 'Decorating';
    case 'done-waiting-approval': 
      return 'Done, Waiting Approval';
    default:
      // Provide a safe fallback - this should never happen
      // if the KitchenOrderStatus type is used correctly
      return 'Unknown Status';
  }
};

/**
 * @deprecated This component is being replaced by NextStatusButton
 */
const KitchenStatusDropdown = ({ order }: KitchenStatusDropdownProps) => {
  const { updateOrder } = useApp();
  const [isUpdating, setIsUpdating] = useState(false);
  const currentKitchenStatus = deriveKitchenStatus(order);
  
  const handleStatusChange = async (kitchenStatus: KitchenOrderStatus) => {
    if (kitchenStatus === currentKitchenStatus || isUpdating) return;
    
    setIsUpdating(true);
    try {
      // Map the kitchen status to the appropriate order status
      const newOrderStatus = mapKitchenStatusToOrderStatus(kitchenStatus);
      
      await updateOrder({
        ...order,
        status: newOrderStatus,
        // In the future we would also set a dedicated kitchenStatus field
        // kitchenStatus: kitchenStatus
      });
      
      toast.success(`Updated status to ${getStatusDisplayName(kitchenStatus)}`);
    } catch (error) {
      toast.error("Failed to update status");
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
            getKitchenStatusColor(currentKitchenStatus),
            isUpdating ? "opacity-70" : ""
          )}
        >
          {getStatusDisplayName(currentKitchenStatus)}
          <ChevronDown className="h-3 w-3 opacity-70" />
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-40 bg-white">
        {kitchenStatusOptions.map((status) => (
          <DropdownMenuItem
            key={status}
            className={cn(
              "flex items-center gap-2 cursor-pointer",
              currentKitchenStatus === status ? "bg-accent" : ""
            )}
            onClick={() => handleStatusChange(status)}
          >
            {currentKitchenStatus === status && <Check className="h-4 w-4 text-primary" />}
            <span className={currentKitchenStatus === status ? "ml-0" : "ml-6"}>
              {getStatusDisplayName(status)}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default KitchenStatusDropdown;
