
import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Helmet } from "react-helmet-async";
import { Order, KitchenOrderStatus } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import KitchenOrderCard from "@/components/kitchen/KitchenOrderCard";
import KitchenOrdersColumn from "@/components/kitchen/KitchenOrdersColumn";
import { formatDate } from "@/lib/utils";
import { Archive, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

const KitchenLeaderPage = () => {
  const { orders } = useApp();
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  
  // Filter orders that are relevant for kitchen production
  // These are orders in confirmed or in-progress status
  useEffect(() => {
    const relevantOrders = orders.filter(order => 
      order.status === 'confirmed' || 
      order.status === 'in-progress' || 
      order.status === 'waiting-photo'
    );
    
    setFilteredOrders(relevantOrders);
  }, [orders]);

  // Group orders by their kitchen status
  const getOrdersByKitchenStatus = (status: KitchenOrderStatus) => {
    return filteredOrders.filter(order => {
      // This is where we'll map the order status to kitchen status
      // For now, use a simple approach based on order status
      if (status === 'waiting-baker') {
        return order.status === 'confirmed';
      } else if (status === 'done-waiting-approval') {
        return order.status === 'waiting-photo';
      } else {
        // For other statuses, check if there's a matching kitchen status property
        // This will be enhanced when we add the kitchenStatus property to orders
        return order.status === 'in-progress';
      }
    });
  };

  const getOrdersByDeliveryDate = () => {
    // Group orders by delivery date
    const ordersByDate = filteredOrders.reduce((acc, order) => {
      const date = formatDate(order.deliveryDate);
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(order);
      return acc;
    }, {} as Record<string, Order[]>);
    
    return ordersByDate;
  };

  const renderKanbanView = () => (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <KitchenOrdersColumn 
        title="Waiting Baker" 
        orders={getOrdersByKitchenStatus('waiting-baker')} 
        status="waiting-baker"
      />
      <KitchenOrdersColumn 
        title="Waiting Crumbcoat" 
        orders={getOrdersByKitchenStatus('waiting-crumbcoat')} 
        status="waiting-crumbcoat"
      />
      <KitchenOrdersColumn 
        title="Waiting Cover" 
        orders={getOrdersByKitchenStatus('waiting-cover')} 
        status="waiting-cover"
      />
      <KitchenOrdersColumn 
        title="In Progress" 
        orders={getOrdersByKitchenStatus('in-progress')} 
        status="in-progress"
      />
      <KitchenOrdersColumn 
        title="Done, Waiting Approval" 
        orders={getOrdersByKitchenStatus('done-waiting-approval')} 
        status="done-waiting-approval"
      />
    </div>
  );

  const renderListView = () => {
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
              <CardContent className="divide-y">
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
            variant={view === "kanban" ? "default" : "outline"}
            onClick={() => setView("kanban")}
            className="flex gap-2 items-center"
          >
            <Inbox className="h-4 w-4" />
            Kanban View
          </Button>
          <Button
            variant={view === "list" ? "default" : "outline"}
            onClick={() => setView("list")}
            className="flex gap-2 items-center"
          >
            <Archive className="h-4 w-4" />
            List by Date
          </Button>
        </div>
      </div>
      
      <p className="text-muted-foreground">
        Manage your cake production workflow. View orders ready to be baked, track progress, and update status.
      </p>
      
      {view === "kanban" ? renderKanbanView() : renderListView()}
    </div>
  );
};

export default KitchenLeaderPage;
