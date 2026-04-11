import { SimulationState } from '../types/demo';

export const INITIAL_SIMULATION_STATE: SimulationState = {
  dryingProgress: 0,
  timeElapsed: 0,
  estimatedTimeRemaining: 360,
  temperature: 32,
  humidity: 45,
  windSpeed: 12,
  riskLevel: 'low',
  riskMessage: 'Điều kiện tốt để phơi bánh',
  recommendation: 'Tiếp tục phơi. Dự kiến hoàn thành sau 6 giờ.'
};