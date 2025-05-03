
import { ActivityLog, ActivityAction, ActivityEntityType } from "@/types";
import { BaseRepository } from "./base.repository";

export interface LogRepository extends BaseRepository<ActivityLog> {
  getByEntityId(entityId: string): Promise<ActivityLog[]>;
  getByAction(action: ActivityAction): Promise<ActivityLog[]>;
  getByEntityType(entityType: ActivityEntityType): Promise<ActivityLog[]>;
  getByDateRange(startDate: Date, endDate: Date): Promise<ActivityLog[]>;
}

export class MockLogRepository implements LogRepository {
  private logs: ActivityLog[] = [];

  constructor(initialData: ActivityLog[] = []) {
    this.logs = initialData;
  }

  async getAll(): Promise<ActivityLog[]> {
    // Return logs sorted by timestamp (newest first)
    return [...this.logs].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async getById(id: string): Promise<ActivityLog | undefined> {
    return this.logs.find(log => log.id === id);
  }

  async create(log: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<ActivityLog> {
    const now = new Date();
    const newLog = {
      ...log,
      id: `log_${this.logs.length + 1}_${now.getTime()}`,
      timestamp: now,
    };
    
    this.logs.push(newLog);
    return newLog;
  }

  async update(id: string, log: Partial<ActivityLog>): Promise<ActivityLog> {
    const index = this.logs.findIndex(l => l.id === id);
    if (index === -1) throw new Error(`Log with id ${id} not found`);
    
    this.logs[index] = {
      ...this.logs[index],
      ...log,
    };
    
    return this.logs[index];
  }

  async delete(id: string): Promise<boolean> {
    const initialLength = this.logs.length;
    this.logs = this.logs.filter(l => l.id !== id);
    return initialLength !== this.logs.length;
  }

  async getByEntityId(entityId: string): Promise<ActivityLog[]> {
    return this.logs.filter(log => log.entityId === entityId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async getByAction(action: ActivityAction): Promise<ActivityLog[]> {
    return this.logs.filter(log => log.action === action)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async getByEntityType(entityType: ActivityEntityType): Promise<ActivityLog[]> {
    return this.logs.filter(log => log.entityType === entityType)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<ActivityLog[]> {
    return this.logs.filter(log => {
      const timestamp = new Date(log.timestamp);
      return timestamp >= startDate && timestamp <= endDate;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}
