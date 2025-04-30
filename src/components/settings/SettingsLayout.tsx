
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReactNode } from "react";

interface SettingsLayoutProps {
  children: ReactNode;
  defaultTab?: string;
  onTabChange?: (tab: string) => void;
  activeTab: string;
}

const SettingsLayout = ({ 
  children, 
  defaultTab = "cake-sizes",
  onTabChange,
  activeTab
}: SettingsLayoutProps) => {
  return (
    <div className="space-y-6">
      <Tabs 
        defaultValue={defaultTab} 
        value={activeTab}
        onValueChange={onTabChange}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="cake-sizes">Cake Sizes</TabsTrigger>
          <TabsTrigger value="cake-shapes">Cake Shapes</TabsTrigger>
          <TabsTrigger value="cake-flavors">Cake Flavors</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="print-form">Print Form</TabsTrigger>
          <TabsTrigger value="delivery-label">Delivery Label</TabsTrigger>
        </TabsList>
        
        {children}
      </Tabs>
    </div>
  );
};

export default SettingsLayout;
