
import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDate } from '@/lib/utils';
import CakePhotoUploader from './CakePhotoUploader';
import { Order } from '@/types';
import DeliveryConfirmation from './DeliveryConfirmation';

const ApprovalRecapTab = () => {
  const { orders } = useApp();
  const [activeFilter, setActiveFilter] = useState<'all' | 'photo' | 'ready'>('all');
  
  // Filter orders by status
  const waitingPhotoOrders = orders.filter(order => order.status === 'waiting-photo');
  const readyForDeliveryOrders = orders.filter(order => order.status === 'ready');
  
  const filteredOrders = activeFilter === 'photo' 
    ? waitingPhotoOrders 
    : activeFilter === 'ready' 
      ? readyForDeliveryOrders 
      : [...waitingPhotoOrders, ...readyForDeliveryOrders];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-medium">Approval & Recap</h2>
          <p className="text-sm text-muted-foreground">
            Upload cake photos and confirm deliveries
          </p>
        </div>
        
        <div>
          <Tabs value={activeFilter} onValueChange={(value) => setActiveFilter(value as 'all' | 'photo' | 'ready')}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="photo" className="flex gap-2">
                Awaiting Photos 
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
                  {waitingPhotoOrders.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="ready" className="flex gap-2">
                Ready for Delivery
                <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                  {readyForDeliveryOrders.length}
                </span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 border rounded-md bg-muted/20">
          <p className="text-muted-foreground">
            No orders found in this category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map(order => (
            <OrderApprovalCard 
              key={order.id} 
              order={order} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface OrderApprovalCardProps {
  order: Order;
}

const OrderApprovalCard = ({ order }: OrderApprovalCardProps) => {
  return (
    <Card>
      <CardHeader className="bg-muted py-3">
        <div className="flex justify-between">
          <span className="font-medium">{order.id}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            order.status === 'waiting-photo' 
              ? 'bg-yellow-100 text-yellow-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {order.status === 'waiting-photo' ? 'Needs Photo' : 'Ready'}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-4 pb-2 space-y-3">
        <div>
          <p className="font-medium">{order.customer.name}</p>
          <p className="text-xs text-muted-foreground">{order.customer.whatsappNumber}</p>
        </div>
        
        <div className="grid grid-cols-2 text-sm gap-y-1">
          <span className="text-muted-foreground">Delivery Date:</span>
          <span className="font-semibold">{formatDate(order.deliveryDate)}</span>
          
          <span className="text-muted-foreground">Cake:</span>
          <span>{order.cakeSize} {order.cakeShape}</span>
          
          <span className="text-muted-foreground">Design:</span>
          <span>{order.cakeDesign}</span>
        </div>
        
        {order.cakeText && (
          <div className="text-sm bg-muted/50 p-2 rounded">
            <p className="italic">"{order.cakeText}"</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col p-3 gap-2">
        {order.status === 'waiting-photo' ? (
          <CakePhotoUploader orderId={order.id} />
        ) : (
          <DeliveryConfirmation orderId={order.id} />
        )}
      </CardFooter>
    </Card>
  );
};

export default ApprovalRecapTab;
