
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Clock, CalendarClock, Timer, ArrowDown, ArrowUp } from "lucide-react";

type TimeSlotFilterValue = 'all' | 'late' | 'within-2-hours' | 'slot1' | 'slot2' | 'slot3';

type DeliveryTimeSlotFilterProps = {
  value: TimeSlotFilterValue;
  onChange: (value: TimeSlotFilterValue) => void;
};

const DeliveryTimeSlotFilter = ({ value, onChange }: DeliveryTimeSlotFilterProps) => {
  return (
    <div className="flex flex-col space-y-2">
      <span className="text-sm font-medium">Delivery Time</span>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "min-w-20",
            value === 'all' && "bg-gray-100 text-gray-800 border-gray-200"
          )}
          onClick={() => onChange('all')}
        >
          <Clock className="h-4 w-4 mr-2" />
          All Times
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "min-w-20",
            value === 'late' && "bg-red-100 text-red-800 border-red-200"
          )}
          onClick={() => onChange('late')}
        >
          <ArrowDown className="h-4 w-4 mr-2" />
          Late
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "min-w-20",
            value === 'within-2-hours' && "bg-amber-100 text-amber-800 border-amber-200"
          )}
          onClick={() => onChange('within-2-hours')}
        >
          <Timer className="h-4 w-4 mr-2" />
          Within 2 Hours
        </Button>

        <Button
          variant="outline"
          size="sm"
          className={cn(
            "min-w-20",
            value === 'slot1' && "bg-purple-100 text-purple-800 border-purple-200"
          )}
          onClick={() => onChange('slot1')}
        >
          <CalendarClock className="h-4 w-4 mr-2" />
          Slot 1 (10:00-13:00)
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "min-w-20",
            value === 'slot2' && "bg-blue-100 text-blue-800 border-blue-200"
          )}
          onClick={() => onChange('slot2')}
        >
          <CalendarClock className="h-4 w-4 mr-2" />
          Slot 2 (13:00-16:00)
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "min-w-20",
            value === 'slot3' && "bg-indigo-100 text-indigo-800 border-indigo-200"
          )}
          onClick={() => onChange('slot3')}
        >
          <CalendarClock className="h-4 w-4 mr-2" />
          Slot 3 (16:00-20:00)
        </Button>
      </div>
    </div>
  );
};

export default DeliveryTimeSlotFilter;
