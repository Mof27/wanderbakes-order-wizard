
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import SettingsLayout from "@/components/settings/SettingsLayout";
import CakeSizesSettings from "@/components/settings/CakeSizesSettings";
import CakeShapesSettings from "@/components/settings/CakeShapesSettings";
import CakeFlavorsSettings from "@/components/settings/CakeFlavorsSettings";
import ColorsSettings from "@/components/settings/ColorsSettings";
import PrintSettings from "@/components/settings/PrintSettings";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("cake-sizes");

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Settings | Cake Shop</title>
      </Helmet>
      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>
      
      <SettingsLayout activeTab={activeTab} onTabChange={handleTabChange}>
        <CakeSizesSettings />
        <CakeShapesSettings />
        <CakeFlavorsSettings />
        <ColorsSettings />
        <PrintSettings />
      </SettingsLayout>
    </div>
  );
};

export default SettingsPage;
