// src/types/weather.ts

// ==========================================
// 1. KIỂU DỮ LIỆU DÀNH CHO FRONTEND UI
// ==========================================

// Dữ liệu theo giờ (Giữ nguyên để dự phòng cho biểu đồ sau này)
export interface WeatherData {
  id: string;
  time: string;
  hour: number;
  temperature: number;
  humidity: number;
  rainChance: number;
  windSpeed: number;
  risk: 'low' | 'medium' | 'high';
}

// Dữ liệu hiện tại (🚀 Đã cập nhật thêm các trường từ Backend)
export interface CurrentWeather {
  temperature: number;
  humidity: number;
  windSpeed: number;
  rainChance: number;
  condition: string;
  icon: string;
  // Các trường mới:
  pressure: number;
  maxPrecip12h: number;
  isRaining: boolean;
}

// ==========================================
// 2. KIỂU DỮ LIỆU GỐC TỪ BACKEND API
// ==========================================

export interface SensorData {
  temperature_c: number;
  humidity_percent: number;
  has_rice_paper: boolean;
  vision_confidence: number;
  source: string;
}

export interface BackendWeatherResponse {
  timestamp: string;
  location: {
    lat: number;
    lon: number;
  };
  api_weather: {
    temperature_c: number;
    humidity_percent: number;
    pressure_hpa: number;
    wind_speed_ms: number;
    precipitation_mm: number;
    weather_code: number;
  };
  sensor_data: SensorData | null;
  prediction: {
    rain_score: number;
    rain_level: 'low' | 'medium' | 'high';
    rain_label: string;
    max_precip_probability_12h: number;
    currently_raining: boolean;
  };
  advice: string[];
  record_id: number;
}