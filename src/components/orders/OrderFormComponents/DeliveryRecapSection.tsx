
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
import { OrderTag } from "@/types";
import { Calendar as CalendarIcon, Upload } from "lucide-react";

interface DeliveryRecapSectionProps {
  finishedCakePhotos?: string[];
  actualDeliveryTime?: Date;
  customerFeedback?: string;
  orderTags?: OrderTag[];
  onPhotosChange: (photos: string[]) => void;
  onDeliveryTimeChange: (date: Date | undefined) => void;
  onFeedbackChange: (feedback: string) => void;
  onTagsChange: (tags: OrderTag[]) => void;
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
  finishedCakePhotos = [],
  actualDeliveryTime,
  customerFeedback = '',
  orderTags = [],
  onPhotosChange,
  onDeliveryTimeChange,
  onFeedbackChange,
  onTagsChange,
}) => {
  const [photoPreview, setPhotoPreview] = useState<string[]>(finishedCakePhotos || []);
  
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
  
  return (
    <div className="space-y-6">
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
