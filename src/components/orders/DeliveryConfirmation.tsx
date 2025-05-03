
import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Check, Clock } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';

interface DeliveryConfirmationProps {
  orderId: string;
}

const DeliveryConfirmation = ({ orderId }: DeliveryConfirmationProps) => {
  const { getOrderById, updateOrder } = useApp();
  const [confirming, setConfirming] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  
  const order = getOrderById(orderId);
  
  if (!order) {
    return <div>Order not found</div>;
  }

  const handleConfirmDelivery = async () => {
    setConfirming(true);
    
    try {
      await updateOrder({
        ...order,
        status: 'delivered',
        updatedAt: new Date(),
        // In a real app, you would also store the delivery details in a dedicated field
      });
      
      toast.success('Delivery confirmed successfully!');
      setShowDialog(false);
    } catch (error) {
      console.error('Failed to confirm delivery:', error);
      toast.error('Failed to confirm delivery');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <>
      <Button 
        className="w-full flex gap-2 items-center"
        onClick={() => setShowDialog(true)}
      >
        <Check className="h-4 w-4" />
        <span>Confirm Delivery</span>
      </Button>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Order Delivery</AlertDialogTitle>
            <AlertDialogDescription>
              Please confirm that order {order.id} for {order.customer.name} has been delivered.
              This will mark the order as "delivered" and complete the order process.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-3">
            <label htmlFor="deliveryNotes" className="text-sm font-medium block mb-2">
              Delivery Notes (Optional)
            </label>
            <Textarea
              id="deliveryNotes"
              placeholder="Any notes about the delivery..."
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              className="w-full"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelivery}
              disabled={confirming}
              className="bg-green-600 hover:bg-green-700"
            >
              {confirming ? (
                <span className="flex items-center gap-2">
                  <Clock className="animate-spin h-4 w-4" />
                  Processing...
                </span>
              ) : (
                "Yes, Confirm Delivery"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DeliveryConfirmation;
