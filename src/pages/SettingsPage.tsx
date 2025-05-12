
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Routes, Route, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { dataService } from "@/services";
import { CakeIcon, Palette, Printer, Truck } from "lucide-react";

// Category Dashboard Components
import SettingsCategoryCard from "@/components/settings/SettingsCategoryCard";

// Detail Views
import SettingsDetailView from "@/components/settings/SettingsDetailView";
import CakeSizesSettings from "@/components/settings/CakeSizesSettings";
import CakeShapesSettings from "@/components/settings/CakeShapesSettings";
import CakeFlavorsSettings from "@/components/settings/CakeFlavorsSettings";
import ColorsSettings from "@/components/settings/ColorsSettings";
import PrintSettings from "@/components/settings/PrintSettings";
import DeliveryLabelSettings from "@/components/settings/DeliveryLabelSettings";
import DeliverySettings from "@/components/settings/DeliverySettings";

// Template Sandbox
import TemplateSandbox from "@/components/settings/template-sandbox/TemplateSandbox";

const SettingsDashboard = () => {
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => dataService.settings.getAll()
  });
  
  const cakePropertiesCount = settings ? 
    settings.cakeSizes.length + 
    settings.cakeShapes.length + 
    settings.cakeFlavors.length + 
    settings.colors.length : 0;
    
  const printTemplatesCount = settings ? 2 : 0; // Print form and delivery label
  const deliverySettingsCount = settings ? 1 : 0; // Driver settings

  return (
    <>
      <Helmet>
        <title>Settings | Cake Shop</title>
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SettingsCategoryCard 
            title="Cake Properties" 
            description="Manage cake sizes, shapes, flavors, and colors"
            icon={<CakeIcon className="h-5 w-5" />}
            category="cake-properties"
            itemCount={cakePropertiesCount}
          />
          
          <SettingsCategoryCard 
            title="Printing & Templates" 
            description="Configure order forms and delivery labels"
            icon={<Printer className="h-5 w-5" />}
            category="printing-templates"
            itemCount={printTemplatesCount}
          />
          
          <SettingsCategoryCard 
            title="Delivery Settings" 
            description="Configure driver names and delivery options"
            icon={<Truck className="h-5 w-5" />}
            category="delivery-settings"
            itemCount={deliverySettingsCount}
          />
        </div>
      </div>
    </>
  );
};

const SettingsPage = () => {
  const location = useLocation();
  
  // On the main settings page, render the dashboard
  if (location.pathname === "/settings") {
    return <SettingsDashboard />;
  }

  return (
    <Routes>
      <Route path="/" element={<SettingsDashboard />} />
      
      <Route path="/cake-properties" element={
        <SettingsDetailView>
          <CakeSizesSettings />
          <CakeShapesSettings />
          <CakeFlavorsSettings />
          <ColorsSettings />
        </SettingsDetailView>
      } />
      
      <Route path="/printing-templates" element={
        <SettingsDetailView>
          <PrintSettings />
          <DeliveryLabelSettings />
        </SettingsDetailView>
      } />
      
      <Route path="/delivery-settings" element={
        <SettingsDetailView>
          <DeliverySettings />
        </SettingsDetailView>
      } />
      
      {/* Template Sandbox Routes */}
      <Route path="/template-sandbox/:templateType" element={<TemplateSandbox />} />
    </Routes>
  );
};

export default SettingsPage;
