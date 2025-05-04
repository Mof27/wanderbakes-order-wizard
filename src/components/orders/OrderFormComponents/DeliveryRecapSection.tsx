import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { OrderStatus, OrderTag } from "@/types";
import { Edit, Info, Camera, Image, Archive } from "lucide-react";
import { matchesStatus } from "@/lib/statusHelpers";
import DeliveryInfoDialog from "@/components/delivery/DeliveryInfoDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

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
}

const availableTags: { value: OrderTag; label: string }[] = [
  { value: 'for-kids', label: 'For Kids' },
  { value: 'for-man', label: 'For Man' },
  { value: 'for-woman', label: 'For Woman' },
  { value: 'birthday', label: 'Birthday' },
  { value: 'anniversary', label: 'Anniversary' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'other', label: 'Other' },
];

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
}) => {
  // Show DeliveryInfoDialog for editing delivery information
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [activePhotoTab, setActivePhotoTab] = useState<string>("cake-photos");
  
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
    } else if (matchesStatus(status, 'delivery-confirmed')) {
      return {
        type: 'info',
        message: 'Delivery has been confirmed. Please collect customer feedback to complete the order.'
      };
    } else if (matchesStatus(status, 'waiting-feedback')) {
      return {
        type: 'warning',
        message: 'This order is waiting for customer feedback. Once feedback is collected, the order will automatically be marked as finished.'
      };
    } else if (matchesStatus(status, 'finished')) {
      return {
        type: 'success',
        message: 'This order has been finished. You can now archive it if no further changes are needed.'
      };
    }
    
    return null;
  };
  
  const guidance = getStatusGuidance();

  // Determine what sections to show based on status
  const showPhotosSection = status === 'waiting-photo' || 
                          status === 'ready-to-deliver' || 
                          status === 'in-delivery' || 
                          status === 'delivery-confirmed' || 
                          status === 'waiting-feedback' || 
                          status === 'finished' ||
                          finishedCakePhotos.length > 0 ||
                          deliveryDocumentationPhotos.length > 0;
                           
  const showDeliverySection = status === 'in-delivery' || 
                             status === 'delivery-confirmed' || 
                             status === 'waiting-feedback' ||
                             status === 'finished' ||
                             actualDeliveryTime !== undefined;
                             
  const showFeedbackSection = status === 'delivery-confirmed' || 
                             status === 'waiting-feedback' || 
                             status === 'finished' ||
                             customerFeedback !== '';

  // Show Archive button only for finished orders
  const showArchiveButton = status === 'finished';

  // Handle update when dialog is saved
  const handleInfoDialogSaved = () => {
    // Dialog will close automatically when saved
  };

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
      
      {/* "Edit Delivery Information" button */}
      {(showPhotosSection || showDeliverySection || showFeedbackSection) && (
        <div className="flex justify-end gap-2">
          {showArchiveButton && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  className="mb-4"
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
          )}
          <Button
            onClick={() => setShowInfoDialog(true)}
            className="mb-4"
            variant="outline"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Delivery Information
          </Button>
          
          {/* DeliveryInfoDialog for editing all delivery information */}
          <DeliveryInfoDialog 
            open={showInfoDialog} 
            onOpenChange={setShowInfoDialog} 
            order={{
              id: orderId || '',
              deliveryDate: new Date(),
              actualDeliveryTime,
              deliveryDocumentationPhotos,
              finishedCakePhotos,
              customerFeedback,
              status: status || 'in-queue',
              customer: { id: '', name: '', whatsappNumber: '', addresses: [], createdAt: new Date() },
              cakeFlavor: '',
              cakeSize: '',
              cakeShape: '',
              cakeDesign: '',
              cakeTier: 1,
              coverColor: { type: 'solid', color: '#000000' },
              cakePrice: 0,
              deliveryAddress: '',
              createdAt: new Date(),
              updatedAt: new Date(),
              // Add missing required properties for Order
              useSameFlavor: true,
              useSameCover: true
            }}
            onSaved={handleInfoDialogSaved}
            editMode="all" // New prop to indicate we're editing all fields
          />
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
      
      {/* Order tags section */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium">Order Tags</h3>
        <div className="grid grid-cols-2 gap-4">
          {availableTags.map((tag) => (
            <div key={tag.value} className="flex items-center space-x-2">
              <Checkbox
                id={`tag-${tag.value}`}
                checked={orderTags?.includes(tag.value)}
                onCheckedChange={(checked) => handleTagChange(tag.value, checked === true)}
              />
              <Label htmlFor={`tag-${tag.value}`}>{tag.label}</Label>
            </div>
          ))}
        </div>
      </div>
      
      {/* Add "Finish Order" button only for waiting-feedback status */}
      {status === 'waiting-feedback' && customerFeedback.trim() && actualDeliveryTime && (
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
