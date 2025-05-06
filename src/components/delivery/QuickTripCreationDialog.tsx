
import { useEffect, useState, useMemo } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dataService } from "@/services";
import { format } from "date-fns";
import { Trip, DriverType, Order } from "@/types";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  
  // Fetch all orders to get order statuses
  const { data: allOrders = [] } = useQuery({
    queryKey: ["orders", "all", open],
    queryFn: () => dataService.orders.getAll(),
    enabled: open
  });
  
  // Group selected orders by status
  const orderStatusGroups = useMemo(() => {
    const groups: Record<string, number> = {};
    
    // Filter to only get the selected orders
    const selectedOrders = allOrders.filter(order => selectedOrderIds.includes(order.id));
    
    selectedOrders.forEach(order => {
      if (!groups[order.status]) {
        groups[order.status] = 0;
      }
      groups[order.status]++;
    });
    
    return groups;
  }, [allOrders, selectedOrderIds]);
  
  // Check if we have orders in non-ready status
  const hasNonReadyOrders = useMemo(() => {
    return Object.keys(orderStatusGroups).some(status => status !== 'ready-to-deliver');
  }, [orderStatusGroups]);

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
            <div className="col-span-3">
              <div className="text-sm">
                {selectedOrderIds.length} orders selected
              </div>
              
              {/* Display order status breakdown */}
              {Object.keys(orderStatusGroups).length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {Object.entries(orderStatusGroups).map(([status, count]) => (
                    <Badge 
                      key={status} 
                      variant="outline"
                      className={status !== 'ready-to-deliver' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                    >
                      {status.replace(/-/g, ' ')}: {count}
                    </Badge>
                  ))}
                </div>
              )}
              
              {/* Warning for mixed statuses */}
              {hasNonReadyOrders && (
                <div className="mt-2 text-xs flex items-start gap-2 text-amber-600 bg-amber-50 p-2 rounded-md">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <p>
                    Some orders aren't ready for delivery yet. They will be pre-assigned to this trip
                    and will automatically join when they reach "Ready to Deliver" status.
                  </p>
                </div>
              )}
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
