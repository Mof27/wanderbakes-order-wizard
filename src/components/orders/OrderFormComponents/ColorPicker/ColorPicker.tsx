
import { useState, useEffect } from "react";
import { CakeColor, ColorType, SolidColor, GradientColor, CustomColor, CoverType } from "@/types";
import { Label } from "@/components/ui/label";
import SolidColorPicker from "./SolidColorPicker";
import GradientColorPicker from "./GradientColorPicker";
import CustomColorPicker from "./CustomColorPicker";
import { baseColors } from "@/data/colorData";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Check, Droplets, Palette } from "lucide-react";

interface ColorPickerProps {
  value: CakeColor;
  onChange: (value: CakeColor) => void;
  coverType?: CoverType;
}

const ColorPicker = ({ value, onChange, coverType }: ColorPickerProps) => {
  const [colorType, setColorType] = useState<ColorType>(value.type);

  // Reset color type if switching to fondant and current type is gradient
  useEffect(() => {
    if (coverType === 'fondant' && colorType === 'gradient') {
      setColorType('solid');
      onChange({
        type: 'solid',
        color: (value as GradientColor).colors[0] || baseColors[0].value
      });
    }
  }, [coverType]);

  const handleColorTypeChange = (type: ColorType) => {
    // Don't allow gradient if fondant is selected
    if (coverType === 'fondant' && type === 'gradient') {
      return;
    }

    setColorType(type);
    
    if (type === 'solid') {
      onChange({
        type: 'solid',
        color: baseColors[0].value
      });
    } else if (type === 'gradient') {
      // Default to 2-color gradient when switching to gradient mode
      onChange({
        type: 'gradient',
        colors: [baseColors[0].value, baseColors[1].value]
      });
    } else if (type === 'custom') {
      // Default for custom color
      onChange({
        type: 'custom',
        notes: ''
      });
    }
  };

  return (
    <div className="space-y-4">
      <ToggleGroup
        type="single"
        value={colorType}
        onValueChange={(value) => value && handleColorTypeChange(value as ColorType)}
        className="justify-start"
      >
        <ToggleGroupItem value="solid" aria-label="Solid Color" className="px-4 py-2 flex gap-2 items-center">
          <Check className="h-4 w-4" />
          <span>Solid Color</span>
        </ToggleGroupItem>
        
        {/* Only show gradient option for buttercream */}
        {(!coverType || coverType === 'buttercream') && (
          <ToggleGroupItem value="gradient" aria-label="Gradient" className="px-4 py-2 flex gap-2 items-center">
            <Droplets className="h-4 w-4" />
            <span>Gradient</span>
          </ToggleGroupItem>
        )}
        
        <ToggleGroupItem value="custom" aria-label="Custom" className="px-4 py-2 flex gap-2 items-center">
          <Palette className="h-4 w-4" />
          <span>Custom</span>
        </ToggleGroupItem>
      </ToggleGroup>

      {coverType === 'fondant' && colorType === 'gradient' && (
        <div className="text-sm text-destructive">
          Gradient colors are not available for fondant. Please select a solid or custom color.
        </div>
      )}

      {colorType === "solid" && (
        <SolidColorPicker 
          value={(value as SolidColor).color} 
          onChange={(color) => onChange({ type: 'solid', color })}
        />
      )}
      
      {colorType === "gradient" && (
        <GradientColorPicker
          value={(value as GradientColor).colors}
          onChange={(colors) => onChange({ type: 'gradient', colors })}
        />
      )}
      
      {colorType === "custom" && (
        <CustomColorPicker
          value={value as CustomColor || { type: 'custom', notes: '' }}
          onChange={(customColor) => onChange(customColor)}
        />
      )}
    </div>
  );
};

export default ColorPicker;
