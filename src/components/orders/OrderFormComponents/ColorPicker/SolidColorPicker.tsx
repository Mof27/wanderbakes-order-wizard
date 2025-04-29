
import { baseColors } from "@/data/colorData";

interface SolidColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

const SolidColorPicker = ({ value, onChange }: SolidColorPickerProps) => {
  return (
    <div className="grid grid-cols-5 gap-2">
      {baseColors.map((color) => (
        <div
          key={color.value}
          className={`h-8 rounded-md cursor-pointer border-2 ${
            value === color.value ? "border-primary" : "border-transparent"
          }`}
          style={{ backgroundColor: color.value }}
          onClick={() => onChange(color.value)}
          title={color.name}
        />
      ))}
    </div>
  );
};

export default SolidColorPicker;
