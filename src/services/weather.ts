import { CurrentWeather, WeatherData } from '../types/weather';
import { TTS_CONFIG } from '../constants/weather';

// 🚀 Đọc Base URL từ file .env
const BASE_URL = process.env.EXPO_PUBLIC_WEATHER_BASE_URL || 'https://mylongaiv2.onrender.com';

export const WeatherService = {
  // 🚀 Hàm giờ đây nhận lat, lon động từ các màn hình truyền vào
  fetchForecast: async (lat: number, lon: number) => {
    try {
      const url = `${BASE_URL}/weather/analyze?lat=${lat}&lon=${lon}&save=true`;
      
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) throw new Error(`Lỗi từ Backend: ${res.status}`);
      
      // Data này là cục JSON chính xác mà bạn đã cung cấp
      const data = await res.json();

      // =======================================================
      // BÓC TÁCH DỮ LIỆU ĐÚNG CHUẨN BACKEND MỚI
      // =======================================================
      
      // 1. Xác định icon dựa trên mức độ mưa (rain_level) từ Backend
      let icon = 'sun';
      if (data.prediction?.currently_raining || data.prediction?.rain_level === 'high') {
        icon = 'cloudrain';
      } else if (data.prediction?.rain_level === 'medium') {
        icon = 'cloud';
      }

      // 2. Map dữ liệu vào cấu trúc CurrentWeather mà giao diện đang cần
      const currentParams: CurrentWeather = {
        temperature: data.api_weather?.temperature_c || 0,
        humidity: data.api_weather?.humidity_percent || 0,
        rainChance: data.prediction?.rain_score || 0, 
        windSpeed: data.api_weather?.wind_speed_ms || 0,
        condition: data.prediction?.rain_label || "Đang cập nhật",
        icon: icon,
        // 🚀 BỔ SUNG 3 TRƯỜNG MỚI ĐỂ KHỚP VỚI TYPES VÀ UI MỚI
        pressure: data.api_weather?.pressure_hpa || 0,
        maxPrecip12h: data.prediction?.max_precip_probability_12h || 0,
        isRaining: data.prediction?.currently_raining || false,
      };

      // 3. Xử lý danh sách dự báo
      // Vì API mới KHÔNG trả về dự báo theo giờ (hourly), ta trả về mảng rỗng
      // Điều này giúp giao diện không bị crash khi cố gắng render danh sách.
      const forecastList: WeatherData[] = [];
      
      return { 
        currentParams, 
        forecastList, 
        // Trả thêm advice và sensorData để dùng trên UI nếu cần
        advice: data.advice || [], 
        sensorData: data.sensor_data 
      };

    } catch (error) {
      console.error("Lỗi API Weather:", error);
      throw error;
    }
  },

  // 🚀 HÀM GỌI API GIỌNG NÓI FPT (GIỮ NGUYÊN HOÀN TOÀN)
  fetchTTSAudioUrl: async (text: string) => {
    const res = await fetch(TTS_CONFIG.PROXY_URL, {
      method: 'POST',
      headers: { 'api-key': TTS_CONFIG.API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: text, voice: TTS_CONFIG.VOICE, speed: '', id: '1' }),
    });
    const raw = await res.text();
    if (!raw || !raw.trim()) throw new Error(`Lỗi Server FPT: ${res.status}`);
    
    const json = JSON.parse(raw);
    if (json.error !== 0) throw new Error(json.message);
    
    await new Promise(r => setTimeout(r, 2000)); // Chờ FPT render Audio
    return json.async;
  }
};