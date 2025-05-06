
import React from "react";
import CompactDeliveryDateFilter from "@/components/delivery/CompactDeliveryDateFilter";
import CompactDeliveryStatusFilter from "@/components/delivery/CompactDeliveryStatusFilter";
import CompactDeliveryTimeSlotFilter from "@/components/delivery/CompactDeliveryTimeSlotFilter";
import CollapsibleFilters from "@/components/delivery/CollapsibleFilters";
import ActiveFiltersBar from "@/components/delivery/ActiveFiltersBar";
import MobileFilterDrawer from "@/components/delivery/MobileFilterDrawer";

interface DeliveryFilterProps {
  dateFilter: 'today' | 'tomorrow' | 'd-plus-2' | 'all';
  statusFilter: 'ready' | 'in-transit' | 'pending-approval' | 'needs-revision' | 'delivery-statuses' | 'all-statuses';
  timeSlotFilter: 'all' | 'late' | 'within-2-hours' | 'slot1' | 'slot2' | 'slot3';
  onDateFilterChange: (filter: 'today' | 'tomorrow' | 'd-plus-2' | 'all') => void;
  onStatusFilterChange: (filter: 'ready' | 'in-transit' | 'pending-approval' | 'needs-revision' | 'delivery-statuses' | 'all-statuses') => void;
  onTimeSlotFilterChange: (filter: 'all' | 'late' | 'within-2-hours' | 'slot1' | 'slot2' | 'slot3') => void;
}

const DeliveryFilter: React.FC<DeliveryFilterProps> = ({
  dateFilter,
  statusFilter,
  timeSlotFilter,
  onDateFilterChange,
  onStatusFilterChange,
  onTimeSlotFilterChange
}) => {
  const activeFiltersCount = 
    (dateFilter !== 'all' ? 1 : 0) + 
    (statusFilter !== 'all-statuses' ? 1 : 0) + 
    (timeSlotFilter !== 'all' ? 1 : 0);

  return (
    <div className="space-y-4">
      <ActiveFiltersBar 
        dateFilter={dateFilter}
        statusFilter={statusFilter}
        timeSlotFilter={timeSlotFilter}
        onClearDateFilter={() => onDateFilterChange('all')}
        onClearStatusFilter={() => onStatusFilterChange('all-statuses')}
        onClearTimeSlotFilter={() => onTimeSlotFilterChange('all')}
      />
      
      {/* Mobile Filters Drawer */}
      <div className="md:hidden mb-4">
        <MobileFilterDrawer 
          dateFilter={dateFilter}
          statusFilter={statusFilter}
          timeSlotFilter={timeSlotFilter}
          onDateFilterChange={onDateFilterChange}
          onStatusFilterChange={onStatusFilterChange}
          onTimeSlotFilterChange={onTimeSlotFilterChange}
          activeFiltersCount={activeFiltersCount}
        />
      </div>
      
      {/* Desktop Filters - Two Column Layout */}
      <div className="hidden md:grid md:grid-cols-2 gap-4">
        {/* Left Column - Always visible date filter */}
        <div>
          <CompactDeliveryDateFilter
            value={dateFilter}
            onChange={onDateFilterChange}
          />
        </div>
        
        {/* Right Column - Collapsible status and time filters */}
        <div>
          <CollapsibleFilters 
            activeFiltersCount={activeFiltersCount - (dateFilter !== 'all' ? 1 : 0)}
            title="Delivery Filters"
          >
            <div className="space-y-6">
              <CompactDeliveryStatusFilter
                value={statusFilter}
                onChange={onStatusFilterChange}
              />
              
              <CompactDeliveryTimeSlotFilter
                value={timeSlotFilter}
                onChange={onTimeSlotFilterChange}
              />
            </div>
          </CollapsibleFilters>
        </div>
      </div>
    </div>
  );
};

export default DeliveryFilter;
