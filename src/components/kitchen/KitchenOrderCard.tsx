
import React from 'react';
import { Order, KitchenOrderStatus } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import KitchenStatusDropdown from './KitchenStatusDropdown';

interface KitchenOrderCardProps {
  order: Order;
  isCompact?: boolean;
}

// Function to extract cake layer information from order
const getCakeLayerInfo = (order: Order): string => {
  if (order.cakeTier > 1 && order.tierDetails && order.tierDetails.length > 0) {
    return order.tierDetails.map(tier => `${tier.shape} ${tier.size} (${tier.height || ''})`).join(', ');
  }
  
  return `${order.cakeShape} ${order.cakeSize} (${order.tierDetails?.[0]?.height || '2 Layer'})`;
};

// Calculate urgency based on delivery date
const getUrgencyClass = (deliveryDate: Date): string => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const deliveryDay = new Date(deliveryDate);
  
  if (deliveryDay <= today) {
    return 'border-l-4 border-l-red-500';
  } else if (deliveryDay <= tomorrow) {
    return 'border-l-4 border-l-orange-400';
  } else {
    return '';
  }
};

const KitchenOrderCard: React.FC<KitchenOrderCardProps> = ({ order, isCompact = false }) => {
  const urgencyClass = getUrgencyClass(order.deliveryDate);
  const layerInfo = getCakeLayerInfo(order);
  
  return (
    <Card className={`mb-2 ${urgencyClass} hover:shadow-md transition-shadow`}>
      <CardContent className={`${isCompact ? 'p-3' : 'p-4'} space-y-2`}>
        <div className="flex justify-between items-start">
          <div className="font-medium text-sm">{order.id}</div>
          <KitchenStatusDropdown order={order} />
        </div>
        
        <div className="space-y-1">
          <div className="grid grid-cols-1 gap-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Delivery:</span>
              <span className="font-semibold">{formatDate(order.deliveryDate)}</span>
            </div>
            
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Cake:</span>
              <span>{order.cakeTier > 1 ? `${order.cakeTier}-Tier Cake` : '1-Tier Cake'}</span>
            </div>
            
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Flavor:</span>
              <span>{order.cakeFlavor}</span>
            </div>
            
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Size:</span>
              <span>{layerInfo}</span>
            </div>
          </div>
          
          {!isCompact && (
            <>
              <div className="bg-muted rounded-md p-2 text-xs">
                <div className="font-medium mb-1">Design:</div>
                <div>{order.cakeDesign}</div>
              </div>
              
              {order.cakeText && (
                <div className="text-xs italic">
                  <span className="font-medium">Cake Text:</span> "{order.cakeText}"
                </div>
              )}
              
              {order.notes && (
                <div className="bg-yellow-50 text-yellow-800 rounded-md p-2 text-xs">
                  <div className="font-medium mb-1">Notes:</div>
                  <div>{order.notes}</div>
                </div>
              )}
            </>
          )}
          
          {!isCompact && order.coverType && (
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-white">
                {order.coverType === 'buttercream' ? 'Buttercream' : 'Fondant'}
              </Badge>
              {typeof order.coverColor === 'object' && order.coverColor.type === 'solid' && (
                <div 
                  className="h-5 w-5 rounded-full border" 
                  style={{ backgroundColor: order.coverColor.color }}
                />
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default KitchenOrderCard;
