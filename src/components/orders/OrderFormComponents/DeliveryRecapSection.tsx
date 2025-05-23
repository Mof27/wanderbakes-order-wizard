
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { OrderStatus, OrderTag } from "@/types";
import { Camera, Image, Archive, Tag } from "lucide-react";
import { matchesStatus } from "@/lib/statusHelpers";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { dataService } from "@/services";

interface DeliveryRecapSectionProps {
  orderId?: string;
  status?: OrderStatus;
  finishedCakePhotos?: string[];
  deliveryDocumentationPhotos?: string[];
  actualDeliveryTime?: Date;
  customerFeedback?: string;
  orderTags?: OrderTag[];
  onPhotosChange: (photos: string[]) => void;
  onDeliveryPhotosChange: (photos: string[]) => void;
  onDeliveryTimeChange: (date: Date | undefined) => void;
  onFeedbackChange: (feedback: string) => void;
  onTagsChange: (tags: OrderTag[]) => void;
  onStatusChange?: (status: OrderStatus) => void;
  readOnly?: boolean;
}

const DeliveryRecapSection: React.FC<DeliveryRecapSectionProps> = ({
  orderId,
  status,
  finishedCakePhotos = [],
  deliveryDocumentationPhotos = [],
  actualDeliveryTime,
  customerFeedback = '',
  orderTags = [],
  onPhotosChange,
  onDeliveryPhotosChange,
  onDeliveryTimeChange,
  onFeedbackChange,
  onTagsChange,
  onStatusChange,
  readOnly = false
}) => {
  // Fetch all available tags
  const { data: allTags = [] } = useQuery({
    queryKey: ['galleryTags'],
    queryFn: () => dataService.gallery.getAllTags(),
  });

  // Get the label for a tag value
  const getTagLabel = (tagValue: string) => {
    const tag = allTags.find(t => t.value === tagValue);
    return tag?.label || tagValue;
  };

  // Handle tag changes directly
  const handleTagChange = (tag: OrderTag, checked: boolean) => {
    const newTags = checked 
      ? [...orderTags, tag]
      : orderTags.filter(t => t !== tag);
      
    onTagsChange(newTags);
  };

  // Handle archive order
  const handleArchiveOrder = () => {
    if (onStatusChange) {
      onStatusChange('archived');
    }
  };

  // Automatically transition to finished status when feedback is provided
  useEffect(() => {
    if (status === 'waiting-feedback' && customerFeedback.trim() && actualDeliveryTime && onStatusChange) {
      onStatusChange('finished');
    }
  }, [status, customerFeedback, actualDeliveryTime, onStatusChange]);

  // Get the appropriate help message based on status
  const getStatusGuidance = () => {
    if (!status) return null;
    
    if (matchesStatus(status, 'waiting-photo')) {
      return {
        type: 'info',
        message: 'Upload photos of the finished cake. You can then mark the order as ready for delivery on the Delivery page.'
      };
    } else if (matchesStatus(status, 'ready-to-deliver')) {
      return {
        type: 'info',
        message: 'This order is ready to be delivered. Go to the Delivery page to start the delivery process.'
      };
    } else if (matchesStatus(status, 'in-delivery')) {
      return {
        type: 'info',
        message: 'This order is currently being delivered. Go to the Delivery page to mark it as delivered.'
      };
    } else if (matchesStatus(status, 'waiting-feedback')) {
      return {
        type: 'warning',
        message: 'This order is waiting for customer feedback. Once feedback is collected, the order will automatically be marked as finished.'
      };
    } else if (matchesStatus(status, 'finished')) {
      return {
        type: 'success',
        message: 'This order has been finished. Make sure to add tags for the gallery before archiving.'
      };
    }
    
    return null;
  };
  
  const guidance = getStatusGuidance();

  // Determine what sections to show based on status
  const showPhotosSection = status === 'waiting-photo' || 
                          status === 'ready-to-deliver' || 
                          status === 'in-delivery' || 
                          status === 'waiting-feedback' || 
                          status === 'finished' ||
                          finishedCakePhotos.length > 0 ||
                          deliveryDocumentationPhotos.length > 0;
                           
  const showDeliverySection = status === 'in-delivery' || 
                             status === 'waiting-feedback' ||
                             status === 'finished' ||
                             actualDeliveryTime !== undefined;
                             
  const showFeedbackSection = status === 'waiting-feedback' || 
                             status === 'finished' ||
                             customerFeedback !== '';

  // Show Archive button only for finished orders - hide if readOnly
  const showArchiveButton = status === 'finished' && !readOnly;

  return (
    <div className="space-y-6">
      {/* Status guidance alert */}
      {guidance && (
        <Alert className={`
          ${guidance.type === 'info' ? 'border-blue-200 bg-blue-50' : ''}
          ${guidance.type === 'warning' ? 'border-amber-200 bg-amber-50' : ''}
          ${guidance.type === 'success' ? 'border-green-200 bg-green-50' : ''}
        `}>
          <AlertDescription className={`
            ${guidance.type === 'info' ? 'text-blue-800' : ''}
            ${guidance.type === 'warning' ? 'text-amber-800' : ''}
            ${guidance.type === 'success' ? 'text-green-800' : ''}
          `}>
            {guidance.message}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Archive button for finished orders - hide if readOnly */}
      {showArchiveButton && !readOnly && (
        <div className="flex justify-end">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
              >
                <Archive className="h-4 w-4 mr-2" />
                Archive Order
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Archive this order?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will move the order to the archives. You can restore it later if needed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleArchiveOrder}>
                  Archive Order
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
      
      {/* Photos section - Read Only */}
      {showPhotosSection && (
        <div className="space-y-2">
          <h3 className="text-lg font-medium flex items-center">
            <Camera className="h-4 w-4 mr-2" />
            Cake Photos
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {finishedCakePhotos.length === 0 ? (
              <p className="text-sm text-muted-foreground col-span-full">No cake photos added yet.</p>
            ) : (
              finishedCakePhotos.map((photo, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={photo} 
                    alt={`Cake photo ${index + 1}`}
                    className="w-full h-24 object-cover rounded-md"
                  />
                </div>
              ))
            )}
          </div>
          
          {status === 'finished' && finishedCakePhotos.length > 0 && (
            <Alert className="mt-2 bg-purple-50 border-purple-200">
              <AlertDescription className="text-purple-800 flex items-center gap-2">
                <Tag className="h-4 w-4" />
                These cake photos will be added to the gallery when you archive the order. 
                Make sure to add relevant tags below.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
      
      {/* Delivery Photos - Read Only */}
      {deliveryDocumentationPhotos.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-medium flex items-center">
            <Image className="h-4 w-4 mr-2" />
            Delivery Documentation
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {deliveryDocumentationPhotos.map((photo, index) => (
              <div key={index} className="relative group">
                <img 
                  src={photo} 
                  alt={`Delivery documentation photo ${index + 1}`}
                  className="w-full h-24 object-cover rounded-md"
                />
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Delivery time - Read Only */}
      {showDeliverySection && actualDeliveryTime && (
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Actual Delivery Time</h3>
          <p className="text-sm">
            {actualDeliveryTime.toLocaleString('en-US', { 
              weekday: 'long',
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      )}
      
      {/* Feedback section - Read Only */}
      {showFeedbackSection && (
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Customer Feedback</h3>
          {customerFeedback ? (
            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm whitespace-pre-line">{customerFeedback}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No feedback collected yet.</p>
          )}
        </div>
      )}
      
      {/* Order tags section - make checkboxes respect readOnly */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Tag className="h-4 w-4" /> Order Tags
          {status === 'finished' && finishedCakePhotos.length > 0 && (
            <Badge variant="outline" className="bg-purple-50 text-purple-800">
              For Gallery
            </Badge>
          )}
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {allTags.map((tag) => (
            <div key={tag.id} className="flex items-center space-x-2">
              <Checkbox
                id={`tag-${tag.value}`}
                checked={orderTags?.includes(tag.value as OrderTag)}
                onCheckedChange={(checked) => !readOnly && handleTagChange(tag.value as OrderTag, !!checked)}
                disabled={readOnly}
              />
              <Label htmlFor={`tag-${tag.value}`} className="flex items-center gap-1">
                {tag.label}
                {tag.id.startsWith('custom') && (
                  <Badge variant="outline" className="text-xs bg-purple-50">custom</Badge>
                )}
              </Label>
            </div>
          ))}
        </div>
        
        {status === 'finished' && !readOnly && (
          <p className="text-sm text-muted-foreground">
            Need more tags? Go to the Gallery page to create custom tags.
          </p>
        )}
      </div>
      
      {/* Add "Finish Order" button only for waiting-feedback status - hide if readOnly */}
      {status === 'waiting-feedback' && customerFeedback.trim() && actualDeliveryTime && !readOnly && (
        <div className="flex justify-end">
          <Button 
            className="bg-lime-600 hover:bg-lime-700"
            onClick={() => onStatusChange && onStatusChange('finished')}
          >
            Finish Order
          </Button>
        </div>
      )}
    </div>
  );
};

export default DeliveryRecapSection;
