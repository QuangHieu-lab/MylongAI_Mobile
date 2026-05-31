import { useState, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { CurrentWeather, WeatherData } from '../types/weather';
import { WeatherService } from '../services/weather';
import { LOCATION } from '../constants/weather'; // 👈 Import tọa độ mặc định

// 🚀 Cho phép truyền lat, lon vào Hook (Mặc định sẽ lấy tọa độ xưởng chính)
export function useWeather(lat: number = LOCATION.LAT, lon: number = LOCATION.LON) {
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
  const [forecastData, setForecastData] = useState<WeatherData[]>([]);
  
  // 🚀 Thêm state để hứng lời khuyên AI và cảm biến từ API mới
  const [advice, setAdvice] = useState<string[]>([]);
  const [sensorData, setSensorData] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const appState = useRef(AppState.currentState);

  const loadWeather = async () => {
    try {
      setLoading(true);
      
      // 🚀 Truyền tọa độ vào service
      const data = await WeatherService.fetchForecast(lat, lon);
      
      setCurrentWeather(data.currentParams);
      setForecastData(data.forecastList);
      setAdvice(data.advice);         // Cập nhật lời khuyên
      setSensorData(data.sensorData); // Cập nhật dữ liệu cảm biến
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
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        loadWeather();
      }
      appState.current = nextAppState;
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [lat, lon]); // 👈 Thêm dependency để API tự gọi lại nếu tọa độ thay đổi

  // 🚀 Xuất thêm advice, sensorData và hàm refetch để các màn hình khác dùng
  return { currentWeather, forecastData, advice, sensorData, loading, error, refetch: loadWeather };
}