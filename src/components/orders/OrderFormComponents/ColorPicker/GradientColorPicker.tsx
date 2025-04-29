
import { gradientPresets } from "@/data/colorData";

interface GradientColorPickerProps {
  value: string[];
  onChange: (colors: string[]) => void;
}

const GradientColorPicker = ({ value, onChange }: GradientColorPickerProps) => {
  // Helper function to create gradient CSS
  const createGradientStyle = (colors: string[]): string => {
    return `linear-gradient(to right, ${colors.join(", ")})`;
  };

  // Check if two arrays have the same values
  const areColorsEqual = (a: string[], b: string[]): boolean => {
    if (a.length !== b.length) return false;
    return a.every((val, idx) => val === b[idx]);
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {gradientPresets.map((preset, index) => (
        <div
          key={index}
          className={`h-12 rounded-md cursor-pointer border-2 ${
            areColorsEqual(value, preset.colors) ? "border-primary" : "border-transparent"
          }`}
          style={{ background: createGradientStyle(preset.colors) }}
          onClick={() => onChange(preset.colors)}
          title={preset.name}
        />
      ))}
    </div>
  );
};

export default GradientColorPicker;
