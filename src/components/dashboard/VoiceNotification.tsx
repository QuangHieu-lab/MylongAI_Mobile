// src/components/dashboard/VoiceNotification.tsx
import React, { useState,useEffect } from 'react';
import { TouchableOpacity, Text, Alert, ActivityIndicator } from 'react-native';
import { Volume2, VolumeX } from 'lucide-react-native';
import { useAudioPlayer } from 'expo-audio'; //  Import thư viện mới
import { WeatherService } from '../../services/weather';
import { useGlobalWeather } from '../../contexts/WeatherContext';

export function VoiceNotification() {
  const { currentWeather } = useGlobalWeather();
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  //  Sức mạnh của expo-audio: Tự động quản lý Audio, không cần useEffect dọn dẹp bộ nhớ nữa!
  const player = useAudioPlayer(audioUrl);
useEffect(() => {
    if (audioUrl && player) {
      player.play();
      setIsLoading(false); // Tắt còng xoay loading
    }
  }, [player, audioUrl]);
  if (!currentWeather) return null;

  const numberToVietnamese = (num: number) => {
    const ones = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
    const tens = ['', 'mười', 'hai mươi', 'ba mươi', 'bốn mươi', 'năm mươi', 'sáu mươi', 'bảy mươi', 'tám mươi', 'chín mươi'];
    if (num < 10) return ones[num];
    if (num < 100) {
      const t = Math.floor(num / 10);
      const o = num % 10;
      if (o === 0) return tens[t];
      return `${tens[t]} ${ones[o]}`;
    }
    return num.toString();
  };

  const readDecimal = (num: number) => {
    const parts = num.toFixed(1).split('.');
    return `${numberToVietnamese(parseInt(parts[0]))} phẩy ${numberToVietnamese(parseInt(parts[1]))}`;
  };

  const translateCondition = (condition: string) => {
    const map: Record<string, string> = {
      Clear: 'Trời quang', Clouds: 'Nhiều mây', Rain: 'Mưa', Drizzle: 'Mưa phùn',
      Thunderstorm: 'Dông', Mist: 'Sương mù', Fog: 'Sương mù', Haze: 'Sương nhẹ',
    };
    return map[condition] || condition;
  };

  const generateWeatherScript = () => {
    const riskLevel = currentWeather.rainChance > 60 ? 'cao' : currentWeather.rainChance > 30 ? 'trung bình' : 'thấp';
    const humidityLevel = currentWeather.humidity > 70 ? 'rất cao' : currentWeather.humidity > 60 ? 'cao' : 'bình thường';
    return `
Thông báo thời tiết khu vực phơi bánh tráng.
Nhiệt độ hiện tại ${readDecimal(currentWeather.temperature)} độ C.
Độ ẩm ${numberToVietnamese(Math.round(currentWeather.humidity))} phần trăm, ở mức ${humidityLevel}.
Khả năng mưa ${numberToVietnamese(Math.round(currentWeather.rainChance))} phần trăm.
Tình trạng: ${translateCondition(currentWeather.condition)}.
${currentWeather.rainChance > 60 ? 'Cảnh báo: Nguy cơ mưa cao, hãy chuẩn bị thu bánh!' : 'Thời tiết ổn định, phơi bánh an toàn.'}
`.trim();
  };

  const speakWeather = async () => {
    if (player.playing) {
      player.pause();
      return;
    }

    setIsLoading(true);
    setAudioUrl(null); // Reset đường link cũ để ép Expo tạo player mới hoàn toàn

    const text = generateWeatherScript();
 
    try {
      // Lấy link Audio mới từ FPT
      const newAudioUrl = await WeatherService.fetchTTSAudioUrl(text);
      
      // Chỉ cần set URL mới, cái useEffect ở trên sẽ tự động bắt lấy và Play!
      setAudioUrl(newAudioUrl);

    } catch (e: any) {
      setIsLoading(false);
      Alert.alert('Lỗi Giọng Nói', `Không thể phát thông báo: ${e.message ?? 'Hãy thử lại sau'}`);
    }
  };

  return (
    <TouchableOpacity
      onPress={isLoading ? undefined : speakWeather}
      disabled={isLoading}
      className={`
        flex-row items-center justify-center gap-2 px-4 py-2 rounded-full shadow-lg
        ${player.playing ? 'bg-red-500' : 'bg-cyan-500'}
        ${isLoading ? 'opacity-70' : 'opacity-100'}
      `}
    >
      {isLoading ? (
        <>
          <ActivityIndicator color="#fff" size="small" />
          <Text className="text-white font-semibold ml-2">Đang xử lý AI...</Text>
        </>
      ) : player.playing ? (
        <>
          <VolumeX color="#fff" size={18} />
          <Text className="text-white font-semibold ml-1">Dừng phát</Text>
        </>
      ) : (
        <>
          <Volume2 color="#fff" size={18} />
          <Text className="text-white font-semibold ml-1">Nghe AI</Text>
        </>
      )}
    </TouchableOpacity>
  );
}