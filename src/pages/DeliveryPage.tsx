
import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Helmet } from "react-helmet-async";
import DeliveryDateFilter from "@/components/delivery/DeliveryDateFilter";
import DeliveryStatusFilter from "@/components/delivery/DeliveryStatusFilter";
import DeliveryTimeSlotFilter from "@/components/delivery/DeliveryTimeSlotFilter";
import { Order } from "@/types";
import { matchesStatus, isInDeliveryStatus, shouldShowInAllStatusesDelivery, isInApprovalFlow } from "@/lib/statusHelpers";
import { startOfDay, endOfDay, addDays, format, isBefore, isAfter, parseISO, addHours, differenceInHours } from "date-fns";
import { Link } from "react-router-dom";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, Upload, CheckSquare2, XCircle, User, Car, ExternalLink, Truck, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import DeliveryStatusManager from "@/components/delivery/DeliveryStatusManager";
import StatusBadge from "@/components/orders/StatusBadge";
import CakePhotoUploadDialog from "@/components/orders/CakePhotoUploadDialog";
import CakePhotoApprovalDialog from "@/components/orders/CakePhotoApprovalDialog";
import DriverAssignmentDialog from "@/components/delivery/DriverAssignmentDialog";

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

// Helper to determine if an order is late or within 2 hours of delivery
const getOrderTimeStatus = (order: Order): 'late' | 'within-2-hours' | null => {
  // Get current time
  const now = new Date();
  const deliveryDate = new Date(order.deliveryDate);
  
  // Early return if it's a future date (not today)
  if (isAfter(startOfDay(deliveryDate), startOfDay(now))) {
    return null;
  }
  
  // Parse the time slot to get the end time
  let endTimeHour: number = 20; // Default to end of day (8pm)
  
  if (order.deliveryTimeSlot === 'slot1') {
    endTimeHour = 13; // 1pm
  } else if (order.deliveryTimeSlot === 'slot2') {
    endTimeHour = 16; // 4pm
  } else if (order.deliveryTimeSlot === 'slot3') {
    endTimeHour = 20; // 8pm
  } else if (order.deliveryTimeSlot) {
    // Try to parse custom time slot
    const timeMatch = order.deliveryTimeSlot.match(/(\d{1,2})[:.]\d{2}/);
    if (timeMatch) {
      endTimeHour = parseInt(timeMatch[1], 10) + 1; // Assuming 1 hour window
    }
  }
  
  // Set end time to specified hour on delivery date
  const endTime = new Date(deliveryDate);
  endTime.setHours(endTimeHour, 0, 0, 0);
  
  // If current time is after end time, it's late
  if (isAfter(now, endTime)) {
    return 'late';
  }
  
  // If within 2 hours of end time
  if (differenceInHours(endTime, now) <= 2) {
    return 'within-2-hours';
  }
  
  return null;
};

// Helper function to get driver badge based on delivery assignment
const getDriverBadge = (order: Order) => {
  if (!order.deliveryAssignment) return null;
  
  const { driverType, driverName, isPreliminary } = order.deliveryAssignment;
  let icon;
  let label;
  let className = "";
  
  // For preliminary assignments, use a different style
  if (isPreliminary) {
    className = "bg-blue-50 text-blue-700 border-blue-200 border border-dashed";
  }
  
  switch (driverType) {
    case "driver-1":
      icon = <Car className="h-4 w-4 mr-1" />;
      label = "Driver 1";
      return (
        <Badge variant="outline" className={cn("bg-blue-50 text-blue-700 border-blue-200", isPreliminary && "border-dashed")}>
          {icon} {label} {isPreliminary && <AlertCircle className="h-3 w-3 ml-1 text-blue-500" />}
        </Badge>
      );
    case "driver-2":
      icon = <Car className="h-4 w-4 mr-1" />;
      label = "Driver 2";
      return (
        <Badge variant="outline" className={cn("bg-indigo-50 text-indigo-700 border-indigo-200", isPreliminary && "border-dashed")}>
          {icon} {label} {isPreliminary && <AlertCircle className="h-3 w-3 ml-1 text-indigo-500" />}
        </Badge>
      );
    case "3rd-party":
      icon = <ExternalLink className="h-4 w-4 mr-1" />;
      label = driverName || "3rd Party";
      return (
        <Badge variant="outline" className={cn("bg-purple-50 text-purple-700 border-purple-200", isPreliminary && "border-dashed")}>
          {icon} {label} {isPreliminary && <AlertCircle className="h-3 w-3 ml-1 text-purple-500" />}
        </Badge>
      );
    default:
      return null;
  }
};

const DeliveryPage = () => {
  const { orders } = useApp();
  const [dateFilter, setDateFilter] = useState<'today' | 'tomorrow' | 'd-plus-2' | 'all'>('today');
  const [statusFilter, setStatusFilter] = useState<'ready' | 'in-transit' | 'pending-approval' | 'needs-revision' | 'delivery-statuses' | 'all-statuses'>('all-statuses');
  const [timeSlotFilter, setTimeSlotFilter] = useState<'all' | 'late' | 'within-2-hours' | 'slot1' | 'slot2' | 'slot3'>('all');
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Add state for dialogs
  const [photoUploadDialogOpen, setPhotoUploadDialogOpen] = useState(false);
  const [photoApprovalDialogOpen, setPhotoApprovalDialogOpen] = useState(false);
  const [driverAssignmentDialogOpen, setDriverAssignmentDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Force a refresh of the component when an order status changes
  const handleStatusChange = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  // Handle opening the photo upload dialog
  const handleOpenPhotoDialog = (order: Order) => {
    setSelectedOrder(order);
    setPhotoUploadDialogOpen(true);
  };
  
  // Handle opening the photo approval dialog
  const handleOpenApprovalDialog = (order: Order) => {
    setSelectedOrder(order);
    setPhotoApprovalDialogOpen(true);
  };
  
  // Handle opening the driver assignment dialog
  const handleOpenDriverDialog = (order: Order) => {
    setSelectedOrder(order);
    setDriverAssignmentDialogOpen(true);
  };
  
  // Handle when photo upload is successful
  const handlePhotoSuccess = () => {
    setPhotoUploadDialogOpen(false);
    setPhotoApprovalDialogOpen(false);
    handleStatusChange();
  };
  
  // Handle successful driver assignment
  const handleDriverAssignmentSuccess = () => {
    setDriverAssignmentDialogOpen(false);
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
        case 'pending-approval':
          return matchesStatus(order.status, 'pending-approval');
        case 'needs-revision':
          return matchesStatus(order.status, 'needs-revision');
        case 'delivery-statuses':
          return isInDeliveryStatus(order.status) || isInApprovalFlow(order.status);
        case 'all-statuses':
          return shouldShowInAllStatusesDelivery(order.status);
        default:
          return isInDeliveryStatus(order.status) || isInApprovalFlow(order.status);
      }
    });
  };
  
  // Filter orders based on selected time slot
  const filterOrdersByTimeSlot = (orders: Order[], timeSlotFilter: string): Order[] => {
    if (timeSlotFilter === 'all') {
      return orders;
    }
    
    return orders.filter(order => {
      // Handle time-based filters (late or within 2 hours)
      if (timeSlotFilter === 'late' || timeSlotFilter === 'within-2-hours') {
        const timeStatus = getOrderTimeStatus(order);
        return timeStatus === timeSlotFilter;
      }
      
      // Handle specific time slots
      return order.deliveryTimeSlot === timeSlotFilter;
    });
  };
  
  // Get filtered orders
  const filteredOrders = useMemo(() => {
    let filtered = [...orders];
    filtered = filterOrdersByDate(filtered, dateFilter);
    filtered = filterOrdersByStatus(filtered, statusFilter);
    filtered = filterOrdersByTimeSlot(filtered, timeSlotFilter);
    
    // Sort orders - first by status priority, then by time slot
    return filtered.sort((a, b) => {
      // Define status priority (lower number = higher priority)
      const getStatusPriority = (status: string): number => {
        switch(status) {
          case 'pending-approval': return 1; // New highest priority
          case 'needs-revision': return 2;   // New high priority
          case 'ready-to-deliver': return 3;
          case 'in-delivery': return 4;
          case 'waiting-photo': return 5;
          case 'in-kitchen': return 6;
          case 'in-queue': return 7;
          case 'incomplete': return 8;
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
  }, [orders, dateFilter, statusFilter, timeSlotFilter, refreshKey]);

  const dateTitles = {
    'today': `Today (${format(new Date(), 'dd MMM')})`,
    'tomorrow': `Tomorrow (${format(addDays(new Date(), 1), 'dd MMM')})`,
    'd-plus-2': `${format(addDays(new Date(), 2), 'dd MMM')}`,
    'all': 'All Delivery Dates'
  };
  
  // Helper function to determine if the status is actionable directly in the delivery page
  const isStatusActionableInDelivery = (status: string): boolean => {
    return status === 'ready-to-deliver' || status === 'in-delivery' || 
           status === 'pending-approval' || status === 'needs-revision';
  };
  
  // Helper to determine if an order is in waiting-photo status
  const isWaitingPhoto = (status: string): boolean => {
    return status === 'waiting-photo';
  };
  
  // Helper to determine if an order is pending approval
  const isPendingApproval = (status: string): boolean => {
    return status === 'pending-approval';
  };
  
  // Helper to determine if an order needs revision
  const isNeedsRevision = (status: string): boolean => {
    return status === 'needs-revision';
  };
  
  // Helper to determine if an order is late or within 2 hours based on time slot
  const getTimeStatusBadge = (order: Order) => {
    const timeStatus = getOrderTimeStatus(order);
    
    if (timeStatus === 'late') {
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
          Late
        </Badge>
      );
    }
    
    if (timeStatus === 'within-2-hours') {
      return (
        <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
          &lt; 2 Hours
        </Badge>
      );
    }
    
    return null;
  };

  // Get revision badge if applicable
  const getRevisionBadge = (order: Order) => {
    if (order.revisionCount && order.revisionCount > 0) {
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 ml-1">
          Rev #{order.revisionCount}
        </Badge>
      );
    }
    return null;
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
      
      <div className="flex flex-col gap-4">
        <DeliveryDateFilter
          value={dateFilter}
          onChange={setDateFilter}
        />
        
        <div className="flex flex-col md:flex-row gap-4 md:items-start">
          <DeliveryStatusFilter
            value={statusFilter}
            onChange={setStatusFilter}
          />
          
          <DeliveryTimeSlotFilter
            value={timeSlotFilter}
            onChange={setTimeSlotFilter}
          />
        </div>
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
                  <TableHead className="w-[130px]">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Driver
                    </div>
                  </TableHead>
                  <TableHead className="w-[150px]">
                    <div className="flex items-center">
                      <CalendarClock className="h-4 w-4 mr-2" />
                      Delivery Time
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
                  const isPendingForApproval = isPendingApproval(order.status);
                  const isNeedingRevision = isNeedsRevision(order.status);
                  const isReadyToDeliver = matchesStatus(order.status, 'ready-to-deliver');
                  const hasDriverAssignment = !!order.deliveryAssignment;
                  const hasPreliminaryAssignment = hasDriverAssignment && order.deliveryAssignment?.isPreliminary;
                  const canPreAssign = !isReadyToDeliver && !matchesStatus(order.status, 'in-delivery');
                  
                  return (
                    <TableRow 
                      key={order.id}
                      className={cn(timeSlotClass)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          {order.id}
                          {getRevisionBadge(order)}
                        </div>
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
                        {getDriverBadge(order) || (
                          <span className="text-muted-foreground">Not assigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center">
                            <CalendarClock className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="font-medium">
                              {formatTimeSlotDisplay(order.deliveryTimeSlot)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {getTimeStatusBadge(order)}
                            {order.deliveryArea && (
                              <Badge variant="secondary" className="text-xs">
                                {order.deliveryArea}
                              </Badge>
                            )}
                          </div>
                        </div>
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
                          
                          {isReadyToDeliver && !hasDriverAssignment ? (
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenDriverDialog(order)}
                              className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200"
                            >
                              <User className="h-4 w-4 mr-1" /> Assign Driver
                            </Button>
                          ) : isStatusActionableInDelivery(order.status) ? (
                            isNeedingRevision ? (
                              <Button 
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenPhotoDialog(order)}
                                className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200"
                              >
                                <Upload className="h-4 w-4 mr-1" /> Upload Revision
                              </Button>
                            ) : (
                              <DeliveryStatusManager 
                                order={order} 
                                onStatusChange={handleStatusChange}
                                compact={true}
                              />
                            )
                          ) : isWaitingForPhoto ? (
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenPhotoDialog(order)}
                              className="bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200"
                            >
                              <Upload className="h-4 w-4 mr-1" /> Upload Photos
                            </Button>
                          ) : canPreAssign ? (
                            // Pre-assign driver option for orders not ready yet
                            <DeliveryStatusManager 
                              order={order} 
                              onStatusChange={handleStatusChange}
                              compact={true}
                              showPreAssign={true}
                            />
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
      
      {/* Dialogs */}
      {selectedOrder && (
        <>
          <CakePhotoUploadDialog 
            order={selectedOrder}
            open={photoUploadDialogOpen}
            onClose={() => setPhotoUploadDialogOpen(false)}
            onSuccess={handlePhotoSuccess}
          />
          
          <CakePhotoApprovalDialog
            order={selectedOrder}
            open={photoApprovalDialogOpen}
            onClose={() => setPhotoApprovalDialogOpen(false)}
            onSuccess={handlePhotoSuccess}
          />
          
          <DriverAssignmentDialog
            order={selectedOrder}
            open={driverAssignmentDialogOpen}
            onOpenChange={setDriverAssignmentDialogOpen}
            onSuccess={handleDriverAssignmentSuccess}
            isPreliminary={selectedOrder.status !== 'ready-to-deliver'}
          />
        </>
      )}
    </div>
  );
};

export default DeliveryPage;
