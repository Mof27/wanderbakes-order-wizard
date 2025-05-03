
import { Order } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Edit, Truck, Trash2, Upload, CheckCircle2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { formatDate, formatCurrency } from "@/lib/utils";
import OrderStatusDropdown from "./OrderStatusDropdown";

interface OrderTableRowProps {
  order: Order;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "incomplete":
      return "bg-gray-200 text-gray-800";
    case "in-queue":
      return "bg-blue-100 text-blue-800";
    case "in-kitchen":
      return "bg-yellow-100 text-yellow-800";
    case "waiting-photo":
      return "bg-purple-100 text-purple-800";
    case "ready-to-deliver":
      return "bg-green-100 text-green-800";
    case "in-delivery":
      return "bg-orange-100 text-orange-800";
    case "delivery-confirmed":
      return "bg-teal-100 text-teal-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const OrderTableRow = ({ order }: OrderTableRowProps) => {
  const { deleteOrder } = useApp();

  // Determine context-specific action buttons based on status
  const getActionButton = () => {
    switch (order.status) {
      case "waiting-photo":
        return (
          <Link to={`/orders/${order.id}?tab=delivery-recap`}>
            <Button
              variant="outline"
              size="sm"
              className="bg-purple-100 text-purple-800 hover:bg-purple-200 h-8 w-8 p-0"
            >
              <Upload className="h-4 w-4" />
            </Button>
          </Link>
        );
      case "in-delivery":
        return (
          <Link to={`/orders/${order.id}?tab=delivery-recap`}>
            <Button
              variant="outline"
              size="sm"
              className="bg-orange-100 text-orange-800 hover:bg-orange-200 h-8 w-8 p-0"
            >
              <Truck className="h-4 w-4" />
            </Button>
          </Link>
        );
      default:
        return (
          <Link to={`/orders/${order.id}`}>
            <Button
              variant="outline"
              size="sm"
              className="bg-cake-primary hover:bg-cake-primary/80 text-cake-text h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
        );
    }
  };

  return (
    <tr className="border-t">
      <td className="p-2 text-sm">{order.id}</td>
      <td className="p-2">
        <div>
          <p className="text-sm font-medium">{order.customer.name}</p>
          <p className="text-xs text-muted-foreground">
            {order.customer.whatsappNumber}
          </p>
        </div>
      </td>
      <td className="p-2">
        <OrderStatusDropdown order={order} />
      </td>
      <td className="p-2 text-sm">
        {formatDate(order.deliveryDate)}
      </td>
      <td className="p-2 text-sm">
        <div>
          <p>{order.cakeFlavor}</p>
          <p className="text-xs text-muted-foreground">{order.cakeSize}</p>
        </div>
      </td>
      <td className="p-2 font-medium">
        {formatCurrency(order.cakePrice)}
      </td>
      <td className="p-2">
        <div className="flex space-x-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => deleteOrder(order.id)}
            className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          
          {getActionButton()}
        </div>
      </td>
    </tr>
  );
};

export default OrderTableRow;
