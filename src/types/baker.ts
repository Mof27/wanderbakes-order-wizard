
export interface QualityCheck {
  properlyBaked: boolean;
  correctSize: boolean;
  goodTexture: boolean;
  notes?: string;
}

export interface BakingTask {
  id: string;
  cakeShape: string;
  cakeSize: string;
  cakeFlavor: string;
  quantity: number;
  quantityCompleted: number;
  height?: string;
  dueDate: Date;
  createdAt: Date;
  updatedAt?: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  orderIds?: string[]; // Optional as it's hidden from bakers
  qualityChecks?: QualityCheck;
  cancellationReason?: string; // Added to track why a task was cancelled
}

export interface CakeInventoryItem {
  id: string;
  cakeShape: string;
  cakeSize: string;
  cakeFlavor: string;
  height?: string;
  quantity: number;
  lastUpdated: Date;
}

export interface ProductionLogEntry {
  id: string;
  cakeShape: string;
  cakeSize: string;
  cakeFlavor: string;
  quantity: number;
  completedAt: Date;
  baker?: string;
  qualityChecks?: QualityCheck;
  notes?: string;
  taskId: string;
  cancelled?: boolean; // Added to track cancelled tasks
  cancellationReason?: string; // Added to track why a task was cancelled
}

export type BakerPageTab = 'tasks' | 'inventory' | 'log';
export type TaskFilter = 'all' | 'pending' | 'in-progress' | 'completed' | 'cancelled';
