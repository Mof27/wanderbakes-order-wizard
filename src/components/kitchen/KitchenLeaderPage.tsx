import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Helmet } from "react-helmet-async";
import { Order, KitchenOrderStatus } from "@/types";
import { matchesStatus, isInRevisionProcess } from "@/lib/statusHelpers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import KitchenOrderCard from "@/components/kitchen/KitchenOrderCard";
import RevisionOrderCard from "@/components/kitchen/RevisionOrderCard";
import { formatDate } from "@/lib/utils";
import { Archive, Check, ChevronDown, Filter, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

type TimeFilter = 'all' | 'today' | 'tomorrow' | 'this-week' | 'later';

const KitchenLeaderPage = () => {
  const { orders } = useApp();
  const [view, setView] = useState<"all" | "byDate">("all");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [inQueueOrders, setInQueueOrders] = useState<Order[]>([]);
  const [inKitchenOrders, setInKitchenOrders] = useState<Order[]>([]);
  const [revisionOrders, setRevisionOrders] = useState<Order[]>([]);
  const [activeFilter, setActiveFilter] = useState<KitchenOrderStatus | "all">("all");
  
  // Filter and sort orders for kitchen production
  useEffect(() => {
    // Get all relevant orders
    const relevantOrders = orders.filter(order => 
      order.status === 'in-queue' || 
      order.status === 'in-kitchen' || 
      order.status === 'waiting-photo' ||
      order.status === 'needs-revision'
    );
    
    // Split into different order categories
    const queueOrders = relevantOrders.filter(order => order.status === 'in-queue');
    const kitchenOrders = relevantOrders.filter(order => 
      order.status === 'in-kitchen' || order.status === 'waiting-photo'
    );
    const needsRevisionOrders = relevantOrders.filter(order => 
      order.status === 'needs-revision'
    );
    
    // Apply time filter if needed
    const filteredQueueOrders = applyTimeFilter(queueOrders, timeFilter);
    
    // Sort by delivery date (soonest first)
    const sortedQueueOrders = filteredQueueOrders.sort(
      (a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime()
    );
    
    const sortedKitchenOrders = kitchenOrders.sort(
      (a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime()
    );

    const sortedRevisionOrders = needsRevisionOrders.sort(
      (a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime()
    );
    
    setInQueueOrders(sortedQueueOrders);
    setInKitchenOrders(sortedKitchenOrders);
    setRevisionOrders(sortedRevisionOrders);
  }, [orders, timeFilter]);

  // Apply time filter to orders
  const applyTimeFilter = (orders: Order[], filter: TimeFilter): Order[] => {
    if (filter === 'all') {
      return orders;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    return orders.filter(order => {
      const deliveryDate = new Date(order.deliveryDate);
      deliveryDate.setHours(0, 0, 0, 0);
      
      switch (filter) {
        case 'today':
          return deliveryDate.getTime() === today.getTime();
        case 'tomorrow':
          return deliveryDate.getTime() === tomorrow.getTime();
        case 'this-week':
          return deliveryDate > today && deliveryDate < nextWeek;
        case 'later':
          return deliveryDate >= nextWeek;
        default:
          return true;
      }
    });
  };

  // Handle status filter changes
  const handleFilterChange = (status: KitchenOrderStatus | "all") => {
    setActiveFilter(status);
  };

  // Get the filtered orders based on kitchen status
  const getFilteredInKitchenOrders = () => {
    if (activeFilter === "all") {
      return inKitchenOrders;
    }
    
    return inKitchenOrders.filter(order => {
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

  const getOrdersByDeliveryDate = (ordersToGroup: Order[]) => {
    // Group filtered orders by delivery date
    const ordersByDate = ordersToGroup.reduce((acc, order) => {
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

  const renderTimeFilter = () => (
    <div className="mb-4 flex items-center gap-2">
      <div className="text-sm font-medium text-muted-foreground">Delivery:</div>
      <Select 
        value={timeFilter} 
        onValueChange={(value) => setTimeFilter(value as TimeFilter)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by delivery" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All timeframes</SelectItem>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="tomorrow">Tomorrow</SelectItem>
          <SelectItem value="this-week">This week</SelectItem>
          <SelectItem value="later">Later</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  const renderAllOrders = (orders: Order[], isQueue: boolean) => {
    if (orders.length === 0) {
      return (
        <div className="text-center p-8 bg-gray-50 rounded-md">
          <p className="text-muted-foreground">No orders found</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.map(order => (
          <KitchenOrderCard 
            key={order.id} 
            order={order} 
            isInQueue={isQueue} 
          />
        ))}
      </div>
    );
  };

  const renderOrdersByDate = (orders: Order[], isQueue: boolean) => {
    const ordersByDate = getOrdersByDeliveryDate(orders);
    
    if (Object.keys(ordersByDate).length === 0) {
      return (
        <div className="text-center p-8 bg-gray-50 rounded-md">
          <p className="text-muted-foreground">No orders found</p>
        </div>
      );
    }
    
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
                  <KitchenOrderCard 
                    key={order.id} 
                    order={order} 
                    isCompact={true} 
                    isInQueue={isQueue} 
                  />
                ))}
              </CardContent>
            </Card>
          ))}
      </div>
    );
  };

  // Render revisions section - similar to renderAllOrders but specifically for revisions
  const renderRevisions = (orders: Order[]) => {
    if (orders.length === 0) {
      return (
        <div className="text-center p-8 bg-gray-50 rounded-md">
          <p className="text-muted-foreground">No orders needing revision</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.map(order => (
          <RevisionOrderCard 
            key={order.id} 
            order={order} 
          />
        ))}
      </div>
    );
  };

  // Render revisions by date
  const renderRevisionsByDate = (orders: Order[]) => {
    const ordersByDate = getOrdersByDeliveryDate(orders);
    
    if (Object.keys(ordersByDate).length === 0) {
      return (
        <div className="text-center p-8 bg-gray-50 rounded-md">
          <p className="text-muted-foreground">No orders needing revision</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        {Object.entries(ordersByDate)
          .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
          .map(([date, dateOrders]) => (
            <Card key={date} className="bg-white">
              <CardHeader className="bg-purple-50">
                <CardTitle className="text-lg font-medium">
                  {date} ({dateOrders.length} orders)
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dateOrders.map(order => (
                  <RevisionOrderCard 
                    key={order.id} 
                    order={order}
                    isCompact={true}
                  />
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
      
      <Tabs defaultValue="queue" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="queue" className="text-center">
            Production Queue ({inQueueOrders.length})
          </TabsTrigger>
          <TabsTrigger value="in-kitchen" className="text-center">
            In Production ({inKitchenOrders.length})
          </TabsTrigger>
          <TabsTrigger value="revisions" className="text-center">
            Revisions ({revisionOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="pt-4">
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-4">
              Orders waiting to start production. Use the delivery filter to view cakes by date.
            </p>
            {renderTimeFilter()}
          </div>
          
          {view === "all" 
            ? renderAllOrders(inQueueOrders, true)
            : renderOrdersByDate(inQueueOrders, true)}
        </TabsContent>

        <TabsContent value="in-kitchen" className="pt-4">
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-4">
              Orders currently in production. Filter by kitchen status to see orders at each stage.
            </p>
            {renderFilterChips()}
          </div>
          
          {view === "all" 
            ? renderAllOrders(getFilteredInKitchenOrders(), false)
            : renderOrdersByDate(getFilteredInKitchenOrders(), false)}
        </TabsContent>
        
        <TabsContent value="revisions" className="pt-4">
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-4">
              Orders needing revision. Review feedback and make necessary corrections.
            </p>
          </div>
          
          {view === "all" 
            ? renderRevisions(revisionOrders)
            : renderRevisionsByDate(revisionOrders)}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default KitchenLeaderPage;
