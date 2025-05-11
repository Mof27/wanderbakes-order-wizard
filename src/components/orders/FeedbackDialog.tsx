
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  MessageSquare,
  Loader2,
  Save,
  Tag,
  Plus
} from "lucide-react";
import { Order, OrderStatus, OrderTag } from "@/types";
import { formatDate } from "@/lib/utils";
import { dataService } from "@/services";
import { useQuery } from "@tanstack/react-query";

// Component for adding new tags
const AddTagInput = ({ onAddTag }: { onAddTag: (tagName: string) => void }) => {
  const [newTagName, setNewTagName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  
  const handleAddTag = async () => {
    if (!newTagName.trim()) return;
    
    setIsAdding(true);
    try {
      await onAddTag(newTagName.trim());
      setNewTagName("");
    } finally {
      setIsAdding(false);
    }
  };
  
  return (
    <div className="flex gap-2 items-center mt-3">
      <div className="flex-1">
        <Input 
          placeholder="Add new tag..." 
          value={newTagName} 
          onChange={(e) => setNewTagName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddTag();
            }
          }}
          disabled={isAdding}
        />
      </div>
      <Button 
        size="sm" 
        disabled={!newTagName.trim() || isAdding} 
        onClick={handleAddTag}
      >
        {isAdding ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
        Add
      </Button>
    </div>
  );
};

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

  // Get all available tags including custom ones
  const { data: allTags = [] } = useQuery({
    queryKey: ['galleryTags'],
    queryFn: () => dataService.gallery.getAllTags(),
  });
  
  // Handle tag selection
  const handleTagChange = (tag: OrderTag, checked: boolean) => {
    if (checked) {
      setSelectedTags(prev => [...prev, tag]);
    } else {
      setSelectedTags(prev => prev.filter(t => t !== tag));
    }
  };

  // Handle creating new custom tag
  const handleAddCustomTag = async (tagName: string) => {
    try {
      const newTag = await dataService.gallery.createCustomTag(tagName);
      // Add the new tag to selected tags
      setSelectedTags(prev => [...prev, newTag.value as OrderTag]);
      toast.success(`Tag "${tagName}" created successfully`);
    } catch (error) {
      console.error("Error creating tag:", error);
      toast.error("Failed to create tag");
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
      
      // If we have finished cake photos, add them to the gallery with selected tags
      if (order.finishedCakePhotos && order.finishedCakePhotos.length > 0) {
        for (const photoUrl of order.finishedCakePhotos) {
          await dataService.gallery.addPhotoFromOrder(
            updatedOrder,
            photoUrl,
            selectedTags
          );
        }
      }
      
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
              {allTags.map((tag) => (
                <div key={tag.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tag-${tag.value}`}
                    checked={selectedTags.includes(tag.value as OrderTag)}
                    onCheckedChange={(checked) => handleTagChange(tag.value as OrderTag, !!checked)}
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
            
            <AddTagInput onAddTag={handleAddCustomTag} />
            
            <p className="text-xs text-muted-foreground mt-1">
              Tags help categorize cakes for the design gallery and reporting.
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
