
import React from "react";
import { Order, DriverType } from "@/types";
import { useApp } from "@/context/AppContext";
import { Car, ExternalLink, ChevronDown, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface QuickDriverAssignDropdownProps {
  order: Order;
  onSuccess?: () => void;
  isPreliminaryOnly?: boolean;
}

const QuickDriverAssignDropdown: React.FC<QuickDriverAssignDropdownProps> = ({
  order,
  onSuccess,
  isPreliminaryOnly = true,
}) => {
  const { updateOrder } = useApp();
  const [isLoading, setIsLoading] = React.useState(false);

  // Check if there's already an assignment
  const hasAssignment = !!order.deliveryAssignment;
  const currentDriverType = order.deliveryAssignment?.driverType;
  const isPreliminary = order.deliveryAssignment?.isPreliminary || false;

  const assignDriver = async (driverType: DriverType) => {
    try {
      setIsLoading(true);
      
      // Create assignment details
      const assignment = {
        driverType,
        // Initial 3rd-party assignment doesn't need a name yet
        driverName: driverType === "3rd-party" ? undefined : undefined,
        isPreliminary: isPreliminaryOnly,
      };

      // Update the order with the new assignment
      await updateOrder(order.id, {
        deliveryAssignment: assignment,
      });

      // Show success notification
      toast({
        title: isPreliminaryOnly ? "Driver Pre-Assigned" : "Driver Assigned",
        description: `Order ${order.id} has been ${isPreliminaryOnly ? 'pre-assigned' : 'assigned'} to ${driverType === "3rd-party" ? "3rd Party" : driverType === "driver-1" ? "Driver 1" : "Driver 2"}`,
        variant: "default",
      });

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error assigning driver:", error);
      toast({
        title: "Assignment Failed",
        description: "There was an error assigning the driver. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Render button text based on current assignment status
  const getButtonText = () => {
    if (!hasAssignment) {
      return "Assign";
    }
    
    if (isPreliminary) {
      return "Pre-Assigned";
    }
    
    return "Assigned";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "text-sm h-7 gap-1",
            hasAssignment && "text-blue-600 font-medium"
          )}
          disabled={isLoading}
        >
          {getButtonText()}
          <ChevronDown className="h-3 w-3 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 bg-background">
        <DropdownMenuItem 
          onClick={() => assignDriver("driver-1")}
          className={cn(
            currentDriverType === "driver-1" && "bg-blue-50 text-blue-700"
          )}
        >
          <Car className="h-4 w-4 mr-2" />
          <span>Driver 1</span>
          {currentDriverType === "driver-1" && isPreliminary && (
            <AlertCircle className="h-3 w-3 ml-2 text-blue-500" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => assignDriver("driver-2")}
          className={cn(
            currentDriverType === "driver-2" && "bg-indigo-50 text-indigo-700"
          )}
        >
          <Car className="h-4 w-4 mr-2" />
          <span>Driver 2</span>
          {currentDriverType === "driver-2" && isPreliminary && (
            <AlertCircle className="h-3 w-3 ml-2 text-indigo-500" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => assignDriver("3rd-party")}
          className={cn(
            currentDriverType === "3rd-party" && "bg-purple-50 text-purple-700"
          )}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          <span>3rd Party</span>
          {currentDriverType === "3rd-party" && isPreliminary && (
            <AlertCircle className="h-3 w-3 ml-2 text-purple-500" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default QuickDriverAssignDropdown;
