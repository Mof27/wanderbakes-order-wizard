
import React, { forwardRef, useEffect } from "react";
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

export const DeliveryLabelTemplateRenderer = forwardRef<HTMLDivElement, DeliveryLabelTemplateRendererProps>(
  ({ template, order, isPreviewing = false }, ref) => {
    useEffect(() => {
      console.log("DeliveryLabelTemplateRenderer mounted", { 
        hasTemplate: !!template, 
        templateSections: template?.sections?.length,
        hasOrder: !!order,
        isPreviewing
      });
      
      return () => {
        console.log("DeliveryLabelTemplateRenderer unmounted");
      };
    }, [template, order, isPreviewing]);
    
    // Get nested properties safely
    const getFieldValue = (fieldKey?: string): string | number | React.ReactNode => {
      if (!fieldKey) return "";
      
      // Special handler for order URL (for QR code)
      if (fieldKey === "orderUrl") {
        const orderId = order.id;
        if (!orderId && !isPreviewing) return "";
        // Create an absolute URL to the order edit page
        const baseUrl = window.location.origin;
        return `${baseUrl}/orders/${orderId}/edit`;
      }
      
      // Special handler for customer phone with WhatsApp deep link
      if (fieldKey === "customer.whatsappLink") {
        const phone = order.customer?.whatsappNumber;
        if (!phone) return "";
        // Format number for WhatsApp (remove spaces, add + if needed)
        const formattedPhone = phone.replace(/\s+/g, '');
        return `https://wa.me/${formattedPhone.startsWith('+') ? formattedPhone.substring(1) : formattedPhone}`;
      }
      
      // Get value from order object using lodash get for nested paths
      const value = get(order, fieldKey);
      
      // Handle special cases
      if (fieldKey.includes("Date") && value instanceof Date) {
        return formatDate(value);
      }
      
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
    const renderField = (field: DeliveryLabelField): React.ReactNode => {
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
          
          const size = field.size || 100;
          
          return (
            <div className="flex flex-col items-center gap-1 my-2">
              {field.label && <div className={cn("font-medium", textClasses)}>{field.label}</div>}
              <div className="border p-2 bg-white inline-block">
                {isPreviewing && !value ? 
                  <div className="w-[100px] h-[100px] bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                    QR Preview
                  </div> :
                  <QRCodeSVG 
                    value={value.toString()} 
                    size={size} 
                    level="M"
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
    const renderSection = (section: DeliveryLabelSection): React.ReactNode => {
      if (!section.enabled) return null;
      
      const enabledFields = section.fields.filter(f => f.enabled);
      if (enabledFields.length === 0) return null;
      
      return (
        <div key={section.id} className="mb-3">
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

    // Fixed header for delivery label
    const renderHeader = () => {
      return (
        <div className="text-center mb-4 border-b pb-2">
          <h1 className="text-xl font-bold">{template.title}</h1>
          {order.id && (
            <p className="text-sm text-muted-foreground">Order #{order.id}</p>
          )}
        </div>
      );
    };

    return (
      <div 
        ref={ref}
        className="print-delivery-label bg-white p-4 shadow-lg overflow-auto"
        style={{ 
          width: '4in', 
          height: '6in',
          margin: '0 auto',
          boxSizing: 'border-box'
        }}
      >
        {renderHeader()}

        {/* Custom sections */}
        <div className="space-y-3">
          {template.sections
            .filter(section => section.enabled)
            .sort((a, b) => a.order - b.order)
            .map(renderSection)}
        </div>
      </div>
    );
  }
);

DeliveryLabelTemplateRenderer.displayName = "DeliveryLabelTemplateRenderer";

export default DeliveryLabelTemplateRenderer;
