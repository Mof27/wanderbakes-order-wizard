import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Customer, Order, Ingredient, Address, TierDetail, PackingItem, CakeColor, CoverType, SettingsData, DeliveryMethod, OrderTag, OrderStatus } from "@/types";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import { mockIngredients, areaOptions, cakeTiers, defaultPackingItems } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { baseColors } from "@/data/colorData";

// Import component sections
import CustomerSection from "./OrderFormComponents/CustomerSection";
import DateSelectionSection from "./OrderFormComponents/DateSelectionSection";
import CakePriceSection from "./OrderFormComponents/CakePriceSection";
import DeliveryOptionsSection from "./OrderFormComponents/DeliveryOptionsSection";
import AddressSection from "./OrderFormComponents/AddressSection";
import CakeDetailsSection from "./OrderFormComponents/CakeDetailsSection";
import OptionalDetailsSection from "./OrderFormComponents/OptionalDetailsSection";
import PackingSection from "./OrderFormComponents/PackingSection";
import NotesSection from "./OrderFormComponents/NotesSection";
import IngredientsSection from "./OrderFormComponents/IngredientsSection";
import AddNewAddressDialog from "./OrderFormComponents/AddNewAddressDialog";
import ActionButtons from "./OrderFormComponents/ActionButtons";
import OrderPrintButton from "./OrderPrintButton";
import DeliveryRecapSection from "./OrderFormComponents/DeliveryRecapSection";
import OrderLogSection from "./OrderFormComponents/OrderLogSection";

interface OrderFormProps {
  order?: Order;
  settings?: SettingsData | null;
  defaultTab?: string;
  onStatusChange?: (newStatus: OrderStatus) => Promise<void>;
  referrer?: string;
}

