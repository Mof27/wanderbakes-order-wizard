
import { useCallback, useEffect, useRef, useState } from "react";
import { PrintTemplate, DeliveryLabelTemplate } from "@/types";
import { SandboxTemplateType, SandboxState, ElementLibraryItem } from "@/types/template";
import { PrintTemplateRenderer } from "../PrintTemplateRenderer";
import DeliveryLabelTemplateRenderer from "../DeliveryLabelTemplateRenderer";
import { v4 as uuidv4 } from 'uuid';
import { cn } from "@/lib/utils";
import { AlignCenter, AlignLeft, AlignRight, Bold, Italic, Underline } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CanvasWorkspaceProps {
  template: PrintTemplate | DeliveryLabelTemplate | null;
  templateType: SandboxTemplateType;
  sandboxState: SandboxState;
  onTemplateChange: (updatedTemplate: PrintTemplate | DeliveryLabelTemplate) => void;
  onElementSelect: (elementId: string) => void;
  onSectionSelect: (sectionId: string) => void;
  onElementDrop?: (element: ElementLibraryItem, position: { x: number, y: number }) => void;
}

const CanvasWorkspace: React.FC<CanvasWorkspaceProps> = ({
  template,
  templateType,
  sandboxState,
  onTemplateChange,
  onElementSelect,
  onSectionSelect,
  onElementDrop
}) => {
  const [canvasScale, setCanvasScale] = useState(1);
  const [dragOverSection, setDragOverSection] = useState<string | null>(null);
  const [selectedElement, setSelectedElement] = useState<{id: string, sectionId: string} | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Sample data for preview
  const sampleOrder = {
    id: "ORD12345",
    customer: {
      id: "CUST12345", 
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
      setSelectedElement(null);
    }
  }, [onElementSelect, onSectionSelect]);

  const handleDragOver = (e: React.DragEvent, sectionId?: string) => {
    e.preventDefault();
    if (sectionId) {
      setDragOverSection(sectionId);
    }
  };
  
  const handleDrop = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    setDragOverSection(null);
    
    const elementData = e.dataTransfer.getData('application/json');
    if (elementData) {
      try {
        const draggedElement: ElementLibraryItem = JSON.parse(elementData);
        
        if (template) {
          // Find the section to add the element to
          const section = template.sections.find(s => s.id === sectionId);
          if (!section) return;
          
          // Create a new field based on the dragged element
          const newField = {
            id: uuidv4(),
            type: draggedElement.type,
            label: draggedElement.defaultProps.label || '',
            value: draggedElement.defaultProps.value || '',
            fieldKey: draggedElement.defaultProps.fieldKey || '',
            order: section.fields.length,
            enabled: true,
            fontSize: draggedElement.defaultProps.fontSize || 'base',
            fontWeight: draggedElement.defaultProps.fontWeight || 'normal',
            fontStyle: draggedElement.defaultProps.fontStyle || 'normal',
            alignment: draggedElement.defaultProps.alignment || 'left',
            size: draggedElement.defaultProps.size || 100,
          };
          
          // Add the new field to the section
          const updatedSections = template.sections.map(s => {
            if (s.id === sectionId) {
              return {
                ...s,
                fields: [...s.fields, newField]
              };
            }
            return s;
          });
          
          // Update the template
          onTemplateChange({
            ...template,
            sections: updatedSections
          });
          
          // Select the new element
          onElementSelect(newField.id);
          setSelectedElement({id: newField.id, sectionId});
        }
      } catch (error) {
        console.error('Error adding element:', error);
      }
    }
  };

  // Handle text formatting for the selected element
  const handleFormatText = (formatType: 'bold' | 'italic' | 'underline' | 'align-left' | 'align-center' | 'align-right', value?: string) => {
    if (!template || !selectedElement) return;
    
    const { id: elementId, sectionId } = selectedElement;
    
    const updatedSections = template.sections.map(section => {
      if (section.id === sectionId) {
        const updatedFields = section.fields.map(field => {
          if (field.id === elementId) {
            switch (formatType) {
              case 'bold':
                return { ...field, fontWeight: field.fontWeight === 'bold' ? 'normal' : 'bold' };
              case 'italic':
                return { ...field, fontStyle: field.fontStyle === 'italic' ? 'normal' : 'italic' };
              case 'align-left':
              case 'align-center':
              case 'align-right':
                const alignment = formatType.replace('align-', '');
                return { ...field, alignment };
              default:
                return field;
            }
          }
          return field;
        });
        return { ...section, fields: updatedFields };
      }
      return section;
    });
    
    onTemplateChange({
      ...template,
      sections: updatedSections
    });
  };
  
  const findSectionAndFieldForElement = (elementId: string) => {
    if (!template) return null;
    
    for (const section of template.sections) {
      const field = section.fields.find(f => f.id === elementId);
      if (field) {
        return { section, field };
      }
    }
    
    return null;
  };
  
  // Set the selected element when selectedElementId changes
  useEffect(() => {
    if (sandboxState.selectedElementId) {
      const result = findSectionAndFieldForElement(sandboxState.selectedElementId);
      if (result) {
        setSelectedElement({id: sandboxState.selectedElementId, sectionId: result.section.id});
      } else {
        setSelectedElement(null);
      }
    } else {
      setSelectedElement(null);
    }
  }, [sandboxState.selectedElementId, template]);
  
  if (!template) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No template loaded.</p>
      </div>
    );
  }
  
  // Get selected field formatting info for the toolbar
  const getSelectedFieldFormat = () => {
    if (!selectedElement || !template) return null;
    
    for (const section of template.sections) {
      const field = section.fields.find(f => f.id === selectedElement.id);
      if (field) {
        return {
          fontWeight: field.fontWeight || 'normal',
          fontStyle: field.fontStyle || 'normal',
          alignment: field.alignment || 'left'
        };
      }
    }
    return null;
  };
  
  const selectedFormat = getSelectedFieldFormat();
  
  return (
    <div className="flex flex-col items-center justify-center h-full overflow-auto p-8 bg-muted/30">
      {/* Text formatting toolbar */}
      {!sandboxState.previewMode && selectedElement && (
        <div className="mb-4 p-2 bg-background shadow rounded-md flex items-center gap-2 z-10">
          <Button
            variant="ghost"
            size="xs"
            className={cn(selectedFormat?.fontWeight === 'bold' && "bg-accent")}
            onClick={() => handleFormatText('bold')}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="xs"
            className={cn(selectedFormat?.fontStyle === 'italic' && "bg-accent")}
            onClick={() => handleFormatText('italic')}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <div className="h-4 border-l mx-1" />
          <Button
            variant="ghost"
            size="xs"
            className={cn(selectedFormat?.alignment === 'left' && "bg-accent")}
            onClick={() => handleFormatText('align-left')}
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="xs"
            className={cn(selectedFormat?.alignment === 'center' && "bg-accent")}
            onClick={() => handleFormatText('align-center')}
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="xs"
            className={cn(selectedFormat?.alignment === 'right' && "bg-accent")}
            onClick={() => handleFormatText('align-right')}
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>
      )}
      
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
            {template.sections.map((section) => (
              <div 
                key={section.id} 
                className={cn(
                  "relative p-2 my-2 rounded pointer-events-auto",
                  section.id === sandboxState.selectedSectionId && "outline outline-2 outline-primary",
                  section.id === dragOverSection && "outline outline-2 outline-blue-500 bg-blue-100/10",
                  !section.enabled && "opacity-50"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onSectionSelect(section.id);
                }}
                onDragOver={(e) => handleDragOver(e, section.id)}
                onDrop={(e) => handleDrop(e, section.id)}
                onDragLeave={() => setDragOverSection(null)}
              >
                {section.fields.map((field) => (
                  <div 
                    key={field.id}
                    className={cn(
                      "relative my-1 p-1 rounded pointer-events-auto",
                      field.id === sandboxState.selectedElementId ? 'outline outline-2 outline-blue-500' : 'hover:outline hover:outline-1 hover:outline-blue-300/50',
                      !field.enabled && "opacity-50"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onElementSelect(field.id);
                    }}
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
