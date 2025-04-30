
import React, { useRef } from 'react';
import { Order, PrintEvent } from "@/types";
import { Button } from "@/components/ui/button";
import { Label } from "lucide-react";
import { useReactToPrint } from 'react-to-print';
import DeliveryLabelView from './DeliveryLabelView';
import { useApp } from "@/context/AppContext";
import { toast } from "@/components/ui/sonner";

interface DeliveryLabelPrintButtonProps {
  order: Partial<Order>;
  showPrintCount?: boolean;
}

const DeliveryLabelPrintButton = ({ order, showPrintCount = true }: DeliveryLabelPrintButtonProps) => {
  const printRef = useRef<HTMLDivElement>(null);
  const { updateOrder } = useApp();

  // Track print count from history
  const printCount = order.printHistory?.filter(event => event.type === 'delivery-label').length || 0;

  const handlePrint = useReactToPrint({
    documentTitle: `Delivery Label ${order.id || ''}`,
    content: () => printRef.current,
    onPrintError: (error) => {
      console.error('Print failed', error);
      toast.error('Failed to print delivery label');
    },
    onAfterPrint: async () => {
      // Only track prints for saved orders with an ID
      if (order.id) {
        try {
          // Create a new print event
          const printEvent: PrintEvent = {
            type: 'delivery-label',
            timestamp: new Date(),
          };
          
          // Update the order with the new print event
          const printHistory = [...(order.printHistory || []), printEvent];
          
          await updateOrder({
            ...order as Order,
            printHistory
          });
          
          toast.success('Label printed successfully');
        } catch (error) {
          console.error('Failed to update print history', error);
        }
      }
    },
    pageStyle: `
      @page {
        size: 4in 6in portrait;
        margin: 2mm;
      }
      @media print {
        body {
          margin: 0;
          padding: 0;
        }
        .print-delivery-label {
          width: 100% !important;
          height: 100% !important;
          margin: 0 !important;
          padding: 2mm !important;
          box-shadow: none !important;
        }
      }
    `,
  });

  return (
    <>
      <Button onClick={handlePrint} variant="outline">
        <Label className="mr-2 h-4 w-4" />
        Print Label
        {showPrintCount && order.id && (
          <span className="ml-1 text-xs bg-muted text-muted-foreground rounded-full px-1.5 py-0.5">
            {printCount}
          </span>
        )}
      </Button>
      
      <div className="hidden">
        <DeliveryLabelView ref={printRef} order={order} />
      </div>
    </>
  );
};

export default DeliveryLabelPrintButton;
