
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Customer, Address } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash } from "lucide-react";
import { areaOptions } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";

interface CustomerFormProps {
  customer?: Customer;
  onSave: (customer: Customer) => void;
}

const CustomerForm = ({ customer, onSave }: CustomerFormProps) => {
  const { addCustomer, updateCustomer } = useApp();

  const initialAddresses = customer?.addresses || [];

  const [formData, setFormData] = useState({
    name: customer?.name || "",
    whatsappNumber: customer?.whatsappNumber || "",
    email: customer?.email || "",
  });

  const [addresses, setAddresses] = useState<Partial<Address>[]>(
    initialAddresses.length > 0
      ? initialAddresses
      : [{ text: "", area: "Jakarta", deliveryNotes: "" }]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (index: number, field: keyof Address, value: string) => {
    setAddresses(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddAddress = () => {
    if (addresses.length < 5) {
      setAddresses(prev => [...prev, { text: "", area: "Jakarta", deliveryNotes: "" }]);
    }
  };

  const handleRemoveAddress = (index: number) => {
    setAddresses(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.whatsappNumber || addresses.length === 0 || !addresses[0].text) {
      return;
    }

    try {
      // Process addresses to ensure they have IDs and timestamps
      const processedAddresses: Address[] = addresses.map((addr, index) => {
        if (addr.id) {
          return addr as Address;
        }
        return {
          id: `addr_${Date.now()}_${index}`,
          text: addr.text || "",
          area: addr.area || "Jakarta",
          deliveryNotes: addr.deliveryNotes,
          createdAt: new Date(),
        };
      });

      if (customer) {
        const updatedCustomer = { 
          ...customer, 
          ...formData, 
          addresses: processedAddresses 
        };
        await updateCustomer(updatedCustomer);
        onSave(updatedCustomer);
      } else {
        const newCustomer = await addCustomer({
          name: formData.name,
          whatsappNumber: formData.whatsappNumber,
          email: formData.email || undefined,
          addresses: processedAddresses,
        });
        onSave(newCustomer);
      }
    } catch (error) {
      console.error("Error saving customer:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Customer name"
          required
        />
      </div>
      <div>
        <Label htmlFor="whatsappNumber">WhatsApp Number *</Label>
        <Input
          id="whatsappNumber"
          name="whatsappNumber"
          value={formData.whatsappNumber}
          onChange={handleChange}
          placeholder="+6281234567890"
          required
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="customer@example.com"
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>Addresses *</Label>
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
                  <Label htmlFor={`address-${index}`}>Address Text *</Label>
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
                  <Label htmlFor={`area-${index}`}>Area *</Label>
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
      
      <Button type="submit" className="bg-cake-primary hover:bg-cake-primary/80 text-cake-text w-full">
        {customer ? "Update Customer" : "Add Customer"}
      </Button>
    </form>
  );
};

export default CustomerForm;
