import { useState, useEffect } from "react";
import { PrintSection, PrintTemplate, PrintField, PrintFieldType, FontWeight, FontStyle, FontSize } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { dataService } from "@/services";
import { toast } from "@/components/ui/sonner";
import { Plus, MoveVertical, Trash2, Eye, EyeOff, ArrowDown, ArrowUp, QrCode, Bold, Italic } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import PrintPreview from "./PrintPreview";
import { Slider } from "@/components/ui/slider";

const fieldTypeOptions = [
  { value: 'section-title', label: 'Section Title' },
  { value: 'text', label: 'Custom Text' },
  { value: 'field', label: 'Order Field' },
  { value: 'separator', label: 'Separator Line' },
  { value: 'spacer', label: 'Spacer' },
  { value: 'qr-code', label: 'QR Code' }
];

const fontSizeOptions = [
  { value: 'xs', label: 'Extra Small' },
  { value: 'sm', label: 'Small' },
  { value: 'base', label: 'Normal' },
  { value: 'lg', label: 'Large' },
  { value: 'xl', label: 'Extra Large' },
  { value: '2xl', label: '2X Large' }
];

const fontWeightOptions = [
  { value: 'normal', label: 'Normal' },
  { value: 'medium', label: 'Medium' },
  { value: 'semibold', label: 'Semi Bold' },
  { value: 'bold', label: 'Bold' }
];

// Order field options for dropdown
const orderFieldOptions = [
  { value: 'id', label: 'Order ID' },
  { value: 'orderDate', label: 'Order Date' },
  { value: 'deliveryDate', label: 'Delivery Date' },
  { value: 'deliveryTimeSlot', label: 'Delivery Time' },
  { value: 'customer.name', label: 'Customer Name' },
  { value: 'customer.whatsappNumber', label: 'Customer WhatsApp' },
  { value: 'customer.email', label: 'Customer Email' },
  { value: 'cakeSize', label: 'Cake Size' },
  { value: 'cakeShape', label: 'Cake Shape' },
  { value: 'customShape', label: 'Custom Shape' },
  { value: 'cakeFlavor', label: 'Cake Flavor' },
  { value: 'cakeTier', label: 'Cake Tiers' },
  { value: 'coverType', label: 'Cover Type' },
  { value: 'cakeDesign', label: 'Cake Design' },
  { value: 'cakeText', label: 'Cake Text' },
  { value: 'deliveryMethod', label: 'Delivery Method' },
  { value: 'deliveryAddress', label: 'Delivery Address' },
  { value: 'deliveryArea', label: 'Delivery Area' },
  { value: 'deliveryAddressNotes', label: 'Delivery Notes' },
  { value: 'cakePrice', label: 'Cake Price' },
  { value: 'deliveryPrice', label: 'Delivery Price' },
  { value: 'totalPrice', label: 'Total Price' },
  { value: 'notes', label: 'Notes' },
  { value: 'packingItems', label: 'Packing Items' },
  { value: 'printDate', label: 'Print Date' }
];

