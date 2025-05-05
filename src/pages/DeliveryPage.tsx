
import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Helmet } from "react-helmet-async";
import DeliveryDateFilter from "@/components/delivery/DeliveryDateFilter";
import DeliveryStatusFilter from "@/components/delivery/DeliveryStatusFilter";
import { Order } from "@/types";
import { matchesStatus, isInDeliveryStatus, shouldShowInAllStatusesDelivery } from "@/lib/statusHelpers";
import { startOfDay, endOfDay, addDays, format } from "date-fns";
import { Link } from "react-router-dom";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import DeliveryStatusManager from "@/components/delivery/DeliveryStatusManager";
import StatusBadge from "@/components/orders/StatusBadge";
import CakePhotoUploadDialog from "@/components/orders/CakePhotoUploadDialog";

// Helper function to determine the time slot background color
const getTimeSlotColor = (timeSlot?: string): string => {
  if (!timeSlot) return "";
  
  if (timeSlot === "slot1") {
    return "bg-purple-50 hover:bg-purple-100";
  } else if (timeSlot === "slot2") {
    return "bg-blue-50 hover:bg-blue-100";
  } else if (timeSlot === "slot3") {
    return "bg-indigo-50 hover:bg-indigo-100";
  }
  
  // For custom time slots, check the time range
  const timeMatch = timeSlot.match(/(\d{1,2})[:.]\d{2}/);
  if (timeMatch) {
    const hour = parseInt(timeMatch[1], 10);
    
    if (hour < 10) {
      return "bg-purple-50 hover:bg-purple-100"; // Morning (like slot1)
    } else if (hour < 15) {
      return "bg-blue-50 hover:bg-blue-100"; // Afternoon (like slot2)
    } else {
      return "bg-indigo-50 hover:bg-indigo-100"; // Evening (like slot3)
    }
  }
  
  return "";
};

// Helper function to format time slot display
const formatTimeSlotDisplay = (timeSlot?: string): string => {
  if (!timeSlot) return "-";
  
  if (timeSlot === "slot1") {
    return "10:00 - 13:00";
  } else if (timeSlot === "slot2") {
    return "13:00 - 16:00";
  } else if (timeSlot === "slot3") {
    return "16:00 - 20:00";
  }
  
  // It's a custom time slot, return as is
  return timeSlot;
};

