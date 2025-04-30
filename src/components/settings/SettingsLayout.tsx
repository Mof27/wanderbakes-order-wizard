
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReactNode } from "react";
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
      default:
        return (
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="cake-sizes">Cake Sizes</TabsTrigger>
            <TabsTrigger value="cake-shapes">Cake Shapes</TabsTrigger>
            <TabsTrigger value="cake-flavors">Cake Flavors</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="print-form">Print Form</TabsTrigger>
            <TabsTrigger value="delivery-label">Delivery Label</TabsTrigger>
          </TabsList>
        );
    }
  };
  
  // Get category-specific default tab
  const getCategoryDefaultTab = () => {
    switch (category) {
      case "cake-properties":
        return "cake-sizes";
      case "printing-templates":
        return "print-form";
      default:
        return defaultTab;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs 
        defaultValue={getCategoryDefaultTab()} 
        value={activeTab}
        onValueChange={onTabChange}
        className="w-full"
      >
        {renderTabs()}
        
        {children}
      </Tabs>
    </div>
  );
};

export default SettingsLayout;
