
import { Trip, TripStatus, DriverType } from "@/types";
import { BaseRepository } from "./base.repository";
import { startOfDay, endOfDay } from "date-fns";

export interface TripRepository extends BaseRepository<Trip> {
  getByDate(date: Date): Promise<Trip[]>;
  getByDriverAndDate(driverType: DriverType, date: Date): Promise<Trip[]>;
  addOrderToTrip(tripId: string, orderId: string, sequence?: number): Promise<Trip>;
  removeOrderFromTrip(tripId: string, orderId: string): Promise<Trip>;
  resequenceTrip(tripId: string, sequence: Record<string, number>): Promise<Trip>;
  updateTripStatus(tripId: string, status: TripStatus): Promise<Trip>;
}

export class MockTripRepository implements TripRepository {
  private trips: Trip[] = [];

  constructor(initialData: Trip[] = []) {
    this.trips = initialData;
  }

  async getAll(): Promise<Trip[]> {
    return [...this.trips];
  }

  async getById(id: string): Promise<Trip | undefined> {
    return this.trips.find(trip => trip.id === id);
  }

  async getByDate(date: Date): Promise<Trip[]> {
    const start = startOfDay(date);
    const end = endOfDay(date);
    
    return this.trips.filter(trip => {
      const tripDate = new Date(trip.date);
      return tripDate >= start && tripDate <= end;
    });
  }

  async getByDriverAndDate(driverType: DriverType, date: Date): Promise<Trip[]> {
    const start = startOfDay(date);
    const end = endOfDay(date);
    
    return this.trips.filter(trip => {
      const tripDate = new Date(trip.date);
      return trip.driverType === driverType && tripDate >= start && tripDate <= end;
    });
  }

  async create(trip: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>): Promise<Trip> {
    const now = new Date();
    
    // Generate a trip ID with format: TRIP-MMYY-XXX
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);
    
    // Count existing trips with this prefix
    const prefix = `TRIP-${month}${year}`;
    const existingTrips = this.trips.filter(t => t.id.startsWith(prefix)).length;
    
    // Create sequence number with padding
    const sequence = String(existingTrips + 1).padStart(3, '0');
    const tripId = `${prefix}-${sequence}`;
    
    const newTrip: Trip = {
      ...trip,
      id: tripId,
      createdAt: now,
      updatedAt: now
    };
    
    this.trips.push(newTrip);
    return newTrip;
  }

  async update(id: string, trip: Partial<Trip>): Promise<Trip> {
    const index = this.trips.findIndex(t => t.id === id);
    if (index === -1) throw new Error(`Trip with id ${id} not found`);
    
    this.trips[index] = {
      ...this.trips[index],
      ...trip,
      updatedAt: new Date()
    };
    
    return this.trips[index];
  }

  async delete(id: string): Promise<boolean> {
    const initialLength = this.trips.length;
    this.trips = this.trips.filter(t => t.id !== id);
    return initialLength !== this.trips.length;
  }

  async addOrderToTrip(tripId: string, orderId: string, sequence?: number): Promise<Trip> {
    const trip = await this.getById(tripId);
    if (!trip) throw new Error(`Trip with id ${tripId} not found`);
    
    // Check if order is already in the trip
    if (trip.orderIds.includes(orderId)) {
      // Update sequence if provided
      if (sequence !== undefined) {
        const updatedSequence = { ...trip.sequence, [orderId]: sequence };
        return this.update(tripId, { sequence: updatedSequence });
      }
      return trip;
    }
    
    // Calculate sequence number if not provided
    const nextSequence = sequence ?? Object.keys(trip.sequence).length + 1;
    
    // Update trip with new order and sequence
    const updatedOrderIds = [...trip.orderIds, orderId];
    const updatedSequence = { ...trip.sequence, [orderId]: nextSequence };
    
    return this.update(tripId, {
      orderIds: updatedOrderIds,
      sequence: updatedSequence
    });
  }

  async removeOrderFromTrip(tripId: string, orderId: string): Promise<Trip> {
    const trip = await this.getById(tripId);
    if (!trip) throw new Error(`Trip with id ${tripId} not found`);
    
    // Check if order is in the trip
    if (!trip.orderIds.includes(orderId)) {
      return trip;
    }
    
    // Remove order from orderIds
    const updatedOrderIds = trip.orderIds.filter(id => id !== orderId);
    
    // Remove order from sequence
    const { [orderId]: _, ...updatedSequence } = trip.sequence;
    
    return this.update(tripId, {
      orderIds: updatedOrderIds,
      sequence: updatedSequence
    });
  }

  async resequenceTrip(tripId: string, sequence: Record<string, number>): Promise<Trip> {
    const trip = await this.getById(tripId);
    if (!trip) throw new Error(`Trip with id ${tripId} not found`);
    
    return this.update(tripId, { sequence });
  }

  async updateTripStatus(tripId: string, status: TripStatus): Promise<Trip> {
    const trip = await this.getById(tripId);
    if (!trip) throw new Error(`Trip with id ${tripId} not found`);
    
    return this.update(tripId, { status });
  }
}
