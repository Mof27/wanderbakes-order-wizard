
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { ReactNode } from "react";

interface SettingsDetailViewProps {
  children: ReactNode;
}

const SettingsDetailView = ({ children }: SettingsDetailViewProps) => {
  const navigate = useNavigate();
  const { category } = useParams<{ category: string }>();

  const getCategoryTitle = () => {
    switch (category) {
      case "cake-properties":
        return "Cake Properties";
      case "printing-templates":
        return "Printing & Templates";
      default:
        return "Settings";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/settings")}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-bold">{getCategoryTitle()}</h2>
      </div>

      <Card className="p-6">
        {children}
      </Card>
    </div>
  );
};

export default SettingsDetailView;
