
import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/components/ui/sonner";
import { 
  ImagePlus,
  Clock,
  User,
  MessageSquare,
  Loader2,
  Save
} from "lucide-react";
import { Order, OrderStatus } from "@/types";
import { formatDate } from "@/lib/utils";

interface DeliveryInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order;
  onSaved?: () => void;
}

type RecipientType = "customer" | "family-member" | "security" | "neighbor" | "other";

const DeliveryInfoDialog = ({ 
  open, 
  onOpenChange,
  order,
  onSaved
}: DeliveryInfoDialogProps) => {
  const { updateOrder } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [photos, setPhotos] = useState<string[]>(order.deliveryDocumentationPhotos || []);
  const [actualDeliveryTime, setActualDeliveryTime] = useState<Date | undefined>(
    order.actualDeliveryTime || new Date()
  );
  const [recipientType, setRecipientType] = useState<RecipientType>("customer");
  const [recipientName, setRecipientName] = useState<string>("");
  const [feedback, setFeedback] = useState<string>(order.customerFeedback || "");
  
  // Reset form state when order changes
  useEffect(() => {
    setPhotos(order.deliveryDocumentationPhotos || []);
    setActualDeliveryTime(order.actualDeliveryTime || new Date());
    setRecipientType("customer");
    setRecipientName("");
    setFeedback(order.customerFeedback || "");
  }, [order]);

  // Handle file upload for delivery documentation photos
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Convert files to base64 strings
    const fileArray = Array.from(files);
    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setPhotos(prevPhotos => [...prevPhotos, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove a photo from the preview
  const handleRemovePhoto = (index: number) => {
    setPhotos(prevPhotos => prevPhotos.filter((_, i) => i !== index));
  };

  // Update delivery time
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const now = new Date();
    const [hours, minutes] = e.target.value.split(':');
    const newDate = new Date(actualDeliveryTime || now);
    
    newDate.setHours(parseInt(hours, 10));
    newDate.setMinutes(parseInt(minutes, 10));
    
    setActualDeliveryTime(newDate);
  };

  // Format time for input value
  const formatTimeForInput = (date?: Date) => {
    if (!date) return "";
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  // Save delivery information
  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      // Create updated order object
      const updatedOrder: Order = {
        ...order,
        actualDeliveryTime: actualDeliveryTime || new Date(),
        deliveryDocumentationPhotos: photos,
        customerFeedback: feedback,
      };
      
      // Determine if we need to update the status
      // If coming from 'in-delivery', move to 'delivery-confirmed'
      if (order.status === 'in-delivery') {
        updatedOrder.status = 'delivery-confirmed';
      }
      
      // Update the order
      await updateOrder(updatedOrder);
      toast.success("Delivery information saved successfully");
      
      // Close dialog and trigger refresh
      onOpenChange(false);
      if (onSaved) {
        onSaved();
      }
    } catch (error) {
      console.error("Error saving delivery information:", error);
      toast.error("Failed to save delivery information");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Delivery Information</DialogTitle>
          <DialogDescription>
            Order #{order.id} • {formatDate(order.deliveryDate)}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {/* Delivery Photos Section */}
          <div className="grid gap-2">
            <Label className="text-base font-semibold flex items-center">
              <ImagePlus className="h-4 w-4 mr-2" /> Delivery Photos
            </Label>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {photos.map((photo, index) => (
                <div key={index} className="relative w-24 h-24 rounded overflow-hidden border">
                  <img 
                    src={photo} 
                    alt={`Delivery ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                  <button 
                    type="button"
                    onClick={() => handleRemovePhoto(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
              
              <label className="w-24 h-24 border-2 border-dashed rounded flex items-center justify-center cursor-pointer bg-muted hover:bg-muted/80">
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  className="hidden"
                  onChange={handleFileUpload} 
                />
                <ImagePlus className="h-6 w-6 text-muted-foreground" />
              </label>
            </div>
            <p className="text-sm text-muted-foreground">
              Upload photos of the delivered cake and/or delivery receipt
            </p>
          </div>

          {/* Delivery Time Section */}
          <div className="grid gap-2">
            <Label className="text-base font-semibold flex items-center">
              <Clock className="h-4 w-4 mr-2" /> Actual Delivery Time
            </Label>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="delivery-date">Date</Label>
                <Input 
                  type="date" 
                  id="delivery-date"
                  value={actualDeliveryTime ? actualDeliveryTime.toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const date = new Date(e.target.value);
                    const current = actualDeliveryTime || new Date();
                    current.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
                    setActualDeliveryTime(new Date(current));
                  }}
                />
              </div>
              <div>
                <Label htmlFor="delivery-time">Time</Label>
                <Input 
                  type="time" 
                  id="delivery-time"
                  value={formatTimeForInput(actualDeliveryTime)}
                  onChange={handleTimeChange}
                />
              </div>
            </div>
          </div>

          {/* Recipient Section */}
          <div className="grid gap-2">
            <Label className="text-base font-semibold flex items-center">
              <User className="h-4 w-4 mr-2" /> Recipient Information
            </Label>
            
            <RadioGroup 
              value={recipientType} 
              onValueChange={(value) => setRecipientType(value as RecipientType)}
              className="grid grid-cols-2 gap-2 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="customer" id="customer" />
                <Label htmlFor="customer">Customer</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="family-member" id="family-member" />
                <Label htmlFor="family-member">Family Member</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="security" id="security" />
                <Label htmlFor="security">Security/Receptionist</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="neighbor" id="neighbor" />
                <Label htmlFor="neighbor">Neighbor</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other">Other</Label>
              </div>
            </RadioGroup>
            
            {recipientType !== "customer" && (
              <div className="mt-2">
                <Label htmlFor="recipient-name">Recipient Name</Label>
                <Input 
                  id="recipient-name" 
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Enter recipient name"
                />
              </div>
            )}
          </div>

          {/* Customer Feedback Section */}
          <div className="grid gap-2">
            <Label className="text-base font-semibold flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" /> Customer Feedback
            </Label>
            
            <Textarea 
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Enter any customer feedback or delivery notes"
              className="min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Information
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeliveryInfoDialog;
