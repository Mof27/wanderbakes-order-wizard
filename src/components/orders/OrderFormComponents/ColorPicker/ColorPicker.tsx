
import { useState } from "react";
import { CakeColor, ColorType, SolidColor, GradientColor } from "@/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import SolidColorPicker from "./SolidColorPicker";
import GradientColorPicker from "./GradientColorPicker";
import { baseColors, gradientPresets } from "@/data/colorData";

interface ColorPickerProps {
  value: CakeColor;
  onChange: (value: CakeColor) => void;
}

const ColorPicker = ({ value, onChange }: ColorPickerProps) => {
  const [colorType, setColorType] = useState<ColorType>(value.type);

  const handleColorTypeChange = (type: ColorType) => {
    setColorType(type);
    if (type === 'solid') {
      onChange({
        type: 'solid',
        color: baseColors[0].value
      });
    } else {
      onChange({
        type: 'gradient',
        colors: gradientPresets[0].colors
      });
    }
  };

  return (
    <div className="space-y-4">
      <RadioGroup
        value={colorType}
        onValueChange={(value) => handleColorTypeChange(value as ColorType)}
        className="flex space-x-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="solid" id="solid" />
          <Label htmlFor="solid">Solid Color</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="gradient" id="gradient" />
          <Label htmlFor="gradient">Gradient</Label>
        </div>
      </RadioGroup>

      {colorType === "solid" ? (
        <SolidColorPicker 
          value={(value as SolidColor).color} 
          onChange={(color) => onChange({ type: 'solid', color })}
        />
      ) : (
        <GradientColorPicker
          value={(value as GradientColor).colors}
          onChange={(colors) => onChange({ type: 'gradient', colors })}
        />
      )}
    </div>
  );
};

export default ColorPicker;
