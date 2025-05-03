import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Helmet } from "react-helmet-async";
import DeliveryDateFilter from "@/components/delivery/DeliveryDateFilter";
import DeliveryStatusFilter from "@/components/delivery/DeliveryStatusFilter";
import DeliveryCard from "@/components/delivery/DeliveryCard";
import { Order } from "@/types";
import { matchesStatus } from "@/lib/statusHelpers";
import { startOfDay, endOfDay, addDays, format } from "date-fns";

const DeliveryPage = () => {
  const { orders } = useApp();
  const [dateFilter, setDateFilter] = useState<'today' | 'tomorrow' | 'd-plus-2' | 'all'>('today');
  const [statusFilter, setStatusFilter] = useState<'ready' | 'in-transit' | 'all'>('ready');

  // Filter orders based on selected date filter
  const filterOrdersByDate = (orders: Order[], dateFilter: string): Order[] => {
    const today = startOfDay(new Date());
    const tomorrow = startOfDay(addDays(today, 1));
    const dayAfterTomorrow = startOfDay(addDays(today, 2));
    
    return orders.filter(order => {
      const deliveryDate = startOfDay(new Date(order.deliveryDate));
      
      switch(dateFilter) {
        case 'today':
          return deliveryDate.getTime() === today.getTime();
        case 'tomorrow':
          return deliveryDate.getTime() === tomorrow.getTime();
        case 'd-plus-2':
          return deliveryDate.getTime() === dayAfterTomorrow.getTime();
        default:
          return true;
      }
    });
  };

  // Filter orders based on selected status
  const filterOrdersByStatus = (orders: Order[], statusFilter: string): Order[] => {
    return orders.filter(order => {
      switch(statusFilter) {
        case 'ready':
          return matchesStatus(order.status, 'ready-to-deliver');
        case 'in-transit':
          return matchesStatus(order.status, 'in-delivery');
        default:
          return (
            matchesStatus(order.status, 'ready-to-deliver') || 
            matchesStatus(order.status, 'in-delivery')
          );
      }
    });
  };
  
  // Get filtered orders
  const filteredOrders = useMemo(() => {
    let filtered = [...orders];
    filtered = filterOrdersByDate(filtered, dateFilter);
    filtered = filterOrdersByStatus(filtered, statusFilter);
    
    // Sort orders by delivery time (if available) or just by delivery date
    return filtered.sort((a, b) => {
      const dateA = new Date(a.deliveryDate);
      const dateB = new Date(b.deliveryDate);
      
      // If they have delivery time slots, compare those first
      if (a.deliveryTimeSlot && b.deliveryTimeSlot) {
        return a.deliveryTimeSlot.localeCompare(b.deliveryTimeSlot);
      }
      
      // Otherwise compare by date
      return dateA.getTime() - dateB.getTime();
    });
  }, [orders, dateFilter, statusFilter]);

  // Group orders by delivery area for better routing
  const ordersByArea = useMemo(() => {
    const grouped: Record<string, Order[]> = {};
    
    filteredOrders.forEach(order => {
      const area = order.deliveryArea || 'Unknown Area';
      if (!grouped[area]) {
        grouped[area] = [];
      }
      grouped[area].push(order);
    });
    
    return grouped;
  }, [filteredOrders]);

  const dateTitles = {
    'today': `Today (${format(new Date(), 'dd MMM')})`,
    'tomorrow': `Tomorrow (${format(addDays(new Date(), 1), 'dd MMM')})`,
    'd-plus-2': `${format(addDays(new Date(), 2), 'dd MMM')}`,
    'all': 'All Delivery Dates'
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Delivery Management | Cake Shop</title>
      </Helmet>
      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Delivery Management</h1>
        <Button 
          variant="outline" 
          onClick={() => window.print()}
          className="hidden md:flex"
        >
          Print Delivery Schedule
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 md:items-center">
        <DeliveryDateFilter
          value={dateFilter}
          onChange={setDateFilter}
        />
        
        <DeliveryStatusFilter
          value={statusFilter}
          onChange={setStatusFilter}
        />
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">
          {dateTitles[dateFilter]} • {filteredOrders.length} deliveries
        </h2>
        
        {Object.entries(ordersByArea).map(([area, areaOrders]) => (
          <div key={area} className="mb-8">
            <div className="bg-muted px-4 py-2 rounded-lg mb-4">
              <h3 className="font-medium">{area} ({areaOrders.length})</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {areaOrders.map(order => (
                <DeliveryCard key={order.id} order={order} />
              ))}
            </div>
          </div>
        ))}
        
        {filteredOrders.length === 0 && (
          <Card className="p-8 text-center text-muted-foreground">
            <p>No deliveries found for the selected filters.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DeliveryPage;
