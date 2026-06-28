import React, { createContext, useContext, ReactNode } from 'react';
import { useWeather } from '../hooks/useWeather';
// 🚀 Thêm SensorData vào phần import
import { CurrentWeather, WeatherData, SensorData } from '../types/weather';

interface WeatherContextType {
  currentWeather: CurrentWeather | null;
  forecastData: WeatherData[];
  // 🚀 Bổ sung 3 trường mới cho khớp với Hook useWeather
  advice: string[];
  sensorData: SensorData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>; // Hàm để các màn hình khác có thể chủ động vuốt để làm mới
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export const WeatherProvider = ({ children }: { children: ReactNode }) => {
  const weatherState = useWeather();
  return <WeatherContext.Provider value={weatherState}>{children}</WeatherContext.Provider>;
};

export const useGlobalWeather = () => {
  const context = useContext(WeatherContext);
  if (context === undefined) {
    throw new Error('useGlobalWeather phải được bọc trong WeatherProvider');
  }
  return context;
};