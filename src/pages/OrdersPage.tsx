import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Plus, Grid, List, Info, Archive, Upload, Eye, MessageSquare, Check, X, Car } from "lucide-react";
import OrderList from "@/components/orders/OrderList";
import SelectableOrderList from "@/components/orders/SelectableOrderList";
import OrderCard from "@/components/orders/OrderCard";
import DateRangePicker from "@/components/orders/DateRangePicker";
import StatusFilterChips from "@/components/orders/StatusFilterChips";
import { ViewMode, FilterOption, Order } from "@/types";
import { DeliveryTrip } from "@/types/trip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/sonner";
import CakePhotoUploadDialog from "@/components/orders/CakePhotoUploadDialog";
import FeedbackDialog from "@/components/orders/FeedbackDialog";
import { getWorkflowStatus } from "@/lib/statusHelpers";
import CreateTripDialog from "@/components/delivery/CreateTripDialog";

const OrdersPage = () => {
  const { orders, trips, orderSelection, setDateRange, dateRange, updateOrder, toggleSelectionMode, clearOrderSelection } = useApp();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filteredOrders, setFilteredOrders] = useState(orders);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [orderToArchive, setOrderToArchive] = useState<Order | null>(null);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [selectedOrderForFeedback, setSelectedOrderForFeedback] = useState<Order | null>(null);
  const [createTripDialogOpen, setCreateTripDialogOpen] = useState(false);
  const [orderTripsMap, setOrderTripsMap] = useState<Map<string, DeliveryTrip>>(new Map());
  
  // Create status filter options - updated to match workflow statuses
  const statusOptions: FilterOption[] = [
    { id: 'all', label: 'All Orders', value: 'all' },
    { id: 'incomplete', label: 'Incomplete', value: 'incomplete' },
    { id: 'in-queue', label: 'In Queue', value: 'in-queue' },
    { id: 'in-kitchen', label: 'In Kitchen', value: 'in-kitchen' },
    { id: 'waiting-photo', label: 'Waiting Photo', value: 'waiting-photo' },
    { id: 'in-delivery', label: 'In Delivery', value: 'in-delivery' },
    { id: 'waiting-feedback', label: 'Waiting Feedback', value: 'waiting-feedback' },
    { id: 'finished', label: 'Finished', value: 'finished' },
    { id: 'cancelled', label: 'Cancelled', value: 'cancelled' }
  ];

  // Selected status option
  const [selectedStatusOption, setSelectedStatusOption] = useState<FilterOption>(statusOptions[0]);
  
  // Calculate order trips map
  useEffect(() => {
    const newMap = new Map<string, DeliveryTrip>();
    
    trips.forEach(trip => {
      trip.orderIds.forEach(orderId => {
        newMap.set(orderId, trip);
      });
    });
    
    setOrderTripsMap(newMap);
  }, [trips]);
  
  // Filter orders based on date range and status
  useEffect(() => {
    let result = [...orders].filter(order => order.status !== 'archived'); // Filter out archived orders
    
    // Filter by date range if selected
    if (dateRange[0] && dateRange[1]) {
      const startDate = new Date(dateRange[0]);
      const endDate = new Date(dateRange[1]);
      
      // Set time to beginning and end of day for proper comparison
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      
      result = result.filter(order => {
        const orderDate = new Date(order.deliveryDate);
        return orderDate >= startDate && orderDate <= endDate;
      });
    }
    
    // Filter by status if not "all" - using workflow status for consistency
    if (selectedStatusOption.value !== 'all') {
      result = result.filter(order => {
        // Use the workflow status helper to map granular statuses to parent workflow status
        return getWorkflowStatus(order.status) === selectedStatusOption.value;
      });
    }
    
    setFilteredOrders(result);
  }, [orders, dateRange, selectedStatusOption]);

  // Handle status filter change
  const handleStatusFilterChange = (option: FilterOption) => {
    setSelectedStatusOption(option);
  };

  // Handle archiving order
  const handleArchiveOrder = (order: Order) => {
    setOrderToArchive(order);
    setIsArchiveDialogOpen(true);
  };

  // Confirm archiving order
  const confirmArchiveOrder = async () => {
    if (!orderToArchive) return;
    
    try {
      const updatedOrder = {
        ...orderToArchive,
        status: 'archived' as const,
        archivedDate: new Date()
      };
      
      await updateOrder(updatedOrder);
      toast.success(`Order #${orderToArchive.id.substring(orderToArchive.id.length - 5)} archived`);
    } catch (error) {
      toast.error("Failed to archive order");
      console.error("Error archiving order:", error);
    } finally {
      setIsArchiveDialogOpen(false);
      setOrderToArchive(null);
    }
  };

  // Cancel archiving order
  const cancelArchiveOrder = () => {
    setIsArchiveDialogOpen(false);
    setOrderToArchive(null);
  };

  // Handle photo upload dialog
  const handleOpenPhotoDialog = (order: Order) => {
    setSelectedOrder(order);
    setPhotoDialogOpen(true);
  };
  
  // Handle photo upload success
  const handlePhotoUploadSuccess = () => {
    toast.success("Photos uploaded successfully");
    setPhotoDialogOpen(false);
    setSelectedOrder(null);
  };

  // Handle feedback dialog
  const handleOpenFeedbackDialog = (order: Order) => {
    setSelectedOrderForFeedback(order);
    setFeedbackDialogOpen(true);
  };

  // Handle feedback success
  const handleFeedbackSuccess = () => {
    toast.success("Feedback saved successfully");
    setFeedbackDialogOpen(false);
    setSelectedOrderForFeedback(null);
  };

  // Toggle selection mode
  const handleToggleSelectionMode = () => {
    toggleSelectionMode();
  };

  // Create delivery trip
  const handleCreateTrip = () => {
    if (orderSelection.selectedOrderIds.length === 0) {
      toast.error("Please select at least one order for the trip");
      return;
    }
    
    setCreateTripDialogOpen(true);
  };

  // Render actions for order list
  const renderOrderActions = (order: Order) => {
    return (
      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        {/* View Order button - always present */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={(e) => {
            e.stopPropagation();
            // Pass referrer information via state
            navigate(`/orders/${order.id}`, {
              state: { referrer: 'orders' }
            });
          }}
        >
          <Eye className="h-4 w-4" />
        </Button>
        
        {/* Contextual buttons based on status */}
        {/* For waiting-photo status, show upload button */}
        {order.status === 'waiting-photo' && (
          <Button 
            variant="outline" 
            size="sm"
            className="bg-purple-100 text-purple-800 hover:bg-purple-200"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenPhotoDialog(order);
            }}
          >
            <Upload className="h-4 w-4" />
          </Button>
        )}
        
        {/* For waiting-feedback status, show feedback button */}
        {order.status === 'waiting-feedback' && (
          <Button 
            variant="outline" 
            size="sm"
            className="bg-blue-100 text-blue-800 hover:bg-blue-200"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenFeedbackDialog(order);
            }}
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        )}
        
        {/* Only show archive button for finished orders */}
        {order.status === 'finished' && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleArchiveOrder(order);
            }}
          >
            <Archive className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Orders | Cake Shop</title>
      </Helmet>
      
      {/* Header section */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Orders</h1>
        <div className="flex gap-2">
          <Link to="/orders/archived">
            <Button variant="outline" size="sm" className="h-9">
              <Archive className="h-4 w-4 mr-2" />
              Archived Orders
            </Button>
          </Link>
          <Link to="/workflow">
            <Button variant="outline" size="sm" className="h-9">
              <Info className="h-4 w-4 mr-2" />
              Workflow
            </Button>
          </Link>
          <Button variant="outline" size="sm" className="h-9" onClick={() => navigate("/orders/scan")}>
            Scan QR
          </Button>
          <Button className="h-9" onClick={() => navigate("/orders/new")}>
            <Plus className="mr-2 h-4 w-4" /> New Order
          </Button>
        </div>
      </div>
      
      {/* Filters section */}
      <div className="flex justify-between items-center">
        <div className="w-full max-w-md">
          <DateRangePicker 
            dateRange={dateRange} 
            onDateRangeChange={setDateRange}
          />
        </div>
        
        <div className="flex gap-2">
          {/* Selection mode toggle */}
          <Button
            variant={orderSelection.isSelectionMode ? "default" : "outline"}
            size="sm"
            onClick={handleToggleSelectionMode}
            className={orderSelection.isSelectionMode ? "bg-blue-600" : ""}
          >
            <Check className="h-4 w-4" />
            {orderSelection.isSelectionMode ? "Exit Selection" : "Select"}
          </Button>
          
          {/* Create trip button - only shown in selection mode with selected orders */}
          {orderSelection.isSelectionMode && orderSelection.selectedOrderIds.length > 0 && (
            <Button
              variant="default"
              size="sm"
              onClick={handleCreateTrip}
              className="bg-green-600"
            >
              <Car className="h-4 w-4 mr-1" />
              Create Trip ({orderSelection.selectedOrderIds.length})
            </Button>
          )}
          
          {/* Clear selection button - only shown in selection mode with selected orders */}
          {orderSelection.isSelectionMode && orderSelection.selectedOrderIds.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearOrderSelection}
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
          
          {/* View mode toggle */}
          <Button 
            variant={viewMode === 'list' ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button 
            variant={viewMode === 'grid' ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Status filter chips */}
      <StatusFilterChips 
        options={statusOptions} 
        selectedOption={selectedStatusOption} 
        onChange={handleStatusFilterChange}
      />
      
      {/* Order list/grid view */}
      {viewMode === 'list' ? (
        orderSelection.isSelectionMode ? (
          <SelectableOrderList 
            orders={filteredOrders} 
            onOrderClick={(orderId) => navigate(`/orders/${orderId}`)}
            renderActions={renderOrderActions}
            tripsMap={orderTripsMap}
          />
        ) : (
          <OrderList 
            orders={filteredOrders} 
            onOrderClick={(orderId) => navigate(`/orders/${orderId}`)}
            renderActions={renderOrderActions}
          />
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
          {filteredOrders.length === 0 && (
            <p className="text-muted-foreground col-span-full text-center py-10">
              No orders found matching your filters.
            </p>
          )}
        </div>
      )}

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive this order? Archived orders can be viewed in the archived orders section.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelArchiveOrder}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmArchiveOrder}>Archive</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Photo Upload Dialog */}
      {selectedOrder && (
        <CakePhotoUploadDialog 
          order={selectedOrder}
          open={photoDialogOpen}
          onClose={() => {
            setPhotoDialogOpen(false);
            setSelectedOrder(null);
          }}
          onSuccess={handlePhotoUploadSuccess}
        />
      )}

      {/* Feedback Dialog */}
      {selectedOrderForFeedback && (
        <FeedbackDialog 
          order={selectedOrderForFeedback}
          open={feedbackDialogOpen}
          onOpenChange={setFeedbackDialogOpen}
          onSaved={handleFeedbackSuccess}
        />
      )}
      
      {/* Create Trip Dialog */}
      <CreateTripDialog
        open={createTripDialogOpen}
        onOpenChange={setCreateTripDialogOpen}
        selectedOrderIds={orderSelection.selectedOrderIds}
        onSuccess={() => {
          toast.success("Trip created successfully");
        }}
      />
    </div>
  );
};

export default OrdersPage;
