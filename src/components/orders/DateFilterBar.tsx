
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { addDays, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";

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
  { id: "today-tomorrow", label: "Today & Tomorrow", value: "today-tomorrow" },
  { id: "next-3-days", label: "Next 3 Days", value: "next-3-days" },
  { id: "custom", label: "Custom", value: "custom" },
];

const DateFilterBar = () => {
  const { dateRange, setDateRange } = useApp();
  const [activeDateFilter, setActiveDateFilter] = useState<string>("all");
  const [customDateRange, setCustomDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

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

      case "today-tomorrow":
        startDate = startOfDay(now);
        endDate = endOfDay(addDays(now, 1));
        break;

      case "next-3-days":
        startDate = startOfDay(now);
        endDate = endOfDay(addDays(now, 2)); // Today + 2 days = 3 days
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
      <div className="flex flex-wrap gap-2">
        {dateFilterOptions.map((option) => (
          option.id === "custom" ? (
            <Popover key={option.id} open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    activeDateFilter === option.id ? "bg-primary text-primary-foreground" : ""
                  )}
                  onClick={() => handleDateFilterClick(option.id)}
                >
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  {option.label}
                </Button>
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
            <Button
              key={option.id}
              variant="outline"
              size="sm"
              className={cn(
                activeDateFilter === option.id ? "bg-primary text-primary-foreground" : ""
              )}
              onClick={() => handleDateFilterClick(option.id)}
            >
              {option.label}
            </Button>
          )
        ))}
      </div>
    </div>
  );
};

export default DateFilterBar;
