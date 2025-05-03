
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
  
  // Direct comparison for other statuses
  return orderStatus === targetStatus as OrderStatus;
};
