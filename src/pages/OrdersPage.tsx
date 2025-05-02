
import OrderList from "@/components/orders/OrderList";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { toast } from "@/components/ui/sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const OrdersPage = () => {
  const { setSearchQuery, orders, getOrderById } = useApp();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const idFromQR = searchParams.get("id");
  const [showQrAlert, setShowQrAlert] = useState(false);
  const [orderFound, setOrderFound] = useState<boolean | null>(null);

  // If there's an ID in the URL (e.g., from scanning a QR code), set it as search query
  useEffect(() => {
    if (idFromQR) {
      setSearchQuery(idFromQR);
      
      // Check if order exists
      const orderExists = getOrderById(idFromQR);
      setOrderFound(!!orderExists);
      setShowQrAlert(true);
      
      if (!orderExists) {
        toast.error(`Order with ID ${idFromQR} not found`);
      }
    }
  }, [idFromQR, setSearchQuery, getOrderById]);

  const handleClearQrSearch = () => {
    setShowQrAlert(false);
    setSearchQuery("");
    navigate("/orders");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Orders</h1>
      
      {showQrAlert && (
        <Alert 
          className={`border ${orderFound ? 'border-green-600 bg-green-50' : 'border-red-600 bg-red-50'}`}
        >
          <div className="flex justify-between items-center">
            <AlertDescription className="flex items-center">
              {orderFound ? (
                <>
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  <span>Order <strong>{idFromQR}</strong> found from QR scan</span>
                </>
              ) : (
                <>
                  <X className="h-4 w-4 text-red-600 mr-2" />
                  <span>Order <strong>{idFromQR}</strong> not found from QR scan</span>
                </>
              )}
            </AlertDescription>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClearQrSearch}
              className="ml-2"
            >
              Clear search
            </Button>
          </div>
        </Alert>
      )}
      
      <p className="text-muted-foreground mb-4">
        Order IDs now show month and year (MM-YY-XXX format) to easily track when orders were placed.
        Scan the QR code on order forms to quickly find orders.
      </p>
      <OrderList />
    </div>
  );
};

export default OrdersPage;
