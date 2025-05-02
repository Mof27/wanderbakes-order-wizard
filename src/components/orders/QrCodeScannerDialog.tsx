
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Html5Qrcode } from "html5-qrcode";

interface QrCodeScannerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (orderId: string) => void;
}

const QrCodeScannerDialog = ({
  isOpen,
  onClose,
  onScanSuccess,
}: QrCodeScannerDialogProps) => {
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = "qrcode-scanner-container";

  useEffect(() => {
    let scanner: Html5Qrcode | null = null;
    
    // Initialize scanner when dialog opens
    if (isOpen && !scannerRef.current) {
      try {
        scanner = new Html5Qrcode(scannerContainerId);
        scannerRef.current = scanner;
      } catch (err) {
        console.error("Failed to initialize scanner:", err);
        setError("Failed to initialize QR scanner");
      }
    }

    // Start scanning when scanner is ready
    if (isOpen && scannerRef.current && !isScanning) {
      startScanner();
    }

    // Clean up when dialog closes
    return () => {
      if (scannerRef.current && isScanning) {
        try {
          scannerRef.current
            .stop()
            .then(() => {
              console.log("Scanner stopped");
              scannerRef.current = null;
              setIsScanning(false);
            })
            .catch((err) => console.error("Failed to stop scanner:", err));
        } catch (err) {
          console.error("Error stopping scanner:", err);
        }
      }
    };
  }, [isOpen, isScanning]);

  const startScanner = () => {
    if (!scannerRef.current) return;

    setError(null);
    setIsScanning(true);
    
    const qrCodeSuccessCallback = (decodedText: string) => {
      console.log("QR Code decoded:", decodedText);
      
      // Extract order ID from URL or use the whole text
      let orderId = decodedText;
      
      try {
        // Check if the scanned value is a URL
        const url = new URL(decodedText);
        
        // Extract order ID from URL search params
        const urlOrderId = url.searchParams.get('id');
        if (urlOrderId) {
          orderId = urlOrderId;
        }
      } catch (e) {
        // If not a URL, use the raw decoded text as the order ID
        console.log("Not a URL, using raw text as order ID");
      }
      
      // Stop scanner and call success callback
      if (scannerRef.current) {
        scannerRef.current.stop()
          .then(() => {
            setIsScanning(false);
            onScanSuccess(orderId);
            onClose();
          })
          .catch(err => {
            console.error("Failed to stop scanner:", err);
            setError("Failed to process scan result");
          });
      }
    };

    const qrCodeErrorCallback = (error: any) => {
      console.warn(`QR Code Error: ${error}`);
      // Don't set error for normal camera issues
      if (error.name === "NotFoundError") {
        setError("No camera found");
      } else if (error.name === "NotAllowedError") {
        setError("Camera permission denied");
      }
    };

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
    };

    scannerRef.current
      .start(
        { facingMode: "environment" },
        config,
        qrCodeSuccessCallback,
        qrCodeErrorCallback
      )
      .catch((err: any) => {
        console.error("Failed to start scanner:", err);
        setError("Failed to access camera");
        setIsScanning(false);
      });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan QR Code</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4">
          {error && (
            <Alert className="border-red-600 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div 
            id={scannerContainerId} 
            className="w-full max-w-[300px] h-[300px] bg-gray-100 rounded-lg overflow-hidden"
          >
            {/* Scanner will be rendered here */}
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            <p>Position the QR code from a printed order within the frame</p>
          </div>
          
          <Button 
            variant="outline" 
            onClick={onClose}
            className="mt-4"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QrCodeScannerDialog;
