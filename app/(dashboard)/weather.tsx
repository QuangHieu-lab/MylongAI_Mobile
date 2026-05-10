import React from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { CloudRain, Droplets, Thermometer, Wind, AlertTriangle } from 'lucide-react-native';
import { useGlobalWeather } from '@/src/contexts/WeatherContext';
import {VoiceNotification} from '@/src/components/dashboard/VoiceNotification';
0
export default function WeatherScreen() {
  const { currentWeather, forecastData, loading } = useGlobalWeather();
  const highRiskHours = forecastData?.filter(f => f.risk === 'high') || [];

  if (loading) return (
    <View className="flex-1 bg-[#0B1121] items-center justify-center">
      <ActivityIndicator size="large" color="#3b82f6" />
      <Text className="text-slate-400 mt-4">Đang lấy dữ liệu trạm quan trắc...</Text>
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-[#0B1121] p-4">
    <View className="flex-row flex-wrap justify-between mb-6">
        {/* 1. Thẻ Nhiệt Độ */}
        <View className="w-[48%] bg-[#1F1A18] p-4 rounded-2xl border border-orange-900/50 mb-4">
          <View className="flex-row items-center mb-2">
            <Thermometer color="#f97316" size={20} />
            <Text className="text-slate-300 ml-2 text-xs">Nhiệt độ</Text>
          </View>
          <Text className="text-3xl font-bold text-orange-500">{currentWeather?.temperature}°C</Text>
        </View>

        {/* 2. Thẻ Độ Ẩm */}
        <View className="w-[48%] bg-[#171A28] p-4 rounded-2xl border border-blue-900/50 mb-4">
          <View className="flex-row items-center mb-2">
            <Droplets color="#3b82f6" size={20} />
            <Text className="text-slate-300 ml-2 text-xs">Độ ẩm</Text>
          </View>
          <Text className="text-3xl font-bold text-blue-500">{currentWeather?.humidity}%</Text>
        </View>

        {/* 3. Thẻ Mưa (Bị thiếu, giờ thêm lại) */}
        <View className="w-[48%] bg-[#14222A] p-4 rounded-2xl border border-cyan-900/50">
          <View className="flex-row items-center mb-2">
            <CloudRain color="#06b6d4" size={20} />
            <Text className="text-slate-300 ml-2 text-xs">Khả năng mưa</Text>
          </View>
          <Text className="text-3xl font-bold text-cyan-500">{currentWeather?.rainChance}%</Text>
        </View>

        {/* 4. Thẻ Gió (Bị thiếu, giờ thêm lại) */}
        <View className="w-[48%] bg-[#132421] p-4 rounded-2xl border border-teal-900/50">
          <View className="flex-row items-center mb-2">
            <Wind color="#14b8a6" size={20} />
            <Text className="text-slate-300 ml-2 text-xs">Gió</Text>
          </View>
          <Text className="text-3xl font-bold text-teal-500">{currentWeather?.windSpeed}</Text>
        </View>
      </View>
    </ScrollView>
  );
}