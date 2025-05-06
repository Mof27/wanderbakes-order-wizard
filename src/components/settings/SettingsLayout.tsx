
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReactNode, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface SettingsLayoutProps {
  children: ReactNode;
  defaultTab?: string;
  onTabChange?: (tab: string) => void;
  activeTab?: string;
}

const SettingsLayout = ({ 
  children, 
  defaultTab = "cake-sizes",
  onTabChange,
  activeTab
}: SettingsLayoutProps) => {
  const { category } = useParams<{ category: string }>();
  const [selectedTab, setSelectedTab] = useState<string>(activeTab || getCategoryDefaultTab());
  
  // Get category-specific default tab
  function getCategoryDefaultTab() {
    switch (category) {
      case "cake-properties":
        return "cake-sizes";
      case "printing-templates":
        return "print-form";
      case "delivery-settings":
        return "driver-settings";
      default:
        return defaultTab;
    }
  }

  // Update the tab when the category changes
  useEffect(() => {
    const newDefaultTab = getCategoryDefaultTab();
    setSelectedTab(newDefaultTab);
    if (onTabChange) {
      onTabChange(newDefaultTab);
    }
  }, [category]);

  const handleTabChange = (value: string) => {
    setSelectedTab(value);
    if (onTabChange) {
      onTabChange(value);
    }
  };

  // Determine which tabs to show based on the category
  const renderTabs = () => {
    switch (category) {
      case "cake-properties":
        return (
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="cake-sizes">Cake Sizes</TabsTrigger>
            <TabsTrigger value="cake-shapes">Cake Shapes</TabsTrigger>
            <TabsTrigger value="cake-flavors">Cake Flavors</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
          </TabsList>
        );
      case "printing-templates":
        return (
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="print-form">Print Form</TabsTrigger>
            <TabsTrigger value="delivery-label">Delivery Label</TabsTrigger>
          </TabsList>
        );
      case "delivery-settings":
        return (
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="driver-settings">Driver Names</TabsTrigger>
          </TabsList>
        );
      default:
        return (
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="cake-sizes">Cake Sizes</TabsTrigger>
            <TabsTrigger value="cake-shapes">Cake Shapes</TabsTrigger>
            <TabsTrigger value="cake-flavors">Cake Flavors</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="print-form">Print Form</TabsTrigger>
            <TabsTrigger value="delivery-label">Delivery Label</TabsTrigger>
            <TabsTrigger value="driver-settings">Driver Names</TabsTrigger>
          </TabsList>
        );
    }
  };

  return (
    <div className="space-y-6">
      <Tabs 
        value={selectedTab} 
        onValueChange={handleTabChange}
        className="w-full"
      >
        {renderTabs()}
        
        {children}
      </Tabs>
    </div>
  );
};

export default SettingsLayout;
