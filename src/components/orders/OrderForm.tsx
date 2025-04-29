
import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Customer, Order, Ingredient, Address } from "@/types";
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
import { format } from "date-fns";
import { CalendarIcon, FileImage, Plus, MapPin } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import CustomerSearch from "@/components/customers/CustomerSearch";
import { cakeFlavors, cakeSizes, cakeColors, mockIngredients, areaOptions } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface OrderFormProps {
  order?: Order;
}

const OrderForm = ({ order }: OrderFormProps) => {
  const navigate = useNavigate();
  const { addOrder, updateOrder } = useApp();
  const [customer, setCustomer] = useState<Customer | null>(order?.customer || null);
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(
    order?.deliveryDate ? new Date(order.deliveryDate) : undefined
  );
  const [cakeFlavor, setCakeFlavor] = useState(order?.cakeFlavor || "");
  const [ingredients, setIngredients] = useState<Ingredient[]>(order?.ingredients || []);
  
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
    coverColor: order?.coverColor || "",
    cakeText: order?.cakeText || "",
    greetingCard: order?.greetingCard || "",
    notes: order?.notes || "",
    totalPrice: order?.totalPrice || 300000,
  });

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (field: keyof typeof newAddress, value: string) => {
    setNewAddress(prev => ({...prev, [field]: value}));
  };
  
  const handleSaveNewAddress = async () => {
    if (!customer || !newAddress.text) return;
    
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
    try {
      await updateCustomer(updatedCustomer);
      setCustomer(updatedCustomer);
      
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
      
      // Reset the new address form
      setNewAddress({
        text: "",
        area: "Jakarta",
        deliveryNotes: ""
      });
    } catch (error) {
      console.error("Error saving new address:", error);
    }
  };

  const handleSaveDraft = () => {
    if (!customer || !deliveryDate) {
      return;
    }

    const orderData = {
      customer,
      deliveryDate,
      cakeFlavor,
      ingredients,
      status: "draft" as const,
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
      deliveryDate,
      cakeFlavor,
      ingredients,
      status: "confirmed" as const,
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
  
  // Get access to updateCustomer function
  const { updateCustomer } = useApp();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-6">
          {!customer && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-4">Select Customer</h3>
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
                        <span className="font-medium">{address.area}</span>: {address.text.substring(0, 30)}
                        {address.text.length > 30 && "..."}
                      </div>
                    </SelectItem>
                  ))}
                  <SelectItem value="new">+ Add New Address</SelectItem>
                </SelectContent>
              </Select>
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
                        onClick={() => setNewAddressDialogOpen(true)}
                      >
                        <Plus className="mr-1 h-4 w-4" /> Save Address to Customer
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

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
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium mb-4">Cake Details</h3>

              <div className="space-y-4">
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
        </div>
      </div>

      {/* Save Address Dialog */}
      <Dialog open={newAddressDialogOpen} onOpenChange={setNewAddressDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save New Address</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="saveAddressText">Address Text *</Label>
              <Textarea
                id="saveAddressText"
                value={newAddress.text || formData.deliveryAddress}
                onChange={(e) => handleAddressChange('text', e.target.value)}
                placeholder="Full address"
                required
                className="h-20"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="saveAddressArea">Area *</Label>
              <Select
                value={newAddress.area || formData.deliveryArea}
                onValueChange={(value) => handleAddressChange('area', value)}
              >
                <SelectTrigger id="saveAddressArea">
                  <SelectValue placeholder="Select area" />
                </SelectTrigger>
                <SelectContent>
                  {areaOptions.map((area) => (
                    <SelectItem key={area} value={area}>{area}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="saveAddressNotes">Delivery Notes</Label>
              <Textarea
                id="saveAddressNotes"
                value={newAddress.deliveryNotes || formData.deliveryAddressNotes}
                onChange={(e) => handleAddressChange('deliveryNotes', e.target.value)}
                placeholder="Special delivery instructions"
                className="h-16"
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setNewAddressDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveNewAddress} className="bg-cake-primary hover:bg-cake-primary/80 text-cake-text">
                Save Address
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={() => navigate("/orders")}>
          Cancel
        </Button>
        <Button variant="outline" onClick={handleSaveDraft}>
          Save as Draft
        </Button>
        <Button className="bg-cake-primary hover:bg-cake-primary/80 text-white" onClick={handleSubmitOrder}>
          {order ? "Update Order" : "Create Order"}
        </Button>
      </div>
    </div>
  );
};

export default OrderForm;
