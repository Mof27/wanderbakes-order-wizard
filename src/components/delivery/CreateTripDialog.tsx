
import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Order, DriverType } from "@/types";
import { DeliveryTrip } from "@/types/trip";
import { format } from "date-fns";
import { Clock, Calendar, ListOrdered, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface CreateTripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedOrderIds: string[];
  onSuccess?: () => void;
}

const CreateTripDialog: React.FC<CreateTripDialogProps> = ({
  open,
  onOpenChange,
  selectedOrderIds,
  onSuccess
}) => {
  const { orders, createTrip, clearOrderSelection } = useApp();
  const [driverId, setDriverId] = useState<DriverType>("driver-1");
  const [departureTime, setDepartureTime] = useState<string>("");
  const [tripDate, setTripDate] = useState<Date>(new Date());
  const [tripNumber, setTripNumber] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Filter orders to only include those that are selected
  const selectedOrders = orders.filter(order => selectedOrderIds.includes(order.id));

  // Sort orders by delivery date
  const sortedOrders = [...selectedOrders].sort((a, b) => 
    new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime()
  );

  // Handle create trip
  const handleCreateTrip = async () => {
    try {
      setIsLoading(true);
      
      // Convert departure time string to Date
      let departureTimeDate: Date | undefined;
      if (departureTime) {
        departureTimeDate = new Date(tripDate);
        const [hours, minutes] = departureTime.split(':').map(Number);
        departureTimeDate.setHours(hours, minutes, 0, 0);
      }
      
      // Create trip data
      const tripData: Omit<DeliveryTrip, 'id' | 'createdAt' | 'updatedAt'> = {
        driverId,
        tripDate,
        tripNumber,
        departureTime: departureTimeDate,
        status: 'planned',
        orderIds: selectedOrderIds,
        name: `${driverId === 'driver-1' ? 'Driver #1' : 'Driver #2'} Trip ${tripNumber}`
      };
      
      await createTrip(tripData);
      
      // Clear selection and close dialog
      clearOrderSelection();
      onOpenChange(false);
      
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error) {
      console.error("Failed to create trip:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Delivery Trip</DialogTitle>
          <DialogDescription>
            Group selected orders into a delivery trip for a driver.
          </DialogDescription>
        </DialogHeader>
        
        {/* Driver Selection */}
        <div className="space-y-1">
          <Label htmlFor="driver">Driver</Label>
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant={driverId === "driver-1" ? "default" : "outline"}
              className={cn(
                "flex-1",
                driverId === "driver-1" && "bg-blue-600"
              )}
              onClick={() => setDriverId("driver-1")}
            >
              <User className="mr-2 h-4 w-4" /> Driver #1
            </Button>
            <Button 
              type="button" 
              variant={driverId === "driver-2" ? "default" : "outline"}
              className={cn(
                "flex-1",
                driverId === "driver-2" && "bg-indigo-600"
              )}
              onClick={() => setDriverId("driver-2")}
            >
              <User className="mr-2 h-4 w-4" /> Driver #2
            </Button>
          </div>
        </div>
        
        {/* Trip Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="tripNumber">Trip Number</Label>
            <Input
              id="tripNumber"
              type="number"
              min="1"
              value={tripNumber}
              onChange={(e) => setTripNumber(parseInt(e.target.value) || 1)}
              className="w-full"
            />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="departureTime">Departure Time (Optional)</Label>
            <div className="flex">
              <Input
                id="departureTime"
                type="time"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </div>
        
        {/* Selected Orders */}
        <div className="space-y-2">
          <Label>Selected Orders ({selectedOrders.length})</Label>
          <div className="border rounded-md overflow-hidden">
            <div className="max-h-40 overflow-y-auto">
              {sortedOrders.map((order, index) => (
                <div 
                  key={order.id}
                  className={cn(
                    "px-3 py-2 flex justify-between",
                    index % 2 === 0 ? "bg-muted/50" : "bg-background"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">#{order.id.substring(order.id.length - 5)}</span>
                    <span className="text-sm text-muted-foreground">{order.customer.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {format(new Date(order.deliveryDate), "MMM d")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateTrip} 
            disabled={isLoading || selectedOrders.length === 0}
          >
            Create Trip
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTripDialog;
