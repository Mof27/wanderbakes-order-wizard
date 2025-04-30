
import { useParams } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import OrderForm from "@/components/orders/OrderForm";
import { useEffect, useState } from "react";
import { Order, SettingsData } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { dataService } from "@/services";

const EditOrderPage = () => {
  const { id } = useParams<{ id: string }>();
  const { orders } = useApp();
  const [order, setOrder] = useState<Order | undefined>(undefined);
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load settings
        const settingsData = await dataService.settings.getAll();
        setSettings(settingsData);
        
        // Find order
        const foundOrder = orders.find((o) => o.id === id);
        setOrder(foundOrder);
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, orders]);

  if (loading || !settings) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold mb-6">Edit Order</h1>
        <Skeleton className="w-full h-[600px]" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold mb-6">Edit Order</h1>
        <div className="p-4 border border-red-300 bg-red-50 text-red-700 rounded-md">
          Order not found
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-6">Edit Order #{order.id}</h1>
      <OrderForm order={order} settings={settings} />
    </div>
  );
};

export default EditOrderPage;
