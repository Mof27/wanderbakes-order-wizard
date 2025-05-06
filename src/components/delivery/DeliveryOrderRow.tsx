
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Eye, MessageSquare, User, Truck, Upload, X } from "lucide-react";
import { Order } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import StatusBadge from "@/components/orders/StatusBadge";
import DeliveryStatusManager from "@/components/delivery/DeliveryStatusManager";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { matchesStatus, isWaitingPhoto, isPendingApproval, isNeedsRevision } from "@/lib/statusHelpers";
import { getTimeSlotColor, getOrderTimeStatus, formatTimeSlotDisplay } from "./utils/deliveryHelpers";
import QuickDriverAssignDropdown from "@/components/delivery/QuickDriverAssignDropdown";

interface DeliveryOrderRowProps {
  order: Order;
  isSelected: boolean;
  onSelect: (orderId: string, checked: boolean) => void;
  onOpenDriverDialog: (order: Order) => void;
  onOpenPhotoDialog: (order: Order) => void;
  onStatusChange: () => void;
}

// Helper to determine if an order can have a driver pre-assigned
const canPreAssignDriver = (status: string): boolean => {
  return !["completed", "cancelled"].includes(status);
};

// Helper function to get driver badge based on delivery assignment
const getDriverBadge = (order: Order) => {
  if (!order.deliveryAssignment) return null;
  
  const { driverType, driverName, isPreliminary } = order.deliveryAssignment;
  let icon;
  let label;
  
  switch (driverType) {
    case "driver-1":
      icon = <Truck className="h-3.5 w-3.5 mr-0.5" />;
      label = "D1";
      return (
        <Badge size="xs" variant="outline" className={cn("bg-blue-50 text-blue-700 border-blue-200", isPreliminary && "border-dashed")}>
          {icon} {label} {isPreliminary && <X className="h-2.5 w-2.5 ml-0.5 text-blue-500" />}
        </Badge>
      );
    case "driver-2":
      icon = <Truck className="h-3.5 w-3.5 mr-0.5" />;
      label = "D2";
      return (
        <Badge size="xs" variant="outline" className={cn("bg-indigo-50 text-indigo-700 border-indigo-200", isPreliminary && "border-dashed")}>
          {icon} {label} {isPreliminary && <X className="h-2.5 w-2.5 ml-0.5 text-indigo-500" />}
        </Badge>
      );
    case "3rd-party":
      icon = <Truck className="h-3.5 w-3.5 mr-0.5" />;
      label = "3P";
      return (
        <Badge size="xs" variant="outline" className={cn("bg-purple-50 text-purple-700 border-purple-200", isPreliminary && "border-dashed")}>
          {icon} {label} {isPreliminary && <X className="h-2.5 w-2.5 ml-0.5 text-purple-500" />}
        </Badge>
      );
    default:
      return null;
  }
};

// Helper to determine if an order is late or within 2 hours based on time slot
const getTimeStatusBadge = (order: Order) => {
  const timeStatus = getOrderTimeStatus(order);
  
  if (timeStatus === 'late') {
    return (
      <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
        Late
      </Badge>
    );
  }
  
  if (timeStatus === 'within-2-hours') {
    return (
      <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
        &lt; 2 Hours
      </Badge>
    );
  }
  
  return null;
};

// Get revision badge if applicable
const getRevisionBadge = (order: Order) => {
  if (order.revisionCount && order.revisionCount > 0) {
    return (
      <Badge variant="outline" className="ml-1 bg-amber-50 text-amber-800 border-amber-200">
        Rev #{order.revisionCount}
      </Badge>
    );
  }
  return null;
};

