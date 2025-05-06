
import React from 'react';
import { Order } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate, cn } from '@/lib/utils';
import { Check, Edit } from 'lucide-react';
import { getRevisionStatusText } from '@/lib/statusHelpers';

interface RevisionOrderCardProps {
  order: Order;
  isCompact?: boolean;
}

const RevisionOrderCard: React.FC<RevisionOrderCardProps> = ({ 
  order, 
  isCompact = false, 
}) => {
  const latestRevision = order.revisionHistory && order.revisionHistory.length > 0 
    ? order.revisionHistory[order.revisionHistory.length - 1] 
    : null;
    
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
  
  const urgencyClass = getUrgencyClass(order.deliveryDate);
  
  const handleStartRevision = () => {
    console.log('Starting revision for order:', order.id);
    // This would typically update the order status and notify the relevant staff
  };

  return (
    <Card className={cn(
      "mb-2 hover:shadow-md transition-shadow",
      urgencyClass,
      "border-purple-200 bg-purple-50"
    )}>
      <CardContent className={`${isCompact ? 'p-3' : 'p-4'} space-y-3`}>
        <div className="flex justify-between items-start">
          <div className="font-medium text-sm">{order.id}</div>
          <Badge className="bg-purple-100 text-purple-800">
            {getRevisionStatusText(order)}
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 gap-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery:</span>
            <span className="font-semibold">{formatDate(order.deliveryDate)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Customer:</span>
            <span>{order.customer.name}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cake:</span>
            <span>{order.cakeTier > 1 ? `${order.cakeTier}-Tier ${order.cakeShape}` : `${order.cakeShape} ${order.cakeSize}`}</span>
          </div>
        </div>
        
        {latestRevision && (
          <div className="space-y-2 mt-2">
            {!isCompact && (
              <div className="text-xs font-semibold text-purple-900">
                Revision #{order.revisionCount || 1} Feedback:
              </div>
            )}
            
            {latestRevision.notes && (
              <div className="bg-white rounded-md p-2 text-xs border border-purple-200">
                <p className="italic">{latestRevision.notes}</p>
              </div>
            )}
            
            {latestRevision.photos && latestRevision.photos.length > 0 && (
              <div className={`grid ${isCompact ? 'grid-cols-1' : 'grid-cols-2'} gap-2 mt-2`}>
                {latestRevision.photos.slice(0, isCompact ? 1 : 2).map((photo, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={photo} 
                      alt={`Rejected cake photo ${index + 1}`}
                      className="w-full h-24 object-cover rounded-md border border-purple-200"
                    />
                    <div className="absolute top-1 right-1">
                      <Badge className="bg-red-100 text-red-800 text-xs">
                        Rejected
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {!isCompact && (
          <Button 
            onClick={handleStartRevision}
            className="w-full bg-purple-700 hover:bg-purple-800 mt-2"
          >
            <Edit className="h-4 w-4 mr-1" /> Start Revision
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default RevisionOrderCard;