const DeliveryPage = () => {
  const { orders } = useApp();
  const [dateFilter, setDateFilter] = useState<'today' | 'tomorrow' | 'd-plus-2' | 'all'>('today');
  const [statusFilter, setStatusFilter] = useState<'ready' | 'in-transit' | 'delivery-statuses' | 'all-statuses'>('delivery-statuses');
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Add state for photo upload dialog
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Force a refresh of the component when an order status changes
  const handleStatusChange = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  // Handle opening the photo upload dialog
  const handleOpenPhotoDialog = (order: Order) => {
    setSelectedOrder(order);
    setPhotoDialogOpen(true);
  };
  
  // Handle when photo upload is successful
  const handlePhotoSuccess = () => {
    setPhotoDialogOpen(false);
    handleStatusChange();
  };

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
        case 'delivery-statuses':
          return isInDeliveryStatus(order.status);
        case 'all-statuses':
          return shouldShowInAllStatusesDelivery(order.status);
        default:
          return isInDeliveryStatus(order.status);
      }
    });
  };
  
  // Get filtered orders
  const filteredOrders = useMemo(() => {
    let filtered = [...orders];
    filtered = filterOrdersByDate(filtered, dateFilter);
    filtered = filterOrdersByStatus(filtered, statusFilter);
    
    // Sort orders - first by status priority, then by time slot
    return filtered.sort((a, b) => {
      // Define status priority (lower number = higher priority)
      const getStatusPriority = (status: string): number => {
        switch(status) {
          case 'ready-to-deliver': return 1;
          case 'in-delivery': return 2;
          case 'waiting-photo': return 3;
          case 'in-kitchen': return 4;
          case 'in-queue': return 5;
          case 'incomplete': return 6;
          default: return 10;
        }
      };
      
      // First sort by status priority
      const statusPriorityA = getStatusPriority(a.status);
      const statusPriorityB = getStatusPriority(b.status);
      
      if (statusPriorityA !== statusPriorityB) {
        return statusPriorityA - statusPriorityB;
      }
      
      // If statuses have the same priority, sort by time slot as before
      if (a.deliveryTimeSlot === b.deliveryTimeSlot) {
        return a.id.localeCompare(b.id);
      }
      
      if (a.deliveryTimeSlot && !b.deliveryTimeSlot) return -1;
      if (!a.deliveryTimeSlot && b.deliveryTimeSlot) return 1;
      
      const slotOrder = { slot1: 1, slot2: 2, slot3: 3 };
      
      if (a.deliveryTimeSlot && b.deliveryTimeSlot) {
        if (a.deliveryTimeSlot in slotOrder && b.deliveryTimeSlot in slotOrder) {
          return slotOrder[a.deliveryTimeSlot as keyof typeof slotOrder] - 
                 slotOrder[b.deliveryTimeSlot as keyof typeof slotOrder];
        }
        
        if (a.deliveryTimeSlot in slotOrder) return -1;
        if (b.deliveryTimeSlot in slotOrder) return 1;
        
        return a.deliveryTimeSlot.localeCompare(b.deliveryTimeSlot);
      }
      
      return 0;
    });
  }, [orders, dateFilter, statusFilter, refreshKey]);

  const dateTitles = {
    'today': `Today (${format(new Date(), 'dd MMM')})`,
    'tomorrow': `Tomorrow (${format(addDays(new Date(), 1), 'dd MMM')})`,
    'd-plus-2': `${format(addDays(new Date(), 2), 'dd MMM')}`,
    'all': 'All Delivery Dates'
  };
  
  // Helper function to determine if the status is actionable directly in the delivery page
  const isStatusActionableInDelivery = (status: string): boolean => {
    return status === 'ready-to-deliver' || status === 'in-delivery';
  };
  
  // Helper to determine if an order is in waiting-photo status
  const isWaitingPhoto = (status: string): boolean => {
    return status === 'waiting-photo';
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
          {dateTitles[dateFilter]} • {filteredOrders.length} {statusFilter === 'all-statuses' ? 'orders' : 'deliveries'}
        </h2>
        
        {filteredOrders.length > 0 ? (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead className="w-[80px]">Order ID</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="w-[120px]">Delivery Method</TableHead>
                  <TableHead className="w-[150px]">
                    <div className="flex items-center">
                      <CalendarClock className="h-4 w-4 mr-2" />
                      Time Slot
                    </div>
                  </TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Address</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => {
                  const timeSlotClass = getTimeSlotColor(order.deliveryTimeSlot);
                  const isWaitingForPhoto = isWaitingPhoto(order.status);
                  
                  return (
                    <TableRow 
                      key={order.id}
                      className={cn(timeSlotClass)}
                    >
                      <TableCell className="font-medium">
                        {order.id}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={order.status} />
                      </TableCell>
                      <TableCell>
                        {order.deliveryMethod ? (
                          <Badge variant="outline" className="capitalize">
                            {order.deliveryMethod === 'flat-rate' ? 'Flat Rate' : 
                             order.deliveryMethod === 'lalamove' ? 'Lalamove' : 'Self-Pickup'}
                          </Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <CalendarClock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="font-medium">
                            {formatTimeSlotDisplay(order.deliveryTimeSlot)}
                          </span>
                        </div>
                        {order.deliveryArea && (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {order.deliveryArea}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.customer.name}</div>
                          <div className="text-sm text-muted-foreground">{order.customer.whatsappNumber}</div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="text-sm max-w-md truncate">
                          {order.deliveryAddress}
                          {order.deliveryAddressNotes && (
                            <span className="text-muted-foreground block">
                              Note: {order.deliveryAddressNotes}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline" 
                            size="sm"
                            asChild
                          >
                            <Link to={`/orders/${order.id}`} state={{ referrer: 'delivery' }}>
                              View Order
                            </Link>
                          </Button>
                          
                          {isStatusActionableInDelivery(order.status) ? (
                            <DeliveryStatusManager 
                              order={order} 
                              onStatusChange={handleStatusChange}
                              compact={true}
                            />
                          ) : isWaitingForPhoto ? (
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenPhotoDialog(order)}
                              className="bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200"
                            >
                              <Upload className="h-4 w-4 mr-1" /> Upload Photos
                            </Button>
                          ) : (
                            <Button 
                              variant="outline"
                              size="sm"
                              asChild
                              className={order.status === 'in-kitchen' 
                                ? "bg-yellow-50 text-yellow-800 border-yellow-200 hover:bg-yellow-100"
                                : ""}
                            >
                              <Link to={order.status === 'in-kitchen' 
                                ? "/kitchen" 
                                : `/orders/${order.id}`}
                                state={{ referrer: 'delivery' }}>
                                {order.status === 'in-kitchen' 
                                  ? "Go to Kitchen" 
                                  : "Manage Order"}
                              </Link>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <Card className="p-8 text-center text-muted-foreground">
            <p>No deliveries found for the selected filters.</p>
          </Card>
        )}
      </div>
      
      {/* Cake Photo Upload Dialog */}
      {selectedOrder && (
        <CakePhotoUploadDialog 
          order={selectedOrder}
          open={photoDialogOpen}
          onClose={() => setPhotoDialogOpen(false)}
          onSuccess={handlePhotoSuccess}
        />
      )}
    </div>
  );
};

export default DeliveryPage;
