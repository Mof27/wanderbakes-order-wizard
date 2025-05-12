
import { useState } from "react";
import { SandboxState } from "@/types/template";
import { PrintTemplate, DeliveryLabelTemplate, PrintField, PrintSection } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2 } from "lucide-react";

interface PropertiesPanelProps {
  sandboxState: SandboxState;
  template: PrintTemplate | DeliveryLabelTemplate | null;
  onTemplateChange: (updatedTemplate: PrintTemplate | DeliveryLabelTemplate) => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ 
  sandboxState, 
  template, 
  onTemplateChange 
}) => {
  const [activeTab, setActiveTab] = useState<'element' | 'section' | 'template'>('template');
  
  if (!template) {
    return (
      <div className="p-4">
        <p className="text-sm text-muted-foreground">No template loaded.</p>
      </div>
    );
  }
  
  // Get selected section if any
  const selectedSection = sandboxState.selectedSectionId 
    ? template.sections.find(s => s.id === sandboxState.selectedSectionId) 
    : null;
  
  // Get selected field if any
  let selectedField: PrintField | null = null;
  if (sandboxState.selectedElementId) {
    for (const section of template.sections) {
      const field = section.fields.find(f => f.id === sandboxState.selectedElementId);
      if (field) {
        selectedField = field;
        break;
      }
    }
  }
  
  // Determine which tab should be active based on selection
  const effectiveTab = selectedField 
    ? 'element' 
    : selectedSection 
      ? 'section' 
      : 'template';
  
  // Update template properties
  const handleTemplatePropertyChange = (key: string, value: any) => {
    if (!template) return;
    
    onTemplateChange({
      ...template,
      [key]: value
    });
  };
  
  // Update section properties
  const handleSectionPropertyChange = (sectionId: string, key: string, value: any) => {
    if (!template) return;
    
    const updatedSections = template.sections.map(section => 
      section.id === sectionId ? { ...section, [key]: value } : section
    );
    
    onTemplateChange({
      ...template,
      sections: updatedSections
    });
  };
  
  // Update field properties
  const handleFieldPropertyChange = (sectionId: string, fieldId: string, key: string, value: any) => {
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
    
    onTemplateChange({
      ...template,
      sections: updatedSections
    });
  };
  
  // Find section ID for a field ID
  const findSectionIdForField = (fieldId: string): string | null => {
    if (!template) return null;
    
    for (const section of template.sections) {
      const field = section.fields.find(f => f.id === fieldId);
      if (field) {
        return section.id;
      }
    }
    
    return null;
  };
  
  return (
    <div className="p-4">
      <h3 className="font-medium mb-3">Properties</h3>
      
      <Tabs value={effectiveTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="w-full mb-4">
          <TabsTrigger value="element" disabled={!selectedField}>
            Element
          </TabsTrigger>
          <TabsTrigger value="section" disabled={!selectedSection}>
            Section
          </TabsTrigger>
          <TabsTrigger value="template">
            Template
          </TabsTrigger>
        </TabsList>
        
        {/* Element Properties */}
        <TabsContent value="element" className="space-y-4">
          {selectedField && (
            <ScrollArea className="h-[calc(100vh-220px)]">
              <div className="space-y-4 pr-3">
                <div className="space-y-2">
                  <Label>Element Type</Label>
                  <Input value={selectedField.type} disabled />
                </div>
                
                {selectedField.type !== 'separator' && selectedField.type !== 'spacer' && (
                  <div className="space-y-2">
                    <Label htmlFor="field-label">Label</Label>
                    <Input
                      id="field-label"
                      value={selectedField.label || ''}
                      onChange={(e) => {
                        const sectionId = findSectionIdForField(selectedField.id);
                        if (sectionId) {
                          handleFieldPropertyChange(
                            sectionId,
                            selectedField.id,
                            'label',
                            e.target.value
                          );
                        }
                      }}
                    />
                  </div>
                )}
                
                {selectedField.type === 'text' && (
                  <div className="space-y-2">
                    <Label htmlFor="field-value">Text Content</Label>
                    <Input
                      id="field-value"
                      value={selectedField.value || ''}
                      onChange={(e) => {
                        const sectionId = findSectionIdForField(selectedField.id);
                        if (sectionId) {
                          handleFieldPropertyChange(
                            sectionId,
                            selectedField.id,
                            'value',
                            e.target.value
                          );
                        }
                      }}
                    />
                  </div>
                )}
                
                {selectedField.type === 'field' && (
                  <div className="space-y-2">
                    <Label htmlFor="field-key">Field Key</Label>
                    <Select
                      value={selectedField.fieldKey || ''}
                      onValueChange={(value) => {
                        const sectionId = findSectionIdForField(selectedField.id);
                        if (sectionId) {
                          handleFieldPropertyChange(
                            sectionId,
                            selectedField.id,
                            'fieldKey',
                            value
                          );
                        }
                      }}
                    >
                      <SelectTrigger id="field-key">
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="id">Order ID</SelectItem>
                        <SelectItem value="orderDate">Order Date</SelectItem>
                        <SelectItem value="deliveryDate">Delivery Date</SelectItem>
                        <SelectItem value="customer.name">Customer Name</SelectItem>
                        <SelectItem value="customer.whatsappNumber">Customer WhatsApp</SelectItem>
                        <SelectItem value="customer.email">Customer Email</SelectItem>
                        <SelectItem value="cakeFlavor">Cake Flavor</SelectItem>
                        <SelectItem value="cakeSize">Cake Size</SelectItem>
                        <SelectItem value="cakeShape">Cake Shape</SelectItem>
                        <SelectItem value="deliveryAddress">Delivery Address</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {selectedField.type === 'qr-code' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="qr-field-key">QR Content</Label>
                      <Select
                        value={selectedField.fieldKey || 'orderUrl'}
                        onValueChange={(value) => {
                          const sectionId = findSectionIdForField(selectedField.id);
                          if (sectionId) {
                            handleFieldPropertyChange(
                              sectionId,
                              selectedField.id,
                              'fieldKey',
                              value
                            );
                          }
                        }}
                      >
                        <SelectTrigger id="qr-field-key">
                          <SelectValue placeholder="Select content" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="orderUrl">Order URL</SelectItem>
                          <SelectItem value="customer.whatsappLink">WhatsApp Link</SelectItem>
                          <SelectItem value="id">Order ID</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label>QR Code Size</Label>
                        <span className="text-sm">{selectedField.size || 100}px</span>
                      </div>
                      <Slider
                        value={[selectedField.size || 100]}
                        min={50}
                        max={200}
                        step={5}
                        onValueChange={([value]) => {
                          const sectionId = findSectionIdForField(selectedField.id);
                          if (sectionId) {
                            handleFieldPropertyChange(
                              sectionId,
                              selectedField.id,
                              'size',
                              value
                            );
                          }
                        }}
                      />
                    </div>
                  </>
                )}
                
                {/* Text styling options for most elements */}
                {selectedField.type !== 'separator' && selectedField.type !== 'spacer' && selectedField.type !== 'qr-code' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="font-size">Font Size</Label>
                      <Select
                        value={selectedField.fontSize || 'base'}
                        onValueChange={(value) => {
                          const sectionId = findSectionIdForField(selectedField.id);
                          if (sectionId) {
                            handleFieldPropertyChange(
                              sectionId,
                              selectedField.id,
                              'fontSize',
                              value
                            );
                          }
                        }}
                      >
                        <SelectTrigger id="font-size">
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="xs">Extra Small</SelectItem>
                          <SelectItem value="sm">Small</SelectItem>
                          <SelectItem value="base">Normal</SelectItem>
                          <SelectItem value="lg">Large</SelectItem>
                          <SelectItem value="xl">Extra Large</SelectItem>
                          <SelectItem value="2xl">2X Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="font-weight">Font Weight</Label>
                      <Select
                        value={selectedField.fontWeight || 'normal'}
                        onValueChange={(value) => {
                          const sectionId = findSectionIdForField(selectedField.id);
                          if (sectionId) {
                            handleFieldPropertyChange(
                              sectionId,
                              selectedField.id,
                              'fontWeight',
                              value
                            );
                          }
                        }}
                      >
                        <SelectTrigger id="font-weight">
                          <SelectValue placeholder="Select weight" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="semibold">Semi Bold</SelectItem>
                          <SelectItem value="bold">Bold</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="font-italic">Italic</Label>
                      <Switch
                        id="font-italic"
                        checked={selectedField.fontStyle === 'italic'}
                        onCheckedChange={(checked) => {
                          const sectionId = findSectionIdForField(selectedField.id);
                          if (sectionId) {
                            handleFieldPropertyChange(
                              sectionId,
                              selectedField.id,
                              'fontStyle',
                              checked ? 'italic' : 'normal'
                            );
                          }
                        }}
                      />
                    </div>
                  </>
                )}
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="element-enabled">Enabled</Label>
                  <Switch
                    id="element-enabled"
                    checked={selectedField.enabled}
                    onCheckedChange={(checked) => {
                      const sectionId = findSectionIdForField(selectedField.id);
                      if (sectionId) {
                        handleFieldPropertyChange(
                          sectionId,
                          selectedField.id,
                          'enabled',
                          checked
                        );
                      }
                    }}
                  />
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-4 text-destructive hover:text-destructive border-destructive/30"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this element?')) {
                      const sectionId = findSectionIdForField(selectedField.id);
                      if (sectionId && template) {
                        const updatedSections = template.sections.map(section => {
                          if (section.id === sectionId) {
                            return {
                              ...section,
                              fields: section.fields.filter(f => f.id !== selectedField.id)
                            };
                          }
                          return section;
                        });
                        
                        onTemplateChange({
                          ...template,
                          sections: updatedSections
                        });
                      }
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Element
                </Button>
              </div>
            </ScrollArea>
          )}
        </TabsContent>
        
        {/* Section Properties */}
        <TabsContent value="section" className="space-y-4">
          {selectedSection && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="section-title">Section Title</Label>
                <Input
                  id="section-title"
                  value={selectedSection.title}
                  onChange={(e) => {
                    handleSectionPropertyChange(
                      selectedSection.id,
                      'title',
                      e.target.value
                    );
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="section-enabled">Enabled</Label>
                <Switch
                  id="section-enabled"
                  checked={selectedSection.enabled}
                  onCheckedChange={(checked) => {
                    handleSectionPropertyChange(
                      selectedSection.id,
                      'enabled',
                      checked
                    );
                  }}
                />
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2 text-destructive hover:text-destructive border-destructive/30"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this section and all its elements?')) {
                    if (template) {
                      onTemplateChange({
                        ...template,
                        sections: template.sections.filter(s => s.id !== selectedSection.id)
                      });
                    }
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Section
              </Button>
            </div>
          )}
        </TabsContent>
        
        {/* Template Properties */}
        <TabsContent value="template" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template-title">Template Title</Label>
            <Input
              id="template-title"
              value={template.title}
              onChange={(e) => handleTemplatePropertyChange('title', e.target.value)}
            />
          </div>
          
          {'orientation' in template && (
            <div className="space-y-2">
              <Label htmlFor="template-orientation">Orientation</Label>
              <Select
                value={template.orientation}
                onValueChange={(value) => 
                  handleTemplatePropertyChange('orientation', value)
                }
              >
                <SelectTrigger id="template-orientation">
                  <SelectValue placeholder="Select orientation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portrait">Portrait</SelectItem>
                  <SelectItem value="landscape">Landscape</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Canvas Zoom</Label>
              <span className="text-sm">{sandboxState.zoom}%</span>
            </div>
            <Slider
              value={[sandboxState.zoom]}
              min={50}
              max={200}
              step={10}
              onValueChange={([value]) => {
                setSandboxState({
                  ...sandboxState,
                  zoom: value
                });
              }}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PropertiesPanel;
