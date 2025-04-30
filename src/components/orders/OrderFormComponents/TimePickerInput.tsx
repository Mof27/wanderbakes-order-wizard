
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

interface TimePickerInputProps {
  value: string;
  onChange: (value: string) => void;
  minHour?: number;
  maxHour?: number;
}

export const TimePickerInput = ({ 
  value, 
  onChange, 
  minHour = 0, 
  maxHour = 23 
}: TimePickerInputProps) => {
  const [displayValue, setDisplayValue] = useState(value || "");
  
  useEffect(() => {
    if (value) {
      setDisplayValue(value);
    }
  }, [value]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // Allow only numbers, colons, and WIB text
    const validInput = input.replace(/[^0-9.:WIB\s]/g, "");
    setDisplayValue(validInput);
  };
  
  const handleBlur = () => {
    try {
      let formattedTime = displayValue;
      
      // Remove any WIB or other text to parse the time
      const timeOnly = displayValue.replace(/[^\d:]/g, "");
      
      // Parse hours and minutes
      let [hours, minutes] = timeOnly.split(":");
      let parsedHours = parseInt(hours || "0", 10);
      let parsedMinutes = parseInt(minutes || "0", 10);
      
      // Validate hours and minutes
      parsedHours = Math.max(minHour, Math.min(maxHour, parsedHours));
      parsedMinutes = Math.max(0, Math.min(59, parsedMinutes));
      
      // Format to HH.MM WIB
      formattedTime = `${String(parsedHours).padStart(2, "0")}.${String(parsedMinutes).padStart(2, "0")} WIB`;
      
      setDisplayValue(formattedTime);
      onChange(formattedTime);
    } catch (error) {
      // If parsing fails, just use the raw input
      onChange(displayValue);
    }
  };
  
  return (
    <Input
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder="e.g., 14.00 WIB"
    />
  );
};
