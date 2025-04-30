
import { baseColors } from "@/data/colorData";
import { getContrastTextColor } from "@/utils/colorUtils";
import { useEffect, useState } from "react";
import { dataService } from "@/services";
import { ColorSettingItem } from "@/types";

interface SolidColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

const SolidColorPicker = ({
  value,
  onChange
}: SolidColorPickerProps) => {
  const [colors, setColors] = useState<ColorSettingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadColors = async () => {
      try {
        const settings = await dataService.settings.getAll();
        // Only use enabled colors
        const enabledColors = settings.colors.filter(color => color.enabled);
        setColors(enabledColors.length > 0 ? enabledColors : 
          baseColors.map(color => ({
            id: `color_${color.name.replace(/\s+/g, '_').toLowerCase()}`,
            name: color.name,
            value: color.value,
            enabled: true,
            createdAt: new Date()
          }))
        );
      } catch (error) {
        console.error("Failed to load colors", error);
        // Fallback to base colors
        setColors(baseColors.map(color => ({
          id: `color_${color.name.replace(/\s+/g, '_').toLowerCase()}`,
          name: color.name,
          value: color.value,
          enabled: true,
          createdAt: new Date()
        })));
      } finally {
        setLoading(false);
      }
    };

    loadColors();
  }, []);

  if (loading) {
    return <div className="text-center py-4">Loading colors...</div>;
  }

  return <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
      {colors.map(color => {
      const textColor = getContrastTextColor(color.value);
      return <div key={color.id} className={`h-12 rounded-md cursor-pointer border-2 flex items-center justify-center ${value === color.value ? "border-primary" : "border-transparent"}`} style={{
        backgroundColor: color.value
      }} onClick={() => onChange(color.value)}>
            <span style={{
          color: textColor,
          fontWeight: "500"
        }} className="text-xs text-center">
              {color.name}
            </span>
          </div>;
    })}
    </div>;
};

export default SolidColorPicker;
