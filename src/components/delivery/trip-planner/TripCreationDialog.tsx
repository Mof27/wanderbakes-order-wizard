
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { format } from "date-fns";
import { dataService } from "@/services";
import { DriverType, Trip } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Car, ExternalLink, Loader2, Route } from "lucide-react";

interface TripCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date;
  onTripCreated?: () => void;
}

const TripCreationDialog = ({
  open,
  onOpenChange,
  date,
  onTripCreated
}: TripCreationDialogProps) => {
  const [tripName, setTripName] = useState("");
  const [driverType, setDriverType] = useState<DriverType>("driver-1");
  const [driverName, setDriverName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch driver settings
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => dataService.settings.getAll()
  });

  // Get driver names from settings or use defaults
  const driver1Name = settings?.driverSettings?.driver1Name || "Driver 1";
  const driver2Name = settings?.driverSettings?.driver2Name || "Driver 2";
  const driver1Vehicle = settings?.driverSettings?.driver1Vehicle || "Car";
  const driver2Vehicle = settings?.driverSettings?.driver2Vehicle || "Car";
  
  const handleCreate = async () => {
    if (!tripName) return;
    
    setIsSubmitting(true);
    
    try {
      // Get vehicle info based on driver type
      let vehicleInfo: string | undefined;
      if (driverType === "driver-1") {
        vehicleInfo = driver1Vehicle;
      } else if (driverType === "driver-2") {
        vehicleInfo = driver2Vehicle;
      }
      
      // Create new trip
      const newTrip: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'> = {
        name: tripName,
        driverType,
        driverName: driverType === '3rd-party' ? driverName : undefined,
        vehicleInfo,
        date,
        status: 'planned',
        orderIds: [],
        completedOrderIds: [],
        sequence: {}
      };
      
      await dataService.trips.create(newTrip);
      
      // Reset form
      setTripName("");
      setDriverType("driver-1");
      setDriverName("");
      
      // Close dialog
      onOpenChange(false);
      
      // Notify parent
      if (onTripCreated) {
        onTripCreated();
      }
    } catch (error) {
      console.error("Failed to create trip:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            Create New Trip
          </DialogTitle>
          <DialogDescription>
            Plan a new delivery trip for {format(date, "EEEE, MMMM d")}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="trip-name">Trip Name</Label>
            <Input
              id="trip-name"
              placeholder="Morning Deliveries"
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Driver</Label>
            <RadioGroup 
              value={driverType} 
              onValueChange={(v) => setDriverType(v as DriverType)}
              className="grid grid-cols-3 gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="driver-1" id="driver-1" />
                <Label htmlFor="driver-1" className="flex items-center">
                  <Car className="h-4 w-4 mr-2" />
                  {driver1Name}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="driver-2" id="driver-2" />
                <Label htmlFor="driver-2" className="flex items-center">
                  <Car className="h-4 w-4 mr-2" />
                  {driver2Name}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3rd-party" id="3rd-party" />
                <Label htmlFor="3rd-party" className="flex items-center">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Lalamove
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          {driverType === '3rd-party' && (
            <div className="space-y-2">
              <Label htmlFor="driver-name">Lalamove Booking ID</Label>
              <Input
                id="driver-name"
                placeholder="Enter Lalamove booking ID"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
              />
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!tripName || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : "Create Trip"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TripCreationDialog;
