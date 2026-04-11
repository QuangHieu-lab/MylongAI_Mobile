import { RiskLevel } from '../types/demo';

export const getRiskStyle = (level: RiskLevel) => {
  switch (level) {
    case 'low':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'medium':
      return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    case 'high':
      return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
    case 'complete':
      return { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' };
    default:
      return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
  }
};

export const getRiskLabel = (level: RiskLevel) => {
  switch (level) {
    case 'low': return 'Rủi ro thấp';
    case 'medium': return 'Cần chú ý';
    case 'high': return 'Rủi ro cao';
    case 'complete': return 'Hoàn thành';
    default: return 'Không xác định';
  }
};

export const formatTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}p` : `${mins}p`;
};