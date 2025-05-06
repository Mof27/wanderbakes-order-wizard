
import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, addDays } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type DateFilterValue = 'today' | 'tomorrow' | 'd-plus-2' | 'all';

interface CompactDeliveryDateFilterProps {
  value: DateFilterValue;
  onChange: (value: DateFilterValue) => void;
}

const CompactDeliveryDateFilter: React.FC<CompactDeliveryDateFilterProps> = ({
  value,
  onChange
}) => {
  const today = new Date();
  const todayFormatted = format(today, 'MMM d');
  const tomorrowFormatted = format(addDays(today, 1), 'MMM d');
  const dPlus2Formatted = format(addDays(today, 2), 'MMM d');

  const options = [
    { value: 'today', label: `Today (${todayFormatted})` },
    { value: 'tomorrow', label: `Tomorrow (${tomorrowFormatted})` },
    { value: 'd-plus-2', label: dPlus2Formatted },
    { value: 'all', label: 'All Dates' }
  ];

  return (
    <div className="w-full">
      <span className="text-sm font-medium mb-2 block">Delivery Date</span>
      
      {/* Desktop version using buttons */}
      <div className="hidden md:flex space-x-2">
        {options.map(option => (
          <Button
            key={option.value}
            variant="outline"
            size="sm"
            className={cn(
              "min-w-20",
              value === option.value && "bg-primary text-primary-foreground"
            )}
            onClick={() => onChange(option.value as DateFilterValue)}
          >
            {option.value !== 'all' && <Calendar className="h-4 w-4 mr-2" />}
            {option.label}
          </Button>
        ))}
      </div>
      
      {/* Mobile version using select dropdown */}
      <div className="block md:hidden w-full">
        <Select 
          value={value} 
          onValueChange={(val) => onChange(val as DateFilterValue)}
        >
          <SelectTrigger className="w-full">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Select date" />
          </SelectTrigger>
          <SelectContent>
            {options.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default CompactDeliveryDateFilter;
