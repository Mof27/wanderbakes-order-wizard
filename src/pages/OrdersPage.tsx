
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Plus, Grid, List, Workflow, Info } from "lucide-react";
import OrderList from "@/components/orders/OrderList";
import OrderCard from "@/components/orders/OrderCard";
import DateFilterBar from "@/components/orders/DateFilterBar";
import StatusFilterChips from "@/components/orders/StatusFilterChips";
import { ViewMode, FilterOption } from "@/types";

const OrdersPage = () => {
  const { orders } = useApp();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [orderDate, setOrderDate] = useState<Date | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filteredOrders, setFilteredOrders] = useState(orders);
  
  // Create status filter options
  const statusOptions: FilterOption[] = [
    { id: 'all', label: 'All Orders', value: 'all' },
    { id: 'incomplete', label: 'Incomplete', value: 'incomplete' },
    { id: 'in-queue', label: 'In Queue', value: 'in-queue' },
    { id: 'in-kitchen', label: 'In Kitchen', value: 'in-kitchen' },
    { id: 'waiting-photo', label: 'Waiting Photo', value: 'waiting-photo' },
    { id: 'ready-to-deliver', label: 'Ready to Deliver', value: 'ready-to-deliver' },
    { id: 'in-delivery', label: 'In Delivery', value: 'in-delivery' },
    { id: 'delivery-confirmed', label: 'Delivered', value: 'delivery-confirmed' },
    { id: 'waiting-feedback', label: 'Waiting Feedback', value: 'waiting-feedback' },
    { id: 'finished', label: 'Finished', value: 'finished' },
    { id: 'cancelled', label: 'Cancelled', value: 'cancelled' }
  ];

  // Selected status option
  const [selectedStatusOption, setSelectedStatusOption] = useState<FilterOption>(statusOptions[0]);
  
  // Filter orders based on date and status
  useEffect(() => {
    let result = [...orders];
    
    // Filter by date if selected
    if (orderDate) {
      const dateStr = orderDate.toISOString().split('T')[0];
      result = result.filter(order => {
        const orderDateStr = new Date(order.deliveryDate).toISOString().split('T')[0];
        return orderDateStr === dateStr;
      });
    }
    
    // Filter by status if not "all"
    if (selectedStatusOption.value !== 'all') {
      result = result.filter(order => order.status === selectedStatusOption.value);
    }
    
    setFilteredOrders(result);
  }, [orders, orderDate, selectedStatusOption]);

  // Handle status filter change
  const handleStatusFilterChange = (option: FilterOption) => {
    setSelectedStatusOption(option);
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Orders | Cake Shop</title>
      </Helmet>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Orders</h1>
        <div className="flex gap-2">
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
        <DateFilterBar 
          selectedDate={orderDate} 
          onDateChange={setOrderDate}
        />
        
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
    </div>
  );
};

export default OrdersPage;
