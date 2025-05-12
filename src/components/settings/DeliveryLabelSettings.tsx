
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DeliveryLabelSection, DeliveryLabelTemplate, DeliveryLabelField, DeliveryLabelFieldType, FontWeight, FontStyle, FontSize } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { dataService } from "@/services";
import { toast } from "@/components/ui/sonner";
import { Pencil, Eye } from "lucide-react";
import DeliveryLabelPreview from "./DeliveryLabelPreview";

const DeliveryLabelSettings = () => {
  const [template, setTemplate] = useState<DeliveryLabelTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("Loading delivery label template settings...");
        const settings = await dataService.settings.getAll();
        console.log("Settings loaded:", settings);
        if (settings && settings.deliveryLabelTemplate) {
          setTemplate(settings.deliveryLabelTemplate);
        } else {
          console.error("Delivery label template not found in settings");
          toast.error("Failed to load delivery label template: Template not found");
        }
      } catch (error) {
        console.error("Failed to load delivery label template settings", error);
        toast.error("Failed to load delivery label template settings");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const openSandbox = () => {
    navigate('/settings/template-sandbox/delivery-label');
  };

  if (loading) {
    return (
      <TabsContent value="delivery-label">
        <Card>
          <CardHeader>
            <CardTitle>Delivery Label Layout</CardTitle>
            <CardDescription>
              Loading delivery label template settings...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <p className="text-muted-foreground">Please wait while we load your template settings...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    );
  }

  if (!template) {
    return (
      <TabsContent value="delivery-label">
        <Card>
          <CardHeader>
            <CardTitle>Delivery Label Layout</CardTitle>
            <CardDescription>
              Failed to load template settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center gap-4 p-8">
              <p className="text-muted-foreground">We couldn't load your delivery label template settings.</p>
              <Button onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    );
  }

  return (
    <TabsContent value="delivery-label">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>Delivery Label Layout</CardTitle>
            <CardDescription>
              Customize how your delivery labels print (4x6 inches)
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewOpen(true)}
            >
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button
              size="sm"
              onClick={openSandbox}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Open Visual Editor
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-base font-medium">Template Information</h3>
              <p className="text-sm text-muted-foreground">
                The delivery label template controls how your shipping labels print. Use the visual editor for an
                intuitive drag-and-drop experience to create professional delivery labels.
              </p>
            </div>
            
            <div className="border rounded-md p-4 bg-muted/30">
              <h4 className="text-sm font-medium mb-2">Available Features in Visual Editor</h4>
              <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                <li>Drag and drop elements to create your layout</li>
                <li>Preview your design with sample data</li>
                <li>Save multiple template versions</li>
                <li>Fine-tune positioning, fonts, and sizes</li>
                <li>Test print from the editor</li>
              </ul>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={openSandbox}>
                Open Visual Editor
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {template && (
        <DeliveryLabelPreview
          template={template}
          open={previewOpen}
          onOpenChange={setPreviewOpen}
        />
      )}
    </TabsContent>
  );
};

export default DeliveryLabelSettings;