const OrderForm = ({ order, settings, defaultTab = "required", onStatusChange, referrer }: OrderFormProps) => {
  const navigate = useNavigate();
  const { addOrder, updateOrder, updateCustomer } = useApp();
  const [customer, setCustomer] = useState<Customer | null>(order?.customer || null);
  
  // Get available options from settings
  const cakeSizes = settings?.cakeSizes?.filter(item => item.enabled).map(item => item.value) || [];
  const cakeShapes = settings?.cakeShapes?.filter(item => item.enabled).map(item => item.value) || [];
  const cakeFlavors = settings?.cakeFlavors?.filter(item => item.enabled).map(item => item.value) || [];

  // Add order date with default as today
  const [orderDate, setOrderDate] = useState<Date | undefined>(
    order?.orderDate || new Date()
  );
  
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(
    order?.deliveryDate ? new Date(order.deliveryDate) : undefined
  );
  const [cakeFlavor, setCakeFlavor] = useState(order?.cakeFlavor || (cakeFlavors.length > 0 ? cakeFlavors[0] : ""));
  const [ingredients, setIngredients] = useState<Ingredient[]>(order?.ingredients || []);
  
  // Use the defaultTab prop to set the initial activeTab state
  const [activeTab, setActiveTab] = useState(
    defaultTab === "delivery-recap" || defaultTab === "optional" || defaultTab === "order-log"
      ? defaultTab 
      : "required"
  );
  
  const [useSameFlavor, setUseSameFlavor] = useState(order?.useSameFlavor !== false);
  const [useSameCover, setUseSameCover] = useState(order?.useSameCover !== false);
  const [packingItems, setPackingItems] = useState<PackingItem[]>(
    order?.packingItems || [...defaultPackingItems]
  );
  
  // New states for Delivery & Data Recap tab
  const [finishedCakePhotos, setFinishedCakePhotos] = useState<string[]>(order?.finishedCakePhotos || []);
  const [deliveryDocumentationPhotos, setDeliveryDocumentationPhotos] = useState<string[]>(order?.deliveryDocumentationPhotos || []);
  const [actualDeliveryTime, setActualDeliveryTime] = useState<Date | undefined>(order?.actualDeliveryTime);
  const [customerFeedback, setCustomerFeedback] = useState<string>(order?.customerFeedback || '');
  const [orderTags, setOrderTags] = useState<OrderTag[]>(order?.orderTags || []);
  
  // Convert legacy string color to CakeColor object if needed
  const defaultColor = settings?.colors?.length && settings.colors[0].enabled ? 
    settings.colors[0].value : baseColors[0].value;
  
  const initialCoverColor = typeof order?.coverColor === 'string' 
    ? { type: 'solid' as const, color: order.coverColor } 
    : order?.coverColor || { type: 'solid' as const, color: defaultColor };
  
  // State for delivery options
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(
    order?.deliveryMethod || "flat-rate"
  );
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState<string>(
    order?.deliveryTimeSlot || "slot1"
  );
  const [deliveryPrice, setDeliveryPrice] = useState<number>(
    order?.deliveryPrice || 0
  );
  
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
    cakeSize: order?.cakeSize || (cakeSizes.length > 0 ? cakeSizes[0] : ""),
    cakeShape: order?.cakeShape || (cakeShapes.length > 0 ? cakeShapes[0] : "Round"),
    customShape: order?.customShape || "", // Add customShape field
    cakeTier: order?.cakeTier || 1,
    coverColor: initialCoverColor,
    coverType: order?.coverType || "buttercream" as CoverType,
    cakeText: order?.cakeText || "",
    greetingCard: order?.greetingCard || "",
    notes: order?.notes || "",
    cakePrice: order?.cakePrice || 300000,
  });

  // State for managing tier details
  const [tierDetails, setTierDetails] = useState<TierDetail[]>(
    order?.tierDetails || Array(3).fill(0).map((_, i) => ({
      tier: i + 1,
      shape: cakeShapes.length > 0 ? cakeShapes[0] : "Round",
      size: cakeSizes.length > 0 ? cakeSizes[0] : "16 CM",
      height: "2 Layer - 10 CM",
      flavor: cakeFlavor || (cakeFlavors.length > 0 ? cakeFlavors[0] : ""),
      coverType: "buttercream",
      coverColor: { type: 'solid', color: defaultColor },
      customShape: "" 
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

  // Update tier cover details when main cover changes and useSameCover is true
  useEffect(() => {
    if (useSameCover) {
      setTierDetails(prev => 
        prev.map(tier => ({ 
          ...tier, 
          coverType: formData.coverType || "buttercream",
          coverColor: formData.coverColor
        }))
      );
    }
  }, [formData.coverType, formData.coverColor, useSameCover]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string | number) => {
    setFormData((prevData) => ({ ...prevData, [name]: value }));

    // Special handling for cake tier changes
    if (name === "cakeTier") {
      const tierCount = Number(value);
      
      // When changing from multi-tier to single tier, initialize the single tier details
      if (tierCount === 1) {
        const updatedTierDetails = [...tierDetails];
        updatedTierDetails[0] = {
          tier: 1,
          shape: formData.cakeShape,
          size: formData.cakeSize || "16 CM",
          height: updatedTierDetails[0]?.height || "2 Layer - 10 CM", // Keep existing height or use default
          flavor: cakeFlavor,
          coverType: formData.coverType || "buttercream",
          coverColor: formData.coverColor,
          customShape: formData.cakeShape === "Custom" ? formData.customShape : "" // Transfer custom shape
        };
        
        setTierDetails(updatedTierDetails.slice(0, 1));
      }
      // When changing from single tier to multi-tier, initialize the first tier with the existing cake shape
      else if (tierCount > 1 && formData.cakeTier === 1) {
        const updatedTierDetails = [...tierDetails];
        updatedTierDetails[0] = {
          ...updatedTierDetails[0],
          shape: formData.cakeShape,
          size: formData.cakeSize,
          height: updatedTierDetails[0]?.height || "2 Layer - 10 CM", // Keep existing height or use default
          flavor: useSameFlavor ? cakeFlavor : "",
          coverType: formData.coverType || "buttercream",
          coverColor: formData.coverColor,
          customShape: formData.cakeShape === "Custom" ? formData.customShape : "" // Transfer custom shape
        };
        
        // Initialize remaining tiers
        while (updatedTierDetails.length < tierCount) {
          const tierIndex = updatedTierDetails.length;
          updatedTierDetails.push({
            tier: tierIndex + 1,
            shape: "Round", // Default shape for additional tiers
            size: "16 CM",  // Default size for additional tiers
            height: "2 Layer - 10 CM", // Default height
            flavor: useSameFlavor ? cakeFlavor : "",
            coverType: formData.coverType || "buttercream",
            coverColor: formData.coverColor,
            customShape: "" // Initialize empty custom shape
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
              height: "2 Layer - 10 CM", // Default height
              flavor: useSameFlavor ? cakeFlavor : "",
              coverType: formData.coverType || "buttercream",
              coverColor: formData.coverColor,
              customShape: "" // Initialize empty custom shape
            });
          }
          return newDetails.slice(0, tierCount);
        });
      }
    }
    
    // If cake shape or size changes for a single tier, update the first tier details
    if ((name === "cakeShape" || name === "cakeSize") && formData.cakeTier === 1) {
      setTierDetails(prev => {
        const updated = [...prev];
        updated[0] = {
          ...updated[0],
          [name === "cakeShape" ? "shape" : "size"]: value,
          // Clear custom shape if shape is not Custom
          ...(name === "cakeShape" && value !== "Custom" ? { customShape: "" } : {})
        };
        return updated;
      });
    }
  };

  // Handler for cake price changes
  const handleCakePriceChange = (price: number) => {
    setFormData(prev => ({ ...prev, cakePrice: price }));
  };

  // Handler for delivery method changes
  const handleDeliveryMethodChange = (method: DeliveryMethod) => {
    setDeliveryMethod(method);
    // Reset time slot when switching to/from flat rate
    if (method === "flat-rate") {
      setDeliveryTimeSlot("slot1");
    } else if (deliveryTimeSlot.startsWith("slot")) {
      setDeliveryTimeSlot("12.00 WIB");
    }
  };

  // Handler for cover color changes
  const handleCoverColorChange = (value: CakeColor) => {
    setFormData(prev => ({ ...prev, coverColor: value }));
  };

  // Handler for cover type changes
  const handleCoverTypeChange = (value: CoverType) => {
    setFormData(prev => ({ ...prev, coverType: value }));

    // If switching to fondant and using gradient, switch to solid
    if (value === "fondant" && formData.coverColor.type === "gradient") {
      const color = (formData.coverColor as any).colors?.[0] || baseColors[0].value;
      handleCoverColorChange({ type: 'solid', color });
    }
  };

  // Update dialog open state to initialize the form values correctly
  const openNewAddressDialog = () => {
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
  const handleTierDetailChange = (tierIndex: number, field: keyof TierDetail, value: string | CakeColor | CoverType) => {
    setTierDetails(prev => {
      const newDetails = [...prev];
      
      // Special handling for coverType
      if (field === "coverType") {
        const newType = value as CoverType;
        const currentColor = newDetails[tierIndex].coverColor;
        
        // If switching to fondant and using gradient, switch to solid
        if (newType === "fondant" && currentColor.type === "gradient") {
          const color = (currentColor as any).colors?.[0] || baseColors[0].value;
          newDetails[tierIndex] = {
            ...newDetails[tierIndex],
            coverType: newType,
            coverColor: { type: 'solid', color }
          };
          return newDetails;
        }
      }

      // Special handling for shape - clear custom shape if changing to non-custom
      if (field === "shape" && value !== "Custom") {
        newDetails[tierIndex] = {
          ...newDetails[tierIndex],
          shape: value as string,
          customShape: "" // Clear custom shape when changing to non-custom
        };
        return newDetails;
      }
      
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

  // Toggle same cover for all tiers
  const handleToggleSameCover = (checked: boolean) => {
    setUseSameCover(checked);
    if (checked) {
      // Set all tiers to the main cover type and color
      setTierDetails(prev => 
        prev.map(tier => ({ 
          ...tier, 
          coverType: formData.coverType || "buttercream",
          coverColor: formData.coverColor
        }))
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
      // Keep existing status for updates, or use "incomplete" for new orders
      status: order ? order.status : "incomplete" as const,
      tierDetails: formData.cakeTier > 1 ? tierDetails.slice(0, formData.cakeTier) : undefined,
      useSameFlavor,
      useSameCover,
      packingItems,
      customShape: formData.cakeShape === "Custom" ? formData.customShape : undefined,
      deliveryMethod,
      deliveryTimeSlot,
      deliveryPrice,
      // Add new fields for Delivery & Data Recap
      finishedCakePhotos: finishedCakePhotos.length > 0 ? finishedCakePhotos : undefined,
      deliveryDocumentationPhotos: deliveryDocumentationPhotos.length > 0 ? deliveryDocumentationPhotos : undefined,
      actualDeliveryTime,
      customerFeedback: customerFeedback || undefined,
      orderTags: orderTags.length > 0 ? orderTags : undefined,
      ...formData,
    };

    if (order) {
      updateOrder({ ...order, ...orderData });
    } else {
      addOrder(orderData);
    }
    
    // Navigate to the referrer page if provided, otherwise default to orders page
    navigate(referrer ? `/${referrer}` : "/orders");
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
      // Only set status to "in-queue" for new orders, keep existing status for updates
      status: order ? order.status : "in-queue" as const,
      tierDetails: formData.cakeTier > 1 ? tierDetails.slice(0, formData.cakeTier) : undefined,
      useSameFlavor,
      useSameCover,
      packingItems,
      customShape: formData.cakeShape === "Custom" ? formData.customShape : undefined,
      deliveryMethod,
      deliveryTimeSlot,
      deliveryPrice,
      // Add new fields for Delivery & Data Recap
      finishedCakePhotos: finishedCakePhotos.length > 0 ? finishedCakePhotos : undefined,
      deliveryDocumentationPhotos: deliveryDocumentationPhotos.length > 0 ? deliveryDocumentationPhotos : undefined,
      actualDeliveryTime,
      customerFeedback: customerFeedback || undefined,
      orderTags: orderTags.length > 0 ? orderTags : undefined,
      ...formData,
    };

    if (order) {
      updateOrder({ ...order, ...orderData });
    } else {
      addOrder(orderData);
    }
    
    // Navigate to the referrer page if provided, otherwise default to orders page
    navigate(referrer ? `/${referrer}` : "/orders");
  };

  // Create a complete order object for printing
  const getCompleteOrderData = (): Partial<Order> => {
    return {
      ...(order || {}),
      id: order?.id,
      customer,
      orderDate,
      deliveryDate,
      cakeFlavor,
      ingredients,
      tierDetails: formData.cakeTier > 1 ? tierDetails.slice(0, formData.cakeTier) : undefined,
      customShape: formData.cakeShape === "Custom" ? formData.customShape : undefined,
      deliveryMethod,
      deliveryTimeSlot,
      deliveryPrice,
      // Add new fields for Delivery & Data Recap
      finishedCakePhotos,
      deliveryDocumentationPhotos,
      actualDeliveryTime,
      customerFeedback,
      orderTags,
      ...formData,
    };
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
      (formData.cakeShape !== "Custom" || formData.customShape) && // Check custom shape is filled if selected
      cakeFlavor &&
      formData.coverColor &&
      formData.coverType &&
      formData.cakeDesign &&
      deliveryMethod &&
      deliveryTimeSlot &&
      formData.cakePrice > 0
    );

    // If multi-tier, check that all tiers have required fields
    if (formData.cakeTier > 1) {
      const tiersFilled = tierDetails
        .slice(0, formData.cakeTier)
        .every(tier => 
          tier.shape && 
          (tier.shape !== "Custom" || tier.customShape) && // Check custom shape is filled if selected
          tier.size && 
          tier.height && 
          (useSameFlavor || tier.flavor) &&
          tier.coverType && 
          tier.coverColor
        );
      return baseRequirements && tiersFilled;
    }

    return baseRequirements;
  };

  // Find timestamps for different order stages - for metrics in log view
  const findOrderStageTimestamp = (type: string): Date | undefined => {
    if (!order?.orderLogs) return undefined;
    
    // For order in kitchen time
    if (type === 'in-kitchen') {
      const inKitchenLog = order.orderLogs.find(log => 
        log.type === 'status-change' && log.newStatus === 'in-kitchen'
      );
      return inKitchenLog ? new Date(inKitchenLog.timestamp) : undefined;
    }
    
    // For order completed time (waiting-photo)
    if (type === 'completed') {
      const completedLog = order.orderLogs.find(log => 
        log.type === 'status-change' && log.newStatus === 'waiting-photo'
      );
      return completedLog ? new Date(completedLog.timestamp) : undefined;
    }
    
    // For delivery time
    if (type === 'delivered') {
      return order.actualDeliveryTime ? new Date(order.actualDeliveryTime) : undefined;
    }
    
    return undefined;
  };

  // Handle going back with referrer info
  const handleGoBack = () => {
    // Navigate to the referrer page if provided, otherwise default to orders page
    if (referrer) {
      navigate(`/${referrer}`);
    } else {
      navigate("/orders");
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="required">Required Information</TabsTrigger>
          <TabsTrigger value="optional">Additional Details</TabsTrigger>
          <TabsTrigger value="delivery-recap">Delivery & Data Recap</TabsTrigger>
          <TabsTrigger value="order-log">Order Log</TabsTrigger>
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

              <DeliveryOptionsSection
                deliveryMethod={deliveryMethod}
                deliveryTimeSlot={deliveryTimeSlot}
                deliveryPrice={deliveryPrice}
                onMethodChange={handleDeliveryMethodChange}
                onTimeSlotChange={setDeliveryTimeSlot}
                onPriceChange={setDeliveryPrice}
              />

              <CakePriceSection 
                cakePrice={formData.cakePrice} 
                onPriceChange={handleCakePriceChange} 
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
              
              {/* Add print button for new orders */}
              {!order && customer && deliveryDate && formData.cakePrice > 0 && (
                <div className="mt-4">
                  <OrderPrintButton order={getCompleteOrderData()} />
                </div>
              )}
            </div>

            <CakeDetailsSection 
              formData={{
                cakeDesign: formData.cakeDesign,
                cakeSize: formData.cakeSize,
                cakeShape: formData.cakeShape,
                customShape: formData.customShape,
                cakeTier: formData.cakeTier,
                coverColor: formData.coverColor,
                coverType: formData.coverType,
              }}
              cakeFlavor={cakeFlavor}
              setCakeFlavor={setCakeFlavor}
              handleInputChange={handleInputChange}
              handleSelectChange={handleSelectChange}
              handleCoverColorChange={handleCoverColorChange}
              handleCoverTypeChange={handleCoverTypeChange}
              cakeFlavors={cakeFlavors}
              cakeSizes={cakeSizes}
              cakeShapes={cakeShapes}
              cakeTiers={cakeTiers}
              tierDetails={tierDetails}
              useSameFlavor={useSameFlavor}
              useSameCover={useSameCover}
              handleToggleSameFlavor={handleToggleSameFlavor}
              handleToggleSameCover={handleToggleSameCover}
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
        
        <TabsContent value="delivery-recap" className="space-y-6">
          <DeliveryRecapSection
            orderId={order?.id}
            status={order?.status}
            finishedCakePhotos={finishedCakePhotos}
            deliveryDocumentationPhotos={deliveryDocumentationPhotos}
            actualDeliveryTime={actualDeliveryTime}
            customerFeedback={customerFeedback}
            orderTags={orderTags}
            onPhotosChange={setFinishedCakePhotos}
            onDeliveryPhotosChange={setDeliveryDocumentationPhotos}
            onDeliveryTimeChange={setActualDeliveryTime}
            onFeedbackChange={setCustomerFeedback}
            onTagsChange={setOrderTags}
            onStatusChange={onStatusChange}
          />
        </TabsContent>
        
        <TabsContent value="order-log" className="space-y-6">
          <OrderLogSection
            logs={order?.orderLogs || []} 
            orderCreatedAt={order?.createdAt || new Date()}
            orderCompletedAt={findOrderStageTimestamp('completed')}
            orderInKitchenAt={findOrderStageTimestamp('in-kitchen')}
            orderDeliveredAt={findOrderStageTimestamp('delivered')}
          />
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
        formData={getCompleteOrderData()}
        referrer={referrer}
        onGoBack={handleGoBack}
      />
    </div>
  );
};

export default OrderForm;
