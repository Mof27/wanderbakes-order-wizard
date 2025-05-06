
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Car } from "lucide-react";
import { DeliveryTrip } from "@/types/trip";

interface TripBadgeProps {
  trip: DeliveryTrip;
  compact?: boolean;
  size?: 'compact' | 'medium' | 'full';
}

const TripBadge: React.FC<TripBadgeProps> = ({ trip, compact = false, size = 'full' }) => {
  const driverLabel = trip.driverName || (trip.driverId === 'driver-1' ? 'Driver #1' : 'Driver #2');
  
  // Handle size-based rendering
  let content;
  let className;
  let iconSize;
  
  if (compact || size === 'compact') {
    content = `Trip ${trip.tripNumber}`;
    className = 'text-xs px-1.5 py-0';
    iconSize = 'h-2.5 w-2.5';
  } else if (size === 'medium') {
    // Show full driver label with trip number for medium size
    content = `${driverLabel} - T${trip.tripNumber}`;
    className = 'text-xs px-2 py-0.5 whitespace-nowrap';
    iconSize = 'h-3 w-3';
  } else {
    content = `${driverLabel} Trip ${trip.tripNumber}`;
    className = 'text-sm';
    iconSize = 'h-3 w-3';
  }
  
  return (
    <Badge 
      variant="outline" 
      className={`
        ${className} 
        bg-blue-50 
        text-blue-700 
        border-blue-200 
        flex 
        items-center 
        gap-1
      `}
    >
      <Car className={iconSize} />
      <span>{content}</span>
    </Badge>
  );
};

export default TripBadge;
