
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Address } from "@/types";

interface AddNewAddressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newAddress: Partial<Address>;
  handleAddressChange: (field: keyof typeof newAddress, value: string) => void;
  handleSaveNewAddress: () => void;
  areaOptions: string[];
}

const AddNewAddressDialog = ({
  open,
  onOpenChange,
  newAddress,
  handleAddressChange,
  handleSaveNewAddress,
  areaOptions
}: AddNewAddressDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Address</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="dialog-address-text">Address *</Label>
            <Textarea
              id="dialog-address-text"
              value={newAddress.text || ""}
              onChange={(e) => handleAddressChange("text", e.target.value)}
              placeholder="Full address"
              className="min-h-[80px]"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dialog-address-area">Area *</Label>
            <Select 
              value={newAddress.area} 
              onValueChange={(value) => handleAddressChange("area", value)}
            >
              <SelectTrigger id="dialog-address-area">
                <SelectValue placeholder="Select area" />
              </SelectTrigger>
              <SelectContent>
                {areaOptions.map((area) => (
                  <SelectItem key={area} value={area}>{area}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dialog-address-notes">Delivery Notes</Label>
            <Textarea
              id="dialog-address-notes"
              value={newAddress.deliveryNotes || ""}
              onChange={(e) => handleAddressChange("deliveryNotes", e.target.value)}
              placeholder="Special delivery instructions"
              className="min-h-[60px]"
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveNewAddress}
            disabled={!newAddress.text}
          >
            Save Address
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddNewAddressDialog;
