
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
import { useQuery } from "@tanstack/react-query";
import { dataService } from "@/services";

interface QuickDriverAssignDropdownProps {
  order: Order;
  onSuccess?: () => void;
  isPreliminaryOnly?: boolean;
  compact?: boolean; // New prop for compact mode
}

const QuickDriverAssignDropdown: React.FC<QuickDriverAssignDropdownProps> = ({
  order,
  onSuccess,
  isPreliminaryOnly = true,
  compact = false
}) => {
  const { updateOrder } = useApp();
  const [isLoading, setIsLoading] = React.useState(false);

  // Fetch driver settings
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => dataService.settings.getAll()
  });

  // Get driver names and vehicles from settings or use defaults
  const driver1Name = settings?.driverSettings?.driver1Name || "Driver 1";
  const driver2Name = settings?.driverSettings?.driver2Name || "Driver 2";
  const driver1Vehicle = settings?.driverSettings?.driver1Vehicle || "Car";
  const driver2Vehicle = settings?.driverSettings?.driver2Vehicle || "Car";

  // Check if there's already an assignment
  const hasAssignment = !!order.deliveryAssignment;
  const currentDriverType = order.deliveryAssignment?.driverType;
  const isPreliminary = order.deliveryAssignment?.isPreliminary || false;

  const assignDriver = async (driverType: DriverType) => {
    try {
      setIsLoading(true);
      
      // Get vehicle information based on driver type
      const vehicleInfo = driverType === 'driver-1' ? driver1Vehicle : 
                          driverType === 'driver-2' ? driver2Vehicle : undefined;
                          
      // Create assignment details with required assignedAt property
      const assignment = {
        driverType,
        // Initial Lalamove assignment doesn't need a name yet
        driverName: driverType === "3rd-party" ? undefined : undefined,
        isPreliminary: isPreliminaryOnly,
        assignedAt: new Date(), // Add the required assignedAt property
        vehicleInfo: vehicleInfo // Store vehicle information
      };

      // Create a new order object with the updated assignment
      const updatedOrder = {
        ...order,
        deliveryAssignment: assignment,
      };

      // Update the order with the new assignment
      await updateOrder(updatedOrder);

      // Show success notification
      toast.toast({
        title: isPreliminaryOnly ? "Driver Pre-Assigned" : "Driver Assigned",
        description: `Order ${order.id} has been ${isPreliminaryOnly ? 'pre-assigned' : 'assigned'} to ${
          driverType === "3rd-party" ? "Lalamove" : 
          driverType === "driver-1" ? driver1Name : driver2Name
        }`
      });

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error assigning driver:", error);
      toast.toast({
        title: "Assignment Failed",
        description: "There was an error assigning the driver. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Render button text based on current assignment status and compact mode
  const getButtonText = () => {
    if (compact) {
      return hasAssignment ? (isPreliminary ? "Pre" : "Asgn") : "Assign";
    }
    
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
            compact ? "text-xs h-6 px-1.5 min-w-0" : "text-sm h-7",
            "gap-0.5",
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
          <Car className="h-3.5 w-3.5 mr-1.5" />
          <span>{driver1Name}</span>
          {currentDriverType === "driver-1" && isPreliminary && (
            <AlertCircle className="h-3 w-3 ml-1 text-blue-500" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => assignDriver("driver-2")}
          className={cn(
            currentDriverType === "driver-2" && "bg-indigo-50 text-indigo-700"
          )}
        >
          <Car className="h-3.5 w-3.5 mr-1.5" />
          <span>{driver2Name}</span>
          {currentDriverType === "driver-2" && isPreliminary && (
            <AlertCircle className="h-3 w-3 ml-1 text-indigo-500" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => assignDriver("3rd-party")}
          className={cn(
            currentDriverType === "3rd-party" && "bg-purple-50 text-purple-700"
          )}
        >
          <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
          <span>Lalamove</span>
          {currentDriverType === "3rd-party" && isPreliminary && (
            <AlertCircle className="h-3 w-3 ml-1 text-purple-500" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default QuickDriverAssignDropdown;
