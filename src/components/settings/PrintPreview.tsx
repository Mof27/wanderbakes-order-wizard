
import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, X } from "lucide-react";
import { PrintTemplate } from "@/types";
import { PrintTemplateRenderer } from "./PrintTemplateRenderer";

interface PrintPreviewProps {
  template: PrintTemplate;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PrintPreview: React.FC<PrintPreviewProps> = ({
  template,
  open,
  onOpenChange
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    documentTitle: template.title,
    onPrintError: (error) => console.error('Print failed', error),
    contentRef: printRef,
    pageStyle: `
      @page {
        size: ${template.orientation === 'landscape' ? 'A5 landscape' : 'A5'};
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

  // Sample data for preview
  const sampleOrder = {
    id: "ORD12345",
    status: "confirmed",
    orderDate: new Date(),
    deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    customer: {
      name: "Sample Customer",
      whatsappNumber: "62812345678",
      email: "sample@email.com"
    },
    cakeFlavor: "Chocolate",
    cakeSize: "18 CM",
    cakeShape: "Round",
    cakeTier: 1,
    coverType: "buttercream",
    coverColor: { type: "solid", color: "#FFCDD2" },
    cakeDesign: "Floral Pattern",
    cakeText: "Happy Birthday",
    deliveryAddress: "Sample Street No. 123",
    deliveryArea: "Jakarta",
    deliveryAddressNotes: "Near the park",
    deliveryMethod: "flat-rate",
    deliveryTimeSlot: "slot1",
    cakePrice: 350000,
    deliveryPrice: 30000,
    notes: "Please be careful with the delivery.",
    packingItems: [
      { id: "1", name: "Cake Box", checked: true },
      { id: "2", name: "Candles", checked: true }
    ]
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[800px] w-full max-h-[90vh] flex flex-col">
        <DialogHeader className="flex justify-between items-center flex-row">
          <DialogTitle>Print Preview</DialogTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Test Print
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto p-4">
          <div
            className="relative mx-auto"
            style={{ 
              width: template.orientation === 'landscape' ? '210mm' : '148mm', 
              height: template.orientation === 'landscape' ? '148mm' : '210mm',
            }}
          >
            <PrintTemplateRenderer 
              ref={printRef}
              template={template}
              order={sampleOrder}
              isPreviewing={true}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrintPreview;
