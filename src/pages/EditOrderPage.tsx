
import { useParams } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import OrderForm from "@/components/orders/OrderForm";
import { useEffect, useState } from "react";
import { Order } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

const EditOrderPage = () => {
  const { id } = useParams<{ id: string }>();
  const { orders } = useApp();
  const [order, setOrder] = useState<Order | undefined>(undefined);

  useEffect(() => {
    const foundOrder = orders.find((o) => o.id === id);
    setOrder(foundOrder);
  }, [id, orders]);

  if (!order) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold mb-6">Edit Order</h1>
        <Skeleton className="w-full h-[600px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-6">Edit Order #{order.id}</h1>
      <OrderForm order={order} />
    </div>
  );
};

export default EditOrderPage;
