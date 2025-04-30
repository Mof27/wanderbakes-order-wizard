
import React, { useRef } from 'react';
import { Order } from "@/types";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useReactToPrint } from 'react-to-print';
import PrintableOrderView from './PrintableOrderView';

interface OrderPrintButtonProps {
  order: Partial<Order>;
}

const OrderPrintButton = ({ order }: OrderPrintButtonProps) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Cake Order ${order.id || ''}`,
    pageStyle: `
      @page {
        size: A5;
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
      </Button>
      
      <div className="hidden">
        <PrintableOrderView ref={printRef} order={order} />
      </div>
    </>
  );
};

export default OrderPrintButton;
