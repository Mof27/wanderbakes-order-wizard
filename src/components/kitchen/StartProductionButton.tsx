
import React, { useState } from 'react';
import { Check, Play, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Order } from '@/types';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/sonner';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';

interface StartProductionButtonProps {
  order: Order;
}

const StartProductionButton: React.FC<StartProductionButtonProps> = ({ order }) => {
  const { updateOrder } = useApp();
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // Reset countdown when component unmounts or when button is reset
  const resetCountdown = () => {
    setIsCountingDown(false);
    setCountdown(3);
  };
  
  // Start the production process
  const startProduction = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      console.log(`Starting production for order ${order.id}`);
      
      await updateOrder({
        ...order,
        status: 'in-kitchen',
        kitchenStatus: 'waiting-baker' 
      });
      
      toast.success("Production started successfully!");
    } catch (error) {
      console.error("Failed to start production:", error);
      toast.error("Failed to start production");
    } finally {
      setIsProcessing(false);
      setShowConfirmDialog(false);
    }
  };
  
  // Calculate progress percentage for the countdown
  const progressPercentage = ((3 - countdown) / 3) * 100;
  
  return (
    <>
      <Button
        variant="outline"
        className="w-full bg-green-100 hover:bg-green-200 text-green-800 border-green-300"
        onClick={() => setShowConfirmDialog(true)}
        disabled={isProcessing}
      >
        <Play className="mr-1 h-4 w-4" />
        {isProcessing ? "Processing..." : "Start Production"}
      </Button>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start Production</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to start production for order {order.id}?
              This will move the cake into the production pipeline.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={startProduction}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              Start Production
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default StartProductionButton;
