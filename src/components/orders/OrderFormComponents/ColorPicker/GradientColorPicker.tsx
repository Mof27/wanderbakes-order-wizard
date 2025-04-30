
import { useState } from "react";
import { baseColors } from "@/data/colorData";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { getContrastTextColor } from "@/utils/colorUtils";

interface GradientColorPickerProps {
  value: string[];
  onChange: (colors: string[]) => void;
}

const GradientColorPicker = ({ value, onChange }: GradientColorPickerProps) => {
  // State to track number of colors (2 or 3)
  const [colorCount, setColorCount] = useState(value.length === 3 ? 3 : 2);
  
  // Helper function to create gradient CSS
  const createGradientStyle = (colors: string[]): string => {
    return `linear-gradient(to bottom, ${colors.join(", ")})`;
  };

  // Handle color count change
  const handleColorCountChange = (count: number) => {
    setColorCount(count);
    
    if (count === 2) {
      // If switching to 2 colors, use the top and bottom colors
      onChange([value[0], value[value.length - 1]]);
    } else {
      // If switching to 3 colors, add a middle color (use the first color as middle if only 2 colors)
      onChange(value.length === 2 ? [value[0], value[0], value[1]] : value);
    }
  };

  // Update an individual color in the gradient
  const updateColor = (index: number, color: string) => {
    const newColors = [...value];
    newColors[index] = color;
    onChange(newColors);
  };

  return (
    <div className="space-y-4">
      {/* Color count selector */}
      <div className="space-y-2">
        <Label>Number of Colors</Label>
        <RadioGroup
          value={colorCount.toString()}
          onValueChange={(value) => handleColorCountChange(parseInt(value))}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="2" id="two-color" />
            <Label htmlFor="two-color">2 Colors</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="3" id="three-color" />
            <Label htmlFor="three-color">3 Colors</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Gradient preview */}
      <div 
        className="h-16 rounded-md"
        style={{ background: createGradientStyle(value) }}
      />

      {/* Color pickers for each position */}
      <div className="space-y-3">
        {/* Top color picker */}
        <div className="space-y-2">
          <Label>Top Color</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {baseColors.map((color) => {
              const textColor = getContrastTextColor(color.value);
              return (
                <div
                  key={`top-${color.value}`}
                  className={`h-12 rounded-md cursor-pointer border-2 flex items-center justify-center ${
                    value[0] === color.value ? "border-primary" : "border-transparent"
                  }`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => updateColor(0, color.value)}
                >
                  <span style={{ color: textColor, fontWeight: "500" }} className="text-xs">
                    {color.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Middle color picker (only when colorCount is 3) */}
        {colorCount === 3 && (
          <div className="space-y-2">
            <Label>Middle Color</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {baseColors.map((color) => {
                const textColor = getContrastTextColor(color.value);
                return (
                  <div
                    key={`middle-${color.value}`}
                    className={`h-12 rounded-md cursor-pointer border-2 flex items-center justify-center ${
                      value[1] === color.value ? "border-primary" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => updateColor(1, color.value)}
                  >
                    <span style={{ color: textColor, fontWeight: "500" }} className="text-xs">
                      {color.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom color picker */}
        <div className="space-y-2">
          <Label>Bottom Color</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {baseColors.map((color) => {
              const textColor = getContrastTextColor(color.value);
              return (
                <div
                  key={`bottom-${color.value}`}
                  className={`h-12 rounded-md cursor-pointer border-2 flex items-center justify-center ${
                    value[colorCount === 2 ? 1 : 2] === color.value ? "border-primary" : "border-transparent"
                  }`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => updateColor(colorCount === 2 ? 1 : 2, color.value)}
                >
                  <span style={{ color: textColor, fontWeight: "500" }} className="text-xs">
                    {color.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradientColorPicker;
