
import React, { useState } from 'react';
import { Order } from '@/types';
import { formatDate, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Info, Cake, Palette, FileText, Image, ChevronDown } from 'lucide-react';
import { getColorStyle } from '@/utils/colorUtils';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from '@/components/ui/sheet';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogTrigger
} from "@/components/ui/dialog";

interface KitchenInfoDrawerProps {
  order: Order;
  children?: React.ReactNode;
}

const KitchenInfoDrawer: React.FC<KitchenInfoDrawerProps> = ({ order, children }) => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [isCompactView, setIsCompactView] = useState(false);
  
  // Function to extract cake layer information from order
  const getCakeLayerInfo = (order: Order): string => {
    if (order.cakeTier > 1 && order.tierDetails && order.tierDetails.length > 0) {
      return order.tierDetails.map(tier => `${tier.shape} ${tier.size} (${tier.height || ''})`).join(', ');
    }
    
    return `${order.cakeShape} ${order.cakeSize} (${order.tierDetails?.[0]?.height || '2 Layer'})`;
  };

  // Determine which component to use based on device type
  const InfoComponent = isMobile ? Sheet : Dialog;
  const TriggerComponent = isMobile ? SheetTrigger : DialogTrigger;
  const ContentComponent = isMobile ? SheetContent : DialogContent;

  // Function to handle closing the drawer
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };
  
  // Flexible TabContent based on compact mode
  const TabContentWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className={cn(
      "space-y-3 py-4",
      isCompactView ? "text-sm" : ""
    )}>
      {children}
    </div>
  );

  // Content for the drawer
  const drawerContent = (
    <div className="w-full">
      {/* Header with Order ID, Customer name, and View mode toggle */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="text-lg font-semibold">Order {order.id}</h3>
          <p className="text-sm text-muted-foreground">{order.customer.name}</p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setIsCompactView(!isCompactView)}
          className="text-xs"
        >
          {isCompactView ? "Detailed View" : "Compact View"}
        </Button>
      </div>
      
      {/* Delivery Information - Always visible and important */}
      <div className="mb-4 bg-muted rounded-md p-3">
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
      
      {/* Tabbed Interface for the rest of the content */}
      <Tabs defaultValue="cake" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="cake" className="text-xs sm:text-sm">
            <Cake className="h-3.5 w-3.5 mr-1" /> 
            Cake Details
          </TabsTrigger>
          <TabsTrigger value="design" className="text-xs sm:text-sm">
            <Palette className="h-3.5 w-3.5 mr-1" />
            Design
          </TabsTrigger>
          <TabsTrigger value="attachments" className="text-xs sm:text-sm">
            <FileText className="h-3.5 w-3.5 mr-1" />
            Notes
          </TabsTrigger>
        </TabsList>
        
        {/* Cake Details Tab */}
        <TabsContent value="cake">
          <TabContentWrapper>
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
            
            {!isCompactView && (
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
            )}
            
            {/* Multi-tier details in collapsible for advanced details */}
            {!isCompactView && order.cakeTier > 1 && order.tierDetails && order.tierDetails.length > 0 && (
              <Collapsible className="border rounded-md p-2">
                <CollapsibleTrigger className="flex w-full items-center justify-between">
                  <span className="text-sm font-medium">Tier Details</span>
                  <ChevronDown className="h-4 w-4" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2">
                  {order.tierDetails.map((tier, index) => (
                    <div key={index} className="border-t pt-2 first:border-0 first:pt-0 mb-2">
                      <p className="text-xs font-medium">Tier {index + 1}:</p>
                      <p className="text-xs">
                        {tier.shape} {tier.size} ({tier.height || '2 Layer'})
                        {tier.flavor && ` - ${tier.flavor}`}
                      </p>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}
          </TabContentWrapper>
        </TabsContent>
        
        {/* Design Tab */}
        <TabsContent value="design">
          <TabContentWrapper>
            {/* Cover details */}
            {isCompactView ? (
              <div className="bg-purple-50 rounded-md p-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Cover</p>
                    <p className="font-medium">{order.coverType === 'buttercream' ? 'Buttercream' : 'Fondant'}</p>
                  </div>
                  {typeof order.coverColor === 'object' && order.coverColor.type === 'solid' && (
                    <div 
                      className="h-6 w-6 rounded-full border" 
                      style={getColorStyle(order.coverColor)} 
                    />
                  )}
                </div>
              </div>
            ) : (
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
            )}
            
            {/* Design Description */}
            <div className="bg-slate-50 rounded-md p-3">
              <p className="text-xs text-muted-foreground mb-1">Design Description</p>
              {isCompactView && order.cakeDesign.length > 80 ? (
                <Collapsible>
                  <div className="space-y-1">
                    <p>{order.cakeDesign.substring(0, 80)}...</p>
                    <CollapsibleTrigger className="text-xs text-blue-600">
                      Show more
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <p>{order.cakeDesign}</p>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              ) : (
                <p>{order.cakeDesign}</p>
              )}
            </div>
            
            {/* Cake Text */}
            {order.cakeText && (
              <div className="bg-slate-50 rounded-md p-3">
                <p className="text-xs text-muted-foreground mb-1">Cake Text</p>
                <p className="italic">"{order.cakeText}"</p>
              </div>
            )}
          </TabContentWrapper>
        </TabsContent>
        
        {/* Notes & Attachments Tab */}
        <TabsContent value="attachments">
          <TabContentWrapper>
            {/* Notes section */}
            {order.notes && (
              <div className="bg-slate-50 rounded-md p-3">
                <p className="text-xs text-muted-foreground mb-1">Additional Notes</p>
                {isCompactView && order.notes.length > 80 ? (
                  <Collapsible>
                    <div className="space-y-1">
                      <p>{order.notes.substring(0, 80)}...</p>
                      <CollapsibleTrigger className="text-xs text-blue-600">
                        Show more
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <p>{order.notes}</p>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                ) : (
                  <p>{order.notes}</p>
                )}
              </div>
            )}
            
            {/* Image References */}
            {order.attachments && order.attachments.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Reference Images</p>
                <div className={cn(
                  "grid gap-2", 
                  isCompactView ? "grid-cols-3" : "grid-cols-2"
                )}>
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
          </TabContentWrapper>
        </TabsContent>
      </Tabs>
    </div>
  );

  return (
    <InfoComponent open={isOpen} onOpenChange={handleOpenChange}>
      <TriggerComponent asChild>
        {children ? (
          children
        ) : (
          <Button 
            variant="ghost" 
            size="icon" 
            className="ml-1 bg-gray-100/80 rounded-full hover:bg-gray-200/80"
          >
            <Info className="h-5 w-5 text-primary" />
            <span className="sr-only">View order details</span>
          </Button>
        )}
      </TriggerComponent>
      {isMobile ? (
        <SheetContent 
          className="px-4 pb-6 sm:max-w-lg sm:mx-auto max-h-[85vh] overflow-y-auto"
          side="bottom"
        >
          {drawerContent}
        </SheetContent>
      ) : (
        <DialogContent 
          className="max-w-lg max-h-[85vh] overflow-y-auto"
        >
          {drawerContent}
        </DialogContent>
      )}
    </InfoComponent>
  );
};

export default KitchenInfoDrawer;
