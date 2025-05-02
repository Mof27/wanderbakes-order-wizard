
import OrderList from "@/components/orders/OrderList";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { useApp } from "@/context/AppContext";

const OrdersPage = () => {
  const { setSearchQuery } = useApp();
  const [searchParams] = useSearchParams();
  const idFromQR = searchParams.get("id");

  // If there's an ID in the URL (e.g., from scanning a QR code), set it as search query
  useEffect(() => {
    if (idFromQR) {
      setSearchQuery(idFromQR);
    }
  }, [idFromQR, setSearchQuery]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Orders</h1>
      <p className="text-muted-foreground mb-4">
        Order IDs now show month and year (MM-YY-XXX format) to easily track when orders were placed.
      </p>
      <OrderList />
    </div>
  );
};

export default OrdersPage;
