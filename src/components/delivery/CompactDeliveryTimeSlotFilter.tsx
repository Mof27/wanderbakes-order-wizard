
import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Clock, CalendarClock, Timer, ArrowDown, ArrowUp } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TimeSlotFilterValue = 'all' | 'late' | 'within-2-hours' | 'slot1' | 'slot2' | 'slot3';

interface CompactDeliveryTimeSlotFilterProps {
  value: TimeSlotFilterValue;
  onChange: (value: TimeSlotFilterValue) => void;
}

const CompactDeliveryTimeSlotFilter: React.FC<CompactDeliveryTimeSlotFilterProps> = ({ 
  value, 
  onChange 
}) => {
  const timeSlotOptions = [
    { value: 'all', label: 'All Times', icon: Clock, className: "bg-gray-100 text-gray-800 border-gray-200" },
    { value: 'late', label: 'Late', icon: ArrowDown, className: "bg-red-100 text-red-800 border-red-200" },
    { value: 'within-2-hours', label: 'Within 2 Hours', icon: Timer, className: "bg-amber-100 text-amber-800 border-amber-200" },
    { value: 'slot1', label: 'Slot 1 (10:00-13:00)', icon: CalendarClock, className: "bg-purple-100 text-purple-800 border-purple-200" },
    { value: 'slot2', label: 'Slot 2 (13:00-16:00)', icon: CalendarClock, className: "bg-blue-100 text-blue-800 border-blue-200" },
    { value: 'slot3', label: 'Slot 3 (16:00-20:00)', icon: CalendarClock, className: "bg-indigo-100 text-indigo-800 border-indigo-200" }
  ];

  const selectedOption = timeSlotOptions.find(option => option.value === value) || timeSlotOptions[0];
  const Icon = selectedOption.icon;

  return (
    <div className="w-full">
      <span className="text-sm font-medium mb-2 block">Delivery Time</span>

      {/* Desktop version */}
      <div className="hidden md:flex flex-wrap gap-2">
        {timeSlotOptions.map(option => {
          const OptionIcon = option.icon;
          return (
            <Button
              key={option.value}
              variant="outline"
              size="sm"
              className={cn(
                "min-w-20",
                value === option.value && option.className
              )}
              onClick={() => onChange(option.value as TimeSlotFilterValue)}
            >
              <OptionIcon className="h-4 w-4 mr-2" />
              {option.label}
            </Button>
          );
        })}
      </div>

      {/* Mobile version */}
      <div className="block md:hidden w-full">
        <Select 
          value={value} 
          onValueChange={(val) => onChange(val as TimeSlotFilterValue)}
        >
          <SelectTrigger className="w-full">
            <Icon className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Select time slot" />
          </SelectTrigger>
          <SelectContent>
            {timeSlotOptions.map(option => {
              const OptionIcon = option.icon;
              return (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  className={cn("flex items-center", option.value === value && option.className)}
                >
                  <div className="flex items-center">
                    <OptionIcon className="h-4 w-4 mr-2" />
                    {option.label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default CompactDeliveryTimeSlotFilter;
