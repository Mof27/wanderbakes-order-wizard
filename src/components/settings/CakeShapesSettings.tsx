import { useState, useEffect } from "react";
import { ShapeSettingItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { dataService } from "@/services";
import SettingItemForm from "./SettingItemForm";
import { toast } from "@/components/ui/sonner";
import { Plus } from "lucide-react";

const CakeShapesSettings = () => {
  const [items, setItems] = useState<ShapeSettingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const settings = await dataService.settings.getAll();
        setItems(settings.cakeShapes);
      } catch (error) {
        console.error("Failed to load cake shapes settings", error);
        toast.error("Failed to load cake shapes settings");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSave = async (item: ShapeSettingItem) => {
    try {
      const updatedItems = items.map(i => 
        i.id === item.id ? item : i
      );
      
      await dataService.settings.updateCakeShapes(updatedItems);
      setItems(updatedItems);
      toast.success("Cake shape updated successfully");
    } catch (error) {
      console.error("Failed to update cake shape", error);
      toast.error("Failed to update cake shape");
    }
  };

  const handleAddNew = () => {
    const newItem: ShapeSettingItem = {
      id: `new_${Date.now()}`,
      name: "",
      value: "",
      enabled: true,
      customFields: false,
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
      await dataService.settings.updateCakeShapes(updatedItems);
      setItems(updatedItems);
      toast.success("Cake shape deleted successfully");
    } catch (error) {
      console.error("Failed to delete cake shape", error);
      toast.error("Failed to delete cake shape");
    }
  };

  return (
    <TabsContent value="cake-shapes">
      <Card>
        <CardHeader>
          <CardTitle>Cake Shapes</CardTitle>
          <CardDescription>
            Manage available cake shapes for orders. Choose whether a shape requires custom fields.
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
                    isShape
                  />
                ))}
              </div>
              
              <Button 
                onClick={handleAddNew} 
                variant="outline"
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" /> Add New Shape
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
};

export default CakeShapesSettings;
