
import { Order } from "@/types";
import { format, addDays, isAfter, startOfDay, differenceInHours } from "date-fns";

// Helper function to determine the time slot background color
export const getTimeSlotColor = (timeSlot?: string): string => {
  if (!timeSlot) return "";
  
  if (timeSlot === "slot1") {
    return "bg-purple-50 hover:bg-purple-100";
  } else if (timeSlot === "slot2") {
    return "bg-blue-50 hover:bg-blue-100";
  } else if (timeSlot === "slot3") {
    return "bg-indigo-50 hover:bg-indigo-100";
  }
  
  // For custom time slots, check the time range
  const timeMatch = timeSlot.match(/(\d{1,2})[:.]\d{2}/);
  if (timeMatch) {
    const hour = parseInt(timeMatch[1], 10);
    
    if (hour < 10) {
      return "bg-purple-50 hover:bg-purple-100"; // Morning (like slot1)
    } else if (hour < 15) {
      return "bg-blue-50 hover:bg-blue-100"; // Afternoon (like slot2)
    } else {
      return "bg-indigo-50 hover:bg-indigo-100"; // Evening (like slot3)
    }
  }
  
  return "";
};

// Helper function to format time slot display
export const formatTimeSlotDisplay = (timeSlot?: string): string => {
  if (!timeSlot) return "-";
  
  if (timeSlot === "slot1") {
    return "10:00 - 13:00";
  } else if (timeSlot === "slot2") {
    return "13:00 - 16:00";
  } else if (timeSlot === "slot3") {
    return "16:00 - 20:00";
  }
  
  // It's a custom time slot, return as is
  return timeSlot;
};

// Helper to determine if an order is late or within 2 hours of delivery
export const getOrderTimeStatus = (order: Order): 'late' | 'within-2-hours' | null => {
  // Get current time
  const now = new Date();
  const deliveryDate = new Date(order.deliveryDate);
  
  // Early return if it's a future date (not today)
  if (isAfter(startOfDay(deliveryDate), startOfDay(now))) {
    return null;
  }
  
  // Parse the time slot to get the end time
  let endTimeHour: number = 20; // Default to end of day (8pm)
  
  if (order.deliveryTimeSlot === 'slot1') {
    endTimeHour = 13; // 1pm
  } else if (order.deliveryTimeSlot === 'slot2') {
    endTimeHour = 16; // 4pm
  } else if (order.deliveryTimeSlot === 'slot3') {
    endTimeHour = 20; // 8pm
  } else if (order.deliveryTimeSlot) {
    // Try to parse custom time slot
    const timeMatch = order.deliveryTimeSlot.match(/(\d{1,2})[:.]\d{2}/);
    if (timeMatch) {
      endTimeHour = parseInt(timeMatch[1], 10) + 1; // Assuming 1 hour window
    }
  }
  
  // Set end time to specified hour on delivery date
  const endTime = new Date(deliveryDate);
  endTime.setHours(endTimeHour, 0, 0, 0);
  
  // If current time is after end time, it's late
  if (isAfter(now, endTime)) {
    return 'late';
  }
  
  // If within 2 hours of end time
  if (differenceInHours(endTime, now) <= 2) {
    return 'within-2-hours';
  }
  
  return null;
};

// Get date titles for filter display
export const getDateTitles = () => {
  return {
    'today': `Today (${format(new Date(), 'dd MMM')})`,
    'tomorrow': `Tomorrow (${format(addDays(new Date(), 1), 'dd MMM')})`,
    'd-plus-2': `${format(addDays(new Date(), 2), 'dd MMM')}`,
    'all': 'All Delivery Dates'
  };
};

// Define status priority (lower number = higher priority)
export const getStatusPriority = (status: string): number => {
  switch(status) {
    case 'pending-approval': return 1; // New highest priority
    case 'needs-revision': return 2;   // New high priority
    case 'ready-to-deliver': return 3;
    case 'in-delivery': return 4;
    case 'waiting-photo': return 5;
    case 'in-kitchen': return 6;
    case 'in-queue': return 7;
    case 'incomplete': return 8;
    default: return 10;
  }
};
