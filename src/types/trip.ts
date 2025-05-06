
import { DriverType, Order } from "./index";

export interface DeliveryTrip {
  id: string;
  driverId: DriverType;
  driverName?: string;
  tripDate: Date;
  tripNumber: number; // e.g., Trip 1, Trip 2 for the day
  departureTime?: Date;
  name?: string; // Optional descriptive name
  status: 'planned' | 'in-progress' | 'completed';
  orderIds: string[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface OrderSelectionState {
  selectedOrderIds: string[];
  isSelectionMode: boolean;
}
