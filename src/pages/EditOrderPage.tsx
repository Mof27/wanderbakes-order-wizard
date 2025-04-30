
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import OrderForm from "@/components/orders/OrderForm";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { dataService } from "@/services";
import { SettingsData } from "@/types";
import OrderPrintButton from "@/components/orders/OrderPrintButton";

const EditOrderPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getOrderById } = useApp();
  const [order, setOrder] = useState(id ? getOrderById(id) : null);
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settingsData = await dataService.settings.getAll();
        setSettings(settingsData);
      } catch (error) {
        console.error("Failed to load settings", error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  if (!order) {
    return (
      <div>
        <Button variant="outline" onClick={() => navigate("/orders")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
        <p>Order not found</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Edit Order</h1>
          <Button variant="outline" onClick={() => navigate("/orders")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        </div>
        <Skeleton className="w-full h-[600px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Edit Order | Cake Shop</title>
      </Helmet>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Edit Order #{order.id}</h1>
        <div className="flex gap-2">
          <OrderPrintButton order={order} />
          <Button variant="outline" onClick={() => navigate("/orders")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        </div>
      </div>
      <OrderForm order={order} settings={settings} />
    </div>
  );
};

export default EditOrderPage;
