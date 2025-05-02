import React, { forwardRef } from "react";
import { PrintTemplate, Order, PrintSection, PrintField } from "@/types";
import { formatCurrency, formatDate, formatTimeSlot } from "@/lib/utils";
import { get } from "lodash";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";

interface PrintTemplateRendererProps {
  template: PrintTemplate;
  order: Partial<Order>;
  isPreviewing?: boolean;
}

export const PrintTemplateRenderer = forwardRef<HTMLDivElement, PrintTemplateRendererProps>(
  ({ template, order, isPreviewing = false }, ref) => {
    // Get nested properties safely
    const getFieldValue = (fieldKey?: string): string | number | React.ReactNode => {
      if (!fieldKey) return "";
      
      // Special handler for order URL (for QR code)
      if (fieldKey === "orderUrl") {
        // Just use the order ID for QR code instead of deep link
        return order.id || (isPreviewing ? "05-25-001" : "");
      }
      
      // Special handler for total price (calculated field)
      if (fieldKey === "totalPrice") {
        return formatCurrency((order.cakePrice || 0) + (order.deliveryPrice || 0));
      }
      
      // Special handler for print date
      if (fieldKey === "printDate") {
        return formatDate(new Date());
      }
      
      // Special handler for delivery time slot
      if (fieldKey === "deliveryTimeSlot" && order.deliveryTimeSlot) {
        return order.deliveryTimeSlot.startsWith("slot") 
          ? formatTimeSlot(order.deliveryTimeSlot)
          : order.deliveryTimeSlot;
      }
      
      // Special handler for delivery method display
      if (fieldKey === "deliveryMethod") {
        const method = order.deliveryMethod;
        if (method === "flat-rate") return "Flat Rate";
        if (method === "lalamove") return "Lalamove";
        if (method === "self-pickup") return "Self-Pickup";
        return method || "";
      }
      
      // Special handler for cover color
      if (fieldKey === "coverColor") {
        const coverColor = order.coverColor;
        if (!coverColor) return "";
        if (typeof coverColor === "string") return coverColor;
        
        if (coverColor.type === "solid") return coverColor.color;
        if (coverColor.type === "gradient") return "Gradient";
        if (coverColor.type === "custom") return "Custom";
        return "";
      }
      
      // Special handler for cake shape with custom shape
      if (fieldKey === "cakeShape") {
        const shape = order.cakeShape;
        const customShape = order.customShape;
        if (shape === "Custom" && customShape) {
          return `${shape} (${customShape})`;
        }
        return shape || "";
      }
      
      // Special handler for packing items
      if (fieldKey === "packingItems") {
        const packingItems = order.packingItems;
        if (!packingItems || packingItems.length === 0) return "";
        
        const checkedItems = packingItems.filter(item => item.checked);
        if (checkedItems.length === 0) return "";
        
        return checkedItems.map(item => item.name).join(", ");
      }
      
      // Get value from order object using lodash get for nested paths
      const value = get(order, fieldKey);
      
      // Format dates
      if (fieldKey.includes("Date") && value instanceof Date) {
        return formatDate(value);
      }
      
      // Format prices
      if ((fieldKey.includes("Price") || fieldKey === "totalPrice") && typeof value === 'number') {
        return formatCurrency(value);
      }
      
      // Important: Convert all values to string to avoid rendering objects directly
      if (value instanceof Date) {
        return formatDate(value);
      }
      
      if (value === null || value === undefined) {
        return "";
      }
      
      if (typeof value === 'object') {
        return JSON.stringify(value);
      }
      
      return value.toString();
    };

    // Render a single field with styling
    const renderField = (field: PrintField): React.ReactNode => {
      if (!field.enabled) return null;
      
      // Determine text styling classes based on field properties
      const textClasses = cn(
        field.fontSize ? `text-${field.fontSize}` : "text-sm",
        field.fontWeight ? `font-${field.fontWeight}` : "",
        field.fontStyle === "italic" ? "italic" : ""
      );
      
      switch (field.type) {
        case 'section-title':
          return (
            <h3 className={cn("font-semibold", textClasses)}>
              {field.label || field.value}
            </h3>
          );
          
        case 'text':
          return <p className={textClasses}>{field.value}</p>;
          
        case 'field': {
          const value = getFieldValue(field.fieldKey);
          if (!value && !isPreviewing) return null;
          
          return (
            <div className="grid grid-cols-2 gap-1 items-start">
              <div className={cn("font-medium", textClasses)}>{field.label}:</div>
              <div className={textClasses}>
                {isPreviewing && !value ? "(No data)" : value}
              </div>
            </div>
          );
        }
          
        case 'separator':
          return <hr className="my-2 border-gray-200" />;
          
        case 'spacer':
          return <div className="h-4" />;
          
        case 'qr-code': {
          const value = getFieldValue(field.fieldKey);
          if (!value && !isPreviewing) return null;
          
          const size = field.size || 100; // Default size if not specified
          
          return (
            <div className="flex flex-col items-center gap-1 mt-2 mb-2">
              {field.label && <div className={cn("font-medium", textClasses)}>{field.label}</div>}
              <div className="border p-2 bg-white inline-block">
                {isPreviewing && !value ? 
                  <div className="w-[100px] h-[100px] bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                    QR Preview
                  </div> :
                  <QRCodeSVG 
                    value={value.toString()} 
                    size={size} 
                    level="M" // QR Code error correction level 
                  />
                }
              </div>
            </div>
          );
        }
          
        default:
          return null;
      }
    };

    // Render a section
    const renderSection = (section: PrintSection): React.ReactNode => {
      if (!section.enabled) return null;
      
      const enabledFields = section.fields.filter(f => f.enabled);
      if (enabledFields.length === 0) return null;
      
      return (
        <div key={section.id} className="mb-4">
          <h2 className="text-lg font-semibold border-b pb-1 mb-2">{section.title}</h2>
          <div className="space-y-2">
            {enabledFields
              .sort((a, b) => a.order - b.order)
              .map((field, index) => (
                <div key={field.id}>{renderField(field)}</div>
              ))}
          </div>
        </div>
      );
    };

    // Fixed header with QR code at top right
    const renderFixedHeader = () => {
      const orderId = order.id || (isPreviewing ? "05-25-001" : "");
      
      return (
        <div className="flex justify-between items-start mb-4 border-b pb-3">
          <div className="text-left">
            <h1 className="text-2xl font-bold">Cake Order Form</h1>
            {orderId && (
              <p className="text-sm text-muted-foreground">Order #{orderId}</p>
            )}
          </div>
          
          <div className="flex flex-col items-end">
            <QRCodeSVG 
              value={orderId} 
              size={80} 
              level="M"
              className="border p-1 bg-white"
            />
            <p className="text-xs text-center mt-1">Order QR</p>
          </div>
        </div>
      );
    };

    return (
      <div 
        ref={ref}
        className="print-container bg-white p-8 shadow-lg overflow-auto"
        style={{ 
          width: template.orientation === 'landscape' ? '210mm' : '148mm', 
          height: template.orientation === 'landscape' ? '148mm' : '210mm',
          margin: '0 auto',
          boxSizing: 'border-box'
        }}
      >
        {/* Fixed header with title and QR */}
        {renderFixedHeader()}
        
        {/* Custom sections */}
        <div className="space-y-4">
          {template.sections
            .filter(section => section.enabled)
            .sort((a, b) => a.order - b.order)
            .map(renderSection)}
        </div>
        
        <div className="text-center text-xs text-gray-500 mt-6 pt-2 border-t">
          <p>Printed on {formatDate(new Date())}</p>
        </div>
      </div>
    );
  }
);

PrintTemplateRenderer.displayName = "PrintTemplateRenderer";

export default PrintTemplateRenderer;
