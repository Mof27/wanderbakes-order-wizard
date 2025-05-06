
import { useState } from "react";
import { Trip, TripStatus } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { Car, CheckCircle2, Clock, MoreVertical, PlayCircle, Route, XCircle } from "lucide-react";
import { dataService } from "@/services";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface TripListProps {
  trips: Trip[];
  isLoading: boolean;
  selectedTripId: string | null;
  onSelectTrip: (tripId: string) => void;
  onTripUpdated: () => void;
}

const TripStatusBadge = ({ status }: { status: TripStatus }) => {
  switch (status) {
    case 'planned':
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Planned</Badge>;
    case 'in-progress':
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">In Progress</Badge>;
    case 'completed':
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
    case 'cancelled':
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
    default:
      return null;
  }
};

const TripList = ({ 
  trips, 
  isLoading, 
  selectedTripId, 
  onSelectTrip,
  onTripUpdated
}: TripListProps) => {
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null);
  
  const handleStatusChange = async (tripId: string, status: TripStatus) => {
    try {
      await dataService.trips.updateTripStatus(tripId, status);
      onTripUpdated();
      toast.success(`Trip ${status === 'in-progress' ? 'started' : status}`);
    } catch (error) {
      console.error(`Failed to update trip status:`, error);
      toast.error("Failed to update trip status");
    }
  };
  
  const handleDeleteTrip = async () => {
    if (!tripToDelete) return;
    
    try {
      // Get all orders in this trip
      const allOrders = await dataService.orders.getAll();
      const tripOrders = allOrders.filter(o => o.tripId === tripToDelete.id);
      
      // Remove trip assignment from all orders
      for (const order of tripOrders) {
        await dataService.orders.removeFromTrip(order.id);
      }
      
      // Delete the trip
      await dataService.trips.delete(tripToDelete.id);
      
      // If the deleted trip was selected, clear selection
      if (selectedTripId === tripToDelete.id) {
        onSelectTrip('');
      }
      
      onTripUpdated();
      setTripToDelete(null);
      toast.success("Trip deleted");
    } catch (error) {
      console.error("Failed to delete trip:", error);
      toast.error("Failed to delete trip");
    }
  };
  
  // Display loading skeletons
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-2 border rounded-md">
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }
  
  // Display empty state
  if (trips.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 space-y-2">
            <Route className="h-10 w-10 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">No trips planned for this day.</p>
            <p className="text-xs text-muted-foreground">Create a trip to organize deliveries.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Route className="h-5 w-5" />
          Trips ({trips.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 p-2">
        {trips.map((trip) => (
          <div 
            key={trip.id}
            className={cn(
              "p-3 border rounded-md cursor-pointer hover:bg-muted/50 transition-colors",
              selectedTripId === trip.id && "bg-muted/70 border-primary/40"
            )}
            onClick={() => onSelectTrip(trip.id)}
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="font-medium">{trip.name}</div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Car className="h-3.5 w-3.5 mr-1" />
                  <span>
                    {trip.driverType === 'driver-1' ? 'Driver 1' : 
                     trip.driverType === 'driver-2' ? 'Driver 2' : 'Lalamove'}
                    {trip.driverName && ` (${trip.driverName})`}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <TripStatusBadge status={trip.status} />
                  <span className="text-xs text-muted-foreground">
                    {trip.orderIds.length} {trip.orderIds.length === 1 ? 'order' : 'orders'}
                  </span>
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {trip.status === 'planned' && (
                    <DropdownMenuItem onClick={() => handleStatusChange(trip.id, 'in-progress')}>
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Start Trip
                    </DropdownMenuItem>
                  )}
                  {trip.status === 'in-progress' && (
                    <DropdownMenuItem onClick={() => handleStatusChange(trip.id, 'completed')}>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Complete Trip
                    </DropdownMenuItem>
                  )}
                  {(trip.status === 'planned' || trip.status === 'in-progress') && (
                    <DropdownMenuItem onClick={() => handleStatusChange(trip.id, 'cancelled')}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel Trip
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => setTripToDelete(trip)}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Delete Trip
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </CardContent>
      
      {/* Delete Trip Confirmation Dialog */}
      <AlertDialog open={!!tripToDelete} onOpenChange={() => setTripToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Trip</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this trip? This action will remove all order assignments and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTrip} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default TripList;
