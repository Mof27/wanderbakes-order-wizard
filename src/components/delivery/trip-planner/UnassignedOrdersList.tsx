
import { Order } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Inbox, Plus } from "lucide-react";
import OrderList from "@/components/orders/OrderList";
import { useState } from "react";

interface UnassignedOrdersListProps {
  orders: Order[];
  isLoading: boolean;
  onAddToTrip: (orderId: string, tripId: string) => Promise<void>;
  selectedTripId: string | null;
}

const UnassignedOrdersList = ({
  orders,
  isLoading,
  onAddToTrip,
  selectedTripId
}: UnassignedOrdersListProps) => {
  const [isAdding, setIsAdding] = useState<Record<string, boolean>>({});
  
  // Filter orders that are ready to be assigned to trips
  // We only want orders in delivery-related statuses
  const filteredOrders = orders.filter(order => 
    order.status === 'ready-to-deliver' || 
    order.status === 'in-delivery' || 
    order.status === 'waiting-feedback'
  );
  
  const handleAddToTrip = async (orderId: string) => {
    if (!selectedTripId) return;
    
    setIsAdding(prev => ({ ...prev, [orderId]: true }));
    
    try {
      await onAddToTrip(orderId, selectedTripId);
    } finally {
      setIsAdding(prev => ({ ...prev, [orderId]: false }));
    }
  };
  
  const renderOrderActions = (order: Order) => {
    if (!selectedTripId) {
      return (
        <Button variant="outline" size="sm" disabled>
          Select a trip
        </Button>
      );
    }
    
    return (
      <Button 
        variant="default" 
        size="sm"
        onClick={() => handleAddToTrip(order.id)}
        disabled={isAdding[order.id]}
        className="flex items-center gap-1"
      >
        {isAdding[order.id] ? <Skeleton className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        Add to Trip
      </Button>
    );
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Unassigned Orders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Inbox className="h-5 w-5" />
          Unassigned Orders ({filteredOrders.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {filteredOrders.length > 0 ? (
          <OrderList 
            orders={filteredOrders}
            renderActions={renderOrderActions}
            useWorkflowStatus={false}
          />
        ) : (
          <div className="text-center py-4">
            <CheckCircle className="h-10 w-10 text-muted-foreground mx-auto" />
            <p className="mt-2 text-muted-foreground">All orders have been assigned to trips</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UnassignedOrdersList;
