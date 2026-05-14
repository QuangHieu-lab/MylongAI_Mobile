import { useState, useEffect } from 'react';
import { SimulationState, RiskLevel } from '../types/demo';
import { INITIAL_SIMULATION_STATE } from '../constants/demo';

export const useSimulation = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [simulation, setSimulation] = useState<SimulationState>(INITIAL_SIMULATION_STATE);
  
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSimulation((prev) => {
        const newProgress = Math.min(prev.dryingProgress + 1, 100);
        const newTimeElapsed = prev.timeElapsed + 6; 
        const newTimeRemaining = Math.max(0, 360 - newTimeElapsed);

        let newTemperature = prev.temperature;
        let newHumidity = prev.humidity;
        let newWindSpeed = prev.windSpeed;
        let newRiskLevel: RiskLevel = 'low';
        let newRiskMessage = '';
        let newRecommendation = '';

        if (newProgress <= 30) {
          newTemperature = 32 + Math.random() * 2;
          newHumidity = 45 + Math.random() * 3;
          newWindSpeed = 12 + Math.random() * 2;
          newRiskLevel = 'low';
          newRiskMessage = 'Điều kiện tốt để phơi bánh';
          newRecommendation = 'Tiếp tục phơi an toàn. Không có rủi ro.';
        } else if (newProgress <= 60) {
          newTemperature = 31 + Math.random() * 2;
          newHumidity = 50 + (newProgress - 30) * 0.5;
          newWindSpeed = 10 + Math.random() * 3;
          newRiskLevel = 'medium';
          newRiskMessage = 'Độ ẩm đang tăng dần';
          newRecommendation = 'Theo dõi sát sao. Dự kiến hoàn thành trong 2-3 giờ.';
        } else if (newProgress <= 89) {
          newTemperature = 30 + Math.random() * 1.5;
          newHumidity = 65 + (newProgress - 60) * 0.8;
          newWindSpeed = 8 + Math.random() * 4;
          newRiskLevel = 'high';
          newRiskMessage = 'Cảnh báo: Nguy cơ mưa cao 70%';
          newRecommendation = 'Khẩn cấp: Thu bánh trong 30 phút hoặc che chắn ngay!';
        } else {
          newTemperature = 29 + Math.random() * 2;
          newHumidity = 75 + Math.random() * 5;
          newWindSpeed = 6 + Math.random() * 3;
          newRiskLevel = 'complete';
          newRiskMessage = 'Batch đã hoàn thành';
          newRecommendation = 'Thu hoạch ngay để đảm bảo chất lượng tốt nhất!';
        }

        if (newProgress >= 100) {
          setIsRunning(false);
        }

        return {
          dryingProgress: newProgress,
          timeElapsed: newTimeElapsed,
          estimatedTimeRemaining: newTimeRemaining,
          temperature: parseFloat(newTemperature.toFixed(1)),
          humidity: parseFloat(newHumidity.toFixed(1)),
          windSpeed: parseFloat(newWindSpeed.toFixed(1)),
          riskLevel: newRiskLevel,
          riskMessage: newRiskMessage,
          recommendation: newRecommendation
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setSimulation(INITIAL_SIMULATION_STATE);
  };

  return {
    isRunning,
    simulation,
    handleStart,
    handlePause,
    handleReset
  };
};