
import { OrderStatus } from "@/types";

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
