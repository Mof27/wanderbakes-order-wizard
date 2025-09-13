
import React, { useRef } from 'react';
import { Order, PrintEvent } from "@/types";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useReactToPrint } from 'react-to-print';
import PrintableOrderView from './PrintableOrderView';
import { useApp } from "@/context/AppContext";
import { toast } from "@/components/ui/sonner";

interface OrderPrintButtonProps {
  order: Partial<Order>;
  showPrintCount?: boolean;
}

const OrderPrintButton = ({ order, showPrintCount = true }: OrderPrintButtonProps) => {
  const printRef = useRef<HTMLDivElement>(null);
  const { updateOrder } = useApp();

  // Track print count from history
  const printCount = order.printHistory?.filter(event => event.type === 'order-form').length || 0;

  const handlePrint = useReactToPrint({
    documentTitle: `Cake Order ${order.id || ''}`,
    onPrintError: (error) => {
      console.error('Print failed', error);
      toast.error('Failed to print order form');
    },
    onAfterPrint: async () => {
      // Only track prints for saved orders with an ID
      if (order.id) {
        try {
          // Create a new print event
          const printEvent: PrintEvent = {
            type: 'order-form',
            timestamp: new Date(),
          };
          
          // Update the order with the new print event
          const printHistory = [...(order.printHistory || []), printEvent];
          
          await updateOrder({ 
            ...order as Order, 
            printHistory 
          });
          
          toast.success('Print successful');
        } catch (error) {
          console.error('Failed to update print history', error);
        }
      }
    },
    contentRef: printRef,
    pageStyle: `
      @page {
        size: A5 landscape;
        margin: 5mm;
      }
      @media print {
        body {
          margin: 0;
          padding: 0;
        }
        .print-container {
          width: 100% !important;
          height: 100% !important;
          margin: 0 !important;
          padding: 5mm !important;
          box-shadow: none !important;
        }
      }
    `,
  });

  return (
    <>
      <Button onClick={handlePrint} variant="outline">
        <Printer className="mr-2 h-4 w-4" />
        Print Order
        {showPrintCount && order.id && (
          <span className="ml-1 text-xs bg-muted text-muted-foreground rounded-full px-1.5 py-0.5">
            {printCount}
          </span>
        )}
      </Button>
      
      <div className="hidden">
        <PrintableOrderView ref={printRef} order={order} />
      </div>
    </>
  );
};

export default OrderPrintButton;
