
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
import { Calendar as CalendarIcon, Upload, Truck, CheckCircle2 } from "lucide-react";
import { useApp } from "@/context/AppContext";

interface DeliveryRecapSectionProps {
  orderId?: string;
  status?: OrderStatus;
  finishedCakePhotos?: string[];
  actualDeliveryTime?: Date;
  customerFeedback?: string;
  orderTags?: OrderTag[];
  onPhotosChange: (photos: string[]) => void;
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
  actualDeliveryTime,
  customerFeedback = '',
  orderTags = [],
  onPhotosChange,
  onDeliveryTimeChange,
  onFeedbackChange,
  onTagsChange,
  onStatusChange,
}) => {
  const [photoPreview, setPhotoPreview] = useState<string[]>(finishedCakePhotos || []);
  const { updateOrder } = useApp();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newPhotos: string[] = [...photoPreview];
      
      Array.from(e.target.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            newPhotos.push(event.target.result as string);
            setPhotoPreview([...newPhotos]);
            onPhotosChange([...newPhotos]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };
  
  const removePhoto = (index: number) => {
    const newPhotos = [...photoPreview];
    newPhotos.splice(index, 1);
    setPhotoPreview(newPhotos);
    onPhotosChange(newPhotos);
  };
  
  const handleTagChange = (tag: OrderTag, checked: boolean) => {
    const newTags = checked 
      ? [...orderTags, tag]
      : orderTags.filter(t => t !== tag);
      
    onTagsChange(newTags);
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
      default:
        return null;
    }
  };

  // Show appropriate section based on status
  const showPhotosSection = status === 'waiting-photo' || photoPreview.length > 0;
  const showDeliverySection = status === 'in-delivery' || status === 'delivery-confirmed' || actualDeliveryTime !== undefined;
  const showFeedbackSection = status === 'delivery-confirmed' || customerFeedback !== '';
  
  return (
    <div className="space-y-6">
      {/* Status action button at the top if available */}
      {getActionButton() && (
        <div className="flex justify-end">
          {getActionButton()}
        </div>
      )}
      
      {/* Photos section */}
      {showPhotosSection && (
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Finished Cake Photos</h3>
          <div className="grid grid-cols-3 gap-4">
            {photoPreview.map((photo, index) => (
              <div key={index} className="relative group">
                <img 
                  src={photo} 
                  alt={`Cake photo ${index + 1}`}
                  className="w-full h-32 object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
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
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
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
                    !actualDeliveryTime && "text-muted-foreground"
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
      {(showFeedbackSection || true) && (
        <div className="space-y-2">
          <Label htmlFor="customer-feedback">Customer Feedback/Complaints</Label>
          <Textarea
            id="customer-feedback"
            value={customerFeedback}
            onChange={(e) => onFeedbackChange(e.target.value)}
            placeholder="Enter any feedback or complaints from the customer"
            className="min-h-[100px]"
          />
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
    </div>
  );
};

export default DeliveryRecapSection;
