import { useState, useEffect } from "react";
import { ColorSettingItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { dataService } from "@/services";
import SettingItemForm from "./SettingItemForm";
import { toast } from "@/components/ui/sonner";
import { Plus } from "lucide-react";

const ColorsSettings = () => {
  const [items, setItems] = useState<ColorSettingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const settings = await dataService.settings.getAll();
        setItems(settings.colors);
      } catch (error) {
        console.error("Failed to load colors settings", error);
        toast.error("Failed to load colors settings");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSave = async (item: ColorSettingItem) => {
    try {
      const updatedItems = items.map(i => 
        i.id === item.id ? item : i
      );
      
      await dataService.settings.updateColors(updatedItems);
      setItems(updatedItems);
      toast.success("Color updated successfully");
    } catch (error) {
      console.error("Failed to update color", error);
      toast.error("Failed to update color");
    }
  };

  const handleAddNew = () => {
    const newItem: ColorSettingItem = {
      id: `new_${Date.now()}`,
      name: "",
      value: "#FFFFFF", // Default to white
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
      await dataService.settings.updateColors(updatedItems);
      setItems(updatedItems);
      toast.success("Color deleted successfully");
    } catch (error) {
      console.error("Failed to delete color", error);
      toast.error("Failed to delete color");
    }
  };

  return (
    <TabsContent value="colors">
      <Card>
        <CardHeader>
          <CardTitle>Colors</CardTitle>
          <CardDescription>
            Manage available colors for cake decorations.
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
                    isColor
                  />
                ))}
              </div>
              
              <Button 
                onClick={handleAddNew} 
                variant="outline"
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" /> Add New Color
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
};

export default ColorsSettings;
