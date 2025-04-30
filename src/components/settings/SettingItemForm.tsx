
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SettingItem, ColorSettingItem, ShapeSettingItem } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Check, Trash2 } from "lucide-react";

interface SettingItemFormProps {
  item: SettingItem | ColorSettingItem | ShapeSettingItem;
  onSave: (item: SettingItem | ColorSettingItem | ShapeSettingItem) => void;
  onDelete?: (id: string) => void;
  isColor?: boolean;
  isShape?: boolean;
}

const SettingItemForm = ({ 
  item, 
  onSave, 
  onDelete, 
  isColor = false,
  isShape = false
}: SettingItemFormProps) => {
  const [editing, setEditing] = useState(item.id.startsWith("new_"));
  const [name, setName] = useState(item.name);
  const [value, setValue] = useState(item.value);
  const [enabled, setEnabled] = useState(item.enabled);
  const [customFields, setCustomFields] = useState(
    isShape && "customFields" in item ? item.customFields : false
  );

  const handleSave = () => {
    const updatedItem = {
      ...item,
      name,
      value,
      enabled,
      updatedAt: new Date(),
      ...(isShape && { customFields }),
    };
    onSave(updatedItem);
    setEditing(false);
  };

  return (
    <div className={`p-4 border rounded-md mb-2 ${editing ? 'bg-muted/50' : ''}`}>
      {editing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`name-${item.id}`}>Name</Label>
              <Input
                id={`name-${item.id}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`value-${item.id}`}>
                {isColor ? "Color Code" : "Value"}
              </Label>
              
              {isColor ? (
                <div className="flex space-x-2">
                  <Input
                    id={`value-${item.id}`}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="flex-1"
                  />
                  <div 
                    className="w-10 h-10 rounded-md border"
                    style={{ backgroundColor: value }}
                  />
                </div>
              ) : (
                <Input
                  id={`value-${item.id}`}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id={`enabled-${item.id}`}
                checked={enabled}
                onCheckedChange={(checked) => 
                  setEnabled(checked === true)
                }
              />
              <Label htmlFor={`enabled-${item.id}`}>
                Enabled
              </Label>
            </div>
            
            {isShape && (
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id={`custom-fields-${item.id}`}
                  checked={customFields}
                  onCheckedChange={(checked) => 
                    setCustomFields(checked === true)
                  }
                />
                <Label htmlFor={`custom-fields-${item.id}`}>
                  Requires Custom Fields
                </Label>
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                if (item.id.startsWith("new_") && onDelete) {
                  onDelete(item.id);
                } else {
                  setEditing(false);
                  setName(item.name);
                  setValue(item.value);
                  setEnabled(item.enabled);
                  if (isShape && "customFields" in item) {
                    setCustomFields(item.customFields || false);
                  }
                }
              }}
            >
              <X className="h-4 w-4 mr-1" /> Cancel
            </Button>
            
            <Button 
              size="sm"
              onClick={handleSave}
              disabled={!name || !value}
            >
              <Check className="h-4 w-4 mr-1" /> Save
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {isColor && (
              <div 
                className="w-6 h-6 rounded-md border"
                style={{ backgroundColor: item.value }}
              />
            )}
            <span className="font-medium">{item.name}</span>
            {!enabled && (
              <span className="text-xs bg-muted px-2 py-1 rounded-full">
                Disabled
              </span>
            )}
            {isShape && "customFields" in item && item.customFields && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                Custom Fields
              </span>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setEditing(true)}
            >
              Edit
            </Button>
            
            {onDelete && (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => onDelete(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingItemForm;
