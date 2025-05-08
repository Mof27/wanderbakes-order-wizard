
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
  status: 'pending' | 'in-progress' | 'completed';
  orderIds?: string[]; // Optional as it's hidden from bakers
  qualityChecks?: QualityCheck;
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
}

export type BakerPageTab = 'tasks' | 'inventory' | 'log';
export type TaskFilter = 'all' | 'pending' | 'in-progress' | 'completed';
