
import React from 'react';
import { Order, KitchenOrderStatus } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, cn } from '@/lib/utils';
import NextStatusButton from './NextStatusButton';
import StartProductionButton from './StartProductionButton';
import { getColorStyle } from '@/utils/colorUtils';

interface KitchenOrderCardProps {
  order: Order;
  isCompact?: boolean;
  isInQueue?: boolean;
  showStartButton?: boolean;
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
    case "decorating":
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
    case 'decorating':
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
  isInQueue = false,
  showStartButton = false
}) => {
  const urgencyClass = getUrgencyClass(order.deliveryDate);
  const layerInfo = getCakeLayerInfo(order);
  const currentKitchenStatus = deriveKitchenStatus(order);
  
  // Render the header section for all card types
  const renderHeader = () => (
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
  );

  // Render basic delivery info for all card types
  const renderBasicInfo = () => (
    <div className="flex justify-between text-xs">
      <span className="text-muted-foreground">Delivery:</span>
      <span className="font-semibold">{formatDate(order.deliveryDate)}</span>
    </div>
  );

  // Status-specific content for Waiting Baker
  const renderWaitingBakerContent = () => (
    <div className="space-y-1">
      {renderBasicInfo()}
      
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">Cake:</span>
        <span>{order.cakeTier > 1 ? `${order.cakeTier}-Tier Cake` : '1-Tier Cake'}</span>
      </div>
      
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">Flavor:</span>
        <span className="font-medium">{order.cakeFlavor}</span>
      </div>
      
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">Size:</span>
        <span>{layerInfo}</span>
      </div>
      
      {!isCompact && (
        <div className="bg-orange-50 rounded-md p-2 text-xs border border-orange-200 mt-2">
          <div className="font-medium mb-1 text-orange-800">Baking Notes:</div>
          <ul className="list-disc list-inside space-y-1">
            <li>Check ingredient availability</li>
            <li>Prepare {order.cakeTier > 1 ? 'multiple tiers' : 'single tier'}</li>
          </ul>
        </div>
      )}
    </div>
  );

  // Status-specific content for Waiting Crumbcoat
  const renderWaitingCrumbcoatContent = () => (
    <div className="space-y-1">
      {renderBasicInfo()}
      
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
      
      {!isCompact && (
        <div className="bg-yellow-50 rounded-md p-2 text-xs border border-yellow-200 mt-2">
          <div className="font-medium mb-1 text-yellow-800">Crumbcoating Instructions:</div>
          <div>Apply thin layer of buttercream to seal in crumbs.</div>
          {order.cakeTier > 1 && (
            <div className="mt-1">Multi-tier cake: Crumbcoat each tier separately.</div>
          )}
        </div>
      )}
    </div>
  );

  // Status-specific content for Waiting Cover
  const renderWaitingCoverContent = () => (
    <div className="space-y-1">
      {renderBasicInfo()}
      
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">Cover Type:</span>
        <span className="font-semibold">{order.coverType === 'buttercream' ? 'Buttercream' : 'Fondant'}</span>
      </div>
      
      {/* Prominently display the cover color */}
      <div className="mt-2">
        <div className="text-xs text-muted-foreground mb-1">Cover Color:</div>
        <div className="flex items-center gap-2">
          {typeof order.coverColor === 'object' && order.coverColor.type === 'solid' && (
            <>
              <div 
                className="h-8 w-8 rounded-full border" 
                style={getColorStyle(order.coverColor)}
              />
              <div className="font-medium text-sm">{order.coverColor.color}</div>
            </>
          )}
          {typeof order.coverColor === 'object' && order.coverColor.type === 'custom' && (
            <div className="text-sm font-medium">{order.coverColor.notes}</div>
          )}
        </div>
      </div>
      
      {!isCompact && (
        <div className="bg-blue-50 rounded-md p-2 text-xs border border-blue-200 mt-2">
          <div className="font-medium mb-1 text-blue-800">Covering Instructions:</div>
          {order.coverType === 'buttercream' ? (
            <div>Apply smooth buttercream finish. Keep edges clean and sharp.</div>
          ) : (
            <div>Roll fondant evenly. Cover carefully to avoid air bubbles.</div>
          )}
          {order.cakeTier > 1 && (
            <div className="mt-1 text-blue-900">Multi-tier cake: Cover each tier separately before assembly.</div>
          )}
        </div>
      )}
    </div>
  );
  
  // Status-specific content for Decorating
  const renderDecoratingContent = () => (
    <div className="space-y-1">
      {renderBasicInfo()}
      
      {/* Cake design is most important for decorating */}
      <div className="bg-purple-50 rounded-md p-2 text-xs border border-purple-200">
        <div className="font-medium mb-1 text-purple-900">Design:</div>
        <div>{order.cakeDesign}</div>
      </div>
      
      {order.cakeText && (
        <div className="text-xs">
          <span className="font-medium text-muted-foreground">Cake Text:</span>{" "}
          <span className="italic">"{order.cakeText}"</span>
        </div>
      )}
      
      {!isCompact && order.notes && (
        <div className="mt-2 bg-purple-50 rounded-md p-2 text-xs border border-purple-200">
          <div className="font-medium mb-1 text-purple-900">Special Instructions:</div>
          <div>{order.notes}</div>
        </div>
      )}
    </div>
  );
  
  // Status-specific content for Done Waiting Approval
  const renderDoneWaitingApprovalContent = () => (
    <div className="space-y-1">
      {renderBasicInfo()}
      
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">Cake:</span>
        <span>{order.cakeTier > 1 ? `${order.cakeTier}-Tier ${order.cakeShape}` : `${order.cakeShape} ${order.cakeSize}`}</span>
      </div>
      
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">Flavor:</span>
        <span>{order.cakeFlavor}</span>
      </div>
      
      {!isCompact && (
        <div className="bg-green-50 rounded-md p-2 text-xs border border-green-200 mt-2">
          <div className="font-medium mb-1 text-green-800">Quality Check:</div>
          <ul className="list-disc list-inside space-y-1">
            <li>Check design matches specifications</li>
            <li>Verify text spelling is correct</li>
            <li>Ensure decorations are secure</li>
            <li>Take clear photos for approval</li>
          </ul>
        </div>
      )}
    </div>
  );
  
  // Render the right content based on kitchen status
  const renderContentByStatus = () => {
    if (isInQueue) {
      // For queued orders, show waiting-baker content
      return renderWaitingBakerContent();
    }
    
    // For orders in kitchen, show content based on status
    switch (currentKitchenStatus) {
      case "waiting-baker":
        return renderWaitingBakerContent();
      case "waiting-crumbcoat":
        return renderWaitingCrumbcoatContent();
      case "waiting-cover":
        return renderWaitingCoverContent();
      case "decorating":
        return renderDecoratingContent();
      case "done-waiting-approval":
        return renderDoneWaitingApprovalContent();
      default:
        return renderWaitingBakerContent(); // Default fallback
    }
  };
  
  // For compact mode, show a more simplified version
  const renderCompactContent = () => (
    <div className="space-y-1">
      {renderBasicInfo()}
      
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">Cake:</span>
        <span>{order.cakeTier > 1 ? `${order.cakeTier}-Tier` : order.cakeSize}</span>
      </div>
      
      {currentKitchenStatus === "waiting-cover" && (
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="outline" className="bg-white text-xs">
            {order.coverType === 'buttercream' ? 'Buttercream' : 'Fondant'}
          </Badge>
          {typeof order.coverColor === 'object' && order.coverColor.type === 'solid' && (
            <div 
              className="h-4 w-4 rounded-full border" 
              style={getColorStyle(order.coverColor)}
            />
          )}
        </div>
      )}
      
      {currentKitchenStatus === "decorating" && order.cakeText && (
        <div className="text-xs italic truncate">"{order.cakeText}"</div>
      )}
    </div>
  );
  
  // Render appropriate action buttons
  const renderActionButtons = () => (
    <div className="mt-3">
      {isInQueue || showStartButton ? (
        <StartProductionButton order={order} />
      ) : (
        <NextStatusButton 
          order={order} 
          currentKitchenStatus={currentKitchenStatus} 
        />
      )}
    </div>
  );
  
  // Get background color based on status
  const getCardBackground = () => {
    if (isInQueue) return 'bg-blue-50 border-blue-200';
    
    switch (currentKitchenStatus) {
      case "waiting-baker":
        return 'bg-orange-50 border-orange-200';
      case "waiting-crumbcoat":
        return 'bg-yellow-50 border-yellow-200';
      case "waiting-cover":
        return 'bg-blue-50 border-blue-200';
      case "decorating":
        return 'bg-purple-50 border-purple-200';
      case "done-waiting-approval":
        return 'bg-green-50 border-green-200';
      default:
        return '';
    }
  };

  return (
    <Card className={`mb-2 ${urgencyClass} hover:shadow-md transition-shadow ${getCardBackground()}`}>
      <CardContent className={`${isCompact ? 'p-3' : 'p-4'} space-y-2`}>
        {renderHeader()}
        
        <div className="space-y-1">
          {isCompact ? renderCompactContent() : renderContentByStatus()}
        </div>
        
        {renderActionButtons()}
      </CardContent>
    </Card>
  );
};

export default KitchenOrderCard;
