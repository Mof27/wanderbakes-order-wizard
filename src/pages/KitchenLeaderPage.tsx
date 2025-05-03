
import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Helmet } from "react-helmet-async";
import { Order, KitchenOrderStatus } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import KitchenOrderCard from "@/components/kitchen/KitchenOrderCard";
import { formatDate } from "@/lib/utils";
import { Archive, Check, ChevronDown, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Function to derive kitchen status from order status
const deriveKitchenStatus = (order: Order): KitchenOrderStatus => {
  // First check if the order already has a kitchenStatus field
  if (order.kitchenStatus) {
    return order.kitchenStatus;
  }
  
  // If not, infer it based on the order status (legacy behavior)
  switch (order.status) {
    case 'in-queue': // Changed from 'confirmed' to 'in-queue'
      return 'waiting-baker';
    case 'waiting-photo':
      return 'done-waiting-approval';
    case 'in-kitchen':
      // Default to waiting-cover
      return 'waiting-cover'; // Default to middle of the process
    default:
      return 'waiting-baker';
  }
};

const KitchenLeaderPage = () => {
  const { orders } = useApp();
  const [view, setView] = useState<"all" | "byDate">("all");
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [activeFilter, setActiveFilter] = useState<KitchenOrderStatus | "all">("all");
  
  // Filter orders that are relevant for kitchen production
  // These are orders in in-queue or in-kitchen status
  useEffect(() => {
    const relevantOrders = orders.filter(order => 
      order.status === 'in-queue' || // Changed from 'confirmed' to 'in-queue'
      order.status === 'in-kitchen' || 
      order.status === 'waiting-photo'
    );
    
    setFilteredOrders(relevantOrders);
  }, [orders]);

  // Handle status filter changes
  const handleFilterChange = (status: KitchenOrderStatus | "all") => {
    setActiveFilter(status);
  };

  // Get the filtered orders based on kitchen status
  const getFilteredOrders = () => {
    if (activeFilter === "all") {
      return filteredOrders;
    }
    
    return filteredOrders.filter(order => {
      // Get the proper kitchen status based on the new field or legacy approach
      const kitchenStatus = deriveKitchenStatus(order);
      return kitchenStatus === activeFilter;
    });
  };

  const kitchenStatusOptions: Array<KitchenOrderStatus | "all"> = [
    "all",
    "waiting-baker",
    "waiting-crumbcoat",
    "waiting-cover",
    "decorating", // Changed from "in-progress" to "decorating"
    "done-waiting-approval"
  ];

  const getStatusDisplayName = (status: KitchenOrderStatus | "all"): string => {
    if (status === "all") return "All Orders";
    
    switch (status) {
      case 'waiting-baker': 
        return 'Waiting Baker';
      case 'waiting-crumbcoat': 
        return 'Waiting Crumbcoat';
      case 'waiting-cover': 
        return 'Waiting Cover';
      case 'decorating': // Changed from "in-progress" to "decorating" 
        return 'Decorating';
      case 'done-waiting-approval': 
        return 'Done, Waiting Approval';
      default:
        return 'Unknown Status';
    }
  };

  // Get status badge color
  const getStatusColor = (status: KitchenOrderStatus | "all") => {
    switch (status) {
      case "all":
        return "bg-gray-100 text-gray-800";
      case "waiting-baker":
        return "bg-orange-100 text-orange-800";
      case "waiting-crumbcoat":
        return "bg-yellow-100 text-yellow-800";
      case "waiting-cover":
        return "bg-blue-100 text-blue-800";
      case "decorating": // Changed from "in-progress" to "decorating"
        return "bg-purple-100 text-purple-800";
      case "done-waiting-approval":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getOrdersByDeliveryDate = () => {
    // Group filtered orders by delivery date
    const displayOrders = getFilteredOrders();
    const ordersByDate = displayOrders.reduce((acc, order) => {
      const date = formatDate(order.deliveryDate);
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(order);
      return acc;
    }, {} as Record<string, Order[]>);
    
    return ordersByDate;
  };

  const renderFilterChips = () => (
    <div className="flex flex-wrap gap-2 mb-4">
      {kitchenStatusOptions.map((status) => (
        <Badge
          key={status}
          className={`cursor-pointer ${
            activeFilter === status 
              ? `${getStatusColor(status)} border-2 border-slate-400` 
              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
          }`}
          onClick={() => handleFilterChange(status)}
        >
          {getStatusDisplayName(status)}
          {activeFilter === status && <Check className="ml-1 h-3 w-3" />}
        </Badge>
      ))}
    </div>
  );

  const renderAllOrders = () => {
    const displayOrders = getFilteredOrders();
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayOrders.map(order => (
          <KitchenOrderCard key={order.id} order={order} />
        ))}
      </div>
    );
  };

  const renderOrdersByDate = () => {
    const ordersByDate = getOrdersByDeliveryDate();
    
    return (
      <div className="space-y-6">
        {Object.entries(ordersByDate)
          .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
          .map(([date, dateOrders]) => (
            <Card key={date} className="bg-white">
              <CardHeader className="bg-muted">
                <CardTitle className="text-lg font-medium">
                  {date} ({dateOrders.length} orders)
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dateOrders.map(order => (
                  <KitchenOrderCard key={order.id} order={order} isCompact={true} />
                ))}
              </CardContent>
            </Card>
          ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Kitchen Production | Cake Shop</title>
      </Helmet>
      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Kitchen Production</h1>
        <div className="flex gap-2">
          <Button
            variant={view === "all" ? "default" : "outline"}
            onClick={() => setView("all")}
            className="flex gap-2 items-center"
          >
            <Filter className="h-4 w-4" />
            All Orders
          </Button>
          <Button
            variant={view === "byDate" ? "default" : "outline"}
            onClick={() => setView("byDate")}
            className="flex gap-2 items-center"
          >
            <Archive className="h-4 w-4" />
            Group by Date
          </Button>
        </div>
      </div>
      
      <p className="text-muted-foreground">
        Manage your cake production workflow. View orders ready to be baked, track progress, and update status.
      </p>
      
      {renderFilterChips()}
      
      {view === "all" ? renderAllOrders() : renderOrdersByDate()}
    </div>
  );
};

export default KitchenLeaderPage;
