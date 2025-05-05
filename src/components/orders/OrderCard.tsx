
import { Order } from "@/types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Edit, Upload, Eye, CheckSquare2, XCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { formatDate, formatCurrency } from "@/lib/utils";
import StatusBadge from "./StatusBadge";
import { matchesStatus } from "@/lib/statusHelpers";
import DeliveryStatusManager from "@/components/delivery/DeliveryStatusManager";
import { useState } from "react";
import CakePhotoUploadDialog from "./CakePhotoUploadDialog";
import CakePhotoApprovalDialog from "./CakePhotoApprovalDialog";
import { Badge } from "@/components/ui/badge";

interface OrderCardProps {
  order: Order;
}

const OrderCard = ({ order }: OrderCardProps) => {
  const { deleteOrder } = useApp();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [photoUploadDialogOpen, setPhotoUploadDialogOpen] = useState(false);
  const [photoApprovalDialogOpen, setPhotoApprovalDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Determine if this order is in a delivery-related status
  const isInDeliveryFlow = matchesStatus(order.status, 'ready-to-deliver') || 
                         matchesStatus(order.status, 'in-delivery');

  // Determine if this is in waiting-photo status
  const isWaitingPhoto = matchesStatus(order.status, 'waiting-photo');
  
  // Determine if this is in pending-approval status
  const isPendingApproval = matchesStatus(order.status, 'pending-approval');
  
  // Determine if this needs revision
  const isNeedsRevision = matchesStatus(order.status, 'needs-revision');
  
  // Check if order has revision history
  const hasRevisions = !!order.revisionCount && order.revisionCount > 0;

  // Handle status changes to trigger a refresh
  const handleStatusChange = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Open the photo upload dialog
  const handleOpenPhotoDialog = () => {
    setPhotoUploadDialogOpen(true);
  };
  
  // Open the photo approval dialog
  const handleOpenApprovalDialog = () => {
    setPhotoApprovalDialogOpen(true);
  };
  
  // Handle dialog close with success
  const handleDialogSuccess = () => {
    setPhotoUploadDialogOpen(false);
    setPhotoApprovalDialogOpen(false);
    handleStatusChange();
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
    
    // For waiting for photo status, show photo upload button
    if (isWaitingPhoto) {
      return (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleOpenPhotoDialog}
          className="bg-purple-100 text-purple-800 hover:bg-purple-200"
        >
          <Upload className="h-4 w-4 mr-1" /> Upload Photos
        </Button>
      );
    }
    
    // For pending approval status, show approve button
    if (isPendingApproval) {
      return (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleOpenApprovalDialog}
          className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
        >
          <CheckSquare2 className="h-4 w-4 mr-1" /> Review Photos
        </Button>
      );
    }
    
    // For needs revision status, show revision button
    if (isNeedsRevision) {
      return (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleOpenPhotoDialog}
          className="bg-amber-100 text-amber-800 hover:bg-amber-200"
        >
          <XCircle className="h-4 w-4 mr-1" /> Re-upload Photos
        </Button>
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
    <>
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted py-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <p className="font-medium">{order.id}</p>
              {hasRevisions && (
                <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 text-xs">
                  Rev #{order.revisionCount}
                </Badge>
              )}
            </div>
            <StatusBadge status={order.status} />
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
          <Link to={`/orders/${order.id}`}>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8"
            >
              <Eye className="h-4 w-4 mr-1" /> View
            </Button>
          </Link>
          
          {getActionButton()}
        </CardFooter>
      </Card>
      
      {/* Photo Upload Dialog */}
      {(isWaitingPhoto || isNeedsRevision) && (
        <CakePhotoUploadDialog 
          order={order}
          open={photoUploadDialogOpen}
          onClose={() => setPhotoUploadDialogOpen(false)}
          onSuccess={handleDialogSuccess}
        />
      )}
      
      {/* Photo Approval Dialog */}
      {isPendingApproval && (
        <CakePhotoApprovalDialog 
          order={order}
          open={photoApprovalDialogOpen}
          onClose={() => setPhotoApprovalDialogOpen(false)}
          onSuccess={handleDialogSuccess}
        />
      )}
    </>
  );
};

export default OrderCard;
