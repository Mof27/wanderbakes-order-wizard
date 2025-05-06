
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Truck, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onCreateTrip: () => void;
  hasNonReadyOrders: boolean;
}

const BulkActionsBar = ({ 
  selectedCount, 
  onClearSelection, 
  onCreateTrip,
  hasNonReadyOrders = false
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
      <div className="flex items-center gap-2">
        {hasNonReadyOrders && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center text-amber-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <span className="text-xs">Pre-planning</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-xs">Some selected orders are not yet ready for delivery. They will be pre-assigned to this trip and will join when ready.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
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
