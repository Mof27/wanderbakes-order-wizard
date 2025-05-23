
import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { OrderStatus } from "@/types";

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
  useWorkflowStatus?: boolean; // New prop to optionally use simplified workflow status
}

// Status color mapping function - consolidated from multiple components
export const getStatusColor = (status: string) => {
  switch (status) {
    case "incomplete":
      return "bg-gray-200 text-gray-800";
    case "in-queue":
      return "bg-blue-100 text-blue-800";
    case "in-kitchen":
      return "bg-yellow-100 text-yellow-800";
    case "waiting-photo":
      return "bg-purple-100 text-purple-800";
    case "pending-approval":
      return "bg-indigo-100 text-indigo-800";
    case "needs-revision":
      return "bg-amber-100 text-amber-800";
    case "ready-to-deliver":
      return "bg-green-100 text-green-800";
    case "in-delivery":
      return "bg-orange-100 text-orange-800";
    case "waiting-feedback":
      return "bg-indigo-100 text-indigo-800";
    case "finished":
      return "bg-lime-100 text-lime-800";
    case "archived":
      return "bg-slate-100 text-slate-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Helper function to format status for display
export const formatStatusLabel = (status: string): string => {
  return status
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className,
  useWorkflowStatus = false,
}) => {
  // For Orders page view, map delivery statuses to "In Delivery"
  const displayStatus = useWorkflowStatus && 
    (status === "ready-to-deliver" || status === "in-delivery") 
      ? "in-delivery" 
      : status;

  return (
    <Badge 
      className={cn(
        getStatusColor(displayStatus),
        className
      )}
    >
      {formatStatusLabel(displayStatus)}
    </Badge>
  );
};

export default StatusBadge;
