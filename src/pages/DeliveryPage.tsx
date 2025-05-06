
import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { Order } from "@/types";
import { filterOrdersByDate, filterOrdersByStatus, filterOrdersByTimeSlot } from "@/lib/statusHelpers";
import { startOfDay, addDays } from "date-fns";
import { List, Route } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatusBadge from "@/components/orders/StatusBadge";
import CakePhotoUploadDialog from "@/components/orders/CakePhotoUploadDialog";
import CakePhotoApprovalDialog from "@/components/orders/CakePhotoApprovalDialog";
import DriverAssignmentDialog from "@/components/delivery/DriverAssignmentDialog";
import TripPlannerView from "@/components/delivery/trip-planner/TripPlannerView";
import BulkActionsBar from "@/components/delivery/BulkActionsBar";
import QuickTripCreationDialog from "@/components/delivery/QuickTripCreationDialog";
import DeliveryFilter from "@/components/delivery/DeliveryFilter";
import DeliveryOrdersTable from "@/components/delivery/DeliveryOrdersTable";
import { getDateTitles, getStatusPriority } from "@/components/delivery/utils/deliveryHelpers";

const DeliveryPage = () => {
  const { orders } = useApp();
  const [dateFilter, setDateFilter] = useState<'today' | 'tomorrow' | 'd-plus-2' | 'all'>('today');
  const [statusFilter, setStatusFilter] = useState<'ready' | 'in-transit' | 'pending-approval' | 'needs-revision' | 'delivery-statuses' | 'all-statuses'>('all-statuses');
  const [timeSlotFilter, setTimeSlotFilter] = useState<'all' | 'late' | 'within-2-hours' | 'slot1' | 'slot2' | 'slot3'>('all');
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<'list-view' | 'trip-planner'>('list-view');
  
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
  
  // Get filtered orders
  const filteredOrders = useMemo(() => {
    let filtered = [...orders];
    filtered = filterOrdersByDate(filtered, dateFilter);
    filtered = filterOrdersByStatus(filtered, statusFilter);
    filtered = filterOrdersByTimeSlot(filtered, timeSlotFilter);
    
    // Sort orders - first by status priority, then by time slot
    return filtered.sort((a, b) => {
      // First sort by status priority
      const statusPriorityA = getStatusPriority(a.status);
      const statusPriorityB = getStatusPriority(b.status);
      
      if (statusPriorityA !== statusPriorityB) {
        return statusPriorityA - statusPriorityB;
      }
      
      // If statuses have the same priority, sort by time slot
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

  const dateTitles = getDateTitles();
  
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
          {/* Filters */}
          <DeliveryFilter 
            dateFilter={dateFilter}
            statusFilter={statusFilter}
            timeSlotFilter={timeSlotFilter}
            onDateFilterChange={setDateFilter}
            onStatusFilterChange={setStatusFilter}
            onTimeSlotFilterChange={setTimeSlotFilter}
          />
          
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {dateTitles[dateFilter]} • {filteredOrders.length} {statusFilter === 'all-statuses' ? 'orders' : 'deliveries'}
            </h2>
            
            {/* Orders Table */}
            <DeliveryOrdersTable 
              orders={filteredOrders}
              selectedOrderIds={selectedOrderIds}
              onSelectOrder={handleOrderSelect}
              onSelectAll={handleSelectAll}
              onOpenDriverDialog={handleOpenDriverDialog}
              onOpenPhotoDialog={handleOpenPhotoDialog}
              onStatusChange={handleStatusChange}
            />
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
