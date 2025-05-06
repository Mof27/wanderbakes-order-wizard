
import React from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import CompactDeliveryDateFilter from "./CompactDeliveryDateFilter";
import CompactDeliveryStatusFilter from "./CompactDeliveryStatusFilter";
import CompactDeliveryTimeSlotFilter from "./CompactDeliveryTimeSlotFilter";

interface MobileFilterDrawerProps {
  dateFilter: 'today' | 'tomorrow' | 'd-plus-2' | 'all';
  statusFilter: 'ready' | 'in-transit' | 'pending-approval' | 'needs-revision' | 'delivery-statuses' | 'all-statuses';
  timeSlotFilter: 'all' | 'late' | 'within-2-hours' | 'slot1' | 'slot2' | 'slot3';
  onDateFilterChange: (value: 'today' | 'tomorrow' | 'd-plus-2' | 'all') => void;
  onStatusFilterChange: (value: 'ready' | 'in-transit' | 'pending-approval' | 'needs-revision' | 'delivery-statuses' | 'all-statuses') => void;
  onTimeSlotFilterChange: (value: 'all' | 'late' | 'within-2-hours' | 'slot1' | 'slot2' | 'slot3') => void;
  activeFiltersCount: number;
}

const MobileFilterDrawer: React.FC<MobileFilterDrawerProps> = ({
  dateFilter,
  statusFilter,
  timeSlotFilter,
  onDateFilterChange,
  onStatusFilterChange,
  onTimeSlotFilterChange,
  activeFiltersCount
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm" className="relative md:hidden">
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Delivery Filters</DrawerTitle>
          <DrawerDescription>
            Filter your delivery orders by date, status, and time slot
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 py-2 space-y-6">
          <CompactDeliveryDateFilter 
            value={dateFilter}
            onChange={onDateFilterChange}
          />
          
          <CompactDeliveryStatusFilter
            value={statusFilter}
            onChange={onStatusFilterChange}
          />
          
          <CompactDeliveryTimeSlotFilter
            value={timeSlotFilter}
            onChange={onTimeSlotFilterChange}
          />
        </div>
        <DrawerFooter>
          <Button 
            variant="secondary" 
            onClick={() => {
              onDateFilterChange('all');
              onStatusFilterChange('all-statuses');
              onTimeSlotFilterChange('all');
            }}
          >
            Reset Filters
          </Button>
          <DrawerClose asChild>
            <Button>Apply Filters</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileFilterDrawer;
