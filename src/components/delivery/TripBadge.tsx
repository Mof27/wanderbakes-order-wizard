
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Car, X } from "lucide-react";
import { DeliveryTrip } from "@/types/trip";
import { cn } from "@/lib/utils";

interface TripBadgeProps {
  trip: DeliveryTrip;
  compact?: boolean;
  size?: 'compact' | 'medium' | 'full';
  onRemoveOrder?: (tripId: string, orderId?: string) => void;
  orderId?: string;
}

const TripBadge: React.FC<TripBadgeProps> = ({ 
  trip, 
  compact = false, 
  size = 'full',
  onRemoveOrder,
  orderId
}) => {
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

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    if (onRemoveOrder && trip.id) {
      onRemoveOrder(trip.id, orderId);
    }
  };
  
  return (
    <Badge 
      variant="outline" 
      className={cn(`
        ${className} 
        bg-blue-50 
        text-blue-700 
        border-blue-200 
        flex 
        items-center 
        gap-1
        group
        relative
      `)}
    >
      <Car className={iconSize} />
      <span>{content}</span>
      
      {onRemoveOrder && (
        <button
          type="button"
          onClick={handleRemoveClick}
          className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 inline-flex items-center justify-center rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200"
          aria-label="Remove from trip"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </Badge>
  );
};

export default TripBadge;
