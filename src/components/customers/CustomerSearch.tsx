
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Customer } from "@/types";
import { useApp } from "@/context/AppContext";
import CustomerForm from "./CustomerForm";
import { UserPlus } from "lucide-react";

interface CustomerSearchProps {
  onSelectCustomer: (customer: Customer) => void;
}

const CustomerSearch = ({ onSelectCustomer }: CustomerSearchProps) => {
  const { customers, findCustomerByWhatsApp } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [matchedCustomers, setMatchedCustomers] = useState<Customer[]>([]);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    if (searchTerm.length > 2) {
      const filtered = customers.filter(
        (customer) =>
          customer.whatsappNumber.includes(searchTerm) ||
          customer.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setMatchedCustomers(filtered);
    } else {
      setMatchedCustomers([]);
    }
  }, [searchTerm, customers]);

  const handleSelectCustomer = (customer: Customer) => {
    onSelectCustomer(customer);
    setSearchTerm("");
    setMatchedCustomers([]);
  };

  const handleCreateCustomer = (newCustomer: Customer) => {
    onSelectCustomer(newCustomer);
    setShowDialog(false);
  };

  return (
    <div className="space-y-2 w-full">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="Search by WhatsApp number or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          {matchedCustomers.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white rounded-md border shadow-lg max-h-60 overflow-auto">
              {matchedCustomers.map((customer) => (
                <div
                  key={customer.id}
                  onClick={() => handleSelectCustomer(customer)}
                  className="p-2 hover:bg-muted cursor-pointer border-b"
                >
                  <div className="font-medium">{customer.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {customer.whatsappNumber}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-cake-primary hover:bg-cake-primary/80 text-cake-text">
              <UserPlus className="mr-2 h-4 w-4" />
              New Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
            </DialogHeader>
            <CustomerForm onSave={handleCreateCustomer} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CustomerSearch;
