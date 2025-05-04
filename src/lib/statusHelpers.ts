
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
