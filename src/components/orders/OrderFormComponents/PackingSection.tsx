
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PackingItem } from "@/types";

interface PackingSectionProps {
  packingItems: PackingItem[];
  handlePackingItemChange: (itemId: string, checked: boolean) => void;
  readOnly?: boolean;
}

const PackingSection = ({ packingItems, handlePackingItemChange, readOnly = false }: PackingSectionProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="font-medium mb-4">Packing Accessories</h3>
        <div className="space-y-3">
          {packingItems.map(item => (
            <div key={item.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`packing-${item.id}`} 
                checked={item.checked}
                onCheckedChange={(checked) => 
                  handlePackingItemChange(item.id, checked === true)
                }
                disabled={readOnly}
              />
              <Label 
                htmlFor={`packing-${item.id}`}
                className={`${readOnly ? "" : "cursor-pointer"}`}
              >
                {item.name}
              </Label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PackingSection;
