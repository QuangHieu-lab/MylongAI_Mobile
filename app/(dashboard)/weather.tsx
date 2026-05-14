import React from 'react';
import { View, Text, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { Thermometer, Droplets, CloudRain, Wind, AlertTriangle } from 'lucide-react-native';
import { LineChart } from 'react-native-chart-kit';
// import { useWeather } from '@/src/contexts/WeatherContext'; // Bỏ comment khi có data thật

const { width } = Dimensions.get('window');

export default function WeatherScreen() {
  // Thay vì dùng Context ngay, ta tạo dữ liệu giả (Mock Data) để test UI trước
  // const { currentWeather, forecastData, isLoading, error } = useWeather();
  
  const isLoading = false;
  
  const currentWeather = {
    temperature: 33.5,
    humidity: 55,
    rainChance: 16,
    windSpeed: 13.1
  };

  // Dữ liệu giả lập cho 6 giờ tới để vẽ biểu đồ
  const forecastData = [
    { time: '12:00', temperature: 33.5, humidity: 55, rainChance: 16 },
    { time: '13:00', temperature: 34.2, humidity: 52, rainChance: 20 },
    { time: '14:00', temperature: 35.0, humidity: 48, rainChance: 30 },
    { time: '15:00', temperature: 34.5, humidity: 50, rainChance: 40 },
    { time: '16:00', temperature: 33.0, humidity: 58, rainChance: 20 },
    { time: '17:00', temperature: 31.5, humidity: 65, rainChance: 10 },
  ];

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#0B0F19]">
        <ActivityIndicator size="large" color="#38bdf8" />
        <Text className="text-slate-400 mt-4">Đang cập nhật thời tiết...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      className="flex-1 bg-[#0B0F19]" 
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* --- HEADER --- */}
      <View className="mb-6 mt-2 flex-row justify-between items-center">
        <View>
          <Text className="text-white text-3xl font-bold tracking-tight">Thời tiết xưởng</Text>
          <Text className="text-slate-400 text-sm mt-1">Cập nhật theo thời gian thực</Text>
        </View>
        
        {/* Nút Nghe AI (Tùy chọn) */}
        <View className="bg-cyan-500/20 px-4 py-2 rounded-full border border-cyan-500/30">
          <Text className="text-cyan-400 font-bold text-sm">Nghe AI</Text>
        </View>
      </View>

      {/* --- 4 THẺ CHỈ SỐ --- */}
      <View className="flex-row flex-wrap justify-between mb-8">
        {/* 1. Thẻ Nhiệt Độ */}
        <View className="w-[48%] bg-[#1F1A18] p-4 rounded-2xl border border-orange-900/50 mb-4 shadow-lg shadow-orange-900/20">
          <View className="flex-row items-center mb-2">
            <Thermometer color="#f97316" size={18} />
            <Text className="text-slate-300 ml-2 text-xs">Nhiệt độ</Text>
          </View>
          <Text className="text-3xl font-extrabold text-orange-500">{currentWeather?.temperature}°C</Text>
        </View>

        {/* 2. Thẻ Độ Ẩm */}
        <View className="w-[48%] bg-[#171A28] p-4 rounded-2xl border border-blue-900/50 mb-4 shadow-lg shadow-blue-900/20">
          <View className="flex-row items-center mb-2">
            <Droplets color="#3b82f6" size={18} />
            <Text className="text-slate-300 ml-2 text-xs">Độ ẩm</Text>
          </View>
          <Text className="text-3xl font-extrabold text-blue-500">{currentWeather?.humidity}%</Text>
        </View>

        {/* 3. Thẻ Mưa */}
        <View className="w-[48%] bg-[#14222A] p-4 rounded-2xl border border-cyan-900/50 shadow-lg shadow-cyan-900/20">
          <View className="flex-row items-center mb-2">
            <CloudRain color="#06b6d4" size={18} />
            <Text className="text-slate-300 ml-2 text-xs">Khả năng mưa</Text>
          </View>
          <Text className="text-3xl font-extrabold text-cyan-500">{currentWeather?.rainChance}%</Text>
        </View>

        {/* 4. Thẻ Gió */}
        <View className="w-[48%] bg-[#132421] p-4 rounded-2xl border border-teal-900/50 shadow-lg shadow-teal-900/20">
          <View className="flex-row items-center mb-2">
            <Wind color="#14b8a6" size={18} />
            <Text className="text-slate-300 ml-2 text-xs">Gió</Text>
          </View>
          <Text className="text-3xl font-extrabold text-teal-500">{currentWeather?.windSpeed}km/h</Text>
        </View>
      </View>

      {/* --- KHU VỰC BIỂU ĐỒ --- */}
      {forecastData && forecastData.length > 0 && (
        <View className="mb-10">
          {/* Biểu đồ 1: Nhiệt độ & Độ ẩm */}
          <View className="bg-[#151E2F] p-5 rounded-3xl border border-slate-800 mb-6 shadow-xl shadow-black/40">
            <Text className="text-white font-bold text-lg mb-6">Dự báo nhiệt độ & độ ẩm</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <LineChart
                data={{
                  labels: forecastData.map(d => d.time),
                  datasets: [
                    {
                      data: forecastData.map(d => d.temperature),
                      color: (opacity = 1) => `rgba(249, 115, 22, ${opacity})`, // Màu Cam
                      strokeWidth: 3,
                    },
                    {
                      data: forecastData.map(d => d.humidity),
                      color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, // Màu Xanh dương
                      strokeWidth: 3,
                    }
                  ],
                  legend: ["Nhiệt độ (°C)", "Độ ẩm (%)"]
                }}
                width={Math.max(width - 32, forecastData.length * 60)} // Tự động kéo dài
                height={220}
                yAxisSuffix=""
                withVerticalLines={false}
                chartConfig={{
                  backgroundColor: '#151E2F',
                  backgroundGradientFrom: '#151E2F',
                  backgroundGradientTo: '#151E2F',
                  decimalPlaces: 1,
                  color: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`, // Trục hoành/tung
                  labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
                  propsForDots: { r: '5', strokeWidth: '2', stroke: '#151E2F' },
                  useShadowColorFromDataset: true
                }}
                bezier
                style={{ marginLeft: -15 }} // Dịch qua trái một chút cho cân đối
              />
            </ScrollView>
          </View>

          {/* Biểu đồ 2: Khả năng mưa */}
          <View className="bg-[#151E2F] p-5 rounded-3xl border border-slate-800 shadow-xl shadow-black/40">
            <Text className="text-white font-bold text-lg mb-6">Dự báo khả năng mưa</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <LineChart
                data={{
                  labels: forecastData.map(d => d.time),
                  datasets: [
                    {
                      data: forecastData.map(d => d.rainChance),
                      color: (opacity = 1) => `rgba(6, 182, 212, ${opacity})`, // Màu Cyan
                      strokeWidth: 3,
                    }
                  ],
                }}
                width={Math.max(width - 32, forecastData.length * 60)}
                height={220}
                yAxisSuffix="%"
                withVerticalLines={false}
                chartConfig={{
                  backgroundColor: '#151E2F',
                  backgroundGradientFrom: '#151E2F',
                  backgroundGradientTo: '#151E2F',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(6, 182, 212, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
                  fillShadowGradientFrom: '#06b6d4',
                  fillShadowGradientFromOpacity: 0.4,
                  fillShadowGradientTo: '#151E2F',
                  fillShadowGradientToOpacity: 0.1,
                  propsForDots: { r: '5', strokeWidth: '2', stroke: '#151E2F' },
                }}
                bezier
                style={{ marginLeft: -15 }}
              />
            </ScrollView>
          </View>
        </View>
      )}
    </ScrollView>
  );
}