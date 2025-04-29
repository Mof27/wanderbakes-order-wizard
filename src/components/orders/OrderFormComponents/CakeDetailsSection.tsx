
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CakeColor, TierDetail } from "@/types";
import ColorPicker from "./ColorPicker/ColorPicker";

interface CakeDetailsSectionProps {
  formData: {
    cakeDesign: string;
    cakeSize: string;
    cakeShape: string;
    cakeTier: number;
    coverColor: string | CakeColor;
  };
  cakeFlavor: string;
  setCakeFlavor: (value: string) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string | number) => void;
  handleCoverColorChange: (value: CakeColor) => void;
  cakeFlavors: string[];
  cakeSizes: string[];
  cakeShapes: string[];
  cakeTiers: number[];
  tierDetails: TierDetail[];
  useSameFlavor: boolean;
  handleToggleSameFlavor: (checked: boolean) => void;
  handleTierDetailChange: (tierIndex: number, field: keyof TierDetail, value: string) => void;
  setActiveTab: (tab: string) => void;
}

const CakeDetailsSection = ({
  formData,
  cakeFlavor,
  setCakeFlavor,
  handleInputChange,
  handleSelectChange,
  handleCoverColorChange,
  cakeFlavors,
  cakeSizes,
  cakeShapes,
  cakeTiers,
  tierDetails,
  useSameFlavor,
  handleToggleSameFlavor,
  handleTierDetailChange,
  setActiveTab
}: CakeDetailsSectionProps) => {
  // Convert legacy string color to CakeColor object if needed
  const coverColor: CakeColor = typeof formData.coverColor === 'string' 
    ? { type: 'solid', color: formData.coverColor } 
    : formData.coverColor as CakeColor;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-medium mb-4">Cake Details *</h3>

          <div className="space-y-4">
            {/* Cake Design at the top */}
            <div className="space-y-2">
              <Label htmlFor="cakeDesign">Cake Design *</Label>
              <Input
                id="cakeDesign"
                name="cakeDesign"
                value={formData.cakeDesign}
                onChange={handleInputChange}
                placeholder="Description of cake design"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cakeFlavor">Cake Flavor *</Label>
              <Select 
                value={cakeFlavor} 
                onValueChange={(value) => setCakeFlavor(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select cake flavor" />
                </SelectTrigger>
                <SelectContent>
                  {cakeFlavors.map((flavor) => (
                    <SelectItem key={flavor} value={flavor}>{flavor}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cakeTier">Cake Tiers *</Label>
                <Select 
                  value={formData.cakeTier.toString()} 
                  onValueChange={(value) => handleSelectChange("cakeTier", parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tier count" />
                  </SelectTrigger>
                  <SelectContent>
                    {cakeTiers.map((tier) => (
                      <SelectItem key={tier} value={tier.toString()}>{tier} Tier</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Show cake shape only if it's a single tier */}
              {formData.cakeTier === 1 && (
                <div className="space-y-2">
                  <Label htmlFor="cakeShape">Cake Shape *</Label>
                  <Select 
                    value={formData.cakeShape} 
                    onValueChange={(value) => handleSelectChange("cakeShape", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select cake shape" />
                    </SelectTrigger>
                    <SelectContent>
                      {cakeShapes.map((shape) => (
                        <SelectItem key={shape} value={shape}>{shape}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Single tier cake size - only show if it's a single tier */}
            {formData.cakeTier === 1 && (
              <div className="space-y-2">
                <Label htmlFor="cakeSize">Cake Size *</Label>
                <Select 
                  value={formData.cakeSize} 
                  onValueChange={(value) => handleSelectChange("cakeSize", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select cake size" />
                  </SelectTrigger>
                  <SelectContent>
                    {cakeSizes.map((size) => (
                      <SelectItem key={size} value={size}>{size}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Multi-tier cake details */}
            {formData.cakeTier > 1 && (
              <div className="space-y-4 mt-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="sameFlavor" 
                    checked={useSameFlavor}
                    onCheckedChange={handleToggleSameFlavor}
                  />
                  <Label htmlFor="sameFlavor">Use same flavor for all tiers</Label>
                </div>

                {/* Tier details section */}
                <div className="space-y-4 border rounded-md p-4">
                  <h4 className="font-medium">Tier Details</h4>
                  {Array.from({ length: formData.cakeTier }).map((_, index) => (
                    <div key={index} className="border-t pt-3 mt-3 first:border-t-0 first:pt-0 first:mt-0">
                      <h5 className="font-medium mb-2">Tier {index + 1} {index === 0 ? "(Bottom)" : index === formData.cakeTier - 1 ? "(Top)" : ""}</h5>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor={`tier-${index}-shape`}>Shape *</Label>
                          <Select 
                            value={tierDetails[index]?.shape || "Round"} 
                            onValueChange={(value) => handleTierDetailChange(index, "shape", value)}
                          >
                            <SelectTrigger id={`tier-${index}-shape`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {cakeShapes.map((shape) => (
                                <SelectItem key={shape} value={shape}>{shape}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`tier-${index}-size`}>Size *</Label>
                          <Select 
                            value={tierDetails[index]?.size || "16 CM"} 
                            onValueChange={(value) => handleTierDetailChange(index, "size", value)}
                          >
                            <SelectTrigger id={`tier-${index}-size`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {cakeSizes.map((size) => (
                                <SelectItem key={size} value={size}>{size}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Flavor selection for each tier if not using same flavor */}
                      {!useSameFlavor && (
                        <div className="space-y-1 mt-3">
                          <Label htmlFor={`tier-${index}-flavor`}>Flavor *</Label>
                          <Select 
                            value={tierDetails[index]?.flavor || ""} 
                            onValueChange={(value) => handleTierDetailChange(index, "flavor", value)}
                          >
                            <SelectTrigger id={`tier-${index}-flavor`}>
                              <SelectValue placeholder="Select flavor" />
                            </SelectTrigger>
                            <SelectContent>
                              {cakeFlavors.map((flavor) => (
                                <SelectItem key={flavor} value={flavor}>{flavor}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="coverColor">Cover Color *</Label>
              <ColorPicker 
                value={coverColor}
                onChange={handleCoverColorChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          variant="outline" 
          onClick={() => setActiveTab("optional")}
          className="w-full md:w-auto"
        >
          Continue to Additional Details
        </Button>
      </div>
    </div>
  );
};

export default CakeDetailsSection;
