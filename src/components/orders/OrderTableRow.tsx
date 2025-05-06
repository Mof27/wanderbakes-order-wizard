
import { useNavigate } from "react-router-dom";
import { Order } from "@/types";
import { TableCell, TableRow } from "@/components/ui/table";
import StatusBadge from "./StatusBadge";
import { DeliveryTrip } from "@/types/trip";
import TripBadge from "@/components/delivery/TripBadge";

interface OrderTableRowProps {
  order: Order;
  onClick?: () => void;
  customActions?: React.ReactNode;
  useWorkflowStatus?: boolean;
  trip?: DeliveryTrip;
}

const OrderTableRow = ({ 
  order, 
  onClick, 
  customActions,
  useWorkflowStatus = true,
  trip
}: OrderTableRowProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/orders/${order.id}`);
    }
  };

  return (
    <TableRow className="cursor-pointer hover:bg-muted/30" onClick={handleClick}>
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
        {trip && <TripBadge trip={trip} compact={true} />}
      </TableCell>
      <TableCell className="text-right">
        {customActions}
      </TableCell>
    </TableRow>
  );
};

export default OrderTableRow;
