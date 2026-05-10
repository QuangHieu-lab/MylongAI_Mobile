export interface DashboardStats {
  totalBatches: { value: number; trend: number; isPositive: boolean; };
  qualityRate: { value: number; trend: number; isPositive: boolean; };
  activeProcesses: { count: number; avgTimeMins: number; };
  cameraStatus: { online: number; total: number; };
}