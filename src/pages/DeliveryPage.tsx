import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Helmet } from "react-helmet-async";
import { Order } from "@/types";
import { matchesStatus, isInDeliveryStatus, shouldShowInAllStatusesDelivery, isInApprovalFlow, canPreAssignDriver } from "@/lib/statusHelpers";
import { startOfDay, endOfDay, addDays, format, isBefore, isAfter, parseISO, addHours, differenceInHours } from "date-fns";
import { Link } from "react-router-dom";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarClock, Upload, CheckSquare2, XCircle, User, Car, ExternalLink, Truck, AlertCircle, Filter, Eye, MessageSquare, List, Route } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DeliveryStatusManager from "@/components/delivery/DeliveryStatusManager";
import StatusBadge from "@/components/orders/StatusBadge";
import CakePhotoUploadDialog from "@/components/orders/CakePhotoUploadDialog";
import CakePhotoApprovalDialog from "@/components/orders/CakePhotoApprovalDialog";
import DriverAssignmentDialog from "@/components/delivery/DriverAssignmentDialog";
import QuickDriverAssignDropdown from "@/components/delivery/QuickDriverAssignDropdown";
import CollapsibleFilters from "@/components/delivery/CollapsibleFilters";
import ActiveFiltersBar from "@/components/delivery/ActiveFiltersBar";
import CompactDeliveryDateFilter from "@/components/delivery/CompactDeliveryDateFilter";
import CompactDeliveryStatusFilter from "@/components/delivery/CompactDeliveryStatusFilter";
import CompactDeliveryTimeSlotFilter from "@/components/delivery/CompactDeliveryTimeSlotFilter";
import MobileFilterDrawer from "@/components/delivery/MobileFilterDrawer";
import TripPlannerView from "@/components/delivery/trip-planner/TripPlannerView";
import BulkActionsBar from "@/components/delivery/BulkActionsBar";
import QuickTripCreationDialog from "@/components/delivery/QuickTripCreationDialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  
  switch (driverType) {
    case "driver-1":
      icon = <Car className="h-3.5 w-3.5 mr-0.5" />;
      label = "D1";
      return (
        <Badge size="xs" variant="outline" className={cn("bg-blue-50 text-blue-700 border-blue-200", isPreliminary && "border-dashed")}>
          {icon} {label} {isPreliminary && <AlertCircle className="h-2.5 w-2.5 ml-0.5 text-blue-500" />}
        </Badge>
      );
    case "driver-2":
      icon = <Car className="h-3.5 w-3.5 mr-0.5" />;
      label = "D2";
      return (
        <Badge size="xs" variant="outline" className={cn("bg-indigo-50 text-indigo-700 border-indigo-200", isPreliminary && "border-dashed")}>
          {icon} {label} {isPreliminary && <AlertCircle className="h-2.5 w-2.5 ml-0.5 text-indigo-500" />}
        </Badge>
      );
    case "3rd-party":
      icon = <ExternalLink className="h-3.5 w-3.5 mr-0.5" />;
      label = "3P";
      return (
        <Badge size="xs" variant="outline" className={cn("bg-purple-50 text-purple-700 border-purple-200", isPreliminary && "border-dashed")}>
          {icon} {label} {isPreliminary && <AlertCircle className="h-2.5 w-2.5 ml-0.5 text-purple-500" />}
        </Badge>
      );
    default:
      return null;
  }
};

// Add the missing functions
// Clear all selected orders
const handleClearSelection = () => {
  setSelectedOrderIds([]);
};

// Open the trip creation dialog
const handleCreateTrip = () => {
  setTripCreationDialogOpen(true);
};

// Handle trip creation success
const handleTripCreationSuccess = (tripId: string) => {
  // Clear selected orders and close dialog
  setSelectedOrderIds([]);
  setTripCreationDialogOpen(false);
  // Show success message and refresh data
  toast.success(`Trip created successfully`);
  handleStatusChange();
  
  // Optionally navigate to trip planner tab to see the new trip
  setActiveTab('trip-planner');
};

const DeliveryPage = () => {
  const { orders } = useApp();
  const [dateFilter, setDateFilter] = useState<'today' | 'tomorrow' | 'd-plus-2' | 'all'>('today');
  const [statusFilter, setStatusFilter] = useState<'ready' | 'in-transit' | 'pending-approval' | 'needs-revision' | 'delivery-statuses' | 'all-statuses'>('all-statuses');
  const [timeSlotFilter, setTimeSlotFilter] = useState<'all' | 'late' | 'within-2-hours' | 'slot1' | 'slot2' | 'slot3'>('all');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'list-view' | 'trip-planner'>('list-view');
  const isMobile = useIsMobile();
  
  // Add state for dialogs
  const [photoUploadDialogOpen, setPhotoUploadDialogOpen] = useState(false);
  const [photoApprovalDialogOpen, setPhotoApprovalDialogOpen] = useState(false);
  const [driverAssignmentDialogOpen, setDriverAssignmentDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Add state for order selection and trip creation
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [tripCreationDialogOpen, setTripCreationDialogOpen] = useState(false);
  
  // Calculate selected date based on dateFilter
  const selectedDate = useMemo(() => {
    const today = new Date();
    
    switch (dateFilter) {
      case 'today':
        return today;
      case 'tomorrow':
        return addDays(today, 1);
      case 'd-plus-2':
        return addDays(today, 2);
      default:
        return today;
    }
  }, [dateFilter]);

  // Calculate how many active filters we have
  const activeFiltersCount = 
    (dateFilter !== 'all' ? 1 : 0) + 
    (statusFilter !== 'all-statuses' ? 1 : 0) + 
    (timeSlotFilter !== 'all' ? 1 : 0);

  // Clear filter handlers
  const handleClearDateFilter = () => setDateFilter('all');
  const handleClearStatusFilter = () => setStatusFilter('all-statuses');
  const handleClearTimeSlotFilter = () => setTimeSlotFilter('all');

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

  // Calculate how many selected orders are not in ready-to-deliver status
  const hasNonReadyOrders = useMemo(() => {
    if (selectedOrderIds.length === 0) return false;
    
    const nonReadyOrders = filteredOrders.filter(order => 
      selectedOrderIds.includes(order.id) && 
      order.status !== 'ready-to-deliver'
    );
    
    return nonReadyOrders.length > 0;
  }, [selectedOrderIds, filteredOrders]);
  
  // Update the select all handler to include all orders
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Select all orders without a trip regardless of status
      const selectableOrderIds = filteredOrders
        .filter(order => !order.tripId)
        .map(order => order.id);
      setSelectedOrderIds(selectableOrderIds);
    } else {
      setSelectedOrderIds([]);
    }
  };
  
  // Update the order selection handler to work with any order
  const handleOrderSelect = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrderIds(prev => [...prev, orderId]);
    } else {
      setSelectedOrderIds(prev => prev.filter(id => id !== orderId));
    }
  };
  
  // Update calculation for selectable orders
  const selectableOrdersCount = useMemo(() => {
    return filteredOrders.filter(order => !order.tripId).length;
  }, [filteredOrders]);
  
  return (
    <div className="space-y-4">
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
      
      {/* Tab Switcher */}
      <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as 'list-view' | 'trip-planner')}>
        <TabsList className="grid grid-cols-2 w-[300px]">
          <TabsTrigger value="list-view" className="flex items-center gap-1">
            <List className="h-4 w-4" />
            List View
          </TabsTrigger>
          <TabsTrigger value="trip-planner" className="flex items-center gap-1">
            <Route className="h-4 w-4" />
            Trip Planner
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="list-view" className="mt-6">
          {/* List View Content */}
          {/* Active Filters Summary */}
          <ActiveFiltersBar 
            dateFilter={dateFilter}
            statusFilter={statusFilter}
            timeSlotFilter={timeSlotFilter}
            onClearDateFilter={handleClearDateFilter}
            onClearStatusFilter={handleClearStatusFilter}
            onClearTimeSlotFilter={handleClearTimeSlotFilter}
          />
          
          {/* Mobile Filters Drawer */}
          <div className="md:hidden mb-4">
            <MobileFilterDrawer 
              dateFilter={dateFilter}
              statusFilter={statusFilter}
              timeSlotFilter={timeSlotFilter}
              onDateFilterChange={setDateFilter}
              onStatusFilterChange={setStatusFilter}
              onTimeSlotFilterChange={setTimeSlotFilter}
              activeFiltersCount={activeFiltersCount}
            />
          </div>
          
          {/* Desktop Filters - Two Column Layout */}
          <div className="hidden md:grid md:grid-cols-2 gap-4">
            {/* Left Column - Always visible date filter */}
            <div>
              <CompactDeliveryDateFilter
                value={dateFilter}
                onChange={setDateFilter}
              />
            </div>
            
            {/* Right Column - Collapsible status and time filters */}
            <div>
              <CollapsibleFilters 
                activeFiltersCount={activeFiltersCount - (dateFilter !== 'all' ? 1 : 0)}
                title="Delivery Filters"
              >
                <div className="space-y-6">
                  <CompactDeliveryStatusFilter
                    value={statusFilter}
                    onChange={setStatusFilter}
                  />
                  
                  <CompactDeliveryTimeSlotFilter
                    value={timeSlotFilter}
                    onChange={setTimeSlotFilter}
                  />
                </div>
              </CollapsibleFilters>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {dateTitles[dateFilter]} • {filteredOrders.length} {statusFilter === 'all-statuses' ? 'orders' : 'deliveries'}
            </h2>
            
            {filteredOrders.length > 0 ? (
              <TooltipProvider>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted">
                      <TableRow>
                        {/* Updated checkbox to show for all selectable orders */}
                        <TableHead className="w-[40px] text-center">
                          {selectableOrdersCount > 0 ? (
                            <Checkbox 
                              checked={selectedOrderIds.length > 0 && selectedOrderIds.length === selectableOrdersCount}
                              onCheckedChange={handleSelectAll}
                              aria-label="Select all orders"
                            />
                          ) : null}
                        </TableHead>
                        <TableHead className="w-[60px]">Order ID</TableHead>
                        <TableHead className="w-[100px]">Status</TableHead>
                        <TableHead className="w-[100px]">Delivery</TableHead>
                        <TableHead className="w-[110px]">
                          <div className="flex items-center">
                            <User className="h-3.5 w-3.5 mr-1" />
                            Driver
                          </div>
                        </TableHead>
                        <TableHead className="w-[130px]">
                          <div className="flex items-center">
                            <CalendarClock className="h-3.5 w-3.5 mr-1" />
                            Delivery Time
                          </div>
                        </TableHead>
                        <TableHead className="hidden md:table-cell w-[180px]">Customer</TableHead>
                        <TableHead className="hidden md:table-cell w-full">Address</TableHead>
                        <TableHead className="text-right w-[100px]">Actions</TableHead>
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
                        const canShowPreAssignDropdown = canPreAssignDriver(order.status);
                        const isInTrip = !!order.tripId;
                        // Updated to make all orders without a trip selectable
                        const isSelectable = !isInTrip;
                        
                        return (
                          <TableRow 
                            key={order.id}
                            className={cn(
                              timeSlotClass,
                              selectedOrderIds.includes(order.id) && "bg-muted"
                            )}
                          >
                            {/* Updated selection checkbox to show for all orders without a trip */}
                            <TableCell className="text-center py-1">
                              {isSelectable ? (
                                <Checkbox 
                                  checked={selectedOrderIds.includes(order.id)}
                                  onCheckedChange={(checked) => handleOrderSelect(order.id, !!checked)}
                                  aria-label={`Select order ${order.id}`}
                                />
                              ) : null}
                            </TableCell>
                            <TableCell className="font-medium py-1">
                              <div className="flex items-center">
                                {order.id}
                                {getRevisionBadge(order)}
                                {isInTrip && (
                                  <Badge size="xs" variant="outline" className="ml-1 bg-blue-50 text-blue-700 border-blue-200">
                                    <Truck className="h-3 w-3 mr-1" /> Trip
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="py-1">
                              <StatusBadge status={order.status} />
                            </TableCell>
                            <TableCell className="py-1">
                              {order.deliveryMethod ? (
                                <Badge size="sm" variant="outline" className="capitalize">
                                  {order.deliveryMethod === 'flat-rate' ? 'Flat' : 
                                  order.deliveryMethod === 'lalamove' ? 'Lala' : 'Pickup'}
                                </Badge>
                              ) : (
                                '-'
                              )}
                            </TableCell>
                            <TableCell className="py-1">
                              <div className="flex items-center gap-0.5">
                                {getDriverBadge(order)}
                                {((!isReadyToDeliver && hasDriverAssignment) || canShowPreAssignDropdown) && (
                                  <QuickDriverAssignDropdown 
                                    order={order} 
                                    onSuccess={handleStatusChange}
                                    isPreliminaryOnly={!isReadyToDeliver}
                                    compact={true}
                                  />
                                )}
                                {!hasDriverAssignment && !canShowPreAssignDropdown && (
                                  <span className="text-xs text-muted-foreground">Not assigned</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="py-1">
                              <div className="flex flex-col space-y-0.5">
                                <div className="flex items-center">
                                  <CalendarClock className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                                  <span className="font-medium text-sm">
                                    {formatTimeSlotDisplay(order.deliveryTimeSlot)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-0.5">
                                  {getTimeStatusBadge(order)}
                                  {order.deliveryArea && (
                                    <Badge size="xs" variant="secondary" className="text-xs">
                                      {order.deliveryArea}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell py-1">
                              <div>
                                <div className="font-medium text-sm">{order.customer.name}</div>
                                <div className="text-xs text-muted-foreground">{order.customer.whatsappNumber}</div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell py-1">
                              <div className="text-xs max-w-full truncate">
                                {order.deliveryAddress}
                                {order.deliveryAddressNotes && (
                                  <span className="text-muted-foreground text-xs block">
                                    Note: {order.deliveryAddressNotes}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right py-1">
                              {/* ... keep existing code for actions */}
                              <div className="flex justify-end gap-0.5">
                                {/* View Order button */}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline" 
                                      size="icon"
                                      asChild
                                      className="h-7 w-7"
                                    >
                                      <Link to={`/orders/${order.id}`} state={{ referrer: 'delivery' }}>
                                        <Eye className="h-3.5 w-3.5" />
                                      </Link>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>View Order</p>
                                  </TooltipContent>
                                </Tooltip>
                                
                                {/* Chat button */}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline" 
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() => {
                                        toast.info(`Chat for order ${order.id} - to be implemented`);
                                      }}
                                    >
                                      <MessageSquare className="h-3.5 w-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Chat</p>
                                  </TooltipContent>
                                </Tooltip>
                                
                                {/* Status-specific action buttons */}
                                {isReadyToDeliver && !hasDriverAssignment ? (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        variant="outline"
                                        size="icon"
                                        className="h-7 w-7 bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200"
                                        onClick={() => handleOpenDriverDialog(order)}
                                      >
                                        <User className="h-3.5 w-3.5" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Assign Driver</p>
                                    </TooltipContent>
                                  </Tooltip>
                                ) : isStatusActionableInDelivery(order.status) ? (
                                  isNeedingRevision ? (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button 
                                          variant="outline"
                                          size="icon"
                                          className="h-7 w-7 bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200"
                                          onClick={() => handleOpenPhotoDialog(order)}
                                        >
                                          <Upload className="h-3.5 w-3.5" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Upload</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  ) : (
                                    <DeliveryStatusManager 
                                      order={order} 
                                      onStatusChange={handleStatusChange}
                                      compact={true}
                                    />
                                  )
                                ) : isWaitingForPhoto ? (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        variant="outline"
                                        size="icon"
                                        className="h-7 w-7 bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200"
                                        onClick={() => handleOpenPhotoDialog(order)}
                                      >
                                        <Upload className="h-3.5 w-3.5" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Upload Photo</p>
                                    </TooltipContent>
                                  </Tooltip>
                                ) : null}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </TooltipProvider>
            ) : (
              <Card className="p-8 text-center text-muted-foreground">
                <p>No deliveries found for the selected filters.</p>
              </Card>
            )}
          </div>
        </TabsContent>
        
        {/* Trip Planner Tab */}
        <TabsContent value="trip-planner" className="mt-6">
          <TripPlannerView selectedDate={selectedDate} />
        </TabsContent>
      </Tabs>
      
      {/* Updated Bulk Actions Bar with hasNonReadyOrders prop */}
      <BulkActionsBar 
        selectedCount={selectedOrderIds.length} 
        onClearSelection={handleClearSelection}
        onCreateTrip={handleCreateTrip}
        hasNonReadyOrders={hasNonReadyOrders}
      />
      
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
      
      {/* Trip Creation Dialog */}
      <QuickTripCreationDialog
        open={tripCreationDialogOpen}
        onOpenChange={setTripCreationDialogOpen}
        selectedOrderIds={selectedOrderIds}
        onSuccess={handleTripCreationSuccess}
        date={selectedDate}
      />
    </div>
  );
};

export default DeliveryPage;
