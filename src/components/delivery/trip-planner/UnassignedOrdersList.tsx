
import { Order } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Inbox, Plus, AlertCircle } from "lucide-react";
import OrderList from "@/components/orders/OrderList";
import { useState, useMemo } from "react";
import StatusBadge from "@/components/orders/StatusBadge";

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
  
  // Remove the filtering by status - show all orders
  const unassignedOrders = orders;
  
  // Group orders by status for better organization
  const groupedOrders = useMemo(() => {
    const groups: Record<string, Order[]> = {};
    
    unassignedOrders.forEach(order => {
      if (!groups[order.status]) {
        groups[order.status] = [];
      }
      groups[order.status].push(order);
    });
    
    return groups;
  }, [unassignedOrders]);
  
  // Sort priority for statuses
  const getStatusPriority = (status: string): number => {
    switch(status) {
      case 'ready-to-deliver': return 1;
      case 'in-delivery': return 2;
      case 'pending-approval': return 3;
      case 'needs-revision': return 4;
      case 'waiting-photo': return 5;
      case 'in-kitchen': return 6;
      case 'in-queue': return 7;
      default: return 10;
    }
  };
  
  // Get sorted status keys
  const sortedStatusKeys = useMemo(() => {
    return Object.keys(groupedOrders).sort((a, b) => {
      return getStatusPriority(a) - getStatusPriority(b);
    });
  }, [groupedOrders]);
  
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
    
    // Add visual indicator for orders not in ready-to-deliver status
    const isNotReady = order.status !== 'ready-to-deliver';
    
    return (
      <Button 
        variant="default" 
        size="sm"
        onClick={() => handleAddToTrip(order.id)}
        disabled={isAdding[order.id]}
        className="flex items-center gap-1"
      >
        {isAdding[order.id] ? <Skeleton className="h-4 w-4" /> : isNotReady ? (
          <AlertCircle className="h-4 w-4" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
        {isNotReady ? "Pre-assign" : "Add to Trip"}
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
          Unassigned Orders ({unassignedOrders.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {unassignedOrders.length > 0 ? (
          <div className="space-y-6">
            {sortedStatusKeys.map(statusKey => (
              <div key={statusKey}>
                <div className="flex items-center gap-2 mb-2">
                  <StatusBadge status={statusKey as any} />
                  <span className="text-sm text-muted-foreground">
                    ({groupedOrders[statusKey].length})
                  </span>
                </div>
                <OrderList 
                  orders={groupedOrders[statusKey]}
                  renderActions={renderOrderActions}
                  useWorkflowStatus={false}
                />
              </div>
            ))}
          </div>
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
