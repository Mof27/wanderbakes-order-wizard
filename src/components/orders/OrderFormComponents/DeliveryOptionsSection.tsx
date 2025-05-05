
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, parseCurrencyInput } from "@/lib/utils";
import { useEffect, useState } from "react";
import { DeliveryMethod, FlatRateTimeSlot } from "@/types";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Clock10, Package, UserRound } from "lucide-react";

// Define time slots
const TIME_SLOTS = {
  slot1: "10.00 s/d 13.00 WIB",
  slot2: "13.00 s/d 16.00 WIB",
  slot3: "16.00 s/d 20.00 WIB"
};

// Define custom time slots with 30-minute intervals
const generateCustomTimeOptions = () => {
  const options = [];
  for (let hour = 6; hour <= 23; hour++) {
    const hourStr = hour.toString().padStart(2, "0");
    options.push(`${hourStr}.00 WIB`);
    options.push(`${hourStr}.30 WIB`);
  }
  return options;
};

const CUSTOM_TIME_OPTIONS = generateCustomTimeOptions();

interface DeliveryOptionsSectionProps {
  deliveryMethod: DeliveryMethod;
  deliveryTimeSlot: string;
  deliveryPrice: number;
  onMethodChange: (method: DeliveryMethod) => void;
  onTimeSlotChange: (timeSlot: string) => void;
  onPriceChange: (price: number) => void;
  readOnly?: boolean;
}

const DeliveryOptionsSection = ({
  deliveryMethod,
  deliveryTimeSlot,
  deliveryPrice,
  onMethodChange,
  onTimeSlotChange,
  onPriceChange,
  readOnly = false
}: DeliveryOptionsSectionProps) => {
  const [displayPrice, setDisplayPrice] = useState<string>("");
  
  // Format the initial price value
  useEffect(() => {
    if (deliveryPrice > 0) {
      setDisplayPrice(formatCurrency(deliveryPrice).replace("Rp", "").trim());
    } else {
      setDisplayPrice("");
    }
  }, [deliveryPrice]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/\D/g, "");
    if (!inputValue) {
      setDisplayPrice("");
      onPriceChange(0);
      return;
    }

    const numericValue = parseInt(inputValue, 10);
    onPriceChange(numericValue);

    // Format for display
    setDisplayPrice(formatCurrency(numericValue).replace("Rp", "").trim());
  };

  const handleBlur = () => {
    // Ensure we have a properly formatted value when the field loses focus
    if (displayPrice) {
      setDisplayPrice(formatCurrency(deliveryPrice).replace("Rp", "").trim());
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Delivery Options *</h3>
      
      <div className="space-y-2">
        <Label>Delivery Method *</Label>
        <ToggleGroup 
          type="single" 
          value={deliveryMethod} 
          onValueChange={(value) => {
            if (value && !readOnly) onMethodChange(value as DeliveryMethod);
          }}
          className="justify-start"
          disabled={readOnly}
        >
          <ToggleGroupItem value="flat-rate" aria-label="Flat Rate Delivery" disabled={readOnly}>
            <Package className="h-4 w-4 mr-2" />
            Flat Rate
          </ToggleGroupItem>
          <ToggleGroupItem value="lalamove" aria-label="Lalamove" disabled={readOnly}>
            <Clock10 className="h-4 w-4 mr-2" />
            Lalamove
          </ToggleGroupItem>
          <ToggleGroupItem value="self-pickup" aria-label="Self-Pickup" disabled={readOnly}>
            <UserRound className="h-4 w-4 mr-2" />
            Self-Pickup
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="space-y-2">
        <Label>Delivery Time *</Label>
        
        {deliveryMethod === "flat-rate" ? (
          <Select 
            value={deliveryTimeSlot} 
            onValueChange={onTimeSlotChange}
            disabled={readOnly}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select delivery time slot" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="slot1">{TIME_SLOTS.slot1}</SelectItem>
              <SelectItem value="slot2">{TIME_SLOTS.slot2}</SelectItem>
              <SelectItem value="slot3">{TIME_SLOTS.slot3}</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <Select 
            value={deliveryTimeSlot} 
            onValueChange={onTimeSlotChange}
            disabled={readOnly}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select delivery time" />
            </SelectTrigger>
            <SelectContent>
              {CUSTOM_TIME_OPTIONS.map((timeOption) => (
                <SelectItem key={timeOption} value={timeOption}>
                  {timeOption}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="deliveryPrice">Delivery Price (IDR) *</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            Rp
          </span>
          <Input
            id="deliveryPrice"
            name="deliveryPrice"
            value={displayPrice}
            onChange={handlePriceChange}
            onBlur={handleBlur}
            className="pl-10"
            required
            disabled={readOnly}
          />
        </div>
      </div>
    </div>
  );
};

export default DeliveryOptionsSection;
