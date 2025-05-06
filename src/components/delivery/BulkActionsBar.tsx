
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Truck } from "lucide-react";

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onCreateTrip: () => void;
}

const BulkActionsBar = ({ 
  selectedCount, 
  onClearSelection, 
  onCreateTrip 
}: BulkActionsBarProps) => {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-background border shadow-lg rounded-lg py-2 px-4 flex items-center justify-between gap-4 w-[calc(100%-2rem)] max-w-3xl">
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="px-2 py-1">
          {selectedCount} selected
        </Badge>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClearSelection}
          className="h-8 text-xs"
        >
          <X className="h-4 w-4 mr-1" /> Clear
        </Button>
      </div>
      <div>
        <Button 
          variant="default" 
          className="h-9"
          onClick={onCreateTrip}
        >
          <Truck className="h-4 w-4 mr-1" /> Create Trip
        </Button>
      </div>
    </div>
  );
};

export default BulkActionsBar;
