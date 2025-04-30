
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, parseCurrencyInput } from "@/lib/utils";
import { useEffect, useState } from "react";
import { DeliveryMethod, FlatRateTimeSlot } from "@/types";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Clock10, Package, UserRound } from "lucide-react";
import { TimePickerInput } from "../OrderFormComponents/TimePickerInput";

// Define time slots
const TIME_SLOTS = {
  slot1: "10.00 s/d 13.00 WIB",
  slot2: "13.00 s/d 16.00 WIB",
  slot3: "16.00 s/d 20.00 WIB"
};

interface DeliveryOptionsSectionProps {
  deliveryMethod: DeliveryMethod;
  deliveryTimeSlot: string;
  deliveryPrice: number;
  onMethodChange: (method: DeliveryMethod) => void;
  onTimeSlotChange: (timeSlot: string) => void;
  onPriceChange: (price: number) => void;
}

const DeliveryOptionsSection = ({
  deliveryMethod,
  deliveryTimeSlot,
  deliveryPrice,
  onMethodChange,
  onTimeSlotChange,
  onPriceChange
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
            if (value) onMethodChange(value as DeliveryMethod);
          }}
          className="justify-start"
        >
          <ToggleGroupItem value="flat-rate" aria-label="Flat Rate Delivery">
            <Package className="h-4 w-4 mr-2" />
            Flat Rate
          </ToggleGroupItem>
          <ToggleGroupItem value="lalamove" aria-label="Lalamove">
            <Clock10 className="h-4 w-4 mr-2" />
            Lalamove
          </ToggleGroupItem>
          <ToggleGroupItem value="self-pickup" aria-label="Self-Pickup">
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
          <TimePickerInput 
            value={deliveryTimeSlot} 
            onChange={onTimeSlotChange}
            minHour={6}
            maxHour={23}
          />
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
          />
        </div>
      </div>
    </div>
  );
};

export default DeliveryOptionsSection;
