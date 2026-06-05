import React, { useState } from 'react';
import { View, Text, ScrollView, Dimensions, TouchableOpacity, RefreshControl } from 'react-native';
import { 
  Thermometer, Droplets, CloudRain, Wind, 
  Bookmark, BookmarkCheck, Cpu, CloudLightning,
  AlertTriangle, ChevronRight, CheckCircle 
} from 'lucide-react-native';
import { LineChart } from 'react-native-chart-kit';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';

// 🚀 IMPORT DATA WRAPPER VÀ HOOK
import DataWrapper from '@/src/components/ui/DataWrapper';
import { useWeather } from '@/src/hooks/useWeather';

const { width } = Dimensions.get('window');

// ==========================================
// COMPONENT BẢNG CHI TIẾT THEO GIỜ (Sẽ ẩn nếu API ko trả về)
// ==========================================
const HourlyForecastCard = ({ data }: { data: any[] }) => {
  const [savedHours, setSavedHours] = useState<string[]>([]);

  const toggleSaveHour = (time: string) => {
    if (savedHours.includes(time)) {
      setSavedHours(prev => prev.filter(t => t !== time));
      Toast.show({ type: 'info', text1: 'Đã hủy lưu', text2: `Đã xóa dữ liệu lúc ${time}`, position: 'top' });
    } else {
      setSavedHours(prev => [...prev, time]);
      Toast.show({ type: 'success', text1: 'Lưu thành công', text2: `Dữ liệu lúc ${time} đã được lưu.`, position: 'top' });
    }
  };

  const getRiskLevel = (rainChance: number) => {
    if (rainChance > 50) return 'high';
    if (rainChance > 20) return 'medium';
    return 'low';
  };

  return (
    <View className="bg-[#1e293b] rounded-3xl overflow-hidden border border-slate-700/50 shadow-xl mt-6">
      <View className="border-b border-slate-800 bg-[#151E2F] p-5">
        <Text className="text-lg font-bold text-white">Chi tiết dự báo theo giờ</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="pb-2">
          {/* THEAD */}
          <View className="flex-row border-b border-slate-700 bg-[#0B1121]/50 px-2 py-3">
            <Text className="w-16 text-center text-sm font-semibold text-slate-400">Giờ</Text>
            <Text className="w-24 text-center text-sm font-semibold text-slate-400">Nhiệt độ</Text>
            <Text className="w-20 text-center text-sm font-semibold text-slate-400">Độ ẩm</Text>
            <Text className="w-20 text-center text-sm font-semibold text-slate-400">Mưa</Text>
            <Text className="w-20 text-center text-sm font-semibold text-slate-400">Rủi ro</Text>
            <Text className="w-20 text-center text-sm font-semibold text-slate-400">Lưu lại</Text>
          </View>
          {/* TBODY */}
          {data.map((hour, index) => {
            const isSaved = savedHours.includes(hour.time);
            const risk = getRiskLevel(hour.rainChance);
            return (
              <View key={index} className={`flex-row items-center border-b border-slate-800/50 px-2 py-4 ${risk === 'high' ? 'bg-red-500/5' : risk === 'medium' ? 'bg-amber-500/5' : ''}`}>
                <Text className="w-16 text-center font-mono font-bold text-slate-200">{hour.time}</Text>
                <View className="w-24 flex-row items-center justify-center gap-1"><Thermometer size={14} color="#f97316" /><Text className="font-bold text-orange-400">{hour.temperature}°C</Text></View>
                <View className="w-20 flex-row items-center justify-center gap-1"><Droplets size={14} color="#3b82f6" /><Text className="font-bold text-blue-400">{hour.humidity}%</Text></View>
                <View className="w-20 flex-row items-center justify-center gap-1"><CloudRain size={14} color="#06b6d4" /><Text className="font-bold text-cyan-400">{hour.rainChance}%</Text></View>
                <View className="w-20 items-center justify-center">
                  <View className={`px-2 py-1 rounded-md border ${risk === 'high' ? 'bg-red-500/10 border-red-500/30' : risk === 'medium' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
                    <Text className={`text-[10px] font-bold ${risk === 'high' ? 'text-red-400' : risk === 'medium' ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {risk === 'high' ? 'Cao' : risk === 'medium' ? 'TB' : 'Thấp'}
                    </Text>
                  </View>
                </View>
                <View className="w-20 items-center justify-center">
                  <TouchableOpacity onPress={() => toggleSaveHour(hour.time)} className={`p-2 rounded-xl border ${isSaved ? 'bg-emerald-500/20 border-emerald-500/40' : 'bg-slate-800 border-slate-700'}`}>
                    {isSaved ? <BookmarkCheck size={18} color="#34d399" /> : <Bookmark size={18} color="#94a3b8" />}
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

// ==========================================
// 🚀 MÀN HÌNH CHÍNH (WEATHER SCREEN)
// ==========================================
export default function WeatherScreen() {
  const router = useRouter(); 
  const { currentWeather, forecastData, sensorData, loading, error, refetch } = useWeather();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  // 🚀 Logic xác định trạng thái cho thẻ Alert thu nhỏ
  const getAlertConfig = () => {
    if (!currentWeather) return null;
    if (currentWeather.isRaining || currentWeather.rainChance > 60) {
      return { bg: 'bg-rose-500/20', border: 'border-rose-500/50', text: 'text-rose-400', icon: CloudLightning, title: 'CẢNH BÁO MƯA KHẨN CẤP' };
    }
    if (currentWeather.rainChance > 30 || currentWeather.humidity > 75) {
      return { bg: 'bg-amber-500/20', border: 'border-amber-500/50', text: 'text-amber-400', icon: AlertTriangle, title: 'RỦI RO THỜI TIẾT KÉM' };
    }
    return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', icon: CheckCircle, title: 'ĐIỀU KIỆN PHƠI TỐT' };
  };

  const alertConfig = getAlertConfig();

  return (
    <>
      <ScrollView 
        className="flex-1 bg-[#0B0F19]" 
        contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#38bdf8" colors={['#38bdf8']} />}
      >
        {/* --- HEADER --- */}
        <View className="mb-6 mt-2 flex-row justify-between items-center">
          <View>
            <Text className="text-white text-3xl font-bold tracking-tight">Thời tiết xưởng</Text>
            {currentWeather?.condition ? (
              <Text className="text-cyan-400 text-sm mt-1 font-semibold">{currentWeather.condition}</Text>
            ) : (
              <Text className="text-slate-400 text-sm mt-1">Cập nhật theo thời gian thực</Text>
            )}
          </View>
          
          <View className="bg-cyan-500/20 px-4 py-2 rounded-full border border-cyan-500/30">
            <Text className="text-cyan-400 font-bold text-sm">Nghe AI</Text>
          </View>
        </View>

        {/* 🚀 BỌC DATA WRAPPER */}
        <DataWrapper isLoading={loading && !isRefreshing} error={error} onRetry={refetch} loadingMessage="Đang lấy dữ liệu thời tiết...">
          
          {/* 🚀 THẺ MINI CẢNH BÁO THỜI TIẾT */}
          {alertConfig && (
            <TouchableOpacity 
              onPress={() => router.push('/(dashboard)/weather-alerts')} 
              className={`flex-row items-center justify-between p-4 mb-6 rounded-2xl border ${alertConfig.bg} ${alertConfig.border}`}
            >
              <View className="flex-row items-center gap-3">
                <alertConfig.icon size={24} color={alertConfig.text.replace('text-', '').replace('400', '')} className={alertConfig.text} />
                <View>
                  <Text className={`font-black uppercase tracking-wider text-sm ${alertConfig.text}`}>
                    {alertConfig.title}
                  </Text>
                  <Text className="text-slate-300 text-xs mt-0.5">Nhấn để xem phân tích AI chi tiết</Text>
                </View>
              </View>
              <View className="bg-slate-900/50 p-1.5 rounded-full">
                <ChevronRight size={18} color="#94a3b8" />
              </View>
            </TouchableOpacity>
          )}

          {/* --- 4 THẺ CHỈ SỐ --- */}
          <View className="flex-row flex-wrap justify-between mb-8">
            <View className="w-[48%] bg-[#1F1A18] p-4 rounded-2xl border border-orange-900/50 mb-4 shadow-lg shadow-orange-900/20">
              <View className="flex-row items-center mb-2">
                <Thermometer color="#f97316" size={18} />
                <Text className="text-slate-300 ml-2 text-xs">Nhiệt độ</Text>
              </View>
              <Text className="text-3xl font-extrabold text-orange-500">{currentWeather?.temperature ?? '--'}°C</Text>
              {currentWeather?.pressure !== undefined && (
                <Text className="text-slate-500 text-[10px] mt-1 font-mono">Áp suất: {currentWeather.pressure} hPa</Text>
              )}
            </View>

            <View className="w-[48%] bg-[#171A28] p-4 rounded-2xl border border-blue-900/50 mb-4 shadow-lg shadow-blue-900/20">
              <View className="flex-row items-center mb-2">
                <Droplets color="#3b82f6" size={18} />
                <Text className="text-slate-300 ml-2 text-xs">Độ ẩm</Text>
              </View>
              <Text className="text-3xl font-extrabold text-blue-500">{currentWeather?.humidity ?? '--'}%</Text>
            </View>

            {/* Cập nhật thẻ Mưa */}
            <View className={`w-[48%] p-4 rounded-2xl border mb-4 shadow-lg ${currentWeather?.isRaining ? 'bg-rose-950/40 border-rose-800/80 shadow-rose-900/10' : 'bg-[#14222A] border-cyan-900/50 shadow-cyan-900/20'}`}>
              <View className="flex-row items-center mb-2">
                {currentWeather?.isRaining ? (
                  <CloudLightning color="#f43f5e" size={18} />
                ) : (
                  <CloudRain color="#06b6d4" size={18} />
                )}
                <Text className={`ml-2 text-xs font-semibold ${currentWeather?.isRaining ? 'text-rose-400' : 'text-slate-300'}`}>
                  {currentWeather?.isRaining ? 'Trời đang mưa' : 'Khả năng mưa'}
                </Text>
              </View>
              <Text className={`text-3xl font-extrabold ${currentWeather?.isRaining ? 'text-rose-500' : 'text-cyan-500'}`}>
                {currentWeather?.rainChance ?? '--'}%
              </Text>
              {currentWeather?.maxPrecip12h !== undefined && (
                <Text className="text-slate-500 text-[10px] mt-1 font-mono">Đỉnh 12h: {currentWeather.maxPrecip12h}%</Text>
              )}
            </View>

            <View className="w-[48%] bg-[#132421] p-4 rounded-2xl border border-teal-900/50 shadow-lg shadow-teal-900/20 mb-4">
              <View className="flex-row items-center mb-2">
                <Wind color="#14b8a6" size={18} />
                <Text className="text-slate-300 ml-2 text-xs">Gió</Text>
              </View>
              <Text className="text-3xl font-extrabold text-teal-500">{currentWeather?.windSpeed ?? '--'} m/s</Text>
            </View>
          </View>

          {/* THÔNG SỐ CẢM BIẾN */}
          {sensorData && (
            <View className="bg-slate-800/50 p-5 rounded-3xl border border-slate-700 mb-6 flex-row items-center justify-between">
              <View>
                <View className="flex-row items-center gap-2 mb-1">
                  <Cpu size={16} color="#94a3b8" />
                  <Text className="text-slate-300 font-bold text-sm">Cảm biến nội bộ (Xưởng)</Text>
                </View>
                <Text className="text-slate-400 text-xs">Nhiệt độ: <Text className="text-white font-bold">{sensorData.temperature_c}°C</Text>  |  Độ ẩm: <Text className="text-white font-bold">{sensorData.humidity_percent}%</Text></Text>
              </View>
              <View className={`px-3 py-1.5 rounded-full border ${sensorData.has_rice_paper ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-slate-700 border-slate-600'}`}>
                <Text className={`text-xs font-bold ${sensorData.has_rice_paper ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {sensorData.has_rice_paper ? 'Đang phơi' : 'Sân trống'}
                </Text>
              </View>
            </View>
          )}

          {/* BIỂU ĐỒ & BẢNG CHI TIẾT */}
          {forecastData && forecastData.length > 0 && (
            <View>
              {/* Biểu đồ 1 */}
              <View className="bg-[#151E2F] p-5 rounded-3xl border border-slate-800 mb-6 shadow-xl shadow-black/40">
                <Text className="text-white font-bold text-lg mb-6">Dự báo nhiệt độ & độ ẩm</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <LineChart
                    data={{
                      labels: forecastData.map(d => d.time),
                      datasets: [
                        { data: forecastData.map(d => d.temperature), color: () => '#f97316', strokeWidth: 3 },
                        { data: forecastData.map(d => d.humidity), color: () => '#3b82f6', strokeWidth: 3 }
                      ],
                      legend: ["Nhiệt độ (°C)", "Độ ẩm (%)"]
                    }}
                    width={Math.max(width - 32, forecastData.length * 60)}
                    height={220}
                    chartConfig={{
                      backgroundColor: '#151E2F', backgroundGradientFrom: '#151E2F', backgroundGradientTo: '#151E2F',
                      decimalPlaces: 1, color: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
                      propsForDots: { r: '5', strokeWidth: '2', stroke: '#151E2F' }
                    }}
                    bezier style={{ marginLeft: -15 }}
                  />
                </ScrollView>
              </View>

              {/* Biểu đồ 2 */}
              <View className="bg-[#151E2F] p-5 rounded-3xl border border-slate-800 shadow-xl shadow-black/40">
                <Text className="text-white font-bold text-lg mb-6">Dự báo khả năng mưa</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <LineChart
                    data={{
                      labels: forecastData.map(d => d.time),
                      datasets: [{ data: forecastData.map(d => d.rainChance), color: () => '#06b6d4', strokeWidth: 3 }]
                    }}
                    width={Math.max(width - 32, forecastData.length * 60)}
                    height={220}
                    yAxisSuffix="%"
                    chartConfig={{
                      backgroundColor: '#151E2F', backgroundGradientFrom: '#151E2F', backgroundGradientTo: '#151E2F',
                      decimalPlaces: 0, color: (opacity = 1) => `rgba(6, 182, 212, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
                      fillShadowGradientFrom: '#06b6d4', fillShadowGradientFromOpacity: 0.4,
                      fillShadowGradientTo: '#151E2F', fillShadowGradientToOpacity: 0.1,
                      propsForDots: { r: '5', strokeWidth: '2', stroke: '#151E2F' }
                    }}
                    bezier style={{ marginLeft: -15 }}
                  />
                </ScrollView>
              </View>

              {/* BẢNG CHI TIẾT THEO GIỜ */}
              <HourlyForecastCard data={forecastData} />
            </View>
          )}

        </DataWrapper>
      </ScrollView>

      {/* 🚀 Toast Container để hiện popup thông báo */}
      <Toast />
    </>
  );
}