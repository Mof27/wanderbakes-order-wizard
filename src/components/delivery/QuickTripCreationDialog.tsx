
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dataService } from "@/services";
import { format } from "date-fns";
import { Trip, DriverType } from "@/types";
import { toast } from "sonner";

interface QuickTripCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (tripId: string) => void;
  selectedOrderIds: string[];
  date: Date;
}

const QuickTripCreationDialog = ({
  open,
  onOpenChange,
  onSuccess,
  selectedOrderIds,
  date
}: QuickTripCreationDialogProps) => {
  const queryClient = useQueryClient();
  const [driverType, setDriverType] = useState<DriverType>("driver-1");
  const [loading, setLoading] = useState(false);

  // Fetch driver settings to get the driver names
  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: () => dataService.settings.getAll()
  });

  // Fetch existing trips to generate a trip counter
  const { data: existingTrips = [] } = useQuery({
    queryKey: ["trips", format(date, "yyyy-MM-dd")],
    queryFn: () => dataService.trips.getByDate(date),
    enabled: open // Only fetch when dialog is open
  });

  // Generate trip name based on driver and existing trips
  const generateTripName = () => {
    if (!settings) return "";

    const driverName = driverType === "driver-1" 
      ? settings.driverSettings.driver1Name 
      : driverType === "driver-2" 
        ? settings.driverSettings.driver2Name 
        : "3rd Party";

    // Count existing trips for this driver on this date
    const driverTrips = existingTrips.filter(trip => trip.driverType === driverType);
    const nextTripNumber = driverTrips.length + 1;

    return `${driverName} Trip #${nextTripNumber}`;
  };

  // Create trip mutation
  const createTripMutation = useMutation({
    mutationFn: async () => {
      // Create new trip
      const newTrip = await dataService.trips.create({
        name: generateTripName(),
        driverType,
        date,
        status: "planned",
        orderIds: [],
        completedOrderIds: [],
        sequence: {}
      });

      // Add orders to the trip
      for (const orderId of selectedOrderIds) {
        await dataService.trips.addOrderToTrip(newTrip.id, orderId);
      }

      return newTrip;
    },
    onSuccess: (newTrip) => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success(`Trip created: ${newTrip.name}`);
      onSuccess(newTrip.id);
    },
    onError: (error) => {
      console.error("Error creating trip:", error);
      toast.error("Failed to create trip");
      setLoading(false);
    }
  });

  const handleCreateTrip = async () => {
    if (selectedOrderIds.length === 0) {
      toast.error("No orders selected");
      return;
    }

    setLoading(true);
    createTripMutation.mutate();
  };

  const tripName = generateTripName();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Trip</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="driver" className="text-right">
              Driver
            </Label>
            <Select 
              value={driverType} 
              onValueChange={(value) => setDriverType(value as DriverType)}
              disabled={loading}
            >
              <SelectTrigger id="driver" className="col-span-3">
                <SelectValue placeholder="Select driver" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="driver-1">
                  {settings?.driverSettings.driver1Name || "Driver 1"}
                </SelectItem>
                <SelectItem value="driver-2">
                  {settings?.driverSettings.driver2Name || "Driver 2"}
                </SelectItem>
                <SelectItem value="3rd-party">3rd Party</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="trip-name" className="text-right">
              Trip Name
            </Label>
            <div className="col-span-3 px-3 py-2 border rounded-md bg-muted">
              {tripName}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Orders</Label>
            <div className="col-span-3 text-sm">
              {selectedOrderIds.length} orders selected
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleCreateTrip} disabled={loading || selectedOrderIds.length === 0}>
            {loading ? "Creating..." : "Create Trip"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuickTripCreationDialog;
