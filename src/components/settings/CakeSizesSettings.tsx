import { useState, useEffect } from "react";
import { SettingItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { dataService } from "@/services";
import SettingItemForm from "./SettingItemForm";
import { toast } from "@/components/ui/sonner";
import { Plus } from "lucide-react";

const CakeSizesSettings = () => {
  const [items, setItems] = useState<SettingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const settings = await dataService.settings.getAll();
        setItems(settings.cakeSizes);
      } catch (error) {
        console.error("Failed to load cake sizes settings", error);
        toast.error("Failed to load cake sizes settings");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSave = async (item: SettingItem) => {
    try {
      const updatedItems = items.map(i => 
        i.id === item.id ? item : i
      );
      
      await dataService.settings.updateCakeSizes(updatedItems);
      setItems(updatedItems);
      toast.success("Cake size updated successfully");
    } catch (error) {
      console.error("Failed to update cake size", error);
      toast.error("Failed to update cake size");
    }
  };

  const handleAddNew = () => {
    const newItem: SettingItem = {
      id: `new_${Date.now()}`,
      name: "",
      value: "",
      enabled: true,
      createdAt: new Date()
    };
    
    setItems([...items, newItem]);
  };

  const handleDelete = async (id: string) => {
    try {
      // If it's a new unsaved item, just remove it from state
      if (id.startsWith("new_")) {
        setItems(items.filter(item => item.id !== id));
        return;
      }
      
      // Otherwise update in the repository
      const updatedItems = items.filter(item => item.id !== id);
      await dataService.settings.updateCakeSizes(updatedItems);
      setItems(updatedItems);
      toast.success("Cake size deleted successfully");
    } catch (error) {
      console.error("Failed to delete cake size", error);
      toast.error("Failed to delete cake size");
    }
  };

  return (
    <TabsContent value="cake-sizes">
      <Card>
        <CardHeader>
          <CardTitle>Cake Sizes</CardTitle>
          <CardDescription>
            Manage available cake sizes for orders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                {items.map(item => (
                  <SettingItemForm
                    key={item.id}
                    item={item}
                    onSave={handleSave}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
              
              <Button 
                onClick={handleAddNew} 
                variant="outline"
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" /> Add New Size
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
};

export default CakeSizesSettings;
