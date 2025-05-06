
import { Order } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDate } from "@/lib/utils";
import { ArrowDown, ArrowUp, Cake, Clock, MapPin, Trash2, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TripOrderItemProps {
  order: Order;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}

const TripOrderItem = ({
  order,
  index,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onRemove
}: TripOrderItemProps) => {
  const navigate = useNavigate();
  
  const formatTimeSlot = (slot?: string) => {
    if (!slot) return "No time slot";
    
    if (slot === "slot1") return "10:00 - 13:00";
    if (slot === "slot2") return "13:00 - 16:00";
    if (slot === "slot3") return "16:00 - 20:00";
    
    return slot;
  };
  
  const handleViewOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/orders/${order.id}`);
  };
  
  return (
    <div className="border rounded-md p-3 bg-background hover:bg-muted/30 transition-colors">
      <div className="flex justify-between">
        <div className="flex-1 mr-2">
          {/* Order number */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1">
              <span className="font-medium">{order.id}</span>
              <Badge variant="outline" size="xs">{index + 1}</Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={handleViewOrder}>
              View
            </Button>
          </div>
          
          {/* Customer info */}
          <div className="flex items-center text-sm mb-1">
            <User className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
            <span>{order.customer.name}</span>
          </div>
          
          {/* Order details */}
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>{formatTimeSlot(order.deliveryTimeSlot)}</span>
            </div>
            <div className="flex items-center">
              <Cake className="h-3 w-3 mr-1" />
              <span>{order.cakeSize} {order.cakeShape}</span>
            </div>
          </div>
          
          {/* Address */}
          <div className="mt-1 text-xs text-muted-foreground flex items-start">
            <MapPin className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
            <span className="truncate">{order.deliveryAddress}</span>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={onMoveUp}
                  disabled={isFirst}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Move up</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={onMoveDown}
                  disabled={isLast}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Move down</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={onRemove}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Remove from trip</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};

export default TripOrderItem;
