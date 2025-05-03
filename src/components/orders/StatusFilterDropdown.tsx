
import React from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { FilterOption } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusFilterDropdownProps {
  options: FilterOption[];
  selectedOption: FilterOption;
  onChange: (selectedOption: FilterOption) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "draft": return "bg-gray-100 text-gray-800";
    case "confirmed": return "bg-blue-100 text-blue-800";
    case "in-kitchen": return "bg-yellow-100 text-yellow-800";
    case "ready": return "bg-green-100 text-green-800";
    case "delivered": return "bg-purple-100 text-purple-800";
    case "cancelled": return "bg-red-100 text-red-800";
    case "all": return "bg-gray-100 text-gray-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const StatusFilterDropdown: React.FC<StatusFilterDropdownProps> = ({
  options,
  selectedOption,
  onChange,
}) => {
  // Get the badge color for the selected status
  const statusColor = selectedOption.value !== "all" ? 
    getStatusColor(selectedOption.value) : "";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="flex justify-between w-full"
        >
          <div className="flex items-center gap-2">
            {selectedOption.value !== "all" ? (
              <>
                <Badge className={cn("mr-1", statusColor)}>
                  {selectedOption.label}
                </Badge>
                <span className="text-muted-foreground">Status</span>
              </>
            ) : (
              <span>All Statuses</span>
            )}
          </div>
          <ChevronDown className="h-4 w-4 opacity-50 ml-auto flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60">
        <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {options.map((option) => (
          <DropdownMenuItem
            key={option.id}
            onClick={() => onChange(option)}
            className={cn(
              "flex items-center justify-between",
              option.value !== "all" ? getStatusColor(option.value) : "",
              selectedOption.id === option.id ? "bg-accent/50" : ""
            )}
          >
            <span>{option.label}</span>
            {selectedOption.id === option.id && (
              <Check className="h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default StatusFilterDropdown;
