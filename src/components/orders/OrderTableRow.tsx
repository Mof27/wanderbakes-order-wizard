
import { Order } from "@/types";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Edit, Truck, Eye, Upload } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { formatDate, formatCurrency } from "@/lib/utils";
import StatusBadge from "./StatusBadge";
import DeliveryStatusManager from "@/components/delivery/DeliveryStatusManager";
import { matchesStatus } from "@/lib/statusHelpers";
import { useState } from "react";
import CakePhotoUploadDialog from "./CakePhotoUploadDialog";

interface OrderTableRowProps {
  order: Order;
  onClick?: () => void;
}

const OrderTableRow = ({ order, onClick }: OrderTableRowProps) => {
  const { deleteOrder } = useApp();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);

  // Determine if this order is in a delivery-related status
  const isInDeliveryFlow = matchesStatus(order.status, 'ready-to-deliver') || 
                          matchesStatus(order.status, 'in-delivery') ||
                          matchesStatus(order.status, 'delivery-confirmed');

  // Determine if this is in waiting-photo status
  const isWaitingPhoto = matchesStatus(order.status, 'waiting-photo');

  // Handle status changes to trigger a refresh
  const handleStatusChange = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Open the photo upload dialog
  const handleOpenPhotoDialog = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoDialogOpen(true);
  };

  // Determine context-specific action buttons
  const getActionButton = () => {
    // For delivery-related statuses, use the DeliveryStatusManager
    if (isInDeliveryFlow) {
      return <DeliveryStatusManager 
                order={order} 
                compact={true} 
                onStatusChange={handleStatusChange} 
             />;
    }
    
    // For waiting-photo status, show upload photo dialog button
    if (isWaitingPhoto) {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={handleOpenPhotoDialog}
          className="bg-purple-100 text-purple-800 hover:bg-purple-200 h-8 w-8 p-0"
        >
          <Upload className="h-4 w-4" />
        </Button>
      );
    }

    // Default edit button for other statuses
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
  };

  return (
    <>
      <tr className="border-t cursor-pointer hover:bg-muted/40" onClick={onClick}>
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
          <StatusBadge status={order.status} />
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
          <div className="flex space-x-1" onClick={e => e.stopPropagation()}>
            <Link to={`/orders/${order.id}`}>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
            
            {getActionButton()}
          </div>
        </td>
      </tr>
      
      {/* Photo Upload Dialog */}
      {isWaitingPhoto && (
        <CakePhotoUploadDialog
          order={order}
          open={photoDialogOpen}
          onClose={() => setPhotoDialogOpen(false)}
          onSuccess={handleStatusChange}
        />
      )}
    </>
  );
};

export default OrderTableRow;
