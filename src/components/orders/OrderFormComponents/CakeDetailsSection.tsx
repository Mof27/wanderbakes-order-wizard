import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CakeColor, TierDetail, CoverType } from "@/types";
import ColorPicker from "./ColorPicker/ColorPicker";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Brush, Droplet, Circle, Square, Edit } from "lucide-react";

// Height options for cake tiers
const cakeHeightOptions = [
  "2 Layer - 10 CM",
  "3 Layer - 15 CM",
  "4 Layer - 20 CM",
];

interface CakeDetailsSectionProps {
  formData: {
    cakeDesign: string;
    cakeSize: string;
    cakeShape: string;
    cakeTier: number;
    coverColor: CakeColor;
    coverType?: CoverType;
    customShape?: string; // Add property for custom shape
  };
  cakeFlavor: string;
  setCakeFlavor: (value: string) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string | number) => void;
  handleCoverColorChange: (value: CakeColor) => void;
  handleCoverTypeChange: (value: CoverType) => void;
  cakeFlavors: string[];
  cakeSizes: string[];
  cakeShapes: string[];
  cakeTiers: number[];
  tierDetails: TierDetail[];
  useSameFlavor: boolean;
  useSameCover: boolean;
  handleToggleSameFlavor: (checked: boolean) => void;
  handleToggleSameCover: (checked: boolean) => void;
  handleTierDetailChange: (tierIndex: number, field: keyof TierDetail, value: string | CakeColor | CoverType) => void;
  setActiveTab: (tab: string) => void;
}

