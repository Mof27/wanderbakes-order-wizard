
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface PriceSectionProps {
  totalPrice: number;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const PriceSection = ({ totalPrice, handleInputChange }: PriceSectionProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="totalPrice">Price (IDR) *</Label>
      <Input
        id="totalPrice"
        name="totalPrice"
        type="number"
        value={totalPrice}
        onChange={handleInputChange}
        required
      />
    </div>
  );
};

export default PriceSection;
