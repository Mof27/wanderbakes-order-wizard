
import React, { useRef, useState } from 'react';
import { Order, PrintEvent, SettingsData } from "@/types";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useReactToPrint } from 'react-to-print';
import DeliveryLabelView from './DeliveryLabelView';
import { useApp } from "@/context/AppContext";
import { toast } from "@/components/ui/sonner";
import { useQuery } from '@tanstack/react-query';
import { dataService } from '@/services';

interface DeliveryLabelPrintButtonProps {
  order: Partial<Order>;
  showPrintCount?: boolean;
}

const DeliveryLabelPrintButton = ({ order, showPrintCount = true }: DeliveryLabelPrintButtonProps) => {
  const printRef = useRef<HTMLDivElement>(null);
  const { updateOrder } = useApp();
  const [isPrinting, setIsPrinting] = useState(false);

  // Pre-fetch settings data
  const { data: settings, isLoading, refetch } = useQuery({
    queryKey: ['settings'],
    queryFn: () => dataService.settings.getAll()
  });

  // Track print count from history
  const printCount = order.printHistory?.filter(event => event.type === 'delivery-label').length || 0;

  const preparePrint = async () => {
    console.log("Preparing to print delivery label");
    setIsPrinting(true);
    
    // Make sure settings are loaded
    if (!settings) {
      console.log("Settings not loaded, fetching...");
      await refetch();
    }
    
    // Small delay to ensure rendering is complete
    setTimeout(() => {
      if (printRef.current) {
        console.log("Print ref is ready, triggering print");
        handlePrint();
      } else {
        console.error("Print ref is not ready");
        toast.error("Print preparation failed");
        setIsPrinting(false);
      }
    }, 300);
  };

  const handlePrint = useReactToPrint({
    documentTitle: `Delivery Label ${order.id || ''}`,
    contentRef: printRef,
    onPrintError: (error) => {
      console.error('Print failed', error);
      toast.error('Failed to print delivery label');
      setIsPrinting(false);
    },
    onAfterPrint: async () => {
      console.log("Print completed successfully");
      setIsPrinting(false);
      
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
        /* Text styling for printed content */
        .text-xs { font-size: 8pt !important; }
        .text-sm { font-size: 10pt !important; }
        .text-base { font-size: 12pt !important; }
        .text-lg { font-size: 14pt !important; }
        .text-xl { font-size: 16pt !important; }
        .text-2xl { font-size: 18pt !important; }
        .font-normal { font-weight: normal !important; }
        .font-medium { font-weight: 500 !important; }
        .font-semibold { font-weight: 600 !important; }
        .font-bold { font-weight: bold !important; }
        .italic { font-style: italic !important; }
      }
    `,
  });

  return (
    <>
      <Button 
        onClick={preparePrint} 
        variant="outline" 
        disabled={isPrinting || isLoading}
      >
        <Printer className="mr-2 h-4 w-4" />
        {isPrinting ? 'Preparing...' : 'Print Label'}
        {showPrintCount && order.id && (
          <span className="ml-1 text-xs bg-muted text-muted-foreground rounded-full px-1.5 py-0.5">
            {printCount}
          </span>
        )}
      </Button>
      
      <div className="hidden">
        <DeliveryLabelView ref={printRef} order={order} preloadedSettings={settings} />
      </div>
    </>
  );
};

export default DeliveryLabelPrintButton;
