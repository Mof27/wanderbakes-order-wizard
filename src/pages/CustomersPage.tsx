
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { Customer } from "@/types";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CustomerForm from "@/components/customers/CustomerForm";

const CustomerCard = ({ customer }: { customer: Customer }) => {
  return (
    <Card className="p-4">
      <div className="flex flex-col space-y-2">
        <h3 className="font-medium">{customer.name}</h3>
        <p className="text-sm text-muted-foreground">{customer.whatsappNumber}</p>
        {customer.email && <p className="text-sm">{customer.email}</p>}
        {customer.address && <p className="text-sm mt-1">{customer.address}</p>}
      </div>
    </Card>
  );
};

const CustomersPage = () => {
  const { customers } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [showDialog, setShowDialog] = useState(false);

  // Filter customers by search term
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.whatsappNumber.includes(searchTerm) ||
      (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h1 className="text-2xl font-bold">Customers</h1>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-cake-primary hover:bg-cake-primary/80 text-cake-text">
              <Plus className="mr-2 h-4 w-4" />
              New Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
            </DialogHeader>
            <CustomerForm onSave={() => setShowDialog(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center border rounded-md px-3 py-2 w-full max-w-md">
        <Search className="h-4 w-4 text-muted-foreground mr-2" />
        <Input
          placeholder="Search customers..."
          className="border-0 focus-visible:ring-0 focus-visible:ring-transparent p-0"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((customer) => (
          <CustomerCard key={customer.id} customer={customer} />
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No customers found</p>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;
