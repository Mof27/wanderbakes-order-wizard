
import { Button } from "@/components/ui/button";
import { Order } from "@/types";
import OrderPrintButton from "../OrderPrintButton";

interface ActionButtonsProps {
  isEditMode: boolean;
  isFormValid: boolean;
  handleSaveDraft: () => void;
  handleSubmitOrder: () => void;
  formData?: Partial<Order>;
}

const ActionButtons = ({ 
  isEditMode,
  isFormValid,
  handleSaveDraft,
  handleSubmitOrder,
  formData
}: ActionButtonsProps) => {
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
      {isEditMode && formData && (
        <OrderPrintButton order={formData} />
      )}
    </div>
  );
};

export default ActionButtons;
