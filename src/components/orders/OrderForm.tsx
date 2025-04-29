import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Customer, Order, Ingredient } from "@/types";
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
import { CalendarIcon, FileImage } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import CustomerSearch from "@/components/customers/CustomerSearch";
import { cakeFlavors, cakeSizes, cakeColors, mockIngredients } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

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

  const [formData, setFormData] = useState({
    deliveryAddress: order?.deliveryAddress || "",
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
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
                    {customer.address && <p className="text-sm mt-1">{customer.address}</p>}
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

          <div className="space-y-2">
            <Label htmlFor="deliveryAddress">Delivery Address *</Label>
            <Textarea
              id="deliveryAddress"
              name="deliveryAddress"
              value={formData.deliveryAddress}
              onChange={handleInputChange}
              placeholder="Full delivery address"
              required
              className="min-h-[80px]"
            />
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