const DeliveryOrderRow: React.FC<DeliveryOrderRowProps> = ({ 
  order,
  isSelected,
  onSelect,
  onOpenDriverDialog,
  onOpenPhotoDialog,
  onStatusChange
}) => {
  const timeSlotClass = getTimeSlotColor(order.deliveryTimeSlot);
  const isWaitingForPhoto = isWaitingPhoto(order.status);
  const isPendingForApproval = isPendingApproval(order.status);
  const isNeedingRevision = isNeedsRevision(order.status);
  const isReadyToDeliver = matchesStatus(order.status, 'ready-to-deliver');
  const hasDriverAssignment = !!order.deliveryAssignment;
  const canShowPreAssignDropdown = canPreAssignDriver(order.status);
  const isInTrip = !!order.tripId;
  const isSelectable = !isInTrip;

  return (
    <TableRow 
      key={order.id}
      className={cn(
        timeSlotClass,
        isSelected && "bg-muted"
      )}
    >
      <TableCell className="text-center py-1">
        {isSelectable ? (
          <Checkbox 
            checked={isSelected}
            onCheckedChange={(checked) => onSelect(order.id, !!checked)}
            aria-label={`Select order ${order.id}`}
          />
        ) : null}
      </TableCell>
      <TableCell className="font-medium py-1">
        <div className="flex items-center">
          {order.id}
          {getRevisionBadge(order)}
          {isInTrip && (
            <Badge size="xs" variant="outline" className="ml-1 bg-blue-50 text-blue-700 border-blue-200">
              <Truck className="h-3 w-3 mr-1" /> Trip
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell className="py-1">
        <StatusBadge status={order.status} />
      </TableCell>
      <TableCell className="py-1">
        {order.deliveryMethod ? (
          <Badge size="sm" variant="outline" className="capitalize">
            {order.deliveryMethod === 'flat-rate' ? 'Flat' : 
              order.deliveryMethod === 'lalamove' ? 'Lala' : 'Pickup'}
          </Badge>
        ) : (
          '-'
        )}
      </TableCell>
      <TableCell className="py-1">
        <div className="flex items-center gap-0.5">
          {getDriverBadge(order)}
          {((!isReadyToDeliver && hasDriverAssignment) || canShowPreAssignDropdown) && (
            <QuickDriverAssignDropdown 
              order={order} 
              onSuccess={onStatusChange}
              isPreliminaryOnly={!isReadyToDeliver}
              compact={true}
            />
          )}
          {!hasDriverAssignment && !canShowPreAssignDropdown && (
            <span className="text-xs text-muted-foreground">Not assigned</span>
          )}
        </div>
      </TableCell>
      <TableCell className="py-1">
        <div className="flex flex-col space-y-0.5">
          <div className="flex items-center">
            <span className="font-medium text-sm">
              {formatTimeSlotDisplay(order.deliveryTimeSlot)}
            </span>
          </div>
          <div className="flex items-center gap-0.5">
            {getTimeStatusBadge(order)}
            {order.deliveryArea && (
              <Badge size="xs" variant="secondary" className="text-xs">
                {order.deliveryArea}
              </Badge>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell py-1">
        <div>
          <div className="font-medium text-sm">{order.customer.name}</div>
          <div className="text-xs text-muted-foreground">{order.customer.whatsappNumber}</div>
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell py-1">
        <div className="text-xs max-w-full truncate">
          {order.deliveryAddress}
          {order.deliveryAddressNotes && (
            <span className="text-muted-foreground text-xs block">
              Note: {order.deliveryAddressNotes}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell className="text-right py-1">
        <div className="flex justify-end gap-0.5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline" 
                  size="icon"
                  asChild
                  className="h-7 w-7"
                >
                  <Link to={`/orders/${order.id}`} state={{ referrer: 'delivery' }}>
                    <Eye className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View Order</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline" 
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => {
                    toast.info(`Chat for order ${order.id} - to be implemented`);
                  }}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Chat</p>
              </TooltipContent>
            </Tooltip>
            
            {isReadyToDeliver && !hasDriverAssignment ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200"
                    onClick={() => onOpenDriverDialog(order)}
                  >
                    <User className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Assign Driver</p>
                </TooltipContent>
              </Tooltip>
            ) : (isReadyToDeliver || isPendingForApproval || isNeedingRevision) ? (
              isNeedingRevision ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200"
                      onClick={() => onOpenPhotoDialog(order)}
                    >
                      <Upload className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Upload</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <DeliveryStatusManager 
                  order={order} 
                  onStatusChange={onStatusChange}
                  compact={true}
                />
              )
            ) : isWaitingForPhoto ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200"
                    onClick={() => onOpenPhotoDialog(order)}
                  >
                    <Upload className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Upload Photo</p>
                </TooltipContent>
                </Tooltip>
              ) : null}
          </TooltipProvider>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default DeliveryOrderRow;
