
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import OrderCard from "./OrderCard";
import OrderTableRow from "./OrderTableRow";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import QrCodeScannerDialog from "./QrCodeScannerDialog";
import { useState } from "react";

const OrderList = () => {
  const { 
    filteredOrders, 
    viewMode,
    setSearchQuery,
  } = useApp();
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);

  const handleScanSuccess = (orderId: string) => {
    if (orderId) {
      setSearchQuery(orderId);
      // Close the scanner dialog (already handled in component)
    }
  };

  return (
    <div className="space-y-4">
      {filteredOrders.length === 0 ? (
        <div className="text-center py-10 border rounded-md bg-gray-50">
          <p className="text-muted-foreground">
            No orders found with current filters
          </p>
        </div>
      ) : (
        <>
          {viewMode === "list" ? (
            <div className="rounded-md border overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr className="text-left">
                    <th className="p-2 font-medium">Order ID</th>
                    <th className="p-2 font-medium">Customer</th>
                    <th className="p-2 font-medium">Status</th>
                    <th className="p-2 font-medium">Delivery Date</th>
                    <th className="p-2 font-medium">Cake</th>
                    <th className="p-2 font-medium">Price</th>
                    <th className="p-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <OrderTableRow key={order.id} order={order} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </>
      )}

      {/* QR Scanner Dialog */}
      <QrCodeScannerDialog
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />
    </div>
  );
};

export default OrderList;
