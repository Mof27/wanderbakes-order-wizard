
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, QrCode, X, Scan } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "@/components/ui/sonner";

const ScanQrPage = () => {
  const [orderIdInput, setOrderIdInput] = useState("");
  const [scanning, setScanning] = useState(false);
  const navigate = useNavigate();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = "qr-reader";
  
  useEffect(() => {
    return () => {
      // Clean up scanner when component unmounts
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(error => {
          console.error("Error stopping scanner:", error);
        });
      }
    };
  }, []);
  
  const handleGoBack = () => {
    navigate("/orders");
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderIdInput.trim()) {
      navigate(`/orders?id=${orderIdInput.trim()}`);
    }
  };
  
  const startScanner = () => {
    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode(scannerContainerId);
    }
    
    setScanning(true);
    
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };
    
    scannerRef.current.start(
      { facingMode: "environment" }, // Use back camera
      config,
      onScanSuccess,
      onScanFailure
    ).catch(err => {
      console.error("Scanner start error:", err);
      toast.error("Could not access camera. Please allow camera access or manually enter the order ID.");
      setScanning(false);
    });
  };
  
  const stopScanner = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().then(() => {
        setScanning(false);
      }).catch(error => {
        console.error("Error stopping scanner:", error);
      });
    }
  };
  
  const onScanSuccess = (decodedText: string) => {
    // Stop scanner after successful scan
    stopScanner();
    
    // QR code content should be just the order ID (e.g., "05-25-001")
    // Validate format
    if (decodedText && (decodedText.match(/^\d{2}-\d{2}-\d{3}$/) || decodedText)) {
      toast.success(`QR code detected: ${decodedText}`);
      navigate(`/orders?id=${decodedText.trim()}`);
    } else {
      toast.error("Invalid QR code format. Expected order ID format: MM-YY-XXX");
    }
  };
  
  const onScanFailure = (error: any) => {
    // We don't need to show errors for ongoing scanning attempts
    console.log("Scan error (ongoing):", error);
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
        <CardContent className="space-y-6">
          {scanning ? (
            <div className="space-y-4">
              <div id={scannerContainerId} className="relative overflow-hidden rounded-lg w-full h-64 flex items-center justify-center">
                {/* Scanner will be mounted here */}
                <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-white rounded-lg"></div>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={stopScanner}
              >
                <X className="h-4 w-4 mr-2" />
                Stop Scanner
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <Button 
                onClick={startScanner} 
                className="w-full flex items-center justify-center gap-2 bg-cake-primary hover:bg-cake-primary/80 text-cake-text"
              >
                <Scan className="h-4 w-4" />
                Scan QR Code with Camera
              </Button>
              
              <div className="relative flex items-center">
                <div className="flex-grow border-t border-muted"></div>
                <span className="mx-2 text-sm text-muted-foreground">OR</span>
                <div className="flex-grow border-t border-muted"></div>
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
                
                <Button type="submit" className="w-full">
                  Search Order
                </Button>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScanQrPage;
