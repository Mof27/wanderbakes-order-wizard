
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, QrCode } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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
      
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Scan Order QR Code</CardTitle>
          <CardDescription>
            Scan a QR code to find an order. Order IDs are in MM-YY-XXX format (e.g., 05-25-001 for May 2025, order #1).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <QrCode className="h-24 w-24 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              This is a placeholder for QR code scanning. In a real app, you would integrate a QR scanning library.
            </p>
          </div>
          
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="orderId" className="text-sm font-medium">
                Order ID (from QR code)
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
