
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
import DeliveryLabelPrintButton from "@/components/orders/DeliveryLabelPrintButton";

const EditOrderPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orders } = useApp();
  const [order, setOrder] = useState(id ? orders.find(o => o.id === id) : null);
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

  // Update order when orders change (in case it was modified elsewhere)
  useEffect(() => {
    if (id) {
      const currentOrder = orders.find(o => o.id === id);
      setOrder(currentOrder || null);
    }
  }, [id, orders]);

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

  const orderPrintCount = order.printHistory?.filter(e => e.type === 'order-form').length || 0;
  const labelPrintCount = order.printHistory?.filter(e => e.type === 'delivery-label').length || 0;

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Edit Order | Cake Shop</title>
      </Helmet>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Edit Order #{order.id}</h1>
        <div className="flex gap-2">
          <OrderPrintButton order={order} />
          <DeliveryLabelPrintButton order={order} />
          <Button variant="outline" onClick={() => navigate("/orders")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        </div>
      </div>
      
      {/* Print history indicator */}
      {(orderPrintCount > 0 || labelPrintCount > 0) && (
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>Print history:</span>
          {orderPrintCount > 0 && (
            <span>Order form: {orderPrintCount} {orderPrintCount === 1 ? 'time' : 'times'}</span>
          )}
          {labelPrintCount > 0 && (
            <span>Delivery label: {labelPrintCount} {labelPrintCount === 1 ? 'time' : 'times'}</span>
          )}
        </div>
      )}
      
      <OrderForm order={order} settings={settings} />
    </div>
  );
};

export default EditOrderPage;
