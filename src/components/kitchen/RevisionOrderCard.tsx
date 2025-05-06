
import React, { useState } from 'react';
import { Order } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getRevisionStatusText } from '@/lib/statusHelpers';
import { FileImage } from 'lucide-react';

interface RevisionOrderCardProps {
  order: Order;
  isCompact?: boolean;
}

const RevisionOrderCard: React.FC<RevisionOrderCardProps> = ({ 
  order, 
  isCompact = false, 
}) => {
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  
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

  const handleOpenPhoto = (index: number) => {
    setSelectedPhotoIndex(index);
    setShowPhotoDialog(true);
  };

  return (
    <>
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
              <div className={`text-xs font-semibold text-purple-900 ${isCompact ? '' : 'mb-1'}`}>
                Revision #{order.revisionCount || 1} Feedback:
              </div>
              
              {latestRevision.notes && (
                <div className="bg-white rounded-md p-2 text-xs border border-purple-200">
                  <p className="italic">{latestRevision.notes}</p>
                </div>
              )}
              
              {latestRevision.photos && latestRevision.photos.length > 0 && (
                <div className={`grid ${isCompact ? 'grid-cols-2' : 'grid-cols-2'} gap-2 mt-2`}>
                  {latestRevision.photos.slice(0, isCompact ? 2 : 4).map((photo, index) => (
                    <div 
                      key={index} 
                      className="relative cursor-pointer"
                      onClick={() => handleOpenPhoto(index)}
                    >
                      <div className="aspect-square relative overflow-hidden rounded-md border border-purple-200 group">
                        <img 
                          src={photo} 
                          alt={`Rejected cake photo ${index + 1}`}
                          className="w-full h-full object-cover rounded-md group-hover:opacity-90 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          <FileImage className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 drop-shadow-md" />
                        </div>
                      </div>
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
        </CardContent>
      </Card>

      {/* Photo Dialog */}
      <Dialog open={showPhotoDialog} onOpenChange={setShowPhotoDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Rejected Cake Photo</DialogTitle>
          </DialogHeader>
          {latestRevision?.photos && latestRevision.photos[selectedPhotoIndex] && (
            <div className="space-y-4">
              <div className="aspect-video relative rounded-md overflow-hidden border">
                <img 
                  src={latestRevision.photos[selectedPhotoIndex]} 
                  alt={`Rejected cake photo ${selectedPhotoIndex + 1}`}
                  className="w-full h-full object-contain"
                />
              </div>
              {latestRevision.notes && (
                <div className="bg-muted p-3 rounded-md">
                  <h4 className="text-sm font-medium mb-1">Revision Feedback:</h4>
                  <p className="text-sm italic">{latestRevision.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RevisionOrderCard;
