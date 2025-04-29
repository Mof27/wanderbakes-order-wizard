
import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Customer, Order, Ingredient, Address, TierDetail, PackingItem, CakeColor } from "@/types";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import { cakeFlavors, cakeSizes, cakeColors, mockIngredients, areaOptions, cakeShapes, cakeTiers, defaultPackingItems } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { baseColors } from "@/data/colorData";

// Import component sections
import CustomerSection from "./OrderFormComponents/CustomerSection";
import DateSelectionSection from "./OrderFormComponents/DateSelectionSection";
import PriceSection from "./OrderFormComponents/PriceSection";
import AddressSection from "./OrderFormComponents/AddressSection";
import CakeDetailsSection from "./OrderFormComponents/CakeDetailsSection";
import OptionalDetailsSection from "./OrderFormComponents/OptionalDetailsSection";
import PackingSection from "./OrderFormComponents/PackingSection";
import NotesSection from "./OrderFormComponents/NotesSection";
import IngredientsSection from "./OrderFormComponents/IngredientsSection";
import AddNewAddressDialog from "./OrderFormComponents/AddNewAddressDialog";
import ActionButtons from "./OrderFormComponents/ActionButtons";

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
  
  // Convert legacy string color to CakeColor object if needed
  const initialCoverColor = typeof order?.coverColor === 'string' 
    ? { type: 'solid' as const, color: order.coverColor } 
    : order?.coverColor || { type: 'solid' as const, color: baseColors[0].value };
  
  // State for address handling
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
    coverColor: initialCoverColor,
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

  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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

  // Handler for cover color changes
  const handleCoverColorChange = (value: CakeColor) => {
    setFormData(prev => ({ ...prev, coverColor: value }));
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

  const handleAddressChange = (field: keyof Partial<Address>, value: string) => {
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

  // Find the selected address for display
  const selectedAddress = customer && selectedAddressId !== "new" 
    ? customer.addresses.find(addr => addr.id === selectedAddressId) 
    : null;

  // Check if required fields are filled
  const areRequiredFieldsFilled = () => {
    const baseRequirements = Boolean(
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
              <CustomerSection 
                customer={customer} 
                setCustomer={setCustomer} 
              />

              <DateSelectionSection 
                orderDate={orderDate}
                setOrderDate={setOrderDate}
                deliveryDate={deliveryDate}
                setDeliveryDate={setDeliveryDate}
              />

              <PriceSection 
                totalPrice={formData.totalPrice} 
                handleInputChange={handleInputChange} 
              />

              <AddressSection 
                customer={customer}
                selectedAddressId={selectedAddressId}
                setSelectedAddressId={setSelectedAddressId}
                selectedAddress={selectedAddress}
                formData={{
                  deliveryAddress: formData.deliveryAddress,
                  deliveryAddressNotes: formData.deliveryAddressNotes,
                  deliveryArea: formData.deliveryArea
                }}
                handleInputChange={handleInputChange}
                handleSelectChange={handleSelectChange}
                areaOptions={areaOptions}
                openNewAddressDialog={openNewAddressDialog}
              />
            </div>

            <CakeDetailsSection 
              formData={{
                cakeDesign: formData.cakeDesign,
                cakeSize: formData.cakeSize,
                cakeShape: formData.cakeShape,
                cakeTier: formData.cakeTier,
                coverColor: formData.coverColor,
              }}
              cakeFlavor={cakeFlavor}
              setCakeFlavor={setCakeFlavor}
              handleInputChange={handleInputChange}
              handleSelectChange={handleSelectChange}
              handleCoverColorChange={handleCoverColorChange}
              cakeFlavors={cakeFlavors}
              cakeSizes={cakeSizes}
              cakeShapes={cakeShapes}
              cakeColors={cakeColors}
              cakeTiers={cakeTiers}
              tierDetails={tierDetails}
              useSameFlavor={useSameFlavor}
              handleToggleSameFlavor={handleToggleSameFlavor}
              handleTierDetailChange={handleTierDetailChange}
              setActiveTab={setActiveTab}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="optional" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <OptionalDetailsSection 
              formData={{
                cakeText: formData.cakeText,
                greetingCard: formData.greetingCard
              }}
              handleInputChange={handleInputChange}
              imagePreview={imagePreview}
              handleFileChange={handleFileChange}
            />
            
            <div className="space-y-6">
              <PackingSection 
                packingItems={packingItems}
                handlePackingItemChange={handlePackingItemChange}
              />
              
              <NotesSection 
                notes={formData.notes}
                handleInputChange={handleInputChange}
              />

              {ingredients.length > 0 && (
                <IngredientsSection ingredients={ingredients} />
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
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <AddNewAddressDialog 
        open={newAddressDialogOpen}
        onOpenChange={setNewAddressDialogOpen}
        newAddress={newAddress}
        handleAddressChange={handleAddressChange}
        handleSaveNewAddress={handleSaveNewAddress}
        areaOptions={areaOptions}
      />

      <ActionButtons 
        isEditMode={!!order}
        isFormValid={areRequiredFieldsFilled()}
        handleSaveDraft={handleSaveDraft}
        handleSubmitOrder={handleSubmitOrder}
      />
    </div>
  );
};

export default OrderForm;
