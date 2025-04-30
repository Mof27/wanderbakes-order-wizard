
import { useState, useEffect } from "react";
import OrderForm from "@/components/orders/OrderForm";
import { Helmet } from "react-helmet-async";
import { dataService } from "@/services";
import { SettingsData } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

const NewOrderPage = () => {
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

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold mb-6">Create New Order</h1>
        <Skeleton className="w-full h-[600px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Create New Order | Cake Shop</title>
      </Helmet>
      <h1 className="text-2xl font-bold mb-6">Create New Order</h1>
      <OrderForm settings={settings} />
    </div>
  );
};

export default NewOrderPage;
