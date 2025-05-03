
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

// Helper function to categorize time slots
const getTimeSlotCategory = (timeSlot: string | undefined): string => {
  if (!timeSlot) return "Unknown Time";
  
  // Handle predefined slots
  if (timeSlot === "slot1" || timeSlot === "09:00 - 12:00") return "Morning (09:00 - 12:00)";
  if (timeSlot === "slot2" || timeSlot === "13:00 - 17:00") return "Afternoon (13:00 - 17:00)";
  if (timeSlot === "slot3" || timeSlot === "17:00 - 20:00") return "Evening (17:00 - 20:00)";
  
  // Handle custom time formats by parsing hours
  const timeMatch = timeSlot.match(/(\d{1,2})[:.]\d{2}\s*-\s*(\d{1,2})[:.]\d{2}/);
  if (timeMatch) {
    const startHour = parseInt(timeMatch[1], 10);
    
    // Categorize based on starting hour
    if (startHour >= 6 && startHour < 12) return "Morning (06:00 - 12:00)";
    if (startHour >= 12 && startHour < 17) return "Afternoon (12:00 - 17:00)";
    if (startHour >= 17 && startHour < 21) return "Evening (17:00 - 21:00)";
    return "Night (21:00 - 06:00)";
  }
  
  return timeSlot; // If we can't categorize, use the original time slot
};

// Helper function to sort time slots
const sortTimeSlots = (a: string, b: string): number => {
  const timeSlotOrder = {
    "Morning (09:00 - 12:00)": 1,
    "Morning (06:00 - 12:00)": 2,
    "Afternoon (13:00 - 17:00)": 3,
    "Afternoon (12:00 - 17:00)": 4,
    "Evening (17:00 - 20:00)": 5,
    "Evening (17:00 - 21:00)": 6,
    "Night (21:00 - 06:00)": 7,
    "Unknown Time": 8
  };
  
  const orderA = timeSlotOrder[a as keyof typeof timeSlotOrder] || 9;
  const orderB = timeSlotOrder[b as keyof typeof timeSlotOrder] || 9;
  
  return orderA - orderB;
};

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
    
    // Sort orders by delivery time slot
    return filtered.sort((a, b) => {
      // First by time slot category
      const slotA = getTimeSlotCategory(a.deliveryTimeSlot);
      const slotB = getTimeSlotCategory(b.deliveryTimeSlot);
      
      const categoryCompare = sortTimeSlots(slotA, slotB);
      if (categoryCompare !== 0) return categoryCompare;
      
      // Then by specific time within category
      return (a.deliveryTimeSlot || "").localeCompare(b.deliveryTimeSlot || "");
    });
  }, [orders, dateFilter, statusFilter]);

  // Group orders by time slot
  const ordersByTimeSlot = useMemo(() => {
    const grouped: Record<string, Order[]> = {};
    
    filteredOrders.forEach(order => {
      const timeSlotCategory = getTimeSlotCategory(order.deliveryTimeSlot);
      
      if (!grouped[timeSlotCategory]) {
        grouped[timeSlotCategory] = [];
      }
      grouped[timeSlotCategory].push(order);
    });
    
    // Sort the keys (time slots) chronologically
    const sortedKeys = Object.keys(grouped).sort(sortTimeSlots);
    
    // Rebuild the object with sorted keys
    const sortedGrouped: Record<string, Order[]> = {};
    sortedKeys.forEach(key => {
      sortedGrouped[key] = grouped[key];
    });
    
    return sortedGrouped;
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
        
        {Object.entries(ordersByTimeSlot).map(([timeSlotCategory, slotOrders]) => (
          <div key={timeSlotCategory} className="mb-8">
            <div className={`px-4 py-2 rounded-lg mb-4 ${
              timeSlotCategory.includes("Morning") ? "bg-yellow-100" :
              timeSlotCategory.includes("Afternoon") ? "bg-blue-100" :
              timeSlotCategory.includes("Evening") ? "bg-purple-100" : "bg-gray-100"
            }`}>
              <h3 className="font-medium">{timeSlotCategory} ({slotOrders.length})</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {slotOrders.map(order => (
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
