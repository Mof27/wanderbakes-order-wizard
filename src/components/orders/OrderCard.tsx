
import { Order } from "@/types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Edit, Upload, Trash2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { formatDate, formatCurrency } from "@/lib/utils";
import OrderStatusDropdown from "./OrderStatusDropdown";
import { matchesStatus } from "@/lib/statusHelpers";
import DeliveryStatusManager from "@/components/delivery/DeliveryStatusManager";
import { useState } from "react";

interface OrderCardProps {
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

const OrderCard = ({ order }: OrderCardProps) => {
  const { deleteOrder } = useApp();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Determine if this order is in a delivery-related status
  const isInDeliveryFlow = matchesStatus(order.status, 'ready-to-deliver') || 
                         matchesStatus(order.status, 'in-delivery') ||
                         matchesStatus(order.status, 'delivery-confirmed');

  // Handle status changes to trigger a refresh
  const handleStatusChange = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Determine context-specific action button based on status
  const getActionButton = () => {
    // For delivery-related statuses, use the DeliveryStatusManager
    if (isInDeliveryFlow) {
      return <DeliveryStatusManager 
                order={order}
                onStatusChange={handleStatusChange}
             />;
    }
    
    // For waiting for photo status, show upload photos button
    if (order.status === "waiting-photo") {
      return (
        <Link to={`/orders/${order.id}?tab=delivery-recap`}>
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-purple-100 text-purple-800 hover:bg-purple-200"
          >
            <Upload className="h-4 w-4 mr-1" /> Upload Photos
          </Button>
        </Link>
      );
    }

    // Default edit button for other statuses
    return (
      <Link to={`/orders/${order.id}`}>
        <Button variant="outline" size="sm" className="bg-cake-primary hover:bg-cake-primary/80 text-cake-text">
          <Edit className="h-4 w-4 mr-1" /> Edit
        </Button>
      </Link>
    );
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted py-2">
        <div className="flex justify-between items-center">
          <p className="font-medium">{order.id}</p>
          <OrderStatusDropdown order={order} />
        </div>
      </CardHeader>
      <CardContent className="py-4 space-y-3">
        <div>
          <p className="text-sm font-medium">{order.customer.name}</p>
          <p className="text-xs text-muted-foreground">{order.customer.whatsappNumber}</p>
        </div>
        
        <div className="text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery:</span>
            <span className="font-medium">
              {formatDate(order.deliveryDate)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Flavor:</span>
            <span>{order.cakeFlavor}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Size:</span>
            <span>{order.cakeSize}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Design:</span>
            <span>{order.cakeDesign}</span>
          </div>
        </div>

        {order.cakeText && (
          <div className="text-sm bg-muted p-2 rounded">
            <p className="italic">"{order.cakeText}"</p>
          </div>
        )}

        <div className="text-right text-lg font-semibold">
          {formatCurrency(order.cakePrice)}
        </div>
      </CardContent>
      <CardFooter className="bg-muted py-2 flex justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => deleteOrder(order.id)} 
          className="text-red-500 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        
        {getActionButton()}
      </CardFooter>
    </Card>
  );
};

export default OrderCard;
