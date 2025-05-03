
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { OrderStatus, OrderTag } from "@/types";
import { Calendar as CalendarIcon, Upload, Truck, CheckCircle2, MessageSquare, Archive, Camera, Image } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [photoPreview, setPhotoPreview] = useState<string[]>(finishedCakePhotos || []);
  const [deliveryPhotoPreview, setDeliveryPhotoPreview] = useState<string[]>(deliveryDocumentationPhotos || []);
  const [activePhotoTab, setActivePhotoTab] = useState<string>("cake-photos");
  const { updateOrder } = useApp();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, photoType: 'cake' | 'delivery') => {
    if (e.target.files && e.target.files.length > 0) {
      const newPhotos: string[] = photoType === 'cake' ? [...photoPreview] : [...deliveryPhotoPreview];
      
      Array.from(e.target.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            newPhotos.push(event.target.result as string);
            
            if (photoType === 'cake') {
              setPhotoPreview([...newPhotos]);
              onPhotosChange([...newPhotos]);
            } else {
              setDeliveryPhotoPreview([...newPhotos]);
              onDeliveryPhotosChange([...newPhotos]);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };
  
  const removePhoto = (index: number, photoType: 'cake' | 'delivery') => {
    if (photoType === 'cake') {
      const newPhotos = [...photoPreview];
      newPhotos.splice(index, 1);
      setPhotoPreview(newPhotos);
      onPhotosChange(newPhotos);
    } else {
      const newPhotos = [...deliveryPhotoPreview];
      newPhotos.splice(index, 1);
      setDeliveryPhotoPreview(newPhotos);
      onDeliveryPhotosChange(newPhotos);
    }
  };
  
  const handleTagChange = (tag: OrderTag, checked: boolean) => {
    const newTags = checked 
      ? [...orderTags, tag]
      : orderTags.filter(t => t !== tag);
      
    onTagsChange(newTags);
  };

  // Check if all required fields for finishing are completed
  const isFinishReady = () => {
    return status === 'waiting-feedback' && 
           customerFeedback && 
           customerFeedback.trim().length > 0 &&
           actualDeliveryTime !== undefined;
  };

  // Handle status progression based on current status
  const handleStatusProgress = () => {
    if (!status || !onStatusChange) return;

    let newStatus: OrderStatus | null = null;
    
    if (status === 'waiting-photo' && photoPreview.length > 0) {
      newStatus = 'ready-to-deliver';
    } else if (status === 'ready-to-deliver') {
      newStatus = 'in-delivery';
    } else if (status === 'in-delivery') {
      newStatus = 'delivery-confirmed';
      // Auto-set delivery time to now if not already set
      if (!actualDeliveryTime) {
        const now = new Date();
        onDeliveryTimeChange(now);
      }
    } else if (status === 'delivery-confirmed') {
      newStatus = 'waiting-feedback';
    } else if (status === 'waiting-feedback' && customerFeedback.trim()) {
      newStatus = 'finished';
    }

    if (newStatus && onStatusChange) {
      onStatusChange(newStatus);
    }
  };

  // Get appropriate button based on status
  const getActionButton = () => {
    if (!status || !onStatusChange) return null;
    
    switch(status) {
      case 'waiting-photo':
        return (
          <Button 
            className="bg-green-600 hover:bg-green-700" 
            onClick={handleStatusProgress}
            disabled={photoPreview.length === 0}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" /> 
            Mark Ready to Deliver
          </Button>
        );
      case 'ready-to-deliver':
        return (
          <Button 
            className="bg-orange-600 hover:bg-orange-700" 
            onClick={handleStatusProgress}
          >
            <Truck className="mr-2 h-4 w-4" /> 
            Start Delivery
          </Button>
        );
      case 'in-delivery':
        return (
          <Button 
            className="bg-teal-600 hover:bg-teal-700" 
            onClick={handleStatusProgress}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" /> 
            Confirm Delivery
          </Button>
        );
      case 'delivery-confirmed':
        return (
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700" 
            onClick={handleStatusProgress}
          >
            <MessageSquare className="mr-2 h-4 w-4" /> 
            Request Feedback
          </Button>
        );
      case 'waiting-feedback':
        return (
          <Button 
            className="bg-lime-600 hover:bg-lime-700" 
            onClick={handleStatusProgress}
            disabled={!isFinishReady()}
          >
            <Archive className="mr-2 h-4 w-4" /> 
            Finish Order
          </Button>
        );
      default:
        return null;
    }
  };

  // Show appropriate section based on status
  // Make photos section visible for all states from waiting-photo onwards
  const showPhotosSection = status === 'waiting-photo' || 
                           status === 'ready-to-deliver' || 
                           status === 'in-delivery' || 
                           status === 'delivery-confirmed' || 
                           status === 'waiting-feedback' || 
                           status === 'finished' ||
                           photoPreview.length > 0 ||
                           deliveryPhotoPreview.length > 0;
                           
  const showDeliverySection = status === 'in-delivery' || 
                             status === 'delivery-confirmed' || 
                             status === 'waiting-feedback' ||
                             status === 'finished' ||
                             actualDeliveryTime !== undefined;
                             
  const showFeedbackSection = status === 'delivery-confirmed' || 
                             status === 'waiting-feedback' || 
                             status === 'finished' ||
                             customerFeedback !== '';
  
  // Determine if feedback is required (highlighted UI)
  const isFeedbackRequired = status === 'waiting-feedback';
  
  return (
    <div className="space-y-6">
      {/* Status action button at the top if available */}
      {getActionButton() && (
        <div className="flex justify-end">
          {getActionButton()}
        </div>
      )}
      
      {/* Status indicator for waiting-feedback */}
      {status === 'waiting-feedback' && (
        <div className="p-4 border border-indigo-200 bg-indigo-50 rounded-md">
          <p className="text-indigo-800 text-sm">
            This order is waiting for customer feedback. Once feedback is collected, you can mark the order as finished.
          </p>
        </div>
      )}
      
      {/* Photos section with tabs */}
      {showPhotosSection && (
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Order Documentation Photos</h3>
          <Tabs value={activePhotoTab} onValueChange={setActivePhotoTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="cake-photos" className="flex items-center">
                <Camera className="h-4 w-4 mr-2" />
                <span>Finished Cake Photos</span>
                {photoPreview.length > 0 && (
                  <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {photoPreview.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="delivery-photos" className="flex items-center">
                <Image className="h-4 w-4 mr-2" />
                <span>Delivery Documentation</span>
                {deliveryPhotoPreview.length > 0 && (
                  <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {deliveryPhotoPreview.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            
            {/* Finished Cake Photos tab */}
            <TabsContent value="cake-photos" className="space-y-4">
              <p className="text-sm text-muted-foreground">Photos of the finished cake before delivery.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {photoPreview.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={photo} 
                      alt={`Cake photo ${index + 1}`}
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index, 'cake')}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      &times;
                    </button>
                  </div>
                ))}
                <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center">
                  <label
                    htmlFor="cake-photo-upload"
                    className="cursor-pointer flex flex-col items-center p-4"
                  >
                    <Upload className="h-6 w-6 mb-2 text-gray-500" />
                    <span className="text-sm text-gray-500">Upload Photo</span>
                    <input
                      id="cake-photo-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleFileChange(e, 'cake')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </TabsContent>
            
            {/* Delivery Documentation Photos tab */}
            <TabsContent value="delivery-photos" className="space-y-4">
              <p className="text-sm text-muted-foreground">Photos taken during delivery (cake at venue, delivery receipt, etc).</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {deliveryPhotoPreview.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={photo} 
                      alt={`Delivery documentation photo ${index + 1}`}
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index, 'delivery')}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      &times;
                    </button>
                  </div>
                ))}
                <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center">
                  <label
                    htmlFor="delivery-photo-upload"
                    className="cursor-pointer flex flex-col items-center p-4"
                  >
                    <Upload className="h-6 w-6 mb-2 text-gray-500" />
                    <span className="text-sm text-gray-500">Upload Photo</span>
                    <input
                      id="delivery-photo-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleFileChange(e, 'delivery')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
      
      {/* Delivery time section */}
      {showDeliverySection && (
        <div className="space-y-2">
          <Label htmlFor="actual-delivery-time">Actual Delivery Time</Label>
          <div className="flex space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !actualDeliveryTime && "text-muted-foreground",
                    status === 'waiting-feedback' && !actualDeliveryTime && "border-red-500"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {actualDeliveryTime ? format(actualDeliveryTime, "PPP HH:mm") : "Select date and time"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={actualDeliveryTime}
                  onSelect={onDeliveryTimeChange}
                  initialFocus
                />
                <div className="p-3 border-t border-gray-200">
                  <Input
                    type="time"
                    value={actualDeliveryTime ? format(actualDeliveryTime, "HH:mm") : ""}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(':').map(Number);
                      const newDate = actualDeliveryTime ? new Date(actualDeliveryTime) : new Date();
                      newDate.setHours(hours, minutes);
                      onDeliveryTimeChange(newDate);
                    }}
                    className="w-full"
                  />
                </div>
              </PopoverContent>
            </Popover>
            
            {actualDeliveryTime && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDeliveryTimeChange(undefined)}
              >
                &times;
              </Button>
            )}
          </div>
        </div>
      )}
      
      {/* Feedback section */}
      {showFeedbackSection && (
        <div className="space-y-2">
          <Label 
            htmlFor="customer-feedback" 
            className={cn(isFeedbackRequired && !customerFeedback.trim() ? "text-red-500" : "")}
          >
            Customer Feedback/Complaints
            {isFeedbackRequired && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Textarea
            id="customer-feedback"
            value={customerFeedback}
            onChange={(e) => onFeedbackChange(e.target.value)}
            placeholder={isFeedbackRequired ? "Feedback required to finish order" : "Enter any feedback or complaints from the customer"}
            className={cn(
              "min-h-[100px]",
              isFeedbackRequired && !customerFeedback.trim() ? "border-red-500" : ""
            )}
          />
          {isFeedbackRequired && !customerFeedback.trim() && (
            <p className="text-red-500 text-sm">Feedback is required to finish this order</p>
          )}
        </div>
      )}
      
      {/* Order tags section - always show */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium">Order Tags</h3>
        <p className="text-sm text-muted-foreground">Select tags that apply to this order:</p>
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
      
      {/* Finished order info */}
      {status === 'finished' && (
        <div className="p-4 border border-lime-200 bg-lime-50 rounded-md">
          <p className="text-lime-800">
            This order has been finished and archived. No further changes can be made unless reopened.
          </p>
        </div>
      )}
    </div>
  );
};

export default DeliveryRecapSection;
