
import { useState } from "react";
import { Order } from "@/types";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { dataService } from "@/services";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { toast } from "sonner";

interface OrderPrintButtonProps {
  order: Order;
}

const OrderPrintButton = ({ order }: OrderPrintButtonProps) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const { getCurrentUserDisplayName } = useCurrentUser();

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      // Create print event
      const printEvent = {
        id: `print_${Date.now()}`,
        timestamp: new Date(),
        type: 'order-form' as const,
        printedBy: getCurrentUserDisplayName()
      };

      // Update order with print history including user info
      await dataService.orders.updatePrintHistory(order.id, printEvent, getCurrentUserDisplayName());
      
      // Trigger actual print
      window.print();
      
      toast.success("Order form printed");
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
      <Printer className="h-4 w-4" />
      {isPrinting ? "Printing..." : "Print Order"}
    </Button>
  );
};

export default OrderPrintButton;
