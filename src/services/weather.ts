import { CurrentWeather, WeatherData } from '../types/weather';
import { LOCATION, TTS_CONFIG } from '../constants/weather';

const getRisk = (rainChance: number, humidity: number): 'low' | 'medium' | 'high' => {
  if (rainChance > 60) return 'high';
  if (rainChance > 30 || humidity > 70) return 'medium';
  return 'low';
};

const getCondition = (rainChance: number, cloudCover: number) => {
  if (rainChance > 60) return { condition: 'Có mưa', icon: 'cloudrain' };
  if (rainChance > 30) return { condition: 'Có mây, khả năng mưa', icon: 'cloud' };
  if (cloudCover > 50) return { condition: 'Nhiều mây', icon: 'cloud' };
  return { condition: 'Nắng ráo', icon: 'sun' };
};

export const WeatherService = {
  fetchForecast: async () => {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${LOCATION.LAT}&longitude=${LOCATION.LON}&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,wind_speed_10m,cloud_cover&current=temperature_2m,relative_humidity_2m,precipitation_probability,wind_speed_10m,cloud_cover&timezone=Asia%2FBangkok&forecast_days=1`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Không thể tải dữ liệu thời tiết');
    const data = await res.json();

    const cur = data.current;
    const { condition, icon } = getCondition(cur.precipitation_probability ?? 0, cur.cloud_cover ?? 0);

    const currentParams: CurrentWeather = {
      temperature: cur.temperature_2m,
      humidity: cur.relative_humidity_2m,
      rainChance: cur.precipitation_probability ?? 0,
      windSpeed: cur.wind_speed_10m,
      condition, icon,
    };

    const now = new Date();
    const times: string[] = data.hourly.time;
    const temps: number[] = data.hourly.temperature_2m;
    const humids: number[] = data.hourly.relative_humidity_2m;
    const rains: number[] = data.hourly.precipitation_probability;
    const winds: number[] = data.hourly.wind_speed_10m;

    const forecastList: WeatherData[] = [];
    for (let i = 0; i < times.length && forecastList.length < 12; i++) {
      if (new Date(times[i]) < now) continue;
      const hour = new Date(times[i]).getHours();
      forecastList.push({
        id: `hour-${times[i]}`,
        time: `${hour.toString().padStart(2, '0')}:00`,
        hour,
        temperature: Math.round(temps[i] * 10) / 10,
        humidity: Math.round(humids[i]),
        rainChance: Math.round(rains[i]),
        windSpeed: Math.round(winds[i] * 10) / 10,
        risk: getRisk(rains[i], humids[i]),
      });
    }
    return { currentParams, forecastList };
  },

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