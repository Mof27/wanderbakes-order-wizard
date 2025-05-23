
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DeliveryLabelTemplate } from "@/types";
import DeliveryLabelTemplateRenderer from "@/components/settings/DeliveryLabelTemplateRenderer";

interface DeliveryLabelPreviewProps {
  template: DeliveryLabelTemplate;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DeliveryLabelPreview = ({ template, open, onOpenChange }: DeliveryLabelPreviewProps) => {
  // Create sample order data for the preview
  const sampleOrder = {
    id: "ORD12345",
    customer: {
      id: "cust123",
      name: "John Doe",
      whatsappNumber: "+62 812 3456 7890",
      email: "john@example.com",
      addresses: [], // Add required addresses array
      createdAt: new Date(), // Add required createdAt date
    },
    deliveryAddress: "123 Main Street",
    deliveryArea: "Jakarta",
    deliveryAddressNotes: "Near the mall",
    cakeSize: "16 CM",
    cakeShape: "Round",
    cakeFlavor: "Chocolate",
    cakeTier: 2,
    coverType: "buttercream" as const, // Use const assertion for literal type
    cakeDesign: "Birthday theme",
    cakeText: "Happy Birthday John!",
    orderDate: new Date(),
    deliveryDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    cakePrice: 500000,
    deliveryMethod: "flat-rate" as const, // Use const assertion for literal type
    deliveryTimeSlot: "slot1" as const, // Use const assertion for literal type
    deliveryPrice: 50000
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[500px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Delivery Label Preview</DialogTitle>
        </DialogHeader>
        <div className="pt-4">
          <DeliveryLabelTemplateRenderer 
            template={template}
            order={sampleOrder} 
            isPreviewing={true}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeliveryLabelPreview;
