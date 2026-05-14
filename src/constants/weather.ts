// src/constants/weather.ts

// Tọa độ xưởng phơi bánh (Bến Tre)
export const LOCATION = {
  LAT: 10.2433,
  LON: 106.3756,
};

// Cấu hình API Giọng nói FPT
export const TTS_CONFIG = {
  PROXY_URL: 'https://green-credit-b40e.karlpro812005.workers.dev',
  API_KEY: process.env.EXPO_PUBLIC_FPT_API_KEY || '', 
  VOICE: 'lannhi',
};