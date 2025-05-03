
import React from 'react';
import { Order, KitchenOrderStatus } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import KitchenOrderCard from './KitchenOrderCard';

interface KitchenOrdersColumnProps {
  title?: string;
  orders: Order[];
  status?: KitchenOrderStatus;
  showStartButton?: boolean;
}

const getColumnColor = (status: KitchenOrderStatus) => {
  switch (status) {
    case 'waiting-baker':
      return 'border-t-4 border-t-orange-400';
    case 'waiting-crumbcoat':
      return 'border-t-4 border-t-yellow-400';
    case 'waiting-cover':
      return 'border-t-4 border-t-blue-400';
    case 'decorating':
      return 'border-t-4 border-t-purple-400';
    case 'done-waiting-approval':
      return 'border-t-4 border-t-green-400';
    default:
      return '';
  }
};

const KitchenOrdersColumn: React.FC<KitchenOrdersColumnProps> = ({ title, orders, status, showStartButton }) => {
  return (
    <Card className={`bg-gray-50 ${status ? getColumnColor(status) : ''}`}>
      <CardHeader className="bg-muted py-3 px-4">
        <CardTitle className="text-sm font-medium flex justify-between">
          <span>{title || 'Orders'}</span>
          <span className="bg-white text-gray-700 px-2 py-0.5 rounded-full text-xs">
            {orders.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 h-[calc(100vh-220px)] overflow-auto space-y-2">
        {orders.length > 0 ? (
          orders.map((order) => (
            <KitchenOrderCard 
              key={order.id} 
              order={order} 
              isInQueue={showStartButton}
            />
          ))
        ) : (
          <div className="flex items-center justify-center h-24 text-muted-foreground text-sm bg-white rounded-md border border-dashed">
            No orders
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-muted/50 py-2 px-4 text-xs text-muted-foreground">
        {orders.length} {orders.length === 1 ? 'cake' : 'cakes'} to prepare
      </CardFooter>
    </Card>
  );
};

export default KitchenOrdersColumn;
