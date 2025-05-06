
import React from "react";
import { useNavigate } from "react-router-dom";
import { Order } from "@/types";
import { TableCell, TableRow } from "@/components/ui/table";
import StatusBadge from "./StatusBadge";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Car } from "lucide-react";
import { DeliveryTrip } from "@/types/trip";

interface SelectableOrderTableRowProps {
  order: Order;
  onClick?: () => void;
  customActions?: React.ReactNode;
  useWorkflowStatus?: boolean;
  isSelectable?: boolean;
  isSelected?: boolean;
  onSelectionChange?: () => void;
  trip?: DeliveryTrip;
}

const SelectableOrderTableRow: React.FC<SelectableOrderTableRowProps> = ({ 
  order, 
  onClick, 
  customActions,
  useWorkflowStatus = true,
  isSelectable = false,
  isSelected = false,
  onSelectionChange,
  trip
}) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    // If we're in selection mode and clicking on the row (not the checkbox or actions)
    if (isSelectable && onSelectionChange && !e.defaultPrevented) {
      onSelectionChange();
    } else if (onClick) {
      onClick();
    } else {
      navigate(`/orders/${order.id}`);
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelectionChange) {
      onSelectionChange();
    }
  };

  return (
    <TableRow 
      className={`
        cursor-pointer 
        hover:bg-muted/30
        ${isSelected ? 'bg-blue-50' : ''}
      `}
      onClick={handleClick}
    >
      {isSelectable && (
        <TableCell onClick={handleCheckboxClick}>
          <Checkbox checked={isSelected} />
        </TableCell>
      )}
      <TableCell>#{order.id.substring(order.id.length - 5)}</TableCell>
      <TableCell>{order.customer.name}</TableCell>
      <TableCell>
        <StatusBadge 
          status={order.status} 
          useWorkflowStatus={useWorkflowStatus} 
        />
      </TableCell>
      <TableCell>
        {new Date(order.deliveryDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })}
      </TableCell>
      <TableCell>
        <span className="line-clamp-1">{`${order.cakeFlavor} - ${order.cakeShape}`}</span>
      </TableCell>
      <TableCell>
        {new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0
        }).format(order.cakePrice)}
      </TableCell>
      <TableCell>
        {trip && (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
            <Car className="h-3 w-3" />
            <span>{`${trip.driverId === 'driver-1' ? 'Driver #1' : 'Driver #2'} Trip ${trip.tripNumber}`}</span>
          </Badge>
        )}
      </TableCell>
      <TableCell className="text-right">
        {customActions}
      </TableCell>
    </TableRow>
  );
};

export default SelectableOrderTableRow;
