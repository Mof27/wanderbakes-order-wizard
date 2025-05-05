
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { format, subDays } from "date-fns";
import { CalendarIcon } from "lucide-react";

interface DateSelectionSectionProps {
  orderDate: Date | undefined;
  setOrderDate: (date: Date | undefined) => void;
  deliveryDate: Date | undefined;
  setDeliveryDate: (date: Date | undefined) => void;
  readOnly?: boolean;
}

const DateSelectionSection = ({ 
  orderDate, 
  setOrderDate, 
  deliveryDate, 
  setDeliveryDate,
  readOnly = false
}: DateSelectionSectionProps) => {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
      {/* Order Date Field */}
      <div className="space-y-2">
        <Label htmlFor="orderDate">Order Date *</Label>
        <Popover>
          <PopoverTrigger asChild disabled={readOnly}>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !orderDate && "text-muted-foreground"
              )}
              disabled={readOnly}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {orderDate ? (
                format(orderDate, "d MMMM yyyy")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={orderDate}
              onSelect={setOrderDate}
              initialFocus
              className="pointer-events-auto"
              disabled={(date) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const threeDaysAgo = subDays(today, 3);
                // Disable dates more than 3 days in the past or any future dates
                return date < threeDaysAgo || date > today || readOnly;
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="deliveryDate">Delivery Date *</Label>
        <Popover>
          <PopoverTrigger asChild disabled={readOnly}>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !deliveryDate && "text-muted-foreground"
              )}
              disabled={readOnly}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {deliveryDate ? (
                format(deliveryDate, "d MMMM yyyy")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={deliveryDate}
              onSelect={setDeliveryDate}
              initialFocus
              className="pointer-events-auto"
              disabled={readOnly}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default DateSelectionSection;
