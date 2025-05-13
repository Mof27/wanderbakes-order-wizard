
import React, { forwardRef } from "react";
import { DeliveryLabelTemplate, Order, DeliveryLabelSection, DeliveryLabelField } from "@/types";
import { formatCurrency, formatDate, formatTimeSlot } from "@/lib/utils";
import { get } from "lodash";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";

interface DeliveryLabelTemplateRendererProps {
  template: DeliveryLabelTemplate;
  order: Partial<Order>;
  isPreviewing?: boolean;
}

const DeliveryLabelTemplateRenderer = forwardRef<HTMLDivElement, DeliveryLabelTemplateRendererProps>(
  ({ template, order, isPreviewing = false }, ref) => {
    // Get nested properties safely
    const getFieldValue = (fieldKey?: string): string | number | React.ReactNode => {
      if (!fieldKey) return "";
      
      // Special handler for order URL (for QR code)
      if (fieldKey === "orderUrl") {
        // Generate a complete URL that can be directly opened when scanned
        const orderId = order.id || (isPreviewing ? "05-25-001" : "");
        // Use window.location to get the base URL of the app
        const baseUrl = typeof window !== 'undefined' ? 
          `${window.location.protocol}//${window.location.host}` : 
          'https://app.example.com';
        
        return `${baseUrl}/orders?id=${orderId}`;
      }
      
      // Special handler for WhatsApp link
      if (fieldKey === "customer.whatsappLink") {
        const whatsappNumber = get(order, "customer.whatsappNumber");
        if (!whatsappNumber && !isPreviewing) return "";
        
        const number = whatsappNumber || (isPreviewing ? "628123456789" : "");
        const cleanNumber = number.replace(/[^0-9]/g, "");
        return `https://wa.me/${cleanNumber}`;
      }
      
      // Get value from order object using lodash get for nested paths
      const value = get(order, fieldKey);
      
      // Format dates
      if (fieldKey.includes("Date") && value instanceof Date) {
        return formatDate(value);
      }
      
      // Format prices
      if (fieldKey.includes("Price") && typeof value === 'number') {
        return formatCurrency(value);
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
    
    // Helper to generate text alignment classes
    const getAlignmentClass = (alignment?: string) => {
      switch (alignment) {
        case 'left': return 'text-left';
        case 'center': return 'text-center';
        case 'right': return 'text-right';
        default: return 'text-left';
      }
    };

    return (
      <div 
        ref={ref}
        className="bg-white p-6 shadow-lg"
        style={{ 
          width: '4in', 
          height: '6in',
          boxSizing: 'border-box'
        }}
      >
        <div className="space-y-4">
          {template.sections
            .filter(section => section.enabled)
            .sort((a, b) => a.order - b.order)
            .map(section => {
              if (!section.enabled) return null;
              
              const enabledFields = section.fields.filter(f => f.enabled);
              if (enabledFields.length === 0) return null;
              
              return (
                <div key={section.id} className="mb-4">
                  <h2 className="text-lg font-semibold border-b pb-1 mb-2">{section.title}</h2>
                  <div className="space-y-2">
                    {enabledFields
                      .sort((a, b) => a.order - b.order)
                      .map(field => {
                        if (!field.enabled) return null;
                        
                        // Determine text styling classes based on field properties
                        const textClasses = cn(
                          field.fontSize ? `text-${field.fontSize}` : "text-sm",
                          field.fontWeight ? `font-${field.fontWeight}` : "",
                          field.fontStyle === "italic" ? "italic" : "",
                          getAlignmentClass(field.alignment)
                        );
                        
                        switch (field.type) {
                          case 'section-title':
                            return (
                              <h3 
                                key={field.id} 
                                className={cn("font-semibold", textClasses)}
                              >
                                {field.label || field.value}
                              </h3>
                            );
                            
                          case 'text':
                            return (
                              <p key={field.id} className={textClasses}>
                                {field.value}
                              </p>
                            );
                            
                          case 'field': {
                            const value = getFieldValue(field.fieldKey);
                            if (!value && !isPreviewing) return null;
                            
                            return (
                              <div key={field.id} className={`grid ${field.alignment === 'center' ? 'grid-cols-1 gap-1' : 'grid-cols-2 gap-1'} items-start`}>
                                <div className={cn("font-medium", textClasses, field.alignment === 'center' && "col-span-1")}>
                                  {field.label}:
                                </div>
                                <div className={cn(textClasses, field.alignment === 'center' && "col-span-1")}>
                                  {isPreviewing && !value ? "(No data)" : value}
                                </div>
                              </div>
                            );
                          }
                            
                          case 'separator':
                            return <hr key={field.id} className="my-2 border-gray-200" />;
                            
                          case 'spacer':
                            return <div key={field.id} style={{ height: field.height || '1rem' }} />;
                            
                          case 'qr-code': {
                            const value = getFieldValue(field.fieldKey);
                            if (!value && !isPreviewing) return null;
                            
                            const size = field.size || 100; // Default size if not specified
                            
                            return (
                              <div 
                                key={field.id} 
                                className={cn(
                                  "flex flex-col items-center gap-1 mt-2 mb-2", 
                                  getAlignmentClass(field.alignment)
                                )}
                              >
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
                                {field.fieldKey === "orderUrl" && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Scan with any camera app
                                  </div>
                                )}
                              </div>
                            );
                          }
                            
                          default:
                            return null;
                        }
                      })}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    );
  }
);

DeliveryLabelTemplateRenderer.displayName = "DeliveryLabelTemplateRenderer";

export default DeliveryLabelTemplateRenderer;