const CakeDetailsSection = ({
  formData,
  cakeFlavor,
  setCakeFlavor,
  handleInputChange,
  handleSelectChange,
  handleCoverColorChange,
  handleCoverTypeChange,
  cakeFlavors,
  cakeSizes,
  cakeShapes,
  cakeTiers,
  tierDetails,
  useSameFlavor,
  useSameCover,
  handleToggleSameFlavor,
  handleToggleSameCover,
  handleTierDetailChange,
  setActiveTab
}: CakeDetailsSectionProps) => {
  // Convert legacy string color to CakeColor object if needed
  const coverColor = formData.coverColor;
  const isCustomShape = formData.cakeShape === "Custom";
  
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

            {/* Cake Shape selection as ToggleGroup - moved right after flavor */}
            <div className="space-y-2">
              <Label>Cake Shape *</Label>
              <ToggleGroup
                type="single"
                value={formData.cakeShape}
                onValueChange={(value) => value && handleSelectChange("cakeShape", value)}
                className="justify-start"
              >
                <ToggleGroupItem value="Round" aria-label="Round" className="px-4 py-2 flex gap-2 items-center">
                  <Circle className="h-4 w-4" />
                  <span>Round</span>
                </ToggleGroupItem>
                <ToggleGroupItem value="Square" aria-label="Square" className="px-4 py-2 flex gap-2 items-center">
                  <Square className="h-4 w-4" />
                  <span>Square</span>
                </ToggleGroupItem>
                <ToggleGroupItem value="Custom" aria-label="Custom" className="px-4 py-2 flex gap-2 items-center">
                  <Edit className="h-4 w-4" />
                  <span>Custom</span>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* Custom shape input - only show when Custom is selected */}
            {isCustomShape && (
              <div className="space-y-2">
                <Label htmlFor="customShape">Custom Shape Description *</Label>
                <Input
                  id="customShape"
                  name="customShape"
                  value={formData.customShape || ""}
                  onChange={handleInputChange}
                  placeholder="Describe the custom cake shape"
                />
              </div>
            )}

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
            </div>

            {/* Single tier cake size - only show if it's a single tier */}
            {formData.cakeTier === 1 && (
              <>
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

                {/* Add cake height selection for single tier */}
                <div className="space-y-2">
                  <Label htmlFor="cakeHeight">Cake Height *</Label>
                  <Select
                    value={tierDetails[0]?.height || cakeHeightOptions[0]}
                    onValueChange={(value) => handleTierDetailChange(0, "height", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select cake height" />
                    </SelectTrigger>
                    <SelectContent>
                      {cakeHeightOptions.map((height) => (
                        <SelectItem key={height} value={height}>{height}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Cover type selection for single tier - replaced RadioGroup with ToggleGroup */}
                <div className="space-y-2">
                  <Label>Cover Type *</Label>
                  <ToggleGroup
                    type="single"
                    value={formData.coverType || "buttercream"}
                    onValueChange={(value) => value && handleCoverTypeChange(value as CoverType)}
                    className="justify-start"
                  >
                    <ToggleGroupItem value="buttercream" aria-label="Buttercream" className="px-4 py-2 flex gap-2 items-center">
                      <Droplet className="h-4 w-4" />
                      <span>Buttercream</span>
                    </ToggleGroupItem>
                    <ToggleGroupItem value="fondant" aria-label="Fondant" className="px-4 py-2 flex gap-2 items-center">
                      <Brush className="h-4 w-4" />
                      <span>Fondant</span>
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>

                {/* Cover color for single tier */}
                <div className="space-y-2">
                  <Label htmlFor="coverColor">Cover Color *</Label>
                  <ColorPicker 
                    value={coverColor}
                    onChange={handleCoverColorChange}
                    coverType={formData.coverType}
                  />
                </div>
              </>
            )}

            {/* Multi-tier cake details */}
            {formData.cakeTier > 1 && (
              <div className="space-y-4 mt-4">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="sameFlavor" 
                      checked={useSameFlavor}
                      onCheckedChange={handleToggleSameFlavor}
                    />
                    <Label htmlFor="sameFlavor">Use same flavor for all tiers</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="sameCover" 
                      checked={useSameCover}
                      onCheckedChange={handleToggleSameCover}
                    />
                    <Label htmlFor="sameCover">Use same cover for all tiers</Label>
                  </div>
                </div>

                {/* If using same cover for all tiers, show the main cover options */}
                {useSameCover && (
                  <div className="space-y-4 border rounded-md p-4">
                    <h4 className="font-medium">Cover for All Tiers</h4>
                    
                    <div className="space-y-2">
                      <Label>Cover Type *</Label>
                      <ToggleGroup 
                        type="single"
                        value={formData.coverType || "buttercream"}
                        onValueChange={(value) => value && handleCoverTypeChange(value as CoverType)}
                        className="justify-start"
                      >
                        <ToggleGroupItem value="buttercream" aria-label="Buttercream" className="px-4 py-2 flex gap-2 items-center">
                          <Droplet className="h-4 w-4" />
                          <span>Buttercream</span>
                        </ToggleGroupItem>
                        <ToggleGroupItem value="fondant" aria-label="Fondant" className="px-4 py-2 flex gap-2 items-center">
                          <Brush className="h-4 w-4" />
                          <span>Fondant</span>
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="coverColor">Cover Color *</Label>
                      <ColorPicker 
                        value={coverColor}
                        onChange={handleCoverColorChange}
                        coverType={formData.coverType}
                      />
                    </div>
                  </div>
                )}

                {/* Tier details section */}
                <div className="space-y-4 border rounded-md p-4">
                  <h4 className="font-medium">Tier Details</h4>
                  {Array.from({ length: formData.cakeTier }).map((_, index) => (
                    <div key={index} className="border-t pt-3 mt-3 first:border-t-0 first:pt-0 first:mt-0">
                      <h5 className="font-medium mb-2">Tier {index + 1} {index === 0 ? "(Bottom)" : index === formData.cakeTier - 1 ? "(Top)" : ""}</h5>
                      <div className="space-y-3">
                        {/* Cake Shape using ToggleGroup for each tier */}
                        <div className="space-y-1">
                          <Label htmlFor={`tier-${index}-shape`}>Shape *</Label>
                          <ToggleGroup 
                            type="single"
                            value={tierDetails[index]?.shape || "Round"}
                            onValueChange={(value) => value && handleTierDetailChange(index, "shape", value)}
                            className="justify-start"
                          >
                            <ToggleGroupItem value="Round" aria-label="Round" className="px-3 py-1 flex gap-1 items-center text-sm">
                              <Circle className="h-3 w-3" />
                              <span>Round</span>
                            </ToggleGroupItem>
                            <ToggleGroupItem value="Square" aria-label="Square" className="px-3 py-1 flex gap-1 items-center text-sm">
                              <Square className="h-3 w-3" />
                              <span>Square</span>
                            </ToggleGroupItem>
                            <ToggleGroupItem value="Custom" aria-label="Custom" className="px-3 py-1 flex gap-1 items-center text-sm">
                              <Edit className="h-3 w-3" />
                              <span>Custom</span>
                            </ToggleGroupItem>
                          </ToggleGroup>
                        </div>

                        {/* Custom shape input for each tier when Custom is selected */}
                        {tierDetails[index]?.shape === "Custom" && (
                          <div className="space-y-1">
                            <Label htmlFor={`tier-${index}-customShape`}>Custom Shape Description *</Label>
                            <Input
                              id={`tier-${index}-customShape`}
                              value={tierDetails[index]?.customShape || ""}
                              onChange={(e) => handleTierDetailChange(index, "customShape", e.target.value)}
                              placeholder="Describe the custom cake shape"
                            />
                          </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-3">
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

                          <div className="space-y-1">
                            <Label htmlFor={`tier-${index}-height`}>Height *</Label>
                            <Select 
                              value={tierDetails[index]?.height || cakeHeightOptions[0]} 
                              onValueChange={(value) => handleTierDetailChange(index, "height", value)}
                            >
                              <SelectTrigger id={`tier-${index}-height`}>
                                <SelectValue placeholder="Select height" />
                              </SelectTrigger>
                              <SelectContent>
                                {cakeHeightOptions.map((height) => (
                                  <SelectItem key={height} value={height}>{height}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Flavor selection for each tier if not using same flavor */}
                        {!useSameFlavor && (
                          <div className="space-y-1">
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

                        {/* Cover type and color for this tier if not using same cover */}
                        {!useSameCover && (
                          <div className="space-y-4 mt-3">
                            <div className="space-y-2">
                              <Label>Cover Type for Tier {index + 1} *</Label>
                              <ToggleGroup 
                                type="single"
                                value={tierDetails[index]?.coverType || "buttercream"}
                                onValueChange={(value) => value && handleTierDetailChange(index, "coverType", value as CoverType)}
                                className="justify-start"
                              >
                                <ToggleGroupItem value="buttercream" aria-label="Buttercream" className="px-3 py-1 flex gap-1 items-center text-sm">
                                  <Droplet className="h-3 w-3" />
                                  <span>Buttercream</span>
                                </ToggleGroupItem>
                                <ToggleGroupItem value="fondant" aria-label="Fondant" className="px-3 py-1 flex gap-1 items-center text-sm">
                                  <Brush className="h-3 w-3" />
                                  <span>Fondant</span>
                                </ToggleGroupItem>
                              </ToggleGroup>
                            </div>

                            <div className="space-y-2">
                              <Label>Cover Color for Tier {index + 1} *</Label>
                              <ColorPicker 
                                value={tierDetails[index]?.coverColor || { type: 'solid', color: '#FFFFFF' }}
                                onChange={(color) => handleTierDetailChange(index, "coverColor", color)}
                                coverType={tierDetails[index]?.coverType}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
