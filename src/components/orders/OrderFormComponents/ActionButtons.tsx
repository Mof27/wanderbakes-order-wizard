
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ActionButtonsProps {
  isEditMode: boolean;
  isFormValid: boolean;
  handleSaveDraft: () => void;
  handleSubmitOrder: () => void;
}

const ActionButtons = ({
  isEditMode,
  isFormValid,
  handleSaveDraft,
  handleSubmitOrder
}: ActionButtonsProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleSaveDraft}
          >
            Save as Draft
          </Button>
          <Button
            type="submit"
            disabled={!isFormValid}
            onClick={handleSubmitOrder}
          >
            {isEditMode ? "Update Order" : "Create Order"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActionButtons;
