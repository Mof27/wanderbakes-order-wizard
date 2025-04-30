
import { baseColors } from "@/data/colorData";
import { getContrastTextColor } from "@/utils/colorUtils";

interface SolidColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

const SolidColorPicker = ({ value, onChange }: SolidColorPickerProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
      {baseColors.map((color) => {
        const textColor = getContrastTextColor(color.value);
        return (
          <div
            key={color.value}
            className={`h-12 rounded-md cursor-pointer border-2 flex items-center justify-center ${
              value === color.value ? "border-primary" : "border-transparent"
            }`}
            style={{ backgroundColor: color.value }}
            onClick={() => onChange(color.value)}
          >
            <span style={{ color: textColor, fontWeight: "500" }} className="text-xs">
              {color.name}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default SolidColorPicker;
