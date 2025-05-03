
import { Order } from "@/types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Link } from "react-router-dom";
import { MapPin, Truck, Package, Calendar, CheckCircle2 } from "lucide-react";
import { matchesStatus } from "@/lib/statusHelpers";

interface DeliveryCardProps {
  order: Order;
}

const DeliveryCard = ({ order }: DeliveryCardProps) => {
  const isReady = matchesStatus(order.status, 'ready-to-deliver');
  const isInTransit = matchesStatus(order.status, 'in-delivery');
  
  const getStatusBadge = () => {
    if (isReady) {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
          <Package className="h-3 w-3 mr-1" /> Ready for Delivery
        </Badge>
      );
    }
    if (isInTransit) {
      return (
        <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">
          <Truck className="h-3 w-3 mr-1" /> In Transit
        </Badge>
      );
    }
    return null;
  };

  return (
    <Card className="overflow-hidden border-l-4 hover:shadow-md transition-shadow">
      <CardHeader className="bg-muted py-3 px-4 flex flex-row items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="font-medium">{order.id}</span>
          {getStatusBadge()}
        </div>
        {order.deliveryMethod && (
          <Badge variant="outline" className="capitalize">
            {order.deliveryMethod === 'flat-rate' ? 'Shop Delivery' : order.deliveryMethod}
          </Badge>
        )}
      </CardHeader>
      
      <CardContent className="p-4 space-y-3">
        <div className="space-y-1">
          <div className="flex items-start">
            <MapPin className="h-4 w-4 mr-2 mt-1 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="font-medium leading-snug">{order.deliveryAddress}</p>
              {order.deliveryAddressNotes && (
                <p className="text-sm text-muted-foreground">{order.deliveryAddressNotes}</p>
              )}
              {order.deliveryArea && (
                <Badge variant="secondary" className="mt-1">{order.deliveryArea}</Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="font-medium">{formatDate(order.deliveryDate)}</span>
            {order.deliveryTimeSlot && (
              <Badge variant="outline" className="ml-2">
                {order.deliveryTimeSlot}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center">
            <div className="text-sm">
              <span className="font-medium">{order.customer.name}</span> • 
              <span className="ml-1 text-muted-foreground">{order.customer.whatsappNumber}</span>
            </div>
          </div>
        </div>
        
        <div className="text-sm">
          <div className="flex items-center">
            <Package className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{order.cakeSize} {order.cakeShape}, {order.cakeFlavor}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-muted px-4 py-3 flex justify-between">
        <Button
          variant="outline" 
          size="sm"
          asChild
        >
          <Link to={`/orders/${order.id}`}>
            View Order
          </Link>
        </Button>
        
        <div className="space-x-2">
          {isReady && (
            <Button 
              size="sm"
              className="bg-orange-600 hover:bg-orange-700 text-white"
              asChild
            >
              <Link to={`/orders/${order.id}?tab=delivery-recap`}>
                <Truck className="h-4 w-4 mr-1" /> Start Delivery
              </Link>
            </Button>
          )}
          
          {isInTransit && (
            <Button 
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
              asChild
            >
              <Link to={`/orders/${order.id}?tab=delivery-recap`}>
                <CheckCircle2 className="h-4 w-4 mr-1" /> Complete Delivery
              </Link>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default DeliveryCard;
