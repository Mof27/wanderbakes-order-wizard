
import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";

interface DateFilterBarProps {
  selectedDate: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
}

const DateFilterBar: React.FC<DateFilterBarProps> = ({ 
  selectedDate, 
  onDateChange 
}) => {
  // Handle clearing the date filter
  const handleClearDate = () => {
    onDateChange(undefined);
  };

  return (
    <div className="flex items-center space-x-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "min-w-[240px] justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? format(selectedDate, "PPP") : "Filter by date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onDateChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      
      {selectedDate && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleClearDate}
          className="rounded-full h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear date filter</span>
        </Button>
      )}
    </div>
  );
};

export default DateFilterBar;
