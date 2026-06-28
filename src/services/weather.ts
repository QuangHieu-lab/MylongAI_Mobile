import { CurrentWeather, WeatherData } from '../types/weather';
import { TTS_CONFIG } from '../constants/weather';
import { apiClient } from './api'; // 🚀 IMPORT API CLIENT ĐÃ CẤU HÌNH

export const WeatherService = {
  fetchForecast: async (lat: number, lon: number) => {
    try {
      // 🚀 Dùng apiClient (Axios) thay vì fetch chay để an toàn và ổn định hơn trên Mobile
      const res = await apiClient.get('/weather/analyze', {
        params: {
          lat: lat,
          lon: lon,
          save: true
        }
      });
      
      // Axios tự động parse JSON nên ta lấy thẳng từ res.data
      const data = res.data;

      // =======================================================
      // BÓC TÁCH DỮ LIỆU ĐÚNG CHUẨN BACKEND MỚI
      // =======================================================
      
      // 1. Xác định icon dựa trên mức độ mưa
      let icon = 'sun';
      if (data.prediction?.currently_raining || data.prediction?.rain_level === 'high') {
        icon = 'cloudrain';
      } else if (data.prediction?.rain_level === 'medium') {
        icon = 'cloud';
      }

      // 2. Map dữ liệu vào cấu trúc CurrentWeather
      const currentParams: CurrentWeather = {
        temperature: data.api_weather?.temperature_c || 0,
        humidity: data.api_weather?.humidity_percent || 0,
        rainChance: data.prediction?.rain_score || 0, 
        windSpeed: data.api_weather?.wind_speed_ms || 0,
        condition: data.prediction?.rain_label || "Đang cập nhật",
    precipitation_mm: data.api_weather?.precipitation_mm || 0,
        icon: icon,
        pressure: data.api_weather?.pressure_hpa || 0,
        maxPrecip12h: data.prediction?.max_precip_probability_12h || 0,
        isRaining: data.prediction?.currently_raining || false,
        rainLevel: data.prediction?.rain_level || 'low',
        advice: data.advice || [],
      };

      // 3. Mảng rỗng cho dự báo theo giờ
      const forecastList: WeatherData[] = [];
      
      return { 
        currentParams, 
        forecastList, 
        advice: data.advice || [], 
        sensorData: data.sensor_data 
      };

    } catch (error: any) {
      // Báo lỗi chi tiết hơn nhờ Axios
      console.error(" Lỗi API Weather:", error.response?.data || error.message);
      throw error;
    }
  },

  // 🚀 HÀM GỌI API GIỌNG NÓI FPT (GIỮ NGUYÊN HOÀN TOÀN VÌ ĐÂY LÀ BÊN THỨ 3)
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