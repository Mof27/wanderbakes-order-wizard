
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
      <OrderList />
    </div>
  );
};

export default OrdersPage;
