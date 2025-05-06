import { Order, OrderStatus } from "@/types";
import { startOfDay, addDays } from "date-fns";
import { getOrderTimeStatus } from "@/components/delivery/utils/deliveryHelpers";

/**
 * Helper function to check if an order status matches a specified status
 * This helps with compatibility when statuses are renamed
 */
export const matchesStatus = (orderStatus: OrderStatus, targetStatus: string): boolean => {
  // Map old status names to new ones for compatibility
  if (targetStatus === "confirmed") {
    return orderStatus === "in-queue";
  }
  
  if (targetStatus === "ready") {
    return orderStatus === "ready-to-deliver";
  }
  
  if (targetStatus === "delivered") {
    // We now map "delivered" directly to "waiting-feedback"
    return orderStatus === "waiting-feedback";
  }
  
  if (targetStatus === "finished") {
    return orderStatus === "finished";
  }
  
  if (targetStatus === "waiting-feedback") {
    return orderStatus === "waiting-feedback";
  }

  if (targetStatus === "archived") {
    return orderStatus === "archived";
  }
  
  // Direct comparison for other statuses
  return orderStatus === targetStatus as OrderStatus;
};

/**
 * Helper function to check if an order is in a delivery-related status
 */
export const isInDeliveryStatus = (orderStatus: OrderStatus): boolean => {
  return orderStatus === "ready-to-deliver" || orderStatus === "in-delivery";
};

/**
 * Helper function to check if an order should be shown in the "all statuses" view
 * on the delivery page (all except cancelled, finished, and archived)
 */
export const shouldShowInAllStatusesDelivery = (orderStatus: OrderStatus): boolean => {
  return !["cancelled", "finished", "archived"].includes(orderStatus);
};

/**
 * Helper function to get simplified workflow status for Orders page display and filtering
 * This maps granular statuses to their parent workflow status
 */
export const getWorkflowStatus = (orderStatus: OrderStatus): string => {
  // All delivery-related statuses map to "in-delivery" for Orders page
  if (orderStatus === "ready-to-deliver" || orderStatus === "in-delivery") {
    return "in-delivery";
  }
  
  // For other statuses, return as is
  return orderStatus;
};

/**
 * Helper function to check if an order is in the approval flow
 */
export const isInApprovalFlow = (orderStatus: OrderStatus): boolean => {
  return orderStatus === "pending-approval" || orderStatus === "needs-revision";
};

/**
 * Helper function to check if order can proceed to delivery
 * Ensures orders cannot enter delivery flow without approval
 */
export const canProceedToDelivery = (orderStatus: OrderStatus): boolean => {
  return orderStatus === "ready-to-deliver";
};

/**
 * Helper function to determine if an order needs to have photos reuploaded
 */
export const needsPhotoReupload = (orderStatus: OrderStatus): boolean => {
  return orderStatus === "needs-revision";
};

/**
 * Helper function to determine if an order is in an active revision process
 */
export const isInRevisionProcess = (order: { status: OrderStatus; revisionCount?: number }): boolean => {
  return (order.status === "needs-revision" || order.status === "pending-approval") && 
         !!order.revisionCount && 
         order.revisionCount > 0;
};

/**
 * Get appropriate label for revision status based on order data
 */
export const getRevisionStatusText = (order: { status: OrderStatus; revisionCount?: number }): string => {
  if (order.status === "needs-revision") {
    return `Revision #${order.revisionCount || 1} Needed`;
  }
  if (order.status === "pending-approval" && order.revisionCount && order.revisionCount > 0) {
    return `Revision #${order.revisionCount} Pending Approval`;
  }
  return "Pending Approval";
};

/**
 * Helper function to determine if an order has a preliminary driver assignment
 */
export const hasPreliminaryAssignment = (order: { deliveryAssignment?: { isPreliminary?: boolean } }): boolean => {
  return !!order.deliveryAssignment?.isPreliminary;
};

/**
 * Helper function to determine if an order can be pre-assigned to a driver
 */
export const canPreAssignDriver = (status: OrderStatus): boolean => {
  // Orders in these statuses can have a driver pre-assigned
  return ['in-queue', 'in-kitchen', 'waiting-photo', 'pending-approval', 'needs-revision'].includes(status);
};

// Helper function to determine if order status is waiting-photo
export const isWaitingPhoto = (status: string): boolean => {
  return status === 'waiting-photo';
};

// Helper function to determine if order is pending approval
export const isPendingApproval = (status: string): boolean => {
  return status === 'pending-approval';
};

// Helper function to determine if order needs revision
export const isNeedsRevision = (status: string): boolean => {
  return status === 'needs-revision';
};

// Filter orders based on selected date filter
export const filterOrdersByDate = (orders: Order[], dateFilter: string): Order[] => {
  const today = startOfDay(new Date());
  const tomorrow = startOfDay(addDays(today, 1));
  const dayAfterTomorrow = startOfDay(addDays(today, 2));
  
  return orders.filter(order => {
    const deliveryDate = startOfDay(new Date(order.deliveryDate));
    
    switch(dateFilter) {
      case 'today':
        return deliveryDate.getTime() === today.getTime();
      case 'tomorrow':
        return deliveryDate.getTime() === tomorrow.getTime();
      case 'd-plus-2':
        return deliveryDate.getTime() === dayAfterTomorrow.getTime();
      default:
        return true;
    }
  });
};

// Filter orders based on selected status
export const filterOrdersByStatus = (orders: Order[], statusFilter: string): Order[] => {
  return orders.filter(order => {
    switch(statusFilter) {
      case 'ready':
        return matchesStatus(order.status, 'ready-to-deliver');
      case 'in-transit':
        return matchesStatus(order.status, 'in-delivery');
      case 'pending-approval':
        return matchesStatus(order.status, 'pending-approval');
      case 'needs-revision':
        return matchesStatus(order.status, 'needs-revision');
      case 'delivery-statuses':
        return isInDeliveryStatus(order.status) || isInApprovalFlow(order.status);
      case 'all-statuses':
        return shouldShowInAllStatusesDelivery(order.status);
      default:
        return isInDeliveryStatus(order.status) || isInApprovalFlow(order.status);
    }
  });
};

// Filter orders based on selected time slot
export const filterOrdersByTimeSlot = (orders: Order[], timeSlotFilter: string): Order[] => {
  if (timeSlotFilter === 'all') {
    return orders;
  }
  
  return orders.filter(order => {
    // Handle time-based filters (late or within 2 hours)
    if (timeSlotFilter === 'late' || timeSlotFilter === 'within-2-hours') {
      const timeStatus = getOrderTimeStatus(order);
      return timeStatus === timeSlotFilter;
    }
    
    // Handle specific time slots
    return order.deliveryTimeSlot === timeSlotFilter;
  });
};
