// src/types/weather.ts

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

export interface CurrentWeather {
  temperature: number;
  humidity: number;
  rainChance: number;
  windSpeed: number;
  condition: string;
  icon: string;
}