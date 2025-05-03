
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
    return orderStatus === "delivery-confirmed" || orderStatus === "waiting-feedback";
  }
  
  if (targetStatus === "finished") {
    return orderStatus === "finished";
  }
  
  if (targetStatus === "waiting-feedback") {
    return orderStatus === "waiting-feedback";
  }
  
  // Direct comparison for other statuses
  return orderStatus === targetStatus as OrderStatus;
};
