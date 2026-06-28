import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { CurrentWeather, WeatherData, SensorData } from '../types/weather';
// 🚀 Chú ý đường dẫn import khớp với tên file service
import { WeatherService } from '../services/weather'; 
import { LOCATION } from '../constants/weather'; 

export function useWeather(lat: number = LOCATION.LAT, lon: number = LOCATION.LON) {
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
  const [forecastData, setForecastData] = useState<WeatherData[]>([]);
  
  const [advice, setAdvice] = useState<string[]>([]);
  const [sensorData, setSensorData] = useState<SensorData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const appState = useRef(AppState.currentState);

  // 🚀 Tối ưu hiệu suất với useCallback
  const loadWeather = useCallback(async () => {
    try {
      setLoading(true);
      
      const data = await WeatherService.fetchForecast(lat, lon);
      
      setCurrentWeather(data.currentParams);
      setForecastData(data.forecastList);
      setAdvice(data.advice);         
      setSensorData(data.sensorData); 
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải thời tiết');
    } finally {
      setLoading(false);
    }
  }, [lat, lon]); // Chỉ tạo lại hàm nếu tọa độ thay đổi

  useEffect(() => {
    loadWeather();
    
    // Auto refresh mỗi 10 phút
    const interval = setInterval(loadWeather, 10 * 60 * 1000); 

    // Auto refresh khi người dùng mở lại App từ chế độ nền
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        loadWeather();
      }
      appState.current = nextAppState;
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [loadWeather]); // 👈 Đưa loadWeather vào dependency array

  return { currentWeather, forecastData, advice, sensorData, loading, error, refetch: loadWeather };
}