
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const ScanQrPage = () => {
  const [orderIdInput, setOrderIdInput] = useState("");
  const navigate = useNavigate();
  
  const handleGoBack = () => {
    navigate("/orders");
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderIdInput.trim()) {
      navigate(`/orders?id=${orderIdInput.trim()}`);
    }
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" onClick={handleGoBack} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
        <h1 className="text-xl font-semibold">Scan QR Code</h1>
      </div>
      
      <div className="max-w-md mx-auto bg-card rounded-lg border p-6 shadow-sm">
        <div className="text-center mb-6">
          <p className="text-muted-foreground">
            This is a placeholder for QR code scanning. In a real app, you would integrate a QR scanning library.
          </p>
        </div>
        
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="orderId" className="text-sm font-medium">
              Order ID (from QR code)
            </label>
            <input
              id="orderId"
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter order ID..."
            />
          </div>
          
          <Button type="submit" className="w-full">
            Search Order
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ScanQrPage;
