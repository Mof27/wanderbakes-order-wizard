
import { Button } from "@/components/ui/button";
import { Order } from "@/types";
import OrderPrintButton from "../OrderPrintButton";
import { Archive } from "lucide-react";

interface ActionButtonsProps {
  isEditMode: boolean;
  isFormValid: boolean;
  handleSaveDraft: () => void;
  handleSubmitOrder: () => void;
  formData?: Order; // Change from Partial<Order> to Order
  referrer?: string;
  onGoBack?: () => void;
  readOnly?: boolean; // Add readOnly prop
}

const ActionButtons = ({ 
  isEditMode,
  isFormValid,
  handleSaveDraft,
  handleSubmitOrder,
  formData,
  referrer,
  onGoBack,
  readOnly = false
}: ActionButtonsProps) => {
  // Get the back button text based on referrer
  const getBackButtonText = () => {
    switch (referrer) {
      case 'kitchen':
        return 'Back to Kitchen';
      case 'delivery':
        return 'Back to Delivery';
      case 'customers':
        return 'Back to Customer Records';
      default:
        return 'Back to Orders';
    }
  };

  return (
    <div className="flex flex-wrap gap-2 justify-between items-center pt-6 border-t">
      <div className="space-x-2">
        {readOnly ? (
          <div className="flex items-center text-amber-600 gap-2">
            <Archive className="h-4 w-4" />
            <span>Archived order (read-only)</span>
          </div>
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              className="min-w-[100px]"
              disabled={readOnly}
            >
              Save Draft
            </Button>
            <Button
              type="button"
              disabled={!isFormValid || readOnly}
              onClick={handleSubmitOrder}
              className="min-w-[150px]"
            >
              {isEditMode ? "Update Order" : "Create Order"}
            </Button>
          </>
        )}
      </div>
      
      <div className="flex gap-2">
        {formData && formData.id && (
          <OrderPrintButton order={formData} />
        )}
        <Button
          type="button"
          variant="outline"
          onClick={onGoBack}
        >
          {getBackButtonText()}
        </Button>
      </div>
    </div>
  );
};

export default ActionButtons;
