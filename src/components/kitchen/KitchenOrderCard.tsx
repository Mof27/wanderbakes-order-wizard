
import React from 'react';
import { Order, KitchenOrderStatus } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import NextStatusButton from './NextStatusButton';
import StartProductionButton from './StartProductionButton';

interface KitchenOrderCardProps {
  order: Order;
  isCompact?: boolean;
  isInQueue?: boolean;
}

// Function to derive kitchen status from order status
const deriveKitchenStatus = (order: Order): KitchenOrderStatus => {
  // First check if the order already has a kitchenStatus field
  if (order.kitchenStatus) {
    return order.kitchenStatus;
  }
  
  // If not, infer it based on the order status (legacy behavior)
  switch (order.status) {
    case 'in-queue':
      return 'waiting-baker';
    case 'waiting-photo':
      return 'done-waiting-approval';
    case 'in-kitchen':
      // Default to waiting-cover to match KitchenLeaderPage
      return 'waiting-cover';
    default:
      return 'waiting-baker';
  }
};

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

// Kitchen status color mapping
const getKitchenStatusColor = (status: KitchenOrderStatus) => {
  switch (status) {
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

// Function to get a nice display name for the status
const getStatusDisplayName = (status: KitchenOrderStatus): string => {
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

const KitchenOrderCard: React.FC<KitchenOrderCardProps> = ({ 
  order, 
  isCompact = false, 
  isInQueue = false
}) => {
  const urgencyClass = getUrgencyClass(order.deliveryDate);
  const layerInfo = getCakeLayerInfo(order);
  const currentKitchenStatus = deriveKitchenStatus(order);
  
  return (
    <Card className={`mb-2 ${urgencyClass} hover:shadow-md transition-shadow ${
      isInQueue ? 'bg-blue-50 border-blue-200' : ''
    }`}>
      <CardContent className={`${isCompact ? 'p-3' : 'p-4'} space-y-2`}>
        <div className="flex justify-between items-start">
          <div className="font-medium text-sm">{order.id}</div>
          
          {!isInQueue && (
            <Badge 
              className={`${getKitchenStatusColor(currentKitchenStatus)}`}
            >
              {getStatusDisplayName(currentKitchenStatus)}
            </Badge>
          )}
          
          {isInQueue && (
            <Badge className="bg-blue-100 text-blue-800">
              In Queue
            </Badge>
          )}
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
          
          {/* Display appropriate button based on order status */}
          <div className="mt-3">
            {isInQueue ? (
              <StartProductionButton order={order} />
            ) : (
              <NextStatusButton 
                order={order} 
                currentKitchenStatus={currentKitchenStatus} 
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default KitchenOrderCard;
