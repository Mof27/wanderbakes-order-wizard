
import { Button } from "@/components/ui/button";
import { Order } from "@/types";
import OrderPrintButton from "../OrderPrintButton";

interface ActionButtonsProps {
  isEditMode: boolean;
  isFormValid: boolean;
  handleSaveDraft: () => void;
  handleSubmitOrder: () => void;
  formData?: Partial<Order>;
  referrer?: string; // Add referrer prop
  onGoBack?: () => void; // Add onGoBack handler
}

const ActionButtons = ({ 
  isEditMode,
  isFormValid,
  handleSaveDraft,
  handleSubmitOrder,
  formData,
  referrer,
  onGoBack
}: ActionButtonsProps) => {
  // Get the back button text based on referrer
  const getBackButtonText = () => {
    switch (referrer) {
      case 'kitchen':
        return 'Back to Kitchen';
      case 'delivery':
        return 'Back to Delivery';
      default:
        return 'Back to Orders';
    }
  };

  return (
    <div className="flex flex-wrap gap-2 justify-between items-center pt-6 border-t">
      <div className="space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleSaveDraft}
          className="min-w-[100px]"
        >
          Save Draft
        </Button>
        <Button
          type="button"
          disabled={!isFormValid}
          onClick={handleSubmitOrder}
          className="min-w-[150px]"
        >
          {isEditMode ? "Update Order" : "Create Order"}
        </Button>
      </div>
      
      <div className="flex gap-2">
        {formData && (
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
