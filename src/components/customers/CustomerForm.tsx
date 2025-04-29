
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Customer, Address } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import AddressManagement from "./AddressManagement";

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

  const [showAddressSheet, setShowAddressSheet] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (updatedAddresses: Partial<Address>[]) => {
    setAddresses(updatedAddresses);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.whatsappNumber) {
      return;
    }

    try {
      // Process addresses to ensure they have IDs and timestamps
      const processedAddresses: Address[] = addresses
        .filter(addr => addr.text) // Only include addresses that have text
        .map((addr, index) => {
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
    <div>
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
        
        <div className="py-2">
          <div className="flex justify-between items-center">
            <Label>Addresses {addresses.some(a => a.text) ? `(${addresses.filter(a => a.text).length})` : ""}</Label>
            <Sheet open={showAddressSheet} onOpenChange={setShowAddressSheet}>
              <SheetTrigger asChild>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                >
                  Manage Addresses
                </Button>
              </SheetTrigger>
              <SheetContent className="sm:max-w-md overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Manage Addresses</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <AddressManagement addresses={addresses} onChange={handleAddressChange} />
                  <div className="mt-6">
                    <Button type="button" onClick={() => setShowAddressSheet(false)} className="w-full">
                      Done
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          <div className="mt-2">
            {addresses.filter(a => a.text).length > 0 ? (
              <div className="text-sm text-muted-foreground">
                {addresses.filter(a => a.text).length} address(es) added
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No addresses added yet</div>
            )}
          </div>
        </div>
        
        <Button type="submit" className="bg-cake-primary hover:bg-cake-primary/80 text-cake-text w-full">
          {customer ? "Update Customer" : "Add Customer"}
        </Button>
      </form>
    </div>
  );
};

export default CustomerForm;
