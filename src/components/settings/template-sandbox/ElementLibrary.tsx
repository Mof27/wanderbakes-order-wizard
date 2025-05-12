
import { useState } from "react";
import { SandboxTemplateType, ElementCategory, ElementLibraryItem } from "@/types/template";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

// Element library data
const elementLibraryData: Record<SandboxTemplateType, ElementLibraryItem[]> = {
  'order-form': [
    // Text elements
    { id: 'heading', name: 'Heading', icon: 'text', category: 'text', type: 'section-title', defaultProps: { label: 'New Heading' } },
    { id: 'paragraph', name: 'Paragraph', icon: 'text', category: 'text', type: 'text', defaultProps: { value: 'New paragraph text' } },
    
    // Field elements
    { id: 'order-id', name: 'Order ID', icon: 'field', category: 'fields', type: 'field', defaultProps: { label: 'Order ID', fieldKey: 'id' } },
    { id: 'customer-name', name: 'Customer Name', icon: 'field', category: 'fields', type: 'field', defaultProps: { label: 'Customer Name', fieldKey: 'customer.name' } },
    { id: 'order-date', name: 'Order Date', icon: 'field', category: 'fields', type: 'field', defaultProps: { label: 'Order Date', fieldKey: 'orderDate' } },
    { id: 'cake-info', name: 'Cake Info', icon: 'field', category: 'fields', type: 'field', defaultProps: { label: 'Cake Info', fieldKey: 'cakeInfo' } },
    
    // Layout elements
    { id: 'separator', name: 'Separator', icon: 'layout', category: 'layout', type: 'separator', defaultProps: {} },
    { id: 'spacer', name: 'Spacer', icon: 'layout', category: 'layout', type: 'spacer', defaultProps: {} },
    
    // Special elements
    { id: 'qr-code', name: 'QR Code', icon: 'special', category: 'special', type: 'qr-code', defaultProps: { label: 'Scan for Order', fieldKey: 'orderUrl', size: 100 } },
  ],
  'delivery-label': [
    // Text elements
    { id: 'heading', name: 'Heading', icon: 'text', category: 'text', type: 'section-title', defaultProps: { label: 'New Heading' } },
    { id: 'paragraph', name: 'Paragraph', icon: 'text', category: 'text', type: 'text', defaultProps: { value: 'New paragraph text' } },
    
    // Field elements
    { id: 'recipient-name', name: 'Recipient Name', icon: 'field', category: 'fields', type: 'field', defaultProps: { label: 'Name', fieldKey: 'customer.name' } },
    { id: 'recipient-phone', name: 'Recipient Phone', icon: 'field', category: 'fields', type: 'field', defaultProps: { label: 'Phone', fieldKey: 'customer.whatsappNumber' } },
    { id: 'delivery-address', name: 'Delivery Address', icon: 'field', category: 'fields', type: 'field', defaultProps: { label: 'Address', fieldKey: 'deliveryAddress' } },
    
    // Layout elements
    { id: 'separator', name: 'Separator', icon: 'layout', category: 'layout', type: 'separator', defaultProps: {} },
    { id: 'spacer', name: 'Spacer', icon: 'layout', category: 'layout', type: 'spacer', defaultProps: {} },
    
    // Special elements
    { id: 'qr-code', name: 'QR Code', icon: 'special', category: 'special', type: 'qr-code', defaultProps: { label: 'Scan for Order', fieldKey: 'orderUrl', size: 100 } },
    { id: 'whatsapp-qr', name: 'WhatsApp QR', icon: 'special', category: 'special', type: 'qr-code', defaultProps: { label: 'WhatsApp Contact', fieldKey: 'customer.whatsappLink', size: 100 } },
  ]
};

interface ElementLibraryProps {
  templateType: SandboxTemplateType;
  onAddElement: (element: ElementLibraryItem) => void;
}

const ElementLibrary: React.FC<ElementLibraryProps> = ({ templateType, onAddElement }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<ElementCategory>('fields');
  
  // Filter elements based on search query and active category
  const filteredElements = elementLibraryData[templateType].filter(element => {
    const matchesSearch = element.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === element.category;
    return matchesSearch && matchesCategory;
  });
  
  const handleAddElement = (element: ElementLibraryItem) => {
    onAddElement({
      ...element,
      id: `${element.id}_${Date.now()}`, // Ensure unique ID
    });
  };
  
  const getCategoryName = (category: ElementCategory): string => {
    switch (category) {
      case 'text': return 'Text';
      case 'fields': return 'Fields';
      case 'layout': return 'Layout';
      case 'special': return 'Special';
      default: return category;
    }
  };
  
  return (
    <div className="p-4 flex flex-col h-full">
      <h3 className="font-medium mb-3">Element Library</h3>
      
      {/* Search box */}
      <div className="relative mb-4">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search elements..."
          className="pl-8 h-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {/* Category tabs */}
      <Tabs defaultValue="fields" onValueChange={(value) => setActiveCategory(value as ElementCategory)}>
        <TabsList className="w-full">
          {['text', 'fields', 'layout', 'special'].map((category) => (
            <TabsTrigger key={category} value={category} className="flex-1 text-xs">
              {getCategoryName(category as ElementCategory)}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {/* Elements list */}
        <TabsContent value={activeCategory} className="mt-2 space-y-1.5">
          <ScrollArea className="h-[calc(100vh-270px)]">
            <div className="space-y-1.5 pr-3">
              {filteredElements.length > 0 ? (
                filteredElements.map((element) => (
                  <Button
                    key={element.id}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-sm"
                    onClick={() => handleAddElement(element)}
                  >
                    {element.name}
                  </Button>
                ))
              ) : (
                <p className="text-sm text-muted-foreground p-2">No elements found.</p>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ElementLibrary;
