
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Address, Customer } from "@/types";
import { Plus } from "lucide-react";

interface AddressSectionProps {
  customer: Customer | null;
  selectedAddressId: string | "new";
  setSelectedAddressId: (id: string | "new") => void;
  selectedAddress: Address | null;
  formData: {
    deliveryAddress: string;
    deliveryAddressNotes: string;
    deliveryArea: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string | number) => void;
  areaOptions: string[];
  openNewAddressDialog: () => void;
}

const AddressSection = ({
  customer,
  selectedAddressId,
  setSelectedAddressId,
  selectedAddress,
  formData,
  handleInputChange,
  handleSelectChange,
  areaOptions,
  openNewAddressDialog
}: AddressSectionProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="addressSelect">Delivery Address *</Label>
      
      {customer && customer.addresses.length > 0 && (
        <Select 
          value={selectedAddressId || "new"} 
          onValueChange={setSelectedAddressId}
        >
          <SelectTrigger id="addressSelect" className="mb-2">
            <SelectValue placeholder="Select delivery address" />
          </SelectTrigger>
          <SelectContent>
            {customer.addresses.map(address => (
              <SelectItem key={address.id} value={address.id}>
                <div className="truncate">
                  <span className="font-medium">{address.area}</span> - {address.text.substring(0, 20)}
                  {address.text.length > 20 && "..."}
                </div>
              </SelectItem>
            ))}
            <SelectItem value="new">+ Add New Address</SelectItem>
          </SelectContent>
        </Select>
      )}
      
      {/* Display selected address details */}
      {selectedAddress && (
        <Card className="mb-4">
          <CardContent className="pt-4">
            <div className="space-y-1">
              <div className="flex items-start justify-between">
                <h4 className="font-medium">{selectedAddress.area}</h4>
              </div>
              <p className="text-sm">{selectedAddress.text}</p>
              {selectedAddress.deliveryNotes && (
                <div className="mt-2 text-sm">
                  <span className="font-medium">Delivery Notes:</span> {selectedAddress.deliveryNotes}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {selectedAddressId === "new" && (
        <Card className="mt-2">
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="newAddressText">Address Text *</Label>
                <Textarea
                  id="newAddressText"
                  name="deliveryAddress"
                  value={formData.deliveryAddress}
                  onChange={handleInputChange}
                  placeholder="Full delivery address"
                  required
                  className="min-h-[80px]"
                />
              </div>
              
              <div>
                <Label htmlFor="deliveryArea">Area *</Label>
                <Select 
                  value={formData.deliveryArea} 
                  onValueChange={(value) => handleSelectChange("deliveryArea", value)}
                >
                  <SelectTrigger id="deliveryArea">
                    <SelectValue placeholder="Select area" />
                  </SelectTrigger>
                  <SelectContent>
                    {areaOptions.map((area) => (
                      <SelectItem key={area} value={area}>{area}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="deliveryAddressNotes">Delivery Notes</Label>
                <Textarea
                  id="deliveryAddressNotes"
                  name="deliveryAddressNotes"
                  value={formData.deliveryAddressNotes}
                  onChange={handleInputChange}
                  placeholder="Special delivery instructions"
                  className="min-h-[60px]"
                />
              </div>
              
              {customer && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={openNewAddressDialog}
                >
                  <Plus className="mr-1 h-4 w-4" /> Save Address to Customer
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AddressSection;
