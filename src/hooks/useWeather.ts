import { useState, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { CurrentWeather, WeatherData } from '../types/weather';
import { WeatherService } from '../services/weather';

export function useWeather() {
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
  const [forecastData, setForecastData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const appState = useRef(AppState.currentState);

  const loadWeather = async () => {
    try {
      setLoading(true);
      const data = await WeatherService.fetchForecast();
      setCurrentWeather(data.currentParams);
      setForecastData(data.forecastList);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải thời tiết');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeather();
    const interval = setInterval(loadWeather, 10 * 60 * 1000); // 10 phút / lần

    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      // Mở app lên là load lại ngay
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') loadWeather();
      appState.current = nextAppState;
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, []);

  return { currentWeather, forecastData, loading, error };
}