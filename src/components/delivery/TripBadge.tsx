
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Car } from "lucide-react";
import { DeliveryTrip } from "@/types/trip";

interface TripBadgeProps {
  trip: DeliveryTrip;
  compact?: boolean;
}

const TripBadge: React.FC<TripBadgeProps> = ({ trip, compact = false }) => {
  const driverLabel = trip.driverName || (trip.driverId === 'driver-1' ? 'Driver #1' : 'Driver #2');
  
  return (
    <Badge 
      variant="outline" 
      className={`
        ${compact ? 'text-xs px-1.5 py-0' : 'text-sm'} 
        bg-blue-50 
        text-blue-700 
        border-blue-200 
        flex 
        items-center 
        gap-1
      `}
    >
      <Car className={compact ? 'h-2.5 w-2.5' : 'h-3 w-3'} />
      <span>
        {compact 
          ? `Trip ${trip.tripNumber}` 
          : `${driverLabel} Trip ${trip.tripNumber}`
        }
      </span>
    </Badge>
  );
};

export default TripBadge;
