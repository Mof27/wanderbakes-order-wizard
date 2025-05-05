
import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { 
  MessageSquare,
  Loader2,
  Save,
  Tag
} from "lucide-react";
import { Order, OrderStatus, OrderTag } from "@/types";
import { formatDate } from "@/lib/utils";

// Available order tags
const availableTags: { value: OrderTag; label: string }[] = [
  { value: 'for-kids', label: 'For Kids' },
  { value: 'for-man', label: 'For Man' },
  { value: 'for-woman', label: 'For Woman' },
  { value: 'birthday', label: 'Birthday' },
  { value: 'anniversary', label: 'Anniversary' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'other', label: 'Other' },
];

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order;
  onSaved?: () => void;
}

const FeedbackDialog = ({ 
  open, 
  onOpenChange,
  order,
  onSaved
}: FeedbackDialogProps) => {
  const { updateOrder } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string>(order.customerFeedback || "");
  const [selectedTags, setSelectedTags] = useState<OrderTag[]>(order.orderTags || []);
  
  // Handle tag selection
  const handleTagChange = (tag: OrderTag, checked: boolean) => {
    if (checked) {
      setSelectedTags(prev => [...prev, tag]);
    } else {
      setSelectedTags(prev => prev.filter(t => t !== tag));
    }
  };

  // Save feedback and tags
  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      // Create updated order object
      const updatedOrder: Order = {
        ...order,
        customerFeedback: feedback,
        orderTags: selectedTags,
        // Update status to finished when feedback is saved
        status: 'finished' as OrderStatus
      };
      
      // Update the order
      await updateOrder(updatedOrder);
      toast.success("Feedback saved successfully");
      
      // Close dialog and trigger refresh
      onOpenChange(false);
      if (onSaved) {
        onSaved();
      }
    } catch (error) {
      console.error("Error saving feedback:", error);
      toast.error("Failed to save feedback");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Customer Feedback</DialogTitle>
          <DialogDescription>
            Order #{order.id.substring(order.id.length - 5)} • {formatDate(order.deliveryDate)}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {/* Feedback Section */}
          <div className="grid gap-2">
            <Label className="text-base font-semibold flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" /> Customer Feedback
            </Label>
            
            <Textarea 
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Enter customer feedback about the cake and delivery"
              className="min-h-[100px]"
            />
          </div>
          
          {/* Order Tags Section */}
          <div className="grid gap-2">
            <Label className="text-base font-semibold flex items-center">
              <Tag className="h-4 w-4 mr-2" /> Order Tags
            </Label>
            
            <div className="grid grid-cols-2 gap-4">
              {availableTags.map((tag) => (
                <div key={tag.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tag-${tag.value}`}
                    checked={selectedTags.includes(tag.value)}
                    onCheckedChange={(checked) => handleTagChange(tag.value, !!checked)}
                  />
                  <Label htmlFor={`tag-${tag.value}`}>{tag.label}</Label>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Tags help categorize orders for reporting and analytics.
            </p>
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
                Save Feedback
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackDialog;
