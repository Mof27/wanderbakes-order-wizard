
import { useState, useEffect } from "react";
import { CakeColor, ColorType, SolidColor, GradientColor, CustomColor, CoverType } from "@/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import SolidColorPicker from "./SolidColorPicker";
import GradientColorPicker from "./GradientColorPicker";
import CustomColorPicker from "./CustomColorPicker";
import { baseColors } from "@/data/colorData";

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
      <RadioGroup
        value={colorType}
        onValueChange={(value) => handleColorTypeChange(value as ColorType)}
        className="flex flex-wrap gap-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="solid" id="solid" />
          <Label htmlFor="solid">Solid Color</Label>
        </div>
        
        {/* Only show gradient option for buttercream */}
        {(!coverType || coverType === 'buttercream') && (
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="gradient" id="gradient" />
            <Label htmlFor="gradient">Gradient</Label>
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="custom" id="custom" />
          <Label htmlFor="custom">Custom</Label>
        </div>
      </RadioGroup>

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
