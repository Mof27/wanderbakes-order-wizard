
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Order, DriverType, DeliveryAssignment } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Car, Truck, ExternalLink } from "lucide-react";

interface DriverAssignmentDialogProps {
  order: Order;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const DriverAssignmentDialog = ({
  order,
  open,
  onOpenChange,
  onSuccess
}: DriverAssignmentDialogProps) => {
  const { updateOrder } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize from existing assignment if available
  const existingAssignment = order.deliveryAssignment;
  const [driverType, setDriverType] = useState<DriverType>(
    existingAssignment?.driverType || "driver-1"
  );
  const [driverName, setDriverName] = useState(
    existingAssignment?.driverName || ""
  );
  const [notes, setNotes] = useState(
    existingAssignment?.notes || ""
  );
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Create assignment object
      const assignment: Omit<DeliveryAssignment, 'assignedAt'> = {
        driverType,
        notes: notes.trim() || undefined
      };
      
      // Only include driver name for 3rd-party
      if (driverType === '3rd-party' && driverName.trim()) {
        assignment.driverName = driverName.trim();
      }
      
      // Update the order
      await updateOrder({
        ...order,
        deliveryAssignment: {
          ...assignment,
          assignedAt: new Date() // Add timestamp
        }
      });
      
      toast.success(`Order ${order.id} assigned to ${getDriverDisplayName(driverType, driverName)}`);
      
      if (onSuccess) {
        onSuccess();
      }
      
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to assign driver");
      console.error("Error assigning driver:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getDriverDisplayName = (type: DriverType, name?: string): string => {
    switch (type) {
      case "driver-1":
        return "Driver 1 (Car)";
      case "driver-2":
        return "Driver 2 (Car)";
      case "3rd-party":
        return name ? `${name} (3rd Party)` : "3rd Party Service";
      default:
        return "Unknown";
    }
  };
  
  const getDriverIcon = (type: DriverType) => {
    switch (type) {
      case "driver-1":
      case "driver-2":
        return <Car className="h-5 w-5" />;
      case "3rd-party":
        return <ExternalLink className="h-5 w-5" />;
      default:
        return <Truck className="h-5 w-5" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Delivery Driver</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <div className="space-y-4">
            <div>
              <Label className="text-base">Select Driver</Label>
              <RadioGroup 
                value={driverType} 
                onValueChange={(value) => setDriverType(value as DriverType)}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3"
              >
                <div className={`border rounded-md p-4 flex items-center space-x-2 ${driverType === 'driver-1' ? 'bg-primary/5 border-primary' : ''}`}>
                  <RadioGroupItem value="driver-1" id="driver-1" />
                  <Label htmlFor="driver-1" className="flex items-center cursor-pointer">
                    <Car className="h-4 w-4 mr-2" />
                    Driver 1
                  </Label>
                </div>
                
                <div className={`border rounded-md p-4 flex items-center space-x-2 ${driverType === 'driver-2' ? 'bg-primary/5 border-primary' : ''}`}>
                  <RadioGroupItem value="driver-2" id="driver-2" />
                  <Label htmlFor="driver-2" className="flex items-center cursor-pointer">
                    <Car className="h-4 w-4 mr-2" />
                    Driver 2
                  </Label>
                </div>
                
                <div className={`border rounded-md p-4 flex items-center space-x-2 ${driverType === '3rd-party' ? 'bg-primary/5 border-primary' : ''}`}>
                  <RadioGroupItem value="3rd-party" id="3rd-party" />
                  <Label htmlFor="3rd-party" className="flex items-center cursor-pointer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    3rd Party
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            {driverType === '3rd-party' && (
              <div className="space-y-2">
                <Label htmlFor="driverName">3rd Party Driver/Service Name</Label>
                <Input
                  id="driverName"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="Enter service name (e.g., Lalamove, GoSend)"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="notes">Delivery Instructions (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any specific instructions for the driver"
                className="min-h-[80px]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="gap-2"
            >
              {getDriverIcon(driverType)}
              {isSubmitting ? "Assigning..." : "Assign Driver"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DriverAssignmentDialog;
