export type RiskLevel = 'low' | 'medium' | 'high' | 'complete';

export interface SimulationState {
  dryingProgress: number;
  timeElapsed: number;
  estimatedTimeRemaining: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  riskLevel: RiskLevel;
  riskMessage: string;
  recommendation: string;
}