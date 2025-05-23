import React, { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface DateRangePickerProps {
  dateRange: [Date | null, Date | null];
  onDateRangeChange: (range: [Date | null, Date | null]) => void;
}

const presets = [
  {
    id: "today",
    label: "Today",
    getValue: () => {
      const today = new Date();
      return [today, today] as [Date, Date];
    },
  },
  {
    id: "tomorrow",
    label: "Tomorrow",
    getValue: () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return [tomorrow, tomorrow] as [Date, Date];
    },
  },
  {
    id: "next-7-days",
    label: "Next 7 days",
    getValue: () => {
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 6);
      return [today, nextWeek] as [Date, Date];
    },
  },
  {
    id: "this-month",
    label: "This Month",
    getValue: () => {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return [startOfMonth, endOfMonth] as [Date, Date];
    },
  },
  {
    id: "custom-selection",
    label: "Custom Selection",
    isCustom: true, // Flag to identify this as the custom selection option
  },
];

const DateRangePicker: React.FC<DateRangePickerProps> = ({ dateRange, onDateRangeChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  // Temporary date range state for custom selection before applying
  const [tempDateRange, setTempDateRange] = useState<[Date | null, Date | null]>([null, null]);

  // Clear date range selection
  const handleClear = () => {
    onDateRangeChange([null, null]);
    setTempDateRange([null, null]);
    setIsOpen(false);
  };

  // Handle preset selection - apply immediately for regular presets
  // or prepare for custom selection
  const handlePresetClick = (preset: typeof presets[number]) => {
    if (preset.isCustom) {
      // For custom selection, just clear the temp range and keep the popover open
      setTempDateRange([null, null]);
    } else {
      // For regular presets, apply immediately and close the popover
      onDateRangeChange(preset.getValue());
      setTempDateRange([null, null]); // Reset temp range
      setIsOpen(false);
    }
  };
  
  // Handle apply button click - only now we update the actual dateRange
  const handleApplyClick = () => {
    if (tempDateRange[0] && tempDateRange[1]) {
      onDateRangeChange(tempDateRange);
      setIsOpen(false);
    }
  };

  // When opening the popover, initialize the temp date range with current selection
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setTempDateRange([dateRange[0], dateRange[1]]);
    }
    setIsOpen(open);
  };

  // Format the display string for selected date range
  const formatDateRange = () => {
    if (dateRange[0] && dateRange[1]) {
      // If same day, show single date
      if (dateRange[0].toDateString() === dateRange[1].toDateString()) {
        return format(dateRange[0], "PPP");
      }
      // Otherwise show date range
      return `${format(dateRange[0], "PP")} - ${format(dateRange[1], "PP")}`;
    }
    return "Select dates";
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-between w-full text-left font-normal",
            dateRange[0] && "text-foreground"
          )}
        >
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 opacity-50" />
            <span>{formatDateRange()}</span>
          </div>
          {dateRange[0] && dateRange[1] && (
            <Badge 
              variant="secondary" 
              className="ml-2 rounded-sm"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
            >
              Clear
            </Badge>
          )}
          <ChevronDown className="h-4 w-4 opacity-50 ml-auto" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex flex-col sm:flex-row gap-2 p-2 border-b">
          {presets.map((preset) => (
            <Button
              key={preset.id}
              size="sm"
              variant={preset.isCustom && tempDateRange[0] === null ? "default" : "outline"}
              className="text-xs"
              onClick={() => handlePresetClick(preset)}
            >
              {preset.label}
            </Button>
          ))}
          <Button
            size="sm"
            variant="ghost"
            className="text-xs mr-2"
            onClick={handleClear}
          >
            Clear
          </Button>
        </div>
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={tempDateRange[0] || dateRange[0] || undefined}
          selected={{ 
            from: tempDateRange[0] || undefined, 
            to: tempDateRange[1] || undefined 
          }}
          onSelect={(range) => {
            setTempDateRange([range?.from || null, range?.to || null]);
          }}
          numberOfMonths={2}
          className={cn("p-3 pointer-events-auto")}
        />
        <div className="flex items-center justify-end p-4 border-t">
          <Button 
            onClick={handleApplyClick}
            disabled={!tempDateRange[0] || !tempDateRange[1]}
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DateRangePicker;
