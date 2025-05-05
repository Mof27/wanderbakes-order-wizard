
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Customer } from "@/types";
import CustomerSearch from "@/components/customers/CustomerSearch";

interface CustomerSectionProps {
  customer: Customer | null;
  setCustomer: (customer: Customer | null) => void;
  readOnly?: boolean;
}

const CustomerSection = ({ customer, setCustomer, readOnly = false }: CustomerSectionProps) => {
  if (!customer) {
    return (
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-medium mb-4">Select Customer *</h3>
          <CustomerSearch onSelectCustomer={setCustomer} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{customer.name}</h3>
            <p className="text-sm text-muted-foreground">{customer.whatsappNumber}</p>
            {customer.email && <p className="text-sm">{customer.email}</p>}
          </div>
          {!readOnly && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCustomer(null)}
            >
              Change
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerSection;
