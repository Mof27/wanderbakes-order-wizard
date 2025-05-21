import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import OrderForm from "@/components/orders/OrderForm";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Archive, RefreshCw, GalleryHorizontal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { dataService } from "@/services";
import { OrderStatus, SettingsData } from "@/types";
import OrderPrintButton from "@/components/orders/OrderPrintButton";
import DeliveryLabelPrintButton from "@/components/orders/DeliveryLabelPrintButton";
import { matchesStatus } from "@/lib/statusHelpers";
import { toast } from "sonner";
import AddToGalleryDialog from "@/components/gallery/AddToGalleryDialog";

const EditOrderPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { orders, updateOrder } = useApp();
  const [order, setOrder] = useState(id ? orders.find(o => o.id === id) : null);
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddToGalleryOpen, setIsAddToGalleryOpen] = useState(false);
  
  // Get the tab from query parameters
  const defaultTab = searchParams.get('tab') || 'required';
  
  // Determine the referrer based on URL state or pathname pattern
  const getReferrer = () => {
    // First check for explicit referrer in state
    if (location.state && location.state.referrer) {
      return location.state.referrer;
    }
    
    // Otherwise check URL patterns
    const path = location.pathname;
    const referrerFromPath = location.pathname.split('/')[1]; // Get first segment after /
    
    if (referrerFromPath === 'kitchen') {
      return 'kitchen';
    } else if (referrerFromPath === 'delivery') {
      return 'delivery';
    } else {
      return 'orders'; // Default referrer
    }
  };
  
  const referrer = getReferrer();

  // Check if order is archived
  const isArchived = order?.status === "archived";

  // Check if coming from CRM (customers page)
  const isFromCRM = referrer === "customers";

  // If order is archived and accessed from CRM, it should be read-only
  const isReadOnly = isArchived && isFromCRM;

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settingsData = await dataService.settings.getAll();
        setSettings(settingsData);
      } catch (error) {
        console.error("Failed to load settings", error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Update order when orders change (in case it was modified elsewhere)
  useEffect(() => {
    if (id) {
      const currentOrder = orders.find(o => o.id === id);
      setOrder(currentOrder || null);
    }
  }, [id, orders]);

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (order && !isReadOnly) {
      try {
        await updateOrder({
          ...order,
          status: newStatus
        });
      } catch (error) {
        console.error("Failed to update order status", error);
      }
    } else if (isReadOnly) {
      toast.error("Cannot modify archived orders accessed from Customer Records");
    }
  };

  // Handle restoring from archive
  const handleRestoreFromArchive = async () => {
    if (order && order.status === "archived") {
      try {
        // Restore to the previous status or default to 'finished'
        const previousStatus = order.orderLogs?.find(log => 
          log.type === 'status-change' && log.newStatus === 'archived'
        )?.previousStatus || 'finished';
        
        await updateOrder({
          ...order,
          status: previousStatus as OrderStatus,
          archivedDate: undefined
        });
        
        toast.success(`Order restored to '${previousStatus}' status`);
      } catch (error) {
        console.error("Failed to restore order from archive", error);
        toast.error("Failed to restore order");
      }
    }
  };
  
  // Handle going back based on referrer
  const handleGoBack = () => {
    navigate(`/${referrer}`);
  };

  // Check if photos can be added to gallery
  const canAddToGallery = order?.finishedCakePhotos && order.finishedCakePhotos.length > 0;

  if (!order) {
    return (
      <div>
        <Button variant="outline" onClick={handleGoBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to {referrer.charAt(0).toUpperCase() + referrer.slice(1)}
        </Button>
        <p>Order not found</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Edit Order</h1>
          <Button variant="outline" onClick={handleGoBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to {referrer.charAt(0).toUpperCase() + referrer.slice(1)}
          </Button>
        </div>
        <Skeleton className="w-full h-[600px]" />
      </div>
    );
  }

  const orderPrintCount = order.printHistory?.filter(e => e.type === 'order-form').length || 0;
  const labelPrintCount = order.printHistory?.filter(e => e.type === 'delivery-label').length || 0;

  // Determine if we should automatically switch to the delivery tab based on status
  let activeTab = defaultTab;
  if (matchesStatus(order.status, 'waiting-photo') || 
      matchesStatus(order.status, 'in-delivery') || 
      matchesStatus(order.status, 'delivery-confirmed') ||
      matchesStatus(order.status, 'waiting-feedback')) {
    activeTab = 'delivery-recap';
  }

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Edit Order | Cake Shop</title>
      </Helmet>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Edit Order #{order.id}</h1>
          {isReadOnly && (
            <div className="mt-1 text-amber-600 flex items-center gap-1">
              <Archive className="h-4 w-4" />
              <span>Archived Order (Read-only Mode)</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {isArchived && (
            <Button 
              variant="outline" 
              onClick={handleRestoreFromArchive}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Restore from Archive
            </Button>
          )}
          {canAddToGallery && (
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setIsAddToGalleryOpen(true)}
            >
              <GalleryHorizontal className="h-4 w-4" />
              Add to Gallery
            </Button>
          )}
          <OrderPrintButton order={order} />
          <DeliveryLabelPrintButton order={order} />
          <Button variant="outline" onClick={handleGoBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to {referrer.charAt(0).toUpperCase() + referrer.slice(1)}
          </Button>
        </div>
      </div>
      
      {/* Print history indicator */}
      {(orderPrintCount > 0 || labelPrintCount > 0) && (
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>Print history:</span>
          {orderPrintCount > 0 && (
            <span>Order form: {orderPrintCount} {orderPrintCount === 1 ? 'time' : 'times'}</span>
          )}
          {labelPrintCount > 0 && (
            <span>Delivery label: {labelPrintCount} {labelPrintCount === 1 ? 'time' : 'times'}</span>
          )}
        </div>
      )}
      
      <OrderForm 
        order={order} 
        settings={settings} 
        defaultTab={activeTab}
        onStatusChange={handleStatusUpdate}
        referrer={referrer} // Pass referrer to OrderForm
        readOnly={isReadOnly} // Pass readOnly prop to OrderForm
      />

      {/* Add to Gallery Dialog */}
      {order && (
        <AddToGalleryDialog
          order={order}
          open={isAddToGalleryOpen}
          onOpenChange={setIsAddToGalleryOpen}
          onSuccess={() => toast.success("Photos added to gallery successfully")}
        />
      )}
    </div>
  );
};

export default EditOrderPage;
