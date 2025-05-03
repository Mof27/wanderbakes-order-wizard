
import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import KitchenOrdersColumn from './KitchenOrdersColumn';
import { Order, KitchenOrderStatus } from '@/types';
import { Link } from 'react-router-dom';

const KitchenLeaderPage = () => {
  const { orders } = useApp();
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'tomorrow' | 'this-week'>('all');

  // Filter orders that are in queue (status = "in-queue")
  const inQueueOrders = orders.filter(order => order.status === 'in-queue');
  
  // Filter orders that are in kitchen (status = "in-kitchen")
  const inKitchenOrders = orders.filter(order => order.status === 'in-kitchen');

  // Time filtering for in-queue orders
  const filteredQueueOrders = filterOrdersByTime(inQueueOrders, timeFilter);

  // Group in-kitchen orders by their kitchen status
  const waitingBakerOrders = inKitchenOrders.filter(order => order.kitchenStatus === 'waiting-baker');
  const waitingCrumbcoatOrders = inKitchenOrders.filter(order => order.kitchenStatus === 'waiting-crumbcoat');
  const waitingCoverOrders = inKitchenOrders.filter(order => order.kitchenStatus === 'waiting-cover');
  const decoratingOrders = inKitchenOrders.filter(order => order.kitchenStatus === 'decorating');
  const doneWaitingApprovalOrders = inKitchenOrders.filter(order => order.kitchenStatus === 'done-waiting-approval');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Kitchen Production</h1>
        <Link to="/orders?tab=approval">
          <Button variant="outline">View Approval & Recap</Button>
        </Link>
      </div>

      <Tabs defaultValue="queue" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="queue" className="flex-1">
            Production Queue ({filteredQueueOrders.length})
          </TabsTrigger>
          <TabsTrigger value="production" className="flex-1">
            In Production ({inKitchenOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="queue">
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex justify-between items-center">
                <h2 className="text-lg font-medium">Orders Ready to Start Production</h2>
                <div className="flex border rounded-md">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`${timeFilter === 'all' ? 'bg-muted' : ''}`}
                    onClick={() => setTimeFilter('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`${timeFilter === 'today' ? 'bg-muted' : ''}`}
                    onClick={() => setTimeFilter('today')}
                  >
                    Today
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`${timeFilter === 'tomorrow' ? 'bg-muted' : ''}`}
                    onClick={() => setTimeFilter('tomorrow')}
                  >
                    Tomorrow
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`${timeFilter === 'this-week' ? 'bg-muted' : ''}`}
                    onClick={() => setTimeFilter('this-week')}
                  >
                    This Week
                  </Button>
                </div>
              </div>

              {filteredQueueOrders.length === 0 ? (
                <div className="text-center py-12 border rounded-md bg-muted/20">
                  <p className="text-muted-foreground">No orders in production queue.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredQueueOrders.map(order => (
                    <KitchenOrdersColumn 
                      key={order.id}
                      orders={[order]}
                      showStartButton={true}
                      title={`Order ${order.id}`}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="production">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <KitchenOrdersColumn 
              title="Waiting Baker" 
              orders={waitingBakerOrders} 
              status="waiting-baker"
            />
            <KitchenOrdersColumn 
              title="Waiting Crumb Coat" 
              orders={waitingCrumbcoatOrders} 
              status="waiting-crumbcoat" 
            />
            <KitchenOrdersColumn 
              title="Waiting Cover" 
              orders={waitingCoverOrders} 
              status="waiting-cover"
            />
            <KitchenOrdersColumn 
              title="Decorating" 
              orders={decoratingOrders} 
              status="decorating"
            />
            <KitchenOrdersColumn 
              title="Done - Waiting Approval" 
              orders={doneWaitingApprovalOrders} 
              status="done-waiting-approval"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper function to filter orders by time
const filterOrdersByTime = (orders: Order[], timeFilter: 'all' | 'today' | 'tomorrow' | 'this-week'): Order[] => {
  if (timeFilter === 'all') {
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
    
    if (timeFilter === 'today') {
      return deliveryDate.getTime() === today.getTime();
    } else if (timeFilter === 'tomorrow') {
      return deliveryDate.getTime() === tomorrow.getTime();
    } else if (timeFilter === 'this-week') {
      return deliveryDate >= today && deliveryDate < nextWeek;
    }
    return true;
  });
};

export default KitchenLeaderPage;