const PrintSettings = () => {
  const [template, setTemplate] = useState<PrintTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("Loading print template settings...");
        const settings = await dataService.settings.getAll();
        console.log("Settings loaded:", settings);
        if (settings && settings.printTemplate) {
          setTemplate(settings.printTemplate);
        } else {
          console.error("Print template not found in settings");
          toast.error("Failed to load print template: Template not found");
        }
      } catch (error) {
        console.error("Failed to load print template settings", error);
        toast.error("Failed to load print template settings");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSave = async () => {
    if (!template) return;
    
    try {
      await dataService.settings.updatePrintTemplate(template);
      toast.success("Print template updated successfully");
    } catch (error) {
      console.error("Failed to update print template", error);
      toast.error("Failed to update print template");
    }
  };

  const handleTemplateChange = (key: keyof PrintTemplate, value: string) => {
    if (!template) return;
    setTemplate({ ...template, [key]: value });
  };

  const handleSectionChange = (sectionId: string, key: keyof PrintSection, value: any) => {
    if (!template) return;
    
    const updatedSections = template.sections.map(section => 
      section.id === sectionId ? { ...section, [key]: value } : section
    );
    
    setTemplate({ ...template, sections: updatedSections });
  };

  const handleFieldChange = (sectionId: string, fieldId: string, key: string, value: any) => {
    if (!template) return;
    
    const updatedSections = template.sections.map(section => {
      if (section.id === sectionId) {
        const updatedFields = section.fields.map(field => 
          field.id === fieldId ? { ...field, [key]: value } : field
        );
        return { ...section, fields: updatedFields };
      }
      return section;
    });
    
    setTemplate({ ...template, sections: updatedSections });
  };

  const addSection = () => {
    if (!template) return;
    
    const newSection: PrintSection = {
      id: `section_${Date.now()}`,
      title: "New Section",
      fields: [],
      enabled: true,
      order: template.sections.length
    };
    
    setTemplate({ 
      ...template, 
      sections: [...template.sections, newSection] 
    });
  };

  const addField = (sectionId: string) => {
    if (!template) return;
    
    const section = template.sections.find(s => s.id === sectionId);
    if (!section) return;
    
    const newField: PrintField = {
      id: `field_${Date.now()}`,
      type: 'text',
      label: "New Field",
      value: "",
      enabled: true,
      order: section.fields.length
    };
    
    const updatedSections = template.sections.map(s => 
      s.id === sectionId 
        ? { ...s, fields: [...s.fields, newField] } 
        : s
    );
    
    setTemplate({ ...template, sections: updatedSections });
  };

  const deleteSection = (sectionId: string) => {
    if (!template) return;
    
    const updatedSections = template.sections
      .filter(s => s.id !== sectionId)
      .map((section, index) => ({ ...section, order: index }));
    
    setTemplate({ ...template, sections: updatedSections });
  };

  const deleteField = (sectionId: string, fieldId: string) => {
    if (!template) return;
    
    const updatedSections = template.sections.map(section => {
      if (section.id === sectionId) {
        const updatedFields = section.fields
          .filter(f => f.id !== fieldId)
          .map((field, index) => ({ ...field, order: index }));
        
        return { ...section, fields: updatedFields };
      }
      return section;
    });
    
    setTemplate({ ...template, sections: updatedSections });
  };

  const moveSection = (sectionId: string, direction: 'up' | 'down') => {
    if (!template) return;
    
    const sections = [...template.sections];
    const index = sections.findIndex(s => s.id === sectionId);
    
    if ((direction === 'up' && index === 0) || 
        (direction === 'down' && index === sections.length - 1)) {
      return;
    }
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const sectionToMove = sections[index];
    
    sections.splice(index, 1);
    sections.splice(newIndex, 0, sectionToMove);
    
    // Update order values
    const updatedSections = sections.map((section, idx) => ({
      ...section, 
      order: idx
    }));
    
    setTemplate({ ...template, sections: updatedSections });
  };

  const moveField = (sectionId: string, fieldId: string, direction: 'up' | 'down') => {
    if (!template) return;
    
    const updatedSections = template.sections.map(section => {
      if (section.id === sectionId) {
        const fields = [...section.fields];
        const index = fields.findIndex(f => f.id === fieldId);
        
        if ((direction === 'up' && index === 0) || 
            (direction === 'down' && index === fields.length - 1)) {
          return section;
        }
        
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        const fieldToMove = fields[index];
        
        fields.splice(index, 1);
        fields.splice(newIndex, 0, fieldToMove);
        
        // Update order values
        const updatedFields = fields.map((field, idx) => ({
          ...field, 
          order: idx
        }));
        
        return { ...section, fields: updatedFields };
      }
      return section;
    });
    
    setTemplate({ ...template, sections: updatedSections });
  };

  const renderFieldEditor = (section: PrintSection, field: PrintField) => {
    return (
      <div key={field.id} className="space-y-3 border p-3 rounded-md bg-background">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MoveVertical className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{field.label || "Field"}</span>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => moveField(section.id, field.id, 'up')}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => moveField(section.id, field.id, 'down')}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => handleFieldChange(section.id, field.id, 'enabled', !field.enabled)}
            >
              {field.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => deleteField(section.id, field.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor={`field-type-${field.id}`}>Field Type</Label>
            <Select 
              value={field.type} 
              onValueChange={(value) => handleFieldChange(section.id, field.id, 'type', value as PrintFieldType)}
            >
              <SelectTrigger id={`field-type-${field.id}`}>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {fieldTypeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`field-label-${field.id}`}>Label</Label>
            <Input 
              id={`field-label-${field.id}`}
              value={field.label || ""}
              onChange={(e) => handleFieldChange(section.id, field.id, 'label', e.target.value)}
              disabled={field.type === 'separator' || field.type === 'spacer'}
            />
          </div>

          {/* Text styling options */}
          <div className="space-y-2">
            <Label htmlFor={`field-font-size-${field.id}`}>Font Size</Label>
            <Select 
              value={field.fontSize || "sm"} 
              onValueChange={(value) => handleFieldChange(section.id, field.id, 'fontSize', value as FontSize)}
              disabled={field.type === 'separator' || field.type === 'spacer' || field.type === 'qr-code'}
            >
              <SelectTrigger id={`field-font-size-${field.id}`}>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                {fontSizeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`field-font-weight-${field.id}`}>Font Weight</Label>
            <Select 
              value={field.fontWeight || "normal"} 
              onValueChange={(value) => handleFieldChange(section.id, field.id, 'fontWeight', value as FontWeight)}
              disabled={field.type === 'separator' || field.type === 'spacer' || field.type === 'qr-code'}
            >
              <SelectTrigger id={`field-font-weight-${field.id}`}>
                <SelectValue placeholder="Select weight" />
              </SelectTrigger>
              <SelectContent>
                {fontWeightOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 col-span-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={`field-font-style-${field.id}`}>Italic</Label>
              <Switch
                id={`field-font-style-${field.id}`}
                checked={field.fontStyle === 'italic'}
                onCheckedChange={(checked) => 
                  handleFieldChange(section.id, field.id, 'fontStyle', checked ? 'italic' : 'normal')
                }
                disabled={field.type === 'separator' || field.type === 'spacer' || field.type === 'qr-code'}
              />
            </div>
          </div>

          {field.type === 'field' && (
            <div className="space-y-2 col-span-2">
              <Label htmlFor={`field-key-${field.id}`}>Order Field</Label>
              <Select 
                value={field.fieldKey || ""} 
                onValueChange={(value) => handleFieldChange(section.id, field.id, 'fieldKey', value)}
              >
                <SelectTrigger id={`field-key-${field.id}`}>
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {orderFieldOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {field.type === 'qr-code' && (
            <>
              <div className="space-y-2 col-span-2">
                <Label htmlFor={`field-key-${field.id}`}>QR Code Content</Label>
                <Select 
                  value={field.fieldKey || "orderUrl"} 
                  onValueChange={(value) => handleFieldChange(section.id, field.id, 'fieldKey', value)}
                >
                  <SelectTrigger id={`field-key-${field.id}`}>
                    <SelectValue placeholder="Select content" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="orderUrl">Order URL (Deep Link)</SelectItem>
                    <SelectItem value="id">Order ID</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <div className="flex justify-between">
                  <Label htmlFor={`field-size-${field.id}`}>QR Code Size</Label>
                  <span className="text-sm text-muted-foreground">{field.size || 100}px</span>
                </div>
                <Slider
                  id={`field-size-${field.id}`}
                  value={[field.size || 100]}
                  min={50}
                  max={200}
                  step={10}
                  onValueChange={(value) => handleFieldChange(section.id, field.id, 'size', value[0])}
                />
              </div>
            </>
          )}

          {field.type === 'text' && (
            <div className="space-y-2 col-span-2">
              <Label htmlFor={`field-value-${field.id}`}>Text Content</Label>
              <Input 
                id={`field-value-${field.id}`}
                value={field.value || ""}
                onChange={(e) => handleFieldChange(section.id, field.id, 'value', e.target.value)}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <TabsContent value="print-form">
        <Card>
          <CardHeader>
            <CardTitle>Print Form Layout</CardTitle>
            <CardDescription>
              Loading print template settings...
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
      <TabsContent value="print-form">
        <Card>
          <CardHeader>
            <CardTitle>Print Form Layout</CardTitle>
            <CardDescription>
              Failed to load template settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center gap-4 p-8">
              <p className="text-muted-foreground">We couldn't load your print template settings.</p>
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
    <TabsContent value="print-form">
      <Card>
        <CardHeader>
          <CardTitle>Print Form Layout</CardTitle>
          <CardDescription>
            Customize the layout of your order print form. The title "Cake Order Form" and QR code position are fixed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h3 className="text-lg font-medium">Form Options</h3>
                <p className="text-sm text-muted-foreground">Configure general settings for the print form</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPreviewOpen(true)}
                >
                  Preview Form
                </Button>
                <Button onClick={handleSave}>
                  Save Changes
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="form-title">Form Title</Label>
                <Input 
                  id="form-title"
                  value={template.title}
                  onChange={(e) => handleTemplateChange('title', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="form-orientation">Paper Orientation</Label>
                <Select 
                  value={template.orientation} 
                  onValueChange={(value) => handleTemplateChange('orientation', value)}
                >
                  <SelectTrigger id="form-orientation">
                    <SelectValue placeholder="Select orientation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portrait">Portrait</SelectItem>
                    <SelectItem value="landscape">Landscape</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Form Sections</h3>
                <Button onClick={addSection} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" /> Add Section
                </Button>
              </div>

              <Accordion type="multiple" className="space-y-2">
                {template.sections.sort((a, b) => a.order - b.order).map((section) => (
                  <AccordionItem key={section.id} value={section.id} className="border rounded-lg">
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <div className="flex justify-between w-full mr-4">
                        <div className="flex items-center gap-2">
                          <MoveVertical className="h-4 w-4 text-muted-foreground" />
                          {section.enabled ? 
                            <span>{section.title}</span> : 
                            <span className="text-muted-foreground">{section.title} (Hidden)</span>
                          }
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="grid grid-cols-2 gap-3 flex-1 mr-4">
                          <div className="space-y-1">
                            <Label htmlFor={`section-title-${section.id}`}>Section Title</Label>
                            <Input 
                              id={`section-title-${section.id}`}
                              value={section.title}
                              onChange={(e) => handleSectionChange(section.id, 'title', e.target.value)}
                            />
                          </div>
                          <div className="flex items-center justify-end space-x-2">
                            <div className="flex items-center space-x-2">
                              <Switch 
                                id={`section-enabled-${section.id}`}
                                checked={section.enabled}
                                onCheckedChange={(checked) => handleSectionChange(section.id, 'enabled', checked)}
                              />
                              <Label htmlFor={`section-enabled-${section.id}`}>
                                {section.enabled ? "Visible" : "Hidden"}
                              </Label>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => moveSection(section.id, 'up')}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => moveSection(section.id, 'down')}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => deleteSection(section.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 pt-2">
                        <div className="flex justify-between">
                          <h4 className="text-sm font-medium">Section Fields</h4>
                          <Button onClick={() => addField(section.id)} variant="outline" size="sm">
                            <Plus className="h-4 w-4 mr-2" /> Add Field
                          </Button>
                        </div>

                        {section.fields.length === 0 && (
                          <p className="text-sm text-muted-foreground">No fields added to this section yet.</p>
                        )}

                        <div className="space-y-3">
                          {section.fields
                            .sort((a, b) => a.order - b.order)
                            .map(field => renderFieldEditor(section, field))}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
            
            <div className="flex justify-end pt-4">
              <Button onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {previewOpen && template && (
        <PrintPreview 
          template={template} 
          open={previewOpen} 
          onOpenChange={setPreviewOpen} 
        />
      )}
    </TabsContent>
  );
};

export default PrintSettings;
