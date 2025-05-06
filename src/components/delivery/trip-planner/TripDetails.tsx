
import { useEffect, useState } from "react";
import { Trip, Order } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { Car, CheckCircle2, Calendar, Clock, Route, Save, Loader2, ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { dataService } from "@/services";
import TripOrderItem from "./TripOrderItem";

interface TripDetailsProps {
  trip: Trip;
  orders: Order[];
  onTripUpdated: () => void;
  onRemoveOrder: (orderId: string, tripId: string) => Promise<void>;
}

const TripDetails = ({ 
  trip, 
  orders, 
  onTripUpdated,
  onRemoveOrder
}: TripDetailsProps) => {
  const [notes, setNotes] = useState(trip.notes || "");
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Reset notes when trip changes
  useEffect(() => {
    setNotes(trip.notes || "");
  }, [trip]);
  
  const handleSaveNotes = async () => {
    setIsUpdating(true);
    try {
      await dataService.trips.update(trip.id, { notes });
      onTripUpdated();
      toast.success("Trip notes saved");
    } catch (error) {
      console.error("Failed to save trip notes:", error);
      toast.error("Failed to save trip notes");
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleMoveOrder = async (orderId: string, direction: 'up' | 'down') => {
    // Find the current order and its sequence
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return;
    
    const currentOrder = orders[orderIndex];
    const currentSeq = currentOrder.tripSequence || 0;
    
    // Find the adjacent order based on direction
    const targetIndex = direction === 'up' ? orderIndex - 1 : orderIndex + 1;
    if (targetIndex < 0 || targetIndex >= orders.length) return;
    
    const targetOrder = orders[targetIndex];
    const targetSeq = targetOrder.tripSequence || 0;
    
    // Create new sequence mapping
    const newSequence = { ...trip.sequence };
    newSequence[currentOrder.id] = targetSeq;
    newSequence[targetOrder.id] = currentSeq;
    
    try {
      // Update trip sequence
      await dataService.trips.resequenceTrip(trip.id, newSequence);
      
      // Update UI
      onTripUpdated();
      toast.success(`Order moved ${direction}`);
    } catch (error) {
      console.error("Failed to reorder trips:", error);
      toast.error("Failed to reorder trips");
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Route className="h-5 w-5" />
          {trip.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">Driver</Label>
            <div className="flex items-center">
              <Car className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>
                {trip.driverType === 'driver-1' ? 'Driver 1' : 
                 trip.driverType === 'driver-2' ? 'Driver 2' : 'Lalamove'}
                {trip.driverName && ` (${trip.driverName})`}
              </span>
            </div>
            {trip.vehicleInfo && (
              <div className="text-xs text-muted-foreground">
                Vehicle: {trip.vehicleInfo}
              </div>
            )}
          </div>
          
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">Date</Label>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{new Date(trip.date).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="trip-notes" className="text-sm">Notes</Label>
          <div className="flex items-start gap-2">
            <Textarea
              id="trip-notes"
              placeholder="Add notes for this trip..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handleSaveNotes} 
              disabled={isUpdating || notes === trip.notes}
              size="sm"
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Orders ({orders.length})</Label>
          </div>
          
          {orders.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground text-sm border rounded-md">
              No orders assigned to this trip yet
            </div>
          ) : (
            <div className="space-y-2">
              {orders.map((order, index) => (
                <TripOrderItem 
                  key={order.id}
                  order={order}
                  index={index}
                  isFirst={index === 0}
                  isLast={index === orders.length - 1}
                  onMoveUp={() => handleMoveOrder(order.id, 'up')}
                  onMoveDown={() => handleMoveOrder(order.id, 'down')}
                  onRemove={() => onRemoveOrder(order.id, trip.id)}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TripDetails;
