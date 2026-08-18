export type StepStatus = 'completed' | 'in-progress' | 'pending';

export interface RouteStep {
  id: string;
  name: string;
  icon: string;
  status: StepStatus;
  notes?: string;
  completedAt?: string;
}

export interface MaterialItem {
  id: string;
  name: string;
  orderedQty: number;
  usedQty: number;
  unit?: string;
}

export interface ProductionBatch {
  id: string;
  batchName: string; // e.g. "Batch 1 (Parsial)", "Batch 2 (Sisa Order)"
  targetQty: number; // e.g. 7500 pcs
  completedQty: number; // e.g. 7500 pcs
  status: 'completed' | 'in-progress' | 'pending';
  steps: RouteStep[];
  createdAt: string;
  completedAt?: string;
  notes?: string;
}

export interface JobSPK {
  id: string;
  title: string;
  customer?: string;
  material: string;
  print: string;
  lamination: string;
  size: string;
  status: string; // 'Active Jobs', 'Selesai', etc.
  activePacking: string;
  targetQty: number;
  completedQty: number;
  packedQty: number;
  shippedQty: number;
  materials: MaterialItem[];
  steps: RouteStep[]; // Default/Active batch steps
  batches?: ProductionBatch[]; // Multi-batch / partial route tracking
  activeBatchId?: string; // Currently active batch ID in stepper
  packingOptions: string[];
  createdAt: string;
  dueDate?: string;
  notes?: string;
}

export interface MasterStepOption {
  name: string;
  icon: string;
  category?: string;
}

export type RoutePresetsMap = Record<string, Omit<RouteStep, 'id'>[]>;

export type ActiveTab = 'jobs' | 'laporan' | 'pengaturan';

export type UserRole = 'moderator' | 'spectator';

export interface DeviceSession {
  id: string; // Unique Device Session ID
  deviceName: string; // e.g. "iPhone 14 (Safari)", "PC Windows 11 (Chrome)"
  userLabel: string; // e.g. "Budi (Operator Finishing)", "Admin Kantor"
  assignedRole: UserRole; // 'moderator' | 'spectator'
  lastActive: string; // ISO Timestamp
  firstLogin: string; // ISO Timestamp
  platform: string; // OS/Browser detail
  status: 'online' | 'offline';
  ipHint?: string;
}

export type SyncState = 'synced' | 'syncing' | 'offline_saved' | 'error';

export interface SyncDetails {
  state: SyncState;
  isOnline: boolean;
  fromCache: boolean;
  hasPendingWrites: boolean;
  lastSyncedAt: Date | null;
  lastActionText?: string;
  totalSavedJobs: number;
}

export interface SyncToast {
  id: string;
  type: 'synced' | 'syncing' | 'offline_saved' | 'error';
  title: string;
  description: string;
  timestamp: number;
}
