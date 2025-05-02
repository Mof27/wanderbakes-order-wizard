import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// This component is no longer needed as we're now using native camera apps
// but we'll keep a simplified version that just redirects to orders with search
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
        <h1 className="text-xl font-semibold">Order Search</h1>
      </div>
      
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Enter Order ID</CardTitle>
          <CardDescription>
            For a better experience, scan QR codes directly with your phone's camera app.
            Order IDs are in MM-YY-XXX format (e.g., 05-25-001 for May 2025, order #1).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="orderId" className="text-sm font-medium">
                Enter Order ID manually
              </label>
              <Input
                id="orderId"
                value={orderIdInput}
                onChange={(e) => setOrderIdInput(e.target.value)}
                placeholder="e.g., 05-25-001"
              />
            </div>
            
            <Button type="submit" className="w-full">
              Search Order
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScanQrPage;
