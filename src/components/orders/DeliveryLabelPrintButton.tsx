
import { useState } from "react";
import { Order } from "@/types";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import { dataService } from "@/services";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { toast } from "sonner";

interface DeliveryLabelPrintButtonProps {
  order: Order;
}

const DeliveryLabelPrintButton = ({ order }: DeliveryLabelPrintButtonProps) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const { getCurrentUserDisplayName } = useCurrentUser();

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      // Create print event
      const printEvent = {
        id: `print_${Date.now()}`,
        timestamp: new Date(),
        type: 'delivery-label' as const,
        printedBy: getCurrentUserDisplayName()
      };

      // Update order with print history including user info
      await dataService.orders.updatePrintHistory(order.id, printEvent, getCurrentUserDisplayName());
      
      // Trigger actual print (in a real app, this would open a delivery label template)
      window.print();
      
      toast.success("Delivery label printed");
    } catch (error) {
      console.error("Failed to record print event:", error);
      toast.error("Failed to record print event");
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      onClick={handlePrint}
      disabled={isPrinting}
      className="gap-2"
    >
      <Package className="h-4 w-4" />
      {isPrinting ? "Printing..." : "Print Label"}
    </Button>
  );
};

export default DeliveryLabelPrintButton;
