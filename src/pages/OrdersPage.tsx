
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Plus, Grid, List, Info, Archive, Edit } from "lucide-react";
import OrderList from "@/components/orders/OrderList";
import OrderCard from "@/components/orders/OrderCard";
import DateRangePicker from "@/components/orders/DateRangePicker";
import StatusFilterChips from "@/components/orders/StatusFilterChips";
import { ViewMode, FilterOption, Order } from "@/types";
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

const OrdersPage = () => {
  const { orders, setDateRange, dateRange, updateOrder } = useApp();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filteredOrders, setFilteredOrders] = useState(orders);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [orderToArchive, setOrderToArchive] = useState<Order | null>(null);
  
  // Create status filter options - removed "ready-to-deliver" and "delivery-confirmed"
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
    
    // Filter by status if not "all"
    if (selectedStatusOption.value !== 'all') {
      result = result.filter(order => order.status === selectedStatusOption.value);
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

  // Render actions for order list
  const renderOrderActions = (order: Order) => {
    return (
      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/orders/${order.id}`);
          }}
        >
          <Edit className="h-4 w-4" />
        </Button>
        
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
      
      <div className="flex justify-between items-center">
        <div className="w-full max-w-md">
          <DateRangePicker 
            dateRange={dateRange} 
            onDateRangeChange={setDateRange}
          />
        </div>
        
        <div className="flex gap-2">
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
      
      <StatusFilterChips 
        options={statusOptions} 
        selectedOption={selectedStatusOption} 
        onChange={handleStatusFilterChange}
      />
      
      {viewMode === 'list' ? (
        <OrderList 
          orders={filteredOrders} 
          onOrderClick={(orderId) => navigate(`/orders/${orderId}`)}
          renderActions={renderOrderActions}
        />
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
    </div>
  );
};

export default OrdersPage;
