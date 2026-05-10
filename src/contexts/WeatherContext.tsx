import React, { createContext, useContext, ReactNode } from 'react';
import { useWeather } from '../hooks/useWeather';
import { CurrentWeather, WeatherData } from '../types/weather';

interface WeatherContextType {
  currentWeather: CurrentWeather | null;
  forecastData: WeatherData[];
  loading: boolean;
  error: string | null;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export const WeatherProvider = ({ children }: { children: ReactNode }) => {
  const weatherState = useWeather();
  return <WeatherContext.Provider value={weatherState}>{children}</WeatherContext.Provider>;
};

export const useGlobalWeather = () => {
  const context = useContext(WeatherContext);
  if (context === undefined) throw new Error('useGlobalWeather phải được bọc trong WeatherProvider');
  return context;
};