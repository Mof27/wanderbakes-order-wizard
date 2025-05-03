
import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { 
  addDays, 
  startOfDay, 
  endOfDay, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth,
  format
} from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";

type DateFilterOption = {
  id: string;
  label: string;
  value: string;
};

const dateFilterOptions: DateFilterOption[] = [
  { id: "all", label: "All Dates", value: "all" },
  { id: "today", label: "Today", value: "today" },
  { id: "tomorrow", label: "Tomorrow", value: "tomorrow" },
  { id: "this-week", label: "This Week", value: "this-week" },
  { id: "this-month", label: "This Month", value: "this-month" },
  { id: "custom", label: "Custom", value: "custom" },
];

const DateFilterBar = () => {
  const { dateRange, setDateRange } = useApp();
  const [activeDateFilter, setActiveDateFilter] = useState<string>("all");
  const [customDateRange, setCustomDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Format the custom date range for display
  const customDateRangeLabel = useMemo(() => {
    if (dateRange[0] && dateRange[1] && activeDateFilter === "custom") {
      return `${format(dateRange[0], "MMM d")} - ${format(dateRange[1], "MMM d")}`;
    }
    return "Custom";
  }, [dateRange, activeDateFilter]);

  // Handle preset date filter selection
  const handleDateFilterClick = (filterId: string) => {
    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    switch (filterId) {
      case "today":
        startDate = startOfDay(now);
        endDate = endOfDay(now);
        break;

      case "tomorrow":
        const tomorrow = addDays(now, 1);
        startDate = startOfDay(tomorrow);
        endDate = endOfDay(tomorrow);
        break;

      case "this-week":
        startDate = startOfWeek(now, { weekStartsOn: 1 }); // Monday
        endDate = endOfWeek(now, { weekStartsOn: 1 }); // Sunday
        break;

      case "this-month":
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;

      case "custom":
        // Open the calendar popover
        setIsCalendarOpen(true);
        setCustomDateRange(dateRange);
        return; // Don't set date range yet for custom

      case "all":
      default:
        // Clear date filter
        startDate = null;
        endDate = null;
        break;
    }

    // Update active filter and global date range
    setActiveDateFilter(filterId);
    setDateRange([startDate, endDate]);
    setIsCalendarOpen(false);
  };

  // Handle custom date range apply button
  const handleApplyCustomDates = () => {
    setDateRange(customDateRange);
    setActiveDateFilter("custom");
    setIsCalendarOpen(false);
  };

  // Handle calendar cancel button
  const handleCancelCustomDates = () => {
    setIsCalendarOpen(false);
  };

  return (
    <div className="space-y-2">
      <h3 className="font-medium text-sm text-muted-foreground">Filter by Date</h3>
      <ToggleGroup 
        type="single" 
        value={activeDateFilter}
        onValueChange={(value) => value && handleDateFilterClick(value)}
        className="flex flex-wrap gap-2"
      >
        {dateFilterOptions.map((option) => (
          option.id === "custom" ? (
            <Popover key={option.id} open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <ToggleGroupItem 
                  value={option.id}
                  className={cn(
                    "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
                    "data-[state=on]:hover:bg-primary data-[state=on]:hover:text-primary-foreground"
                  )}
                >
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  {activeDateFilter === "custom" ? customDateRangeLabel : option.label}
                </ToggleGroupItem>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-3">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={customDateRange[0] || new Date()}
                    selected={{
                      from: customDateRange[0] || undefined,
                      to: customDateRange[1] || undefined,
                    }}
                    onSelect={(range) => {
                      setCustomDateRange([range?.from || null, range?.to || null]);
                    }}
                    numberOfMonths={2}
                    className="pointer-events-auto"
                  />
                  <div className="flex justify-end gap-2 pt-2 border-t mt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleCancelCustomDates}
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleApplyCustomDates}
                      disabled={!customDateRange[0] || !customDateRange[1]}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <ToggleGroupItem
              key={option.id}
              value={option.id}
              className={cn(
                "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
                "data-[state=on]:hover:bg-primary data-[state=on]:hover:text-primary-foreground"
              )}
            >
              {option.label}
            </ToggleGroupItem>
          )
        ))}
      </ToggleGroup>
    </div>
  );
};

export default DateFilterBar;
