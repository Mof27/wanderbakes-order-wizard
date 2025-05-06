import { Order } from "@/types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { MapPin, Truck, Package, Calendar, CheckCircle2, Clock, CheckSquare2, XCircle, User, Car, ExternalLink, AlertCircle } from "lucide-react";
import { matchesStatus, isInApprovalFlow } from "@/lib/statusHelpers";
import { useState } from "react";
import DriverAssignmentDialog from "./DriverAssignmentDialog";

interface DeliveryCardProps {
  order: Order;
  onStatusChange?: () => void;
}

const DeliveryCard = ({ order, onStatusChange }: DeliveryCardProps) => {
  const [showDriverDialog, setShowDriverDialog] = useState(false);
  const [isPreliminary, setIsPreliminary] = useState(false);
  
  const isReady = matchesStatus(order.status, 'ready-to-deliver');
  const isInTransit = matchesStatus(order.status, 'in-delivery');
  const isPendingApproval = matchesStatus(order.status, 'pending-approval');
  const isNeedsRevision = matchesStatus(order.status, 'needs-revision');
  const canPreAssign = !isReady && !isInTransit;
  
  // Check if order has a driver assignment
  const hasDriverAssignment = !!order.deliveryAssignment;
  const hasPreliminaryAssignment = hasDriverAssignment && order.deliveryAssignment?.isPreliminary;
  
  const getStatusBadge = () => {
    if (isPendingApproval) {
      return (
        <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200">
          <CheckSquare2 className="h-3 w-3 mr-1" /> Pending Approval
        </Badge>
      );
    }
    if (isNeedsRevision) {
      return (
        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
          <XCircle className="h-3 w-3 mr-1" /> Needs Revision
        </Badge>
      );
    }
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

  // Get revision badge if applicable
  const getRevisionBadge = () => {
    if (order.revisionCount && order.revisionCount > 0) {
      return (
        <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-800 border-amber-200">
          Rev #{order.revisionCount}
        </Badge>
      );
    }
    return null;
  };
  
  // Get driver badge if driver is assigned
  const getDriverBadge = () => {
    if (!order.deliveryAssignment) return null;
    
    const { driverType, driverName, isPreliminary } = order.deliveryAssignment;
    
    let icon = <Truck className="h-3 w-3 mr-1" />;
    let label = "Unknown";
    let color = "";
    
    switch (driverType) {
      case "driver-1":
        icon = <Car className="h-3 w-3 mr-1" />;
        label = "Driver 1";
        color = "bg-blue-100 text-blue-800 hover:bg-blue-200";
        break;
      case "driver-2":
        icon = <Car className="h-3 w-3 mr-1" />;
        label = "Driver 2";
        color = "bg-indigo-100 text-indigo-800 hover:bg-indigo-200";
        break;
      case "3rd-party":
        icon = <ExternalLink className="h-3 w-3 mr-1" />;
        label = driverName || "Lalamove";
        color = "bg-purple-100 text-purple-800 hover:bg-purple-200";
        break;
    }
    
    return (
      <Badge className={cn(color, isPreliminary && "border-dashed border")}>
        {icon} {label} {isPreliminary && <AlertCircle className="h-3 w-3 ml-1" />}
      </Badge>
    );
  };

  // Handle driver dialog
  const openDriverDialog = (preliminary = false) => {
    setIsPreliminary(preliminary);
    setShowDriverDialog(true);
  };

  const handleDriverSuccess = () => {
    setShowDriverDialog(false);
    if (onStatusChange) onStatusChange();
  };

  return (
    <Card className={cn(
      "overflow-hidden border-l-4 hover:shadow-md transition-shadow",
      isNeedsRevision ? "border-l-amber-500" : ""
    )}>
      <CardHeader className="bg-muted py-3 px-4 flex flex-row items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="font-medium">{order.id}</span>
          {getStatusBadge()}
          {getRevisionBadge()}
        </div>
        <div className="flex items-center gap-2">
          {getDriverBadge()}
          {order.deliveryMethod && (
            <Badge variant="outline" className="capitalize">
              {order.deliveryMethod === 'flat-rate' ? 'Shop Delivery' : order.deliveryMethod}
            </Badge>
          )}
        </div>
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
          </div>
          {order.deliveryTimeSlot && (
            <div className="flex items-center ml-6">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">{order.deliveryTimeSlot}</span>
            </div>
          )}
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
        
        {order.deliveryAssignment?.notes && (
          <div className="p-2 bg-muted rounded text-sm">
            <p className="font-medium mb-1">Delivery Instructions:</p>
            <p className="text-muted-foreground">{order.deliveryAssignment.notes}</p>
          </div>
        )}
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
          {isPendingApproval && (
            <Button 
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              asChild
            >
              <Link to={`/orders/${order.id}?tab=delivery-recap`}>
                <CheckSquare2 className="h-4 w-4 mr-1" /> Review Photos
              </Link>
            </Button>
          )}

          {isNeedsRevision && (
            <Button 
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 text-white"
              asChild
            >
              <Link to={`/orders/${order.id}?tab=delivery-recap`}>
                <XCircle className="h-4 w-4 mr-1" /> Upload Revision
              </Link>
            </Button>
          )}
          
          {isReady && !hasDriverAssignment && (
            <Button 
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => openDriverDialog(false)}
            >
              <User className="h-4 w-4 mr-1" /> Assign Driver
            </Button>
          )}
          
          {isReady && hasDriverAssignment && (
            <>
              <Button 
                size="sm"
                variant="outline"
                onClick={() => openDriverDialog(false)}
              >
                <User className="h-4 w-4 mr-1" /> Change Driver
              </Button>
              
              <Button 
                size="sm"
                className="bg-orange-600 hover:bg-orange-700 text-white"
                asChild
              >
                <Link to={`/orders/${order.id}?tab=delivery-recap&action=start-delivery`}>
                  <Truck className="h-4 w-4 mr-1" /> Start Delivery
                </Link>
              </Button>
            </>
          )}
          
          {canPreAssign && !hasDriverAssignment && (
            <Button 
              size="sm"
              variant="outline"
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
              onClick={() => openDriverDialog(true)}
            >
              <User className="h-4 w-4 mr-1" /> Pre-Assign Driver
            </Button>
          )}
          
          {canPreAssign && hasPreliminaryAssignment && (
            <Button 
              size="sm"
              variant="outline"
              onClick={() => openDriverDialog(true)}
            >
              <User className="h-4 w-4 mr-1" /> Change Pre-Assignment
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
      
      <DriverAssignmentDialog 
        open={showDriverDialog}
        onOpenChange={setShowDriverDialog}
        order={order}
        onSuccess={handleDriverSuccess}
        isPreliminary={isPreliminary}
      />
    </Card>
  );
};

export default DeliveryCard;
