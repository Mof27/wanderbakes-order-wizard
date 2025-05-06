
import { useState, useMemo, useCallback } from "react";
import { Trip, Order } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { dataService } from "@/services";
import { format, startOfDay, addDays, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/sonner";
import { PlusCircle, Route, Calendar, List } from "lucide-react";
import TripList from "./TripList";
import TripDetails from "./TripDetails";
import UnassignedOrdersList from "./UnassignedOrdersList";
import TripCreationDialog from "./TripCreationDialog";

const TripPlannerView = ({ selectedDate }: { selectedDate: Date }) => {
  const [isCreatingTrip, setIsCreatingTrip] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Format date for display
  const formattedDate = format(selectedDate, "EEEE, MMMM d");
  
  // Fetch trips for the selected date
  const { data: trips = [], isLoading: isLoadingTrips } = useQuery({
    queryKey: ['trips', selectedDate.toISOString(), refreshKey],
    queryFn: () => dataService.trips.getByDate(selectedDate)
  });
  
  // Fetch all orders for the selected date 
  const { data: allOrders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ['orders', 'delivery-date', selectedDate.toISOString(), refreshKey],
    queryFn: async () => {
      const allOrders = await dataService.orders.getAll();
      return allOrders.filter(order => {
        // Filter by delivery date
        const orderDeliveryDate = startOfDay(new Date(order.deliveryDate));
        const compareDate = startOfDay(selectedDate);
        return orderDeliveryDate.getTime() === compareDate.getTime();
      });
    }
  });
  
  // Get selected trip if any
  const selectedTrip = useMemo(() => {
    return trips.find(trip => trip.id === selectedTripId) || null;
  }, [trips, selectedTripId]);

  // Filter unassigned orders (not in any trip)
  const unassignedOrders = useMemo(() => {
    return allOrders.filter(order => !order.tripId);
  }, [allOrders]);

  // Get orders for selected trip
  const tripOrders = useMemo(() => {
    if (!selectedTripId) return [];
    
    // Get orders in this trip
    return allOrders
      .filter(order => order.tripId === selectedTripId)
      .sort((a, b) => {
        // Sort by sequence if available
        if (a.tripSequence && b.tripSequence) {
          return a.tripSequence - b.tripSequence;
        }
        return 0;
      });
  }, [allOrders, selectedTripId]);
  
  // Handlers
  const handleTripCreated = () => {
    setIsCreatingTrip(false);
    setRefreshKey(prev => prev + 1);
    toast.success("Trip created successfully");
  };
  
  const handleTripSelected = (tripId: string) => {
    setSelectedTripId(tripId);
  };
  
  const handleTripUpdated = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  const handleAddOrderToTrip = async (orderId: string, targetTripId: string) => {
    if (!targetTripId) return;
    
    try {
      // Assign the order to the trip
      await dataService.orders.assignToTrip(orderId, targetTripId);
      
      // Add the order to the trip
      await dataService.trips.addOrderToTrip(targetTripId, orderId);
      
      setRefreshKey(prev => prev + 1);
      toast.success("Order added to trip");
    } catch (error) {
      console.error("Failed to add order to trip:", error);
      toast.error("Failed to add order to trip");
    }
  };
  
  const handleRemoveOrderFromTrip = async (orderId: string, tripId: string) => {
    try {
      // Remove the order from the trip
      await dataService.trips.removeOrderFromTrip(tripId, orderId);
      
      // Remove the trip assignment from the order
      await dataService.orders.removeFromTrip(orderId);
      
      setRefreshKey(prev => prev + 1);
      toast.success("Order removed from trip");
    } catch (error) {
      console.error("Failed to remove order from trip:", error);
      toast.error("Failed to remove order from trip");
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Route className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Trip Planner</h2>
          <span className="text-muted-foreground">•</span>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{formattedDate}</span>
          </div>
        </div>
        <Button 
          onClick={() => setIsCreatingTrip(true)} 
          className="flex items-center gap-1"
        >
          <PlusCircle className="h-4 w-4" />
          Create Trip
        </Button>
      </div>
      
      <Separator />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left column - Trip list */}
        <div className="md:col-span-1">
          <TripList 
            trips={trips} 
            isLoading={isLoadingTrips}
            selectedTripId={selectedTripId}
            onSelectTrip={handleTripSelected}
            onTripUpdated={handleTripUpdated}
          />
        </div>
        
        {/* Right column - Trip details or unassigned orders */}
        <div className="md:col-span-2">
          {selectedTrip ? (
            <TripDetails 
              trip={selectedTrip} 
              orders={tripOrders}
              onTripUpdated={handleTripUpdated}
              onRemoveOrder={handleRemoveOrderFromTrip}
            />
          ) : (
            <div className="border rounded-md p-4 bg-muted/30">
              <p className="text-center text-muted-foreground">
                Select a trip to see details or create a new trip
              </p>
            </div>
          )}
          
          {/* Unassigned orders section */}
          <div className="mt-4">
            <UnassignedOrdersList 
              orders={unassignedOrders}
              isLoading={isLoadingOrders}
              onAddToTrip={handleAddOrderToTrip}
              selectedTripId={selectedTripId}
            />
          </div>
        </div>
      </div>
      
      {/* Trip Creation Dialog */}
      <TripCreationDialog 
        open={isCreatingTrip}
        onOpenChange={setIsCreatingTrip}
        date={selectedDate}
        onTripCreated={handleTripCreated}
      />
    </div>
  );
};

export default TripPlannerView;
