
import { useState } from "react";
import { Address } from "@/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash } from "lucide-react";
import { areaOptions } from "@/data/mockData";

interface AddressManagementProps {
  addresses: Partial<Address>[];
  onChange: (addresses: Partial<Address>[]) => void;
}

const AddressManagement = ({ addresses, onChange }: AddressManagementProps) => {
  const handleAddressChange = (index: number, field: keyof Address, value: string) => {
    const updated = [...addresses];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleAddAddress = () => {
    if (addresses.length < 5) {
      onChange([...addresses, { text: "", area: "Jakarta", deliveryNotes: "" }]);
    }
  };

  const handleRemoveAddress = (index: number) => {
    onChange(addresses.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Customer Addresses</h3>
        {addresses.length < 5 && (
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={handleAddAddress}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" /> Add Address
          </Button>
        )}
      </div>
      
      {addresses.length === 0 && (
        <div className="text-center py-6 border rounded-md bg-muted/20">
          <p className="text-muted-foreground">No addresses added yet.</p>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={handleAddAddress}
            className="mt-2"
          >
            Add First Address
          </Button>
        </div>
      )}
      
      <div className="space-y-4">
        {addresses.map((address, index) => (
          <Card key={address.id || `new-${index}`}>
            <CardContent className="pt-4 space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium">Address {index + 1}</span>
                {addresses.length > 1 && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRemoveAddress(index)}
                    className="h-8 w-8 p-0 text-red-500"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div>
                <Label htmlFor={`address-${index}`}>Address Text {index === 0 && "*"}</Label>
                <Textarea
                  id={`address-${index}`}
                  value={address.text || ""}
                  onChange={(e) => handleAddressChange(index, 'text', e.target.value)}
                  placeholder="Full address"
                  required={index === 0}
                  className="h-20"
                />
              </div>
              
              <div>
                <Label htmlFor={`area-${index}`}>Area {index === 0 && "*"}</Label>
                <Select
                  value={address.area || "Jakarta"}
                  onValueChange={(value) => handleAddressChange(index, 'area', value)}
                >
                  <SelectTrigger id={`area-${index}`}>
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
                <Label htmlFor={`notes-${index}`}>Delivery Notes</Label>
                <Textarea
                  id={`notes-${index}`}
                  value={address.deliveryNotes || ""}
                  onChange={(e) => handleAddressChange(index, 'deliveryNotes', e.target.value)}
                  placeholder="Special delivery instructions"
                  className="h-16"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AddressManagement;
