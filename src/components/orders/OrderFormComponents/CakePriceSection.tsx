
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { formatCurrency, parseCurrencyInput } from "@/lib/utils";
import { useEffect, useState } from "react";

interface CakePriceSectionProps {
  cakePrice: number;
  onPriceChange: (price: number) => void;
  readOnly?: boolean;
}

const CakePriceSection = ({ cakePrice, onPriceChange, readOnly = false }: CakePriceSectionProps) => {
  const [displayValue, setDisplayValue] = useState<string>("");

  // Format the initial price value
  useEffect(() => {
    setDisplayValue(formatCurrency(cakePrice).replace("Rp", "").trim());
  }, [cakePrice]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/\D/g, "");
    if (!inputValue) {
      setDisplayValue("");
      onPriceChange(0);
      return;
    }

    const numericValue = parseInt(inputValue, 10);
    onPriceChange(numericValue);

    // Format for display
    setDisplayValue(formatCurrency(numericValue).replace("Rp", "").trim());
  };

  const handleBlur = () => {
    // Ensure we have a properly formatted value when the field loses focus
    if (displayValue) {
      setDisplayValue(formatCurrency(cakePrice).replace("Rp", "").trim());
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="cakePrice">Cake Price (IDR) *</Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
          Rp
        </span>
        <Input
          id="cakePrice"
          name="cakePrice"
          value={displayValue}
          onChange={handlePriceChange}
          onBlur={handleBlur}
          className="pl-10"
          required
          disabled={readOnly}
        />
      </div>
    </div>
  );
};

export default CakePriceSection;
