
import React from 'react';
import { Order } from '@/types';
import { formatDate } from '@/lib/utils';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import { getColorStyle } from '@/utils/colorUtils';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';

interface KitchenInfoDrawerProps {
  order: Order;
  children?: React.ReactNode;
}

const KitchenInfoDrawer: React.FC<KitchenInfoDrawerProps> = ({ order, children }) => {
  const isMobile = useIsMobile();
  
  // Function to extract cake layer information from order
  const getCakeLayerInfo = (order: Order): string => {
    if (order.cakeTier > 1 && order.tierDetails && order.tierDetails.length > 0) {
      return order.tierDetails.map(tier => `${tier.shape} ${tier.size} (${tier.height || ''})`).join(', ');
    }
    
    return `${order.cakeShape} ${order.cakeSize} (${order.tierDetails?.[0]?.height || '2 Layer'})`;
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        {children ? (
          children
        ) : (
          isMobile ? (
            // Larger touch target for mobile devices without tooltip
            <Button 
              variant="ghost" 
              size="icon" // Use regular icon size instead of icon-sm for better touch target
              className="ml-1 bg-gray-100/80 rounded-full" // Add subtle background for better visibility
            >
              <Info className="h-5 w-5 text-primary" />
            </Button>
          ) : (
            // Desktop version with tooltip
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon-sm" 
                    className="ml-1"
                  >
                    <Info className="h-4 w-4 text-primary" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View order details</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        )}
      </DrawerTrigger>
      <DrawerContent className="px-4 pb-6">
        <div className="mx-auto w-full max-w-lg">
          {/* Order ID and Customer Section */}
          <div className="py-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Order {order.id}</h3>
              <span className="text-sm text-muted-foreground">{order.customer.name}</span>
            </div>
            
            {/* Delivery Information */}
            <div className="mt-4 bg-muted rounded-md p-3">
              <div className="text-sm">
                <div className="flex justify-between mb-1">
                  <span className="font-medium">Delivery Date:</span>
                  <span>{formatDate(order.deliveryDate)}</span>
                </div>
                {order.deliveryTimeSlot && (
                  <div className="flex justify-between">
                    <span className="font-medium">Delivery Time:</span>
                    <span>{order.deliveryTimeSlot}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Cake Specifications */}
          <div className="py-4">
            <h4 className="text-sm font-semibold mb-2">Cake Specifications</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-orange-50 rounded-md p-2">
                <p className="text-xs text-muted-foreground">Flavor</p>
                <p className="font-medium">{order.cakeFlavor}</p>
              </div>
              
              <div className="bg-blue-50 rounded-md p-2">
                <p className="text-xs text-muted-foreground">
                  {order.cakeTier > 1 ? `${order.cakeTier}-Tier Cake` : 'Size'}
                </p>
                <p className="font-medium">{getCakeLayerInfo(order)}</p>
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Cover Details */}
          <div className="py-4">
            <h4 className="text-sm font-semibold mb-2">Cover Details</h4>
            <div className="flex items-center gap-3">
              <div className="bg-purple-50 rounded-md p-2 flex-1">
                <p className="text-xs text-muted-foreground">Cover Type</p>
                <p className="font-medium">{order.coverType === 'buttercream' ? 'Buttercream' : 'Fondant'}</p>
              </div>
              
              {typeof order.coverColor === 'object' && (
                <div className="bg-purple-50 rounded-md p-2 flex-1">
                  <p className="text-xs text-muted-foreground">Cover Color</p>
                  <div className="flex items-center gap-2 mt-1">
                    {order.coverColor.type === 'solid' && (
                      <>
                        <div 
                          className="h-6 w-6 rounded-full border" 
                          style={getColorStyle(order.coverColor)} 
                        />
                        <span>{order.coverColor.color}</span>
                      </>
                    )}
                    {order.coverColor.type === 'custom' && (
                      <span>{order.coverColor.notes}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <Separator />
          
          {/* Design Information */}
          <div className="py-4">
            <h4 className="text-sm font-semibold mb-2">Design Information</h4>
            <div className="bg-slate-50 rounded-md p-3 mb-3">
              <p className="text-xs text-muted-foreground mb-1">Design Description</p>
              <p>{order.cakeDesign}</p>
            </div>
            
            {order.cakeText && (
              <div className="bg-slate-50 rounded-md p-3 mb-3">
                <p className="text-xs text-muted-foreground mb-1">Cake Text</p>
                <p className="italic">"{order.cakeText}"</p>
              </div>
            )}
            
            {order.notes && (
              <div className="bg-slate-50 rounded-md p-3 mb-3">
                <p className="text-xs text-muted-foreground mb-1">Additional Notes</p>
                <p>{order.notes}</p>
              </div>
            )}
            
            {/* Image References */}
            {order.attachments && order.attachments.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-muted-foreground mb-2">Reference Images</p>
                <div className="grid grid-cols-2 gap-2">
                  {order.attachments.map((attachment, index) => (
                    <div 
                      key={index} 
                      className="aspect-square bg-muted rounded-md overflow-hidden border"
                    >
                      <img 
                        src={attachment} 
                        alt={`Reference ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default KitchenInfoDrawer;
