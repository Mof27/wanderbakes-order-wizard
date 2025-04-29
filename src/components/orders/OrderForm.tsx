import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Customer, Order, Ingredient, Address, TierDetail, PackingItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { format, addDays, subDays } from "date-fns";
import { CalendarIcon, FileImage, Plus, MapPin, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import CustomerSearch from "@/components/customers/CustomerSearch";
import { cakeFlavors, cakeSizes, cakeColors, mockIngredients, areaOptions, cakeShapes, cakeTiers, defaultPackingItems } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/components/ui/sonner";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface OrderFormProps {
  order?: Order;
}

const OrderForm = ({ order }: OrderFormProps) => {
  const navigate = useNavigate();
  const { addOrder, updateOrder, updateCustomer } = useApp();
  const [customer, setCustomer] = useState<Customer | null>(order?.customer || null);
  
  // Add order date with default as today
  const [orderDate, setOrderDate] = useState<Date | undefined>(
    order?.orderDate || new Date()
  );
  
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(
    order?.deliveryDate ? new Date(order.deliveryDate) : undefined
  );
  const [cakeFlavor, setCakeFlavor] = useState(order?.cakeFlavor || "");
  const [ingredients, setIngredients] = useState<Ingredient[]>(order?.ingredients || []);
  const [activeTab, setActiveTab] = useState("required");
  const [useSameFlavor, setUseSameFlavor] = useState(order?.useSameFlavor !== false);
  const [packingItems, setPackingItems] = useState<PackingItem[]>(
    order?.packingItems || [...defaultPackingItems]
  );
  
  // New state for address handling
  const [selectedAddressId, setSelectedAddressId] = useState<string | "new">(
    order?.deliveryAddress ? "existing" : "new"
  );
  const [newAddressDialogOpen, setNewAddressDialogOpen] = useState(false);
  const [newAddress, setNewAddress] = useState<Partial<Address>>({
    text: "",
    area: "Jakarta",
    deliveryNotes: ""
  });

  const [formData, setFormData] = useState({
    deliveryAddress: order?.deliveryAddress || "",
    deliveryAddressNotes: order?.deliveryAddressNotes || "",
    deliveryArea: order?.deliveryArea || "Jakarta",
    cakeDesign: order?.cakeDesign || "",
    cakeSize: order?.cakeSize || "",
    cakeShape: order?.cakeShape || "Round",
    cakeTier: order?.cakeTier || 1,
    coverColor: order?.coverColor || "",
    cakeText: order?.cakeText || "",
    greetingCard: order?.greetingCard || "",
    notes: order?.notes || "",
    totalPrice: order?.totalPrice || 300000,
  });

  // State for managing tier details
  const [tierDetails, setTierDetails] = useState<TierDetail[]>(
    order?.tierDetails || Array(3).fill(0).map((_, i) => ({
      tier: i + 1,
      shape: "Round",
      size: "16 CM",
      flavor: cakeFlavor
    }))
  );

  // Update ingredients when cake flavor changes
  useEffect(() => {
    if (cakeFlavor && mockIngredients[cakeFlavor]) {
      setIngredients(mockIngredients[cakeFlavor]);
    } else {
      setIngredients([]);
    }
  }, [cakeFlavor]);

  // Update delivery address when an address is selected
  useEffect(() => {
    if (customer && selectedAddressId && selectedAddressId !== "new") {
      const selectedAddress = customer.addresses.find(addr => addr.id === selectedAddressId);
      
      if (selectedAddress) {
        setFormData(prev => ({
          ...prev,
          deliveryAddress: selectedAddress.text,
          deliveryAddressNotes: selectedAddress.deliveryNotes || "",
          deliveryArea: selectedAddress.area
        }));
      }
    }
  }, [customer, selectedAddressId]);

  // Update tier flavors when main flavor changes and useSameFlavor is true
  useEffect(() => {
    if (useSameFlavor && cakeFlavor) {
      setTierDetails(prev => 
        prev.map(tier => ({ ...tier, flavor: cakeFlavor }))
      );
    }
  }, [cakeFlavor, useSameFlavor]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string | number) => {
    setFormData((prevData) => ({ ...prevData, [name]: value }));

    // Special handling for cake tier changes
    if (name === "cakeTier") {
      const tierCount = Number(value);
      
      // When changing from single tier to multi-tier, initialize the first tier with the existing cake shape
      if (tierCount > 1 && formData.cakeTier === 1) {
        const updatedTierDetails = [...tierDetails];
        updatedTierDetails[0] = {
          ...updatedTierDetails[0],
          shape: formData.cakeShape,
          size: formData.cakeSize,
          flavor: useSameFlavor ? cakeFlavor : ""
        };
        
        // Initialize remaining tiers
        while (updatedTierDetails.length < tierCount) {
          const tierIndex = updatedTierDetails.length;
          updatedTierDetails.push({
            tier: tierIndex + 1,
            shape: "Round", // Default shape for additional tiers
            size: "16 CM",  // Default size for additional tiers
            flavor: useSameFlavor ? cakeFlavor : ""
          });
        }
        
        setTierDetails(updatedTierDetails.slice(0, tierCount));
      }
      // When changing between multi-tier options, ensure we have the correct number of tiers
      else if (tierCount > 1) {
        setTierDetails(prevTiers => {
          const newDetails = [...prevTiers];
          while (newDetails.length < tierCount) {
            newDetails.push({
              tier: newDetails.length + 1,
              shape: "Round",
              size: "16 CM",
              flavor: useSameFlavor ? cakeFlavor : ""
            });
          }
          return newDetails.slice(0, tierCount);
        });
      }
    }
  };

  // Update dialog open state to initialize the form values correctly
  const openNewAddressDialog = () => {
    // Pre-populate the dialog with the current form values
    setNewAddress({
      text: formData.deliveryAddress,
      area: formData.deliveryArea,
      deliveryNotes: formData.deliveryAddressNotes
    });
    setNewAddressDialogOpen(true);
  };

  const handleAddressChange = (field: keyof typeof newAddress, value: string) => {
    setNewAddress(prev => ({...prev, [field]: value}));
  };
  
  const handleSaveNewAddress = async () => {
    if (!customer) {
      toast.error("Please select a customer first");
      return;
    }
    
    if (!newAddress.text) {
      toast.error("Address text is required");
      return;
    }
    
    try {
      const newAddressObj: Address = {
        id: `addr_${Date.now()}`,
        text: newAddress.text || "",
        area: newAddress.area || "Jakarta",
        deliveryNotes: newAddress.deliveryNotes,
        createdAt: new Date()
      };
      
      // Add the address to the customer
      const updatedCustomer = {
        ...customer,
        addresses: [...customer.addresses, newAddressObj]
      };
      
      // Update customer in the app context
      const result = await updateCustomer(updatedCustomer);
      setCustomer(result);
      
      // Set the form data for delivery
      setFormData(prev => ({
        ...prev,
        deliveryAddress: newAddressObj.text,
        deliveryAddressNotes: newAddressObj.deliveryNotes || "",
        deliveryArea: newAddressObj.area
      }));
      
      // Select the new address
      setSelectedAddressId(newAddressObj.id);
      
      // Close the dialog
      setNewAddressDialogOpen(false);
      
      // Show success message
      toast.success("Address saved successfully");
    } catch (error) {
      console.error("Error saving new address:", error);
      toast.error("Failed to save address");
    }
  };

  // Handle tier detail changes
  const handleTierDetailChange = (tierIndex: number, field: keyof TierDetail, value: string) => {
    setTierDetails(prev => {
      const newDetails = [...prev];
      newDetails[tierIndex] = {
        ...newDetails[tierIndex],
        [field]: value
      };
      return newDetails;
    });
  };

  // Toggle same flavor for all tiers
  const handleToggleSameFlavor = (checked: boolean) => {
    setUseSameFlavor(checked);
    if (checked && cakeFlavor) {
      // Set all tiers to the main cake flavor
      setTierDetails(prev => 
        prev.map(tier => ({ ...tier, flavor: cakeFlavor }))
      );
    }
  };

  // Handle packing item checkbox changes
  const handlePackingItemChange = (itemId: string, checked: boolean) => {
    setPackingItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, checked } : item
      )
    );
  };

  const handleSaveDraft = () => {
    if (!customer || !deliveryDate) {
      return;
    }

    const orderData = {
      customer,
      orderDate,
      deliveryDate,
      cakeFlavor,
      ingredients,
      status: "draft" as const,
      tierDetails: formData.cakeTier > 1 ? tierDetails.slice(0, formData.cakeTier) : undefined,
      useSameFlavor,
      packingItems,
      ...formData,
    };

    if (order) {
      updateOrder({ ...order, ...orderData });
    } else {
      addOrder(orderData);
    }
    
    navigate("/orders");
  };

  const handleSubmitOrder = () => {
    if (!customer || !deliveryDate || !formData.deliveryAddress || !cakeFlavor || !formData.cakeSize) {
      return;
    }

    const orderData = {
      customer,
      orderDate,
      deliveryDate,
      cakeFlavor,
      ingredients,
      status: "confirmed" as const,
      tierDetails: formData.cakeTier > 1 ? tierDetails.slice(0, formData.cakeTier) : undefined,
      useSameFlavor,
      packingItems,
      ...formData,
    };

    if (order) {
      updateOrder({ ...order, ...orderData });
    } else {
      addOrder(orderData);
    }
    
    navigate("/orders");
  };

  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  // Find the selected address for display
  const selectedAddress = customer && selectedAddressId !== "new" 
    ? customer.addresses.find(addr => addr.id === selectedAddressId) 
    : null;

  // Check if required fields are filled
  const areRequiredFieldsFilled = () => {
    const baseRequirements = (
      customer &&
      deliveryDate &&
      formData.deliveryAddress &&
      formData.cakeSize &&
      formData.cakeShape &&
      cakeFlavor &&
      formData.coverColor &&
      formData.cakeDesign
    );

    // If multi-tier, check that all tiers have required fields
    if (formData.cakeTier > 1) {
      const tiersFilled = tierDetails
        .slice(0, formData.cakeTier)
        .every(tier => 
          tier.shape && tier.size && (useSameFlavor || tier.flavor)
        );
      return baseRequirements && tiersFilled;
    }

    return baseRequirements;
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="required">Required Information</TabsTrigger>
          <TabsTrigger value="optional">Additional Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="required" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-6">
              {!customer && (
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-medium mb-4">Select Customer *</h3>
                    <CustomerSearch onSelectCustomer={setCustomer} />
                  </CardContent>
                </Card>
              )}

              {customer && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{customer.name}</h3>
                        <p className="text-sm text-muted-foreground">{customer.whatsappNumber}</p>
                        {customer.email && <p className="text-sm">{customer.email}</p>}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setCustomer(null)}
                      >
                        Change
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {/* Order Date Field */}
                <div className="space-y-2">
                  <Label htmlFor="orderDate">Order Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !orderDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {orderDate ? (
                          format(orderDate, "PPP")
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
                          return date < threeDaysAgo || date > today;
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryDate">Delivery Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !deliveryDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {deliveryDate ? (
                          format(deliveryDate, "PPP")
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
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalPrice">Price (IDR) *</Label>
                <Input
                  id="totalPrice"
                  name="totalPrice"
                  type="number"
                  value={formData.totalPrice}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Address Selection Section */}
              <div className="space-y-2">
                <Label htmlFor="addressSelect">Delivery Address *</Label>
                
                {customer && customer.addresses.length > 0 && (
                  <Select 
                    value={selectedAddressId || "new"} 
                    onValueChange={setSelectedAddressId}
                  >
                    <SelectTrigger id="addressSelect" className="mb-2">
                      <SelectValue placeholder="Select delivery address" />
                    </SelectTrigger>
                    <SelectContent>
                      {customer.addresses.map(address => (
                        <SelectItem key={address.id} value={address.id}>
                          <div className="truncate">
                            <span className="font-medium">{address.area}</span> - {address.text.substring(0, 20)}
                            {address.text.length > 20 && "..."}
                          </div>
                        </SelectItem>
                      ))}
                      <SelectItem value="new">+ Add New Address</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                
                {/* Display selected address details */}
                {selectedAddress && (
                  <Card className="mb-4">
                    <CardContent className="pt-4">
                      <div className="space-y-1">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium">{selectedAddress.area}</h4>
                        </div>
                        <p className="text-sm">{selectedAddress.text}</p>
                        {selectedAddress.deliveryNotes && (
                          <div className="mt-2 text-sm">
                            <span className="font-medium">Delivery Notes:</span> {selectedAddress.deliveryNotes}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {selectedAddressId === "new" && (
                  <Card className="mt-2">
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="newAddressText">Address Text *</Label>
                          <Textarea
                            id="newAddressText"
                            name="deliveryAddress"
                            value={formData.deliveryAddress}
                            onChange={handleInputChange}
                            placeholder="Full delivery address"
                            required
                            className="min-h-[80px]"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="deliveryArea">Area *</Label>
                          <Select 
                            value={formData.deliveryArea} 
                            onValueChange={(value) => handleSelectChange("deliveryArea", value)}
                          >
                            <SelectTrigger id="deliveryArea">
                              <SelectValue placeholder="Select area" />
                            </SelectTrigger>
                            <SelectContent>
                              {areaOptions.map((area) => (
                                <SelectItem key={area} value={area}>{area}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="deliveryAddressNotes">Delivery Notes</Label>
                          <Textarea
                            id="deliveryAddressNotes"
                            name="deliveryAddressNotes"
                            value={formData.deliveryAddressNotes}
                            onChange={handleInputChange}
                            placeholder="Special delivery instructions"
                            className="min-h-[60px]"
                          />
                        </div>
                        
                        {customer && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={openNewAddressDialog}
                          >
                            <Plus className="mr-1 h-4 w-4" /> Save Address to Customer
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

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
                      <Select 
                        value={formData.coverColor} 
                        onValueChange={(value) => handleSelectChange("coverColor", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select cover color" />
                        </SelectTrigger>
                        <SelectContent>
                          {cakeColors.map((color) => (
                            <SelectItem key={color} value={color}>{color}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
          </div>
        </TabsContent>
        
        <TabsContent value="optional" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-medium mb-4">Optional Design Details</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cakeText">Cake Text</Label>
                      <Input
                        id="cakeText"
                        name="cakeText"
                        value={formData.cakeText}
                        onChange={handleInputChange}
                        placeholder="Text to be written on the cake"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="greetingCard">Greeting Card Message</Label>
                      <Textarea
                        id="greetingCard"
                        name="greetingCard"
                        value={formData.greetingCard}
                        onChange={handleInputChange}
                        placeholder="Message for the greeting card"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label>Design Attachment</Label>
                <div className="border-2 border-dashed rounded-md p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                  <input 
                    type="file" 
                    id="fileUpload" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="fileUpload" className="cursor-pointer flex flex-col items-center">
                    {imagePreview ? (
                      <div className="space-y-2">
                        <img src={imagePreview} alt="Preview" className="max-h-40 mx-auto rounded-md" />
                        <p className="text-sm text-muted-foreground">Click to change image</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <FileImage className="h-10 w-10 text-muted-foreground mx-auto" />
                        <p className="text-sm font-medium">Upload design image</p>
                        <p className="text-xs text-muted-foreground">Click to upload JPG, PNG</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Packing Accessories Section */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-medium mb-4">Packing Accessories</h3>
                  <div className="space-y-3">
                    {packingItems.map(item => (
                      <div key={item.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`packing-${item.id}`} 
                          checked={item.checked}
                          onCheckedChange={(checked) => 
                            handlePackingItemChange(item.id, checked === true)
                          }
                        />
                        <Label 
                          htmlFor={`packing-${item.id}`}
                          className="cursor-pointer"
                        >
                          {item.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Order Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Additional notes about this order"
                  className="min-h-[80px]"
                />
              </div>

              {ingredients.length > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-medium mb-4">Ingredients (Bill of Material)</h3>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Ingredient</th>
                          <th className="text-right py-2">Quantity</th>
                          <th className="text-right py-2">Unit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ingredients.map((ingredient) => (
                          <tr key={ingredient.id} className="border-b last:border-0">
                            <td className="py-2">{ingredient.name}</td>
                            <td className="text-right py-2">{ingredient.quantity}</td>
                            <td className="text-right py-2">{ingredient.unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-start">
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab("required")}
                  className="w-full md:w-auto"
                >
                  Back to Required Information
                </Button>
              </div>
