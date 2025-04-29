
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Customer } from "@/types";

interface CustomerFormProps {
  customer?: Customer;
  onSave: (customer: Customer) => void;
}

const CustomerForm = ({ customer, onSave }: CustomerFormProps) => {
  const { addCustomer, updateCustomer } = useApp();

  const [formData, setFormData] = useState({
    name: customer?.name || "",
    whatsappNumber: customer?.whatsappNumber || "",
    email: customer?.email || "",
    address: customer?.address || ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.whatsappNumber) {
      return;
    }

    if (customer) {
      const updatedCustomer = { ...customer, ...formData };
      updateCustomer(updatedCustomer);
      onSave(updatedCustomer);
    } else {
      const newCustomer = addCustomer({
        name: formData.name,
        whatsappNumber: formData.whatsappNumber,
        email: formData.email || undefined,
        address: formData.address || undefined,
      });
      onSave(newCustomer);
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
      <div>
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Customer address"
          className="h-20"
        />
      </div>
      <Button type="submit" className="bg-cake-primary hover:bg-cake-primary/80 text-cake-text w-full">
        {customer ? "Update Customer" : "Add Customer"}
      </Button>
    </form>
  );
};

export default CustomerForm;
