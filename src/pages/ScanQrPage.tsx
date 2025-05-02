
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, QrCode } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import QrCodeScannerDialog from "@/components/orders/QrCodeScannerDialog";

const ScanQrPage = () => {
  const [orderIdInput, setOrderIdInput] = useState("");
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
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

  const handleScanSuccess = (orderId: string) => {
    if (orderId) {
      navigate(`/orders?id=${orderId}`);
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
          <CardTitle>Find an Order</CardTitle>
          <CardDescription>
            Scan a QR code directly or enter an order ID manually.
            Order IDs are in MM-YY-XXX format (e.g., 05-25-001 for May 2025, order #1).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button 
            onClick={() => setIsQrScannerOpen(true)} 
            className="w-full flex items-center justify-center gap-2"
          >
            <QrCode className="h-4 w-4" />
            Scan QR Code
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>
          
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
            
            <Button type="submit" variant="outline" className="w-full">
              Search Order
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* QR Scanner Dialog */}
      <QrCodeScannerDialog
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />
    </div>
  );
};

export default ScanQrPage;
