
import { Order } from "@/types";
import { forwardRef, useEffect, useState } from "react";
import { dataService } from "@/services";
import { PrintTemplateRenderer } from "@/components/settings/PrintTemplateRenderer";

interface PrintableOrderViewProps {
  order: Partial<Order>;
}

const PrintableOrderView = forwardRef<HTMLDivElement, PrintableOrderViewProps>(({ order }, ref) => {
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        const settings = await dataService.settings.getAll();
        setTemplate(settings.printTemplate);
      } catch (error) {
        console.error("Failed to load print template:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTemplate();
  }, []);

  if (loading || !template) {
    return (
      <div ref={ref} className="p-8 bg-white">
        <p>Loading print template...</p>
      </div>
    );
  }

  return (
    <PrintTemplateRenderer 
      ref={ref} 
      template={template} 
      order={order} 
    />
  );
});

PrintableOrderView.displayName = "PrintableOrderView";

export default PrintableOrderView;
