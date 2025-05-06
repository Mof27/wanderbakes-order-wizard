
import { DeliveryTrip } from "@/types/trip";
import { BaseRepository } from "./base.repository";

export interface TripRepository extends BaseRepository<DeliveryTrip> {
  getByDate(date: Date): Promise<DeliveryTrip[]>;
  getByDriver(driverId: string): Promise<DeliveryTrip[]>;
  getByOrderId(orderId: string): Promise<DeliveryTrip | undefined>;
}

export class MockTripRepository implements TripRepository {
  private trips: DeliveryTrip[] = [];

  constructor(initialData: DeliveryTrip[] = []) {
    this.trips = initialData;
  }

  async getAll(): Promise<DeliveryTrip[]> {
    return [...this.trips];
  }

  async getById(id: string): Promise<DeliveryTrip | undefined> {
    return this.trips.find(trip => trip.id === id);
  }

  async create(trip: Omit<DeliveryTrip, 'id' | 'createdAt'>): Promise<DeliveryTrip> {
    const now = new Date();
    const tripId = `trip_${now.getTime()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const newTrip: DeliveryTrip = {
      ...trip,
      id: tripId,
      createdAt: now,
      updatedAt: now
    };
    
    this.trips.push(newTrip);
    return newTrip;
  }

  async update(id: string, trip: Partial<DeliveryTrip>): Promise<DeliveryTrip> {
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

  async getByDate(date: Date): Promise<DeliveryTrip[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return this.trips.filter(trip => {
      const tripDate = new Date(trip.tripDate);
      return tripDate >= startOfDay && tripDate <= endOfDay;
    });
  }

  async getByDriver(driverId: string): Promise<DeliveryTrip[]> {
    return this.trips.filter(trip => trip.driverId === driverId);
  }

  async getByOrderId(orderId: string): Promise<DeliveryTrip | undefined> {
    return this.trips.find(trip => trip.orderIds.includes(orderId));
  }
}
