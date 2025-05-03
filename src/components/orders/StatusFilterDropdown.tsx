
import React from "react";
import { Check, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { FilterOption } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusFilterDropdownProps {
  options: FilterOption[];
  selectedOptions: FilterOption[];
  onChange: (selectedOptions: FilterOption[]) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "draft": return "bg-gray-100 text-gray-800";
    case "confirmed": return "bg-blue-100 text-blue-800";
    case "in-progress": return "bg-yellow-100 text-yellow-800";
    case "ready": return "bg-green-100 text-green-800";
    case "delivered": return "bg-purple-100 text-purple-800";
    case "cancelled": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const StatusFilterDropdown: React.FC<StatusFilterDropdownProps> = ({
  options,
  selectedOptions,
  onChange,
}) => {
  // Toggle selection of an option
  const toggleOption = (option: FilterOption) => {
    // If "All" is clicked, return only "All" option
    if (option.value === "all") {
      return onChange([options[0]]);
    }
    
    // If selecting a specific status option
    const newSelection = selectedOptions.some(o => o.id === option.id)
      ? selectedOptions.filter(o => o.id !== option.id) // Remove if already selected
      : [...selectedOptions.filter(o => o.value !== "all"), option]; // Add, and remove "all" if present
    
    // If nothing selected, default back to "All"
    if (newSelection.length === 0) {
      return onChange([options[0]]);
    }
    
    onChange(newSelection);
  };
  
  // Reset to "All" option
  const handleReset = () => {
    onChange([options[0]]);
  };
  
  // Format the trigger text
  const getTriggerText = () => {
    if (selectedOptions.length === 1 && selectedOptions[0].value === "all") {
      return "All Statuses";
    }
    return `${selectedOptions.length} statuses selected`;
  };

  // Check if any status filters are active (not just "All")
  const hasStatusFilters = !(
    selectedOptions.length === 1 && selectedOptions[0].value === "all"
  );
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className={cn(
            "flex justify-between min-w-[180px]",
            hasStatusFilters && "border-primary text-primary"
          )}
        >
          <span className="truncate mr-1">{getTriggerText()}</span>
          {hasStatusFilters && (
            <Badge 
              variant="secondary"
              className="mr-1"
            >
              {selectedOptions.length}
            </Badge>
          )}
          <ChevronDown className="h-4 w-4 opacity-50 ml-auto flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60">
        <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.id}
            checked={selectedOptions.some(o => o.id === option.id)}
            onSelect={(e) => {
              e.preventDefault();
              toggleOption(option);
            }}
            className={cn("flex gap-2 justify-between", 
              option.value !== "all" && getStatusColor(option.value)
            )}
          >
            <span>{option.label}</span>
            {selectedOptions.some(o => o.id === option.id) && (
              <Check className="h-4 w-4 ml-auto" />
            )}
          </DropdownMenuCheckboxItem>
        ))}
        
        {hasStatusFilters && (
          <>
            <DropdownMenuSeparator />
            <div className="flex justify-end p-1">
              <Button
                size="sm"
                variant="ghost"
                className="text-xs h-8 px-2 flex gap-1"
                onClick={handleReset}
              >
                <X className="h-3 w-3" /> Reset filter
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default StatusFilterDropdown;
