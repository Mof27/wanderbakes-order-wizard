
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, addDays } from "date-fns";

type DeliveryDateFilterProps = {
  value: 'today' | 'tomorrow' | 'd-plus-2' | 'all';
  onChange: (value: 'today' | 'tomorrow' | 'd-plus-2' | 'all') => void;
};

const DeliveryDateFilter = ({ value, onChange }: DeliveryDateFilterProps) => {
  // Get the formatted dates for display
  const today = new Date();
  const todayFormatted = format(today, 'MMM d');
  const tomorrowFormatted = format(addDays(today, 1), 'MMM d');
  const dPlus2Formatted = format(addDays(today, 2), 'MMM d');

  return (
    <div className="flex flex-col space-y-2">
      <span className="text-sm font-medium">Delivery Date</span>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "min-w-20",
            value === 'today' && "bg-primary text-primary-foreground"
          )}
          onClick={() => onChange('today')}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Today ({todayFormatted})
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "min-w-20",
            value === 'tomorrow' && "bg-primary text-primary-foreground"
          )}
          onClick={() => onChange('tomorrow')}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Tomorrow ({tomorrowFormatted})
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "min-w-20",
            value === 'd-plus-2' && "bg-primary text-primary-foreground"
          )}
          onClick={() => onChange('d-plus-2')}
        >
          <ArrowRight className="h-4 w-4 mr-2" />
          {dPlus2Formatted}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "min-w-20",
            value === 'all' && "bg-primary text-primary-foreground"
          )}
          onClick={() => onChange('all')}
        >
          All
        </Button>
      </div>
    </div>
  );
};

export default DeliveryDateFilter;
