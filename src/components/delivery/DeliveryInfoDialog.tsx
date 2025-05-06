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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import { 
  ImagePlus,
  Clock,
  User,
  Loader2,
  Save,
  Camera,
  Image,
  Car,
  ExternalLink
} from "lucide-react";
import { Order, OrderStatus, DriverType } from "@/types";
import { formatDate } from "@/lib/utils";

interface DeliveryInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order;
  onSaved?: () => void;
  editMode?: 'delivery' | 'all'; // 'delivery' is default, 'all' allows editing all fields
}

type RecipientType = "customer" | "family-member" | "security" | "neighbor" | "other";

const DeliveryInfoDialog = ({ 
  open, 
  onOpenChange,
  order,
  onSaved,
  editMode = 'delivery'
}: DeliveryInfoDialogProps) => {
  const { updateOrder } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('delivery-photos');
  
  // Delivery documentation photos
  const [photos, setPhotos] = useState<string[]>(order.deliveryDocumentationPhotos || []);
  
  // Finished cake photos (only editable in 'all' mode)
  const [cakePhotos, setCakePhotos] = useState<string[]>(order.finishedCakePhotos || []);
  
  // Delivery time
  const [actualDeliveryTime, setActualDeliveryTime] = useState<Date | undefined>(
    order.actualDeliveryTime || new Date()
  );
  
  // Recipient info
  const [recipientType, setRecipientType] = useState<RecipientType>("customer");
  const [recipientName, setRecipientName] = useState<string>("");

  // Driver information
  const [driverType, setDriverType] = useState<DriverType | null>(
    order.deliveryAssignment?.driverType || null
  );
  const [driverName, setDriverName] = useState<string>(
    order.deliveryAssignment?.driverName || ""
  );
  
  // Reset form state when order changes
  useEffect(() => {
    setPhotos(order.deliveryDocumentationPhotos || []);
    setCakePhotos(order.finishedCakePhotos || []);
    setActualDeliveryTime(order.actualDeliveryTime || new Date());
    setRecipientType("customer");
    setRecipientName("");
    setDriverType(order.deliveryAssignment?.driverType || null);
    setDriverName(order.deliveryAssignment?.driverName || "");
    
    // Set the most appropriate tab based on edit mode
    if (editMode === 'all') {
      setActiveTab('cake-photos');
    } else {
      setActiveTab('delivery-photos');
    }
  }, [order, editMode, open]);

  // Handle file upload for both types of photos
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, photoType: 'cake' | 'delivery') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Convert files to base64 strings
    const fileArray = Array.from(files);
    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          if (photoType === 'cake') {
            setCakePhotos(prevPhotos => [...prevPhotos, e.target!.result as string]);
          } else {
            setPhotos(prevPhotos => [...prevPhotos, e.target!.result as string]);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove a photo from the preview
  const handleRemovePhoto = (index: number, photoType: 'cake' | 'delivery') => {
    if (photoType === 'cake') {
      setCakePhotos(prevPhotos => prevPhotos.filter((_, i) => i !== index));
    } else {
      setPhotos(prevPhotos => prevPhotos.filter((_, i) => i !== index));
    }
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
      // Create updated order object - no longer include customerFeedback
      const updatedOrder: Order = {
        ...order,
        actualDeliveryTime: actualDeliveryTime || new Date(),
        deliveryDocumentationPhotos: photos,
      };
      
      // Only update cake photos when in 'all' edit mode
      if (editMode === 'all') {
        updatedOrder.finishedCakePhotos = cakePhotos;
      }

      // Add driver information to the updated order
      updatedOrder.deliveryAssignment = {
        driverType: driverType || "driver-1",
        driverName: driverName || undefined,
        assignedAt: new Date(),
        isPreliminary: false,
      };
      
      // Determine if we need to update the status
      // If coming from 'in-delivery', move straight to 'waiting-feedback'
      if (order.status === 'in-delivery') {
        updatedOrder.status = 'waiting-feedback';
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
          {/* Photos Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2">
              {editMode === 'all' && (
                <TabsTrigger value="cake-photos" className="flex items-center">
                  <Camera className="h-4 w-4 mr-2" />
                  Cake Photos
                </TabsTrigger>
              )}
              <TabsTrigger value="delivery-photos" className={editMode === 'all' ? '' : 'col-span-2'}>
                <Image className="h-4 w-4 mr-2" />
                Delivery Photos
              </TabsTrigger>
            </TabsList>
            
            {/* Cake Photos Tab */}
            {editMode === 'all' && (
              <TabsContent value="cake-photos" className="space-y-4">
                <Label className="text-base font-semibold flex items-center">
                  <Camera className="h-4 w-4 mr-2" /> Finished Cake Photos
                </Label>
                
                <div className="flex flex-wrap gap-2 mt-2">
                  {cakePhotos.map((photo, index) => (
                    <div key={index} className="relative w-24 h-24 rounded overflow-hidden border">
                      <img 
                        src={photo} 
                        alt={`Cake ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                      <button 
                        type="button"
                        onClick={() => handleRemovePhoto(index, 'cake')}
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
                      onChange={(e) => handleFileUpload(e, 'cake')} 
                    />
                    <ImagePlus className="h-6 w-6 text-muted-foreground" />
                  </label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Upload photos of the finished cake before delivery
                </p>
              </TabsContent>
            )}
            
            {/* Delivery Photos Tab */}
            <TabsContent value="delivery-photos" className="space-y-4">
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
                      onClick={() => handleRemovePhoto(index, 'delivery')}
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
                    onChange={(e) => handleFileUpload(e, 'delivery')} 
                  />
                  <ImagePlus className="h-6 w-6 text-muted-foreground" />
                </label>
              </div>
              <p className="text-sm text-muted-foreground">
                Upload photos of the delivered cake and/or delivery receipt
              </p>
            </TabsContent>
          </Tabs>

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

          {/* Driver Information Section */}
          <div className="grid gap-2">
            <Label className="text-base font-semibold flex items-center">
              <Car className="h-4 w-4 mr-2" /> Driver Information
            </Label>
            
            <RadioGroup 
              value={driverType || ""} 
              onValueChange={(value) => setDriverType(value as DriverType)}
              className="grid grid-cols-3 gap-2 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="driver-1" id="driver-1" />
                <Label htmlFor="driver-1" className="flex items-center">
                  <Car className="h-4 w-4 mr-2" />
                  Driver 1
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="driver-2" id="driver-2" />
                <Label htmlFor="driver-2" className="flex items-center">
                  <Car className="h-4 w-4 mr-2" />
                  Driver 2
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3rd-party" id="3rd-party" />
                <Label htmlFor="3rd-party" className="flex items-center">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Lalamove
                </Label>
              </div>
            </RadioGroup>
            
            {driverType === '3rd-party' && (
              <div className="mt-2">
                <Label htmlFor="driver-name">Lalamove Booking ID</Label>
                <Input 
                  id="driver-name" 
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="Enter Lalamove booking ID"
                />
              </div>
            )}
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

          {/* Customer Feedback Section - REMOVED */}
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
