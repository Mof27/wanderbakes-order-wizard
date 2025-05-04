
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { ArchiveRestore, Grid, List } from "lucide-react";
import OrderList from "@/components/orders/OrderList";
import OrderCard from "@/components/orders/OrderCard";
import DateRangePicker from "@/components/orders/DateRangePicker";
import { ViewMode, FilterOption, Order, OrderStatus } from "@/types";
import { toast } from "@/components/ui/sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const ArchivedOrdersPage = () => {
  const { orders, updateOrder, dateRange, setDateRange } = useApp();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [archivedOrders, setArchivedOrders] = useState<Order[]>([]);
  
  // Filter for archived orders only
  useEffect(() => {
    const filtered = orders.filter(order => order.status === 'archived');
    
    // Filter by date range if selected
    let result = [...filtered];
    if (dateRange[0] && dateRange[1]) {
      const startDate = new Date(dateRange[0]);
      const endDate = new Date(dateRange[1]);
      
      // Set time to beginning and end of day for proper comparison
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      
      result = result.filter(order => {
        const orderDate = new Date(order.archivedDate || order.updatedAt);
        return orderDate >= startDate && orderDate <= endDate;
      });
    }
    
    // Sort by archived date (newest first)
    result.sort((a, b) => {
      const dateA = new Date(a.archivedDate || a.updatedAt).getTime();
      const dateB = new Date(b.archivedDate || b.updatedAt).getTime();
      return dateB - dateA;
    });
    
    setArchivedOrders(result);
  }, [orders, dateRange]);

  // Handle restore order from archive
  const handleRestoreOrder = async (order: Order) => {
    try {
      await updateOrder({
        ...order,
        status: 'finished' as OrderStatus, // Restore to finished status
        archivedDate: undefined // Remove archive date
      });
      toast.success("Order restored from archive");
    } catch (error) {
      console.error("Failed to restore order:", error);
      toast.error("Failed to restore order");
    }
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Archived Orders | Cake Shop</title>
      </Helmet>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Archived Orders</h1>
      </div>
      
      <div className="flex justify-between items-center flex-wrap gap-4">
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
      
      {archivedOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ArchiveRestore className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No archived orders found</h3>
          <p className="text-muted-foreground mt-2 max-w-md">
            When you archive completed orders, they will appear here. Archived orders can be restored if needed.
          </p>
        </div>
      ) : (
        viewMode === 'list' ? (
          <OrderList 
            orders={archivedOrders}
            onOrderClick={(orderId) => navigate(`/orders/${orderId}`)}
            renderActions={(order) => (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 w-8 p-0 bg-sky-100 text-sky-800 hover:bg-sky-200"
                  >
                    <ArchiveRestore className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Restore Order from Archive?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will move the order back to the "Finished" status and make it visible in the main orders list again.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleRestoreOrder(order)}>
                      Restore Order
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {archivedOrders.map(order => (
              <div key={order.id} className="relative group">
                <OrderCard order={order} />
                <div className="absolute top-2 right-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 w-8 p-0 bg-sky-100 text-sky-800 hover:bg-sky-200"
                      >
                        <ArchiveRestore className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Restore Order from Archive?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will move the order back to the "Finished" status and make it visible in the main orders list again.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleRestoreOrder(order)}>
                          Restore Order
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default ArchivedOrdersPage;
