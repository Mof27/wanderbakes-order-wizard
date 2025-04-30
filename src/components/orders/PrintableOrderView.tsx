
import { Order } from "@/types";
import { formatCurrency, formatDate, formatTimeSlot } from "@/lib/utils";
import { forwardRef } from "react";

interface PrintableOrderViewProps {
  order: Partial<Order>;
}

const PrintableOrderView = forwardRef<HTMLDivElement, PrintableOrderViewProps>(({ order }, ref) => {
  if (!order) return null;

  // Get the time slot display value
  const getTimeDisplay = () => {
    if (!order.deliveryTimeSlot) return "";
    return order.deliveryTimeSlot.startsWith("slot") 
      ? formatTimeSlot(order.deliveryTimeSlot)
      : order.deliveryTimeSlot;
  };

  return (
    <div 
      ref={ref}
      className="print-container bg-white p-8"
      style={{ width: "148mm", minHeight: "210mm", margin: "0 auto" }}
    >
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Cake Order Form</h1>
        <p className="text-sm text-muted-foreground">Order #{order.id}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold border-b pb-1 mb-2">Customer Details</h2>
        {order.customer && (
          <div className="grid grid-cols-2 gap-2">
            <div className="text-sm">
              <span className="font-medium">Name:</span>
            </div>
            <div className="text-sm">{order.customer.name}</div>
            
            <div className="text-sm">
              <span className="font-medium">WhatsApp:</span>
            </div>
            <div className="text-sm">{order.customer.whatsappNumber}</div>
            
            {order.customer.email && (
              <>
                <div className="text-sm">
                  <span className="font-medium">Email:</span>
                </div>
                <div className="text-sm">{order.customer.email}</div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold border-b pb-1 mb-2">Order Information</h2>
        <div className="grid grid-cols-2 gap-2">
          <div className="text-sm">
            <span className="font-medium">Order Date:</span>
          </div>
          <div className="text-sm">
            {order.orderDate ? formatDate(order.orderDate) : "-"}
          </div>
          
          <div className="text-sm">
            <span className="font-medium">Delivery Date:</span>
          </div>
          <div className="text-sm">
            {order.deliveryDate ? formatDate(order.deliveryDate) : "-"}
          </div>
          
          <div className="text-sm">
            <span className="font-medium">Delivery Time:</span>
          </div>
          <div className="text-sm">{getTimeDisplay()}</div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold border-b pb-1 mb-2">Cake Details</h2>
        <div className="grid grid-cols-2 gap-2">
          <div className="text-sm">
            <span className="font-medium">Cake Flavor:</span>
          </div>
          <div className="text-sm">{order.cakeFlavor}</div>
          
          <div className="text-sm">
            <span className="font-medium">Cake Size:</span>
          </div>
          <div className="text-sm">{order.cakeSize}</div>
          
          <div className="text-sm">
            <span className="font-medium">Cake Shape:</span>
          </div>
          <div className="text-sm">
            {order.cakeShape}
            {order.cakeShape === "Custom" && order.customShape && ` (${order.customShape})`}
          </div>
          
          <div className="text-sm">
            <span className="font-medium">Number of Tiers:</span>
          </div>
          <div className="text-sm">{order.cakeTier}</div>
          
          <div className="text-sm">
            <span className="font-medium">Cover Type:</span>
          </div>
          <div className="text-sm">{order.coverType}</div>
          
          <div className="text-sm">
            <span className="font-medium">Cover Color:</span>
          </div>
          <div className="text-sm">
            {order.coverColor?.type === 'solid' && order.coverColor.color}
            {order.coverColor?.type === 'gradient' && 'Gradient'}
            {order.coverColor?.type === 'custom' && 'Custom'}
          </div>
          
          <div className="text-sm">
            <span className="font-medium">Cake Design:</span>
          </div>
          <div className="text-sm">{order.cakeDesign || "-"}</div>
          
          {order.cakeText && (
            <>
              <div className="text-sm">
                <span className="font-medium">Cake Text:</span>
              </div>
              <div className="text-sm">{order.cakeText}</div>
            </>
          )}
        </div>
      </div>

      {/* Only show tier details for multi-tier cakes */}
      {order.cakeTier && order.cakeTier > 1 && order.tierDetails && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold border-b pb-1 mb-2">Tier Details</h2>
          {order.tierDetails.map((tier, index) => (
            <div key={index} className="mb-3">
              <h3 className="font-medium">Tier {tier.tier}</h3>
              <div className="grid grid-cols-2 gap-2 pl-2">
                <div className="text-sm">
                  <span className="font-medium">Shape:</span>
                </div>
                <div className="text-sm">
                  {tier.shape}
                  {tier.shape === "Custom" && tier.customShape && ` (${tier.customShape})`}
                </div>
                
                <div className="text-sm">
                  <span className="font-medium">Size:</span>
                </div>
                <div className="text-sm">{tier.size}</div>
                
                <div className="text-sm">
                  <span className="font-medium">Height:</span>
                </div>
                <div className="text-sm">{tier.height}</div>
                
                <div className="text-sm">
                  <span className="font-medium">Flavor:</span>
                </div>
                <div className="text-sm">{tier.flavor}</div>
                
                <div className="text-sm">
                  <span className="font-medium">Cover:</span>
                </div>
                <div className="text-sm">{tier.coverType}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-lg font-semibold border-b pb-1 mb-2">Delivery Details</h2>
        <div className="grid grid-cols-2 gap-2">
          <div className="text-sm">
            <span className="font-medium">Delivery Method:</span>
          </div>
          <div className="text-sm">
            {order.deliveryMethod === "flat-rate" && "Flat Rate"}
            {order.deliveryMethod === "lalamove" && "Lalamove"}
            {order.deliveryMethod === "self-pickup" && "Self-Pickup"}
          </div>
          
          <div className="text-sm">
            <span className="font-medium">Address:</span>
          </div>
          <div className="text-sm">{order.deliveryAddress}</div>
          
          <div className="text-sm">
            <span className="font-medium">Area:</span>
          </div>
          <div className="text-sm">{order.deliveryArea}</div>
          
          {order.deliveryAddressNotes && (
            <>
              <div className="text-sm">
                <span className="font-medium">Delivery Notes:</span>
              </div>
              <div className="text-sm">{order.deliveryAddressNotes}</div>
            </>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold border-b pb-1 mb-2">Pricing</h2>
        <div className="grid grid-cols-2 gap-2">
          <div className="text-sm">
            <span className="font-medium">Cake Price:</span>
          </div>
          <div className="text-sm">{formatCurrency(order.cakePrice || 0)}</div>
          
          <div className="text-sm">
            <span className="font-medium">Delivery Price:</span>
          </div>
          <div className="text-sm">{formatCurrency(order.deliveryPrice || 0)}</div>
          
          <div className="text-sm font-medium">
            <span className="font-bold">Total Price:</span>
          </div>
          <div className="text-sm font-bold">
            {formatCurrency((order.cakePrice || 0) + (order.deliveryPrice || 0))}
          </div>
        </div>
      </div>

      {order.notes && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold border-b pb-1 mb-2">Additional Notes</h2>
          <div className="text-sm whitespace-pre-line">{order.notes}</div>
        </div>
      )}

      {order.packingItems && order.packingItems.some(item => item.checked) && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold border-b pb-1 mb-2">Packing Items</h2>
          <ul className="list-disc pl-5">
            {order.packingItems
              .filter(item => item.checked)
              .map((item, index) => (
                <li key={index} className="text-sm">{item.name}</li>
              ))
            }
          </ul>
        </div>
      )}
      
      <div className="text-center text-xs text-gray-500 mt-8 pt-4 border-t">
        <p>Printed on {formatDate(new Date())}</p>
      </div>
    </div>
  );
});

PrintableOrderView.displayName = "PrintableOrderView";

export default PrintableOrderView;
