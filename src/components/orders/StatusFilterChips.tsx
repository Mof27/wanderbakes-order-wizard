
import React from "react";
import { Check } from "lucide-react";
import { FilterOption } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";

interface StatusFilterChipsProps {
  options: FilterOption[];
  selectedOption: FilterOption;
  onChange: (selectedOption: FilterOption) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "draft": return "bg-gray-100 text-gray-800 border-gray-200";
    case "confirmed": return "bg-blue-100 text-blue-800 border-blue-200";
    case "in-progress": return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "ready": return "bg-green-100 text-green-800 border-green-200";
    case "delivered": return "bg-purple-100 text-purple-800 border-purple-200";
    case "cancelled": return "bg-red-100 text-red-800 border-red-200";
    case "all": return "bg-white border-gray-200 text-gray-800";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const StatusFilterChips: React.FC<StatusFilterChipsProps> = ({
  options,
  selectedOption,
  onChange,
}) => {
  return (
    <div className="space-y-2">
      <h3 className="font-medium text-sm text-muted-foreground">Filter by Status</h3>
      <ToggleGroup
        type="single"
        value={selectedOption.id}
        onValueChange={(value) => {
          if (value) {
            const option = options.find(opt => opt.id === value);
            if (option) onChange(option);
          }
        }}
        className="flex flex-wrap gap-2"
      >
        {options.map((option) => (
          <ToggleGroupItem
            key={option.id}
            value={option.id}
            className={cn(
              "border rounded-full px-3 py-1 text-sm font-medium flex items-center gap-1.5 transition-colors",
              getStatusColor(option.value),
              option.id === selectedOption.id ? "ring-2 ring-offset-2 ring-primary/30" : "",
              option.id === selectedOption.id ? "hover:bg-opacity-100" : "hover:bg-opacity-80"
            )}
          >
            {option.id === selectedOption.id && (
              <Check className="h-3 w-3" />
            )}
            <span>{option.label}</span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
};

export default StatusFilterChips;
