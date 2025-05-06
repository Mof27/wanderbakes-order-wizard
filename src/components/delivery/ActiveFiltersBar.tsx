
import React from "react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, addDays } from "date-fns";

interface FilterBadgeProps {
  label: string;
  onClear: () => void;
  className?: string;
}

const FilterBadge: React.FC<FilterBadgeProps> = ({ label, onClear, className }) => (
  <Badge 
    variant="outline"
    className={cn("flex items-center gap-1", className)}
  >
    {label}
    <button 
      onClick={onClear} 
      className="rounded-full hover:bg-background/20 p-0.5"
      aria-label={`Clear ${label} filter`}
    >
      <X className="h-3 w-3" />
    </button>
  </Badge>
);

interface ActiveFiltersBarProps {
  dateFilter: 'today' | 'tomorrow' | 'd-plus-2' | 'all';
  statusFilter: 'ready' | 'in-transit' | 'pending-approval' | 'needs-revision' | 'delivery-statuses' | 'all-statuses';
  timeSlotFilter: 'all' | 'late' | 'within-2-hours' | 'slot1' | 'slot2' | 'slot3';
  onClearDateFilter: () => void;
  onClearStatusFilter: () => void;
  onClearTimeSlotFilter: () => void;
}

const ActiveFiltersBar: React.FC<ActiveFiltersBarProps> = ({
  dateFilter,
  statusFilter,
  timeSlotFilter,
  onClearDateFilter,
  onClearStatusFilter,
  onClearTimeSlotFilter
}) => {
  const formatDateFilterLabel = (filter: string) => {
    switch (filter) {
      case 'today': return `Today (${format(new Date(), 'MMM d')})`;
      case 'tomorrow': return `Tomorrow (${format(addDays(new Date(), 1), 'MMM d')})`;
      case 'd-plus-2': return format(addDays(new Date(), 2), 'MMM d');
      default: return null;
    }
  };

  const formatStatusFilterLabel = (filter: string) => {
    switch (filter) {
      case 'ready': return 'Ready';
      case 'in-transit': return 'In Transit';
      case 'pending-approval': return 'Needs Approval';
      case 'needs-revision': return 'Needs Revision';
      case 'delivery-statuses': return 'Delivery Only';
      default: return null;
    }
  };

  const formatTimeSlotFilterLabel = (filter: string) => {
    switch (filter) {
      case 'late': return 'Late';
      case 'within-2-hours': return 'Within 2 Hours';
      case 'slot1': return 'Slot 1 (10:00-13:00)';
      case 'slot2': return 'Slot 2 (13:00-16:00)';
      case 'slot3': return 'Slot 3 (16:00-20:00)';
      default: return null;
    }
  };

  const dateLabel = formatDateFilterLabel(dateFilter);
  const statusLabel = formatStatusFilterLabel(statusFilter);
  const timeSlotLabel = formatTimeSlotFilterLabel(timeSlotFilter);

  const hasActiveFilters = dateLabel || statusLabel || timeSlotLabel;

  if (!hasActiveFilters) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2 mb-4">
      {dateLabel && (
        <FilterBadge 
          label={dateLabel}
          onClear={onClearDateFilter}
          className="bg-blue-50 text-blue-800 border-blue-200"
        />
      )}
      
      {statusLabel && (
        <FilterBadge 
          label={statusLabel}
          onClear={onClearStatusFilter}
          className={cn(
            statusFilter === 'ready' && "bg-green-50 text-green-800 border-green-200",
            statusFilter === 'in-transit' && "bg-orange-50 text-orange-800 border-orange-200",
            statusFilter === 'pending-approval' && "bg-indigo-50 text-indigo-800 border-indigo-200",
            statusFilter === 'needs-revision' && "bg-amber-50 text-amber-800 border-amber-200",
            statusFilter === 'delivery-statuses' && "bg-blue-50 text-blue-800 border-blue-200",
          )}
        />
      )}
      
      {timeSlotLabel && (
        <FilterBadge 
          label={timeSlotLabel}
          onClear={onClearTimeSlotFilter}
          className={cn(
            timeSlotFilter === 'late' && "bg-red-50 text-red-800 border-red-200",
            timeSlotFilter === 'within-2-hours' && "bg-amber-50 text-amber-800 border-amber-200",
            timeSlotFilter === 'slot1' && "bg-purple-50 text-purple-800 border-purple-200",
            timeSlotFilter === 'slot2' && "bg-blue-50 text-blue-800 border-blue-200",
            timeSlotFilter === 'slot3' && "bg-indigo-50 text-indigo-800 border-indigo-200",
          )}
        />
      )}
    </div>
  );
};

export default ActiveFiltersBar;
