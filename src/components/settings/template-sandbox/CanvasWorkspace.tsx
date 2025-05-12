
import { useCallback, useEffect, useRef, useState } from "react";
import { PrintTemplate, DeliveryLabelTemplate } from "@/types";
import { SandboxTemplateType, SandboxState } from "@/types/template";
import { PrintTemplateRenderer } from "../PrintTemplateRenderer";
import DeliveryLabelTemplateRenderer from "../DeliveryLabelTemplateRenderer";

interface CanvasWorkspaceProps {
  template: PrintTemplate | DeliveryLabelTemplate | null;
  templateType: SandboxTemplateType;
  sandboxState: SandboxState;
  onTemplateChange: (updatedTemplate: PrintTemplate | DeliveryLabelTemplate) => void;
  onElementSelect: (elementId: string) => void;
  onSectionSelect: (sectionId: string) => void;
}

const CanvasWorkspace: React.FC<CanvasWorkspaceProps> = ({
  template,
  templateType,
  sandboxState,
  onTemplateChange,
  onElementSelect,
  onSectionSelect
}) => {
  const [canvasScale, setCanvasScale] = useState(1);
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Sample data for preview
  const sampleOrder = {
    id: "ORD12345",
    customer: {
      name: "John Doe",
      whatsappNumber: "+62 812 3456 7890",
      email: "john@example.com",
      addresses: [],
      createdAt: new Date()
    },
    deliveryAddress: "123 Main Street, Apartment 4B",
    deliveryArea: "Jakarta",
    deliveryAddressNotes: "Near the blue building on the corner",
    cakeSize: "18 CM",
    cakeShape: "Round",
    cakeFlavor: "Chocolate",
    cakeTier: 2,
    coverType: "buttercream" as const,
    cakeDesign: "Birthday theme with flowers",
    cakeText: "Happy Birthday John!",
    orderDate: new Date(),
    deliveryDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
    cakePrice: 500000,
    deliveryMethod: "flat-rate" as const,
    deliveryTimeSlot: "slot1" as const,
    deliveryPrice: 50000
  };
  
  useEffect(() => {
    setCanvasScale(sandboxState.zoom / 100);
  }, [sandboxState.zoom]);
  
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    // Handle canvas clicks, e.g., to deselect elements
    if (e.currentTarget === e.target) {
      onElementSelect('');
      onSectionSelect('');
    }
  }, [onElementSelect, onSectionSelect]);
  
  if (!template) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No template loaded.</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center h-full overflow-auto p-8 bg-muted/30">
      <div
        className="canvas-container relative bg-background shadow-xl"
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{
          width: templateType === 'order-form' ? 
            (template as PrintTemplate).orientation === 'landscape' ? '210mm' : '148mm' :
            '4in',
          height: templateType === 'order-form' ? 
            (template as PrintTemplate).orientation === 'landscape' ? '148mm' : '210mm' :
            '6in',
          transform: `scale(${canvasScale})`,
          transformOrigin: 'center',
          transition: 'transform 0.2s ease'
        }}
      >
        {/* Display the appropriate template renderer based on type */}
        {templateType === 'order-form' ? (
          <PrintTemplateRenderer 
            template={template as PrintTemplate} 
            order={sampleOrder}
            isPreviewing={true}
          />
        ) : (
          <DeliveryLabelTemplateRenderer 
            template={template as DeliveryLabelTemplate} 
            order={sampleOrder}
            isPreviewing={true}
          />
        )}
        
        {/* Overlay for editing when not in preview mode */}
        {!sandboxState.previewMode && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Here we would add interactive elements for the editor */}
            {/* For example, click handlers for sections and elements */}
            {template.sections.map((section) => (
              <div 
                key={section.id} 
                className={`relative p-2 my-2 rounded ${section.id === sandboxState.selectedSectionId ? 'outline outline-2 outline-primary' : 'outline outline-1 outline-gray-300/30'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSectionSelect(section.id);
                }}
                style={{ opacity: section.enabled ? 1 : 0.5 }}
              >
                {section.fields.map((field) => (
                  <div 
                    key={field.id}
                    className={`relative my-1 rounded ${field.id === sandboxState.selectedElementId ? 'outline outline-2 outline-blue-500' : 'hover:outline hover:outline-1 hover:outline-blue-300/50'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onElementSelect(field.id);
                    }}
                    style={{ opacity: field.enabled ? 1 : 0.5 }}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="mt-4 text-sm text-muted-foreground">
        {sandboxState.previewMode ? 'Preview Mode' : 'Edit Mode'} • Zoom: {sandboxState.zoom}%
      </div>
    </div>
  );
};

export default CanvasWorkspace;
