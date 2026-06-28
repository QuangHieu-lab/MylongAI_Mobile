import React, { useState } from 'react';
import { View, Text, ScrollView, Dimensions, TouchableOpacity, RefreshControl } from 'react-native';
import { 
  Thermometer, Droplets, CloudRain, Wind, 
  Bookmark, BookmarkCheck, Cpu, CloudLightning,
  AlertTriangle, ChevronRight, CheckCircle2, Lightbulb, Sun, CloudDrizzle, Cloud
} from 'lucide-react-native';
import { LineChart } from 'react-native-chart-kit';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';

// 🚀 IMPORT DATA WRAPPER VÀ HOOK
import DataWrapper from '@/src/components/ui/DataWrapper';
import { useWeather } from '@/src/hooks/useWeather';
import { WeatherData } from '@/src/types/weather';

const { width } = Dimensions.get('window');

// ==========================================
// COMPONENT BẢNG CHI TIẾT THEO GIỜ 
// ==========================================
const HourlyForecastCard = ({ data }: { data: WeatherData[] }) => {
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
    if (rainChance > 70) return 'high';
    if (rainChance > 40) return 'medium';
    return 'low';
  };

  return (
    <View className="bg-[#1e293b] rounded-3xl overflow-hidden border border-slate-700/50 shadow-xl mt-6">
      <View className="border-b border-slate-800 bg-[#151E2F] p-5">
        <Text className="text-lg font-bold text-white">Chi tiết dự báo theo giờ</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="pb-2">
          <View className="flex-row border-b border-slate-700 bg-[#0B1121]/50 px-2 py-3">
            <Text className="w-16 text-center text-sm font-semibold text-slate-400">Giờ</Text>
            <Text className="w-24 text-center text-sm font-semibold text-slate-400">Nhiệt độ</Text>
            <Text className="w-20 text-center text-sm font-semibold text-slate-400">Độ ẩm</Text>
            <Text className="w-20 text-center text-sm font-semibold text-slate-400">Mưa</Text>
            <Text className="w-20 text-center text-sm font-semibold text-slate-400">Rủi ro</Text>
            <Text className="w-20 text-center text-sm font-semibold text-slate-400">Lưu lại</Text>
          </View>
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
  const { currentWeather, forecastData, advice, sensorData, loading, error, refetch } = useWeather();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  // 🚀 ĐÃ BỎ MOCK DATA. SỬ DỤNG DỮ LIỆU THẬT 100% TỪ BACKEND
  const displayForecastData = forecastData || [];

  // 🚀 LOGIC 3 MỨC CẢNH BÁO TỪ WEB (70 - 40 - <40)
  const getAlertConfig = () => {
    if (!currentWeather) return null;
    
    if (currentWeather.isRaining || currentWeather.rainChance >= 70) {
      return { 
        bg: 'bg-rose-500/20', border: 'border-rose-500/50', text: 'text-rose-400', 
        icon: AlertTriangle, title: 'CẢNH BÁO KHẨN CẤP',
        subtitle: 'Khả năng mưa rất cao, hãy chú ý thu bánh!'
      };
    }
    
    if (currentWeather.rainChance >= 40) {
      return { 
        bg: 'bg-amber-500/20', border: 'border-amber-500/50', text: 'text-amber-400', 
        icon: CloudRain, title: 'LƯU Ý THỜI TIẾT',
        subtitle: 'Có thể có mưa, hãy theo dõi sát sao.'
      };
    }

    return { 
      bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', 
      icon: CheckCircle2, title: 'ĐIỀU KIỆN PHƠI TỐT',
      subtitle: 'Trời nắng đẹp, an toàn để phơi bánh tráng.'
    };
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
            <Text className="text-slate-400 text-sm mt-1">Phân tích tự động bởi AI và Cảm biến</Text>
          </View>
          
          <TouchableOpacity className="flex-row items-center gap-2 bg-cyan-500/10 px-4 py-2 rounded-xl border border-cyan-500/30 shadow-lg shadow-cyan-500/20">
            <CloudLightning className="w-4 h-4 text-cyan-400" />
            <Text className="text-cyan-400 font-bold text-sm">Nghe AI</Text>
          </TouchableOpacity>
        </View>

        <DataWrapper isLoading={loading && !isRefreshing} error={error} onRetry={refetch} loadingMessage="Đang đồng bộ AI...">
          
          {/* 🚀 THẺ MINI CẢNH BÁO TỔNG QUAN */}
          {alertConfig && (
            <TouchableOpacity 
              onPress={() => router.push('/(dashboard)/weather-alerts')} 
              className={`flex-row items-center justify-between p-5 mb-6 rounded-3xl border shadow-xl ${alertConfig.bg} ${alertConfig.border}`}
            >
              <View className="flex-row items-center gap-4 flex-1 pr-2">
                <View className={`p-3 rounded-2xl bg-black/20`}>
                  <alertConfig.icon size={28} color={alertConfig.text.replace('text-', '').replace('400', '')} />
                </View>
                <View className="flex-1">
                  <Text className={`font-black uppercase tracking-wider text-base mb-1 ${alertConfig.text}`}>
                    {alertConfig.title}
                  </Text>
                  <Text className="text-slate-300 text-xs leading-tight" numberOfLines={2}>
                    {alertConfig.subtitle}
                  </Text>
                </View>
              </View>
              <View className="bg-slate-900/50 p-2 rounded-full ml-1">
                <ChevronRight size={20} color="#94a3b8" />
              </View>
            </TouchableOpacity>
          )}

          {/* --- 5 THẺ CHỈ SỐ --- */}
          <View className="flex-row flex-wrap justify-between mb-2">
            <View className="w-[48%] bg-gradient-to-br from-[#2A2421] to-[#1F1A18] p-4 rounded-3xl border border-[#3A2E2A] mb-4 shadow-xl">
              <View className="flex-row items-center gap-2 mb-3">
                <View className="p-2 bg-orange-500/20 rounded-xl border border-orange-500/30"><Thermometer color="#f97316" size={16} /></View>
                <Text className="text-slate-300 font-medium text-xs">Nhiệt độ</Text>
              </View>
              <Text className="text-3xl font-extrabold text-orange-500">{currentWeather?.temperature ?? '--'}°C</Text>
              <Text className="text-orange-400/80 text-[10px] mt-2 font-mono">Áp suất: {currentWeather?.pressure ?? '--'} hPa</Text>
            </View>

            <View className="w-[48%] bg-gradient-to-br from-[#1E2335] to-[#171A28] p-4 rounded-3xl border border-[#2A344D] mb-4 shadow-xl">
              <View className="flex-row items-center gap-2 mb-3">
                <View className="p-2 bg-blue-500/20 rounded-xl border border-blue-500/30"><Droplets color="#3b82f6" size={16} /></View>
                <Text className="text-slate-300 font-medium text-xs">Độ ẩm</Text>
              </View>
              <Text className="text-3xl font-extrabold text-blue-500">{currentWeather?.humidity ?? '--'}%</Text>
            </View>

            <View className="w-[48%] bg-gradient-to-br from-[#1A2C35] to-[#14222A] p-4 rounded-3xl border border-[#25424D] mb-4 shadow-xl">
              <View className="flex-row items-center gap-2 mb-3">
                <View className="p-2 bg-cyan-500/20 rounded-xl border border-cyan-500/30">
                  <CloudRain color="#06b6d4" size={16} />
                </View>
                <Text className="text-slate-300 font-medium text-xs">Rủi ro mưa</Text>
              </View>
              <Text className="text-3xl font-extrabold text-cyan-500">{currentWeather?.rainChance ?? '--'}%</Text>
              <Text className="text-cyan-400/80 text-[10px] mt-2 font-mono">Đỉnh 12h: {currentWeather?.maxPrecip12h ?? '--'}%</Text>
            </View>

            <View className="w-[48%] bg-gradient-to-br from-[#26182D] to-[#1A0F1F] p-4 rounded-3xl border border-[#3D2547] mb-4 shadow-xl">
              <View className="flex-row items-center gap-2 mb-3">
                <View className="p-2 bg-violet-500/20 rounded-xl border border-violet-500/30">
                  <CloudDrizzle color="#a78bfa" size={16} />
                </View>
                <Text className="text-slate-300 font-medium text-xs">Lượng mưa</Text>
              </View>
              <Text className="text-3xl font-extrabold text-violet-500">
                {currentWeather?.precipitation_mm ?? '0'} <Text className="text-lg text-violet-500/70">mm</Text>
              </Text>
            </View>

            <View className="w-full bg-gradient-to-br from-[#192E2B] to-[#132421] p-4 rounded-3xl border border-[#24453F] mb-6 shadow-xl flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View className="p-3 bg-teal-500/20 rounded-2xl border border-teal-500/30"><Wind color="#14b8a6" size={20} /></View>
                <View>
                  <Text className="text-slate-300 font-medium text-sm mb-1">Tốc độ gió</Text>
                  <Text className="text-3xl font-extrabold text-teal-500">{currentWeather?.windSpeed ?? '--'} <Text className="text-xl font-bold text-teal-500/70">m/s</Text></Text>
                </View>
              </View>
            </View>
          </View>

          {/* 🚀 THÔNG SỐ CẢM BIẾN ESP32 */}
          {sensorData && (
            <View className="bg-[#151E2F] p-5 rounded-3xl border border-slate-800 mb-6 shadow-2xl">
              <View className="flex-row items-center gap-2 mb-4 border-b border-slate-800/50 pb-3">
                <Cpu size={20} color="#818cf8" />
                <Text className="text-white font-bold text-base">Cảm biến môi trường thực tế</Text>
              </View>
              
              <View className="flex-row justify-between mb-4">
                <View className="bg-slate-800/50 p-4 rounded-2xl flex-1 mr-2 border border-slate-700/50">
                  <Text className="text-slate-400 text-xs uppercase font-bold mb-1">Nhiệt độ Sân</Text>
                  <Text className="text-2xl font-bold text-white">{sensorData.temperature_c}°C</Text>
                </View>
                <View className="bg-slate-800/50 p-4 rounded-2xl flex-1 ml-2 border border-slate-700/50">
                  <Text className="text-slate-400 text-xs uppercase font-bold mb-1">Độ ẩm Sân</Text>
                  <Text className="text-2xl font-bold text-white">{sensorData.humidity_percent}%</Text>
                </View>
              </View>

              <View className="flex-row items-center justify-between p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                <View>
                  <Text className="text-indigo-400 font-bold mb-1">Trạng thái Xưởng phơi</Text>
                  <Text className="text-slate-300 text-xs">Phát hiện bởi Camera AI</Text>
                </View>
                <View className={`px-3 py-1.5 rounded-full border flex-row items-center gap-1.5 ${sensorData.has_rice_paper ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-slate-800 border-slate-600'}`}>
                  {sensorData.has_rice_paper ? <CheckCircle2 size={14} color="#34d399"/> : <Sun size={14} color="#94a3b8"/>}
                  <Text className={`text-xs font-bold ${sensorData.has_rice_paper ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {sensorData.has_rice_paper ? 'Đang phơi' : 'Sân trống'}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* 🚀 LỜI KHUYÊN AI */}
          {advice && advice.length > 0 && (
            <View className="bg-[#1A1625] p-5 rounded-3xl border border-purple-900/50 mb-6 shadow-xl shadow-purple-900/20">
              <View className="flex-row items-center gap-2 mb-4 border-b border-purple-900/50 pb-3">
                <Lightbulb className="w-5 h-5 text-purple-500" />
                <Text className="text-purple-400 font-bold text-base">AI Khuyến nghị</Text>
              </View>
              <View className="space-y-3">
                {advice.map((adv, index) => (
                  <View key={index} className="flex-row items-start gap-3 p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                    <Text className="text-lg mt-0.5">💡</Text>
                    <Text className="text-purple-200 flex-1 leading-5">{adv}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* BIỂU ĐỒ & BẢNG CHI TIẾT */}
          <View>
            {displayForecastData && displayForecastData.length > 0 ? (
              <>
                {/* Biểu đồ 1 */}
                <View className="bg-[#151E2F] p-5 rounded-3xl border border-slate-800 mb-6 shadow-xl shadow-black/40">
                  <Text className="text-white font-bold text-lg mb-6">Dự báo nhiệt độ & độ ẩm</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <LineChart
                      data={{
                        labels: displayForecastData.map(d => d.time),
                        datasets: [
                          { data: displayForecastData.map(d => d.temperature), color: () => '#f97316', strokeWidth: 3 },
                          { data: displayForecastData.map(d => d.humidity), color: () => '#3b82f6', strokeWidth: 3 }
                        ],
                        legend: ["Nhiệt độ (°C)", "Độ ẩm (%)"]
                      }}
                      width={Math.max(width - 32, displayForecastData.length * 60)}
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
                        labels: displayForecastData.map(d => d.time),
                        datasets: [{ data: displayForecastData.map(d => d.rainChance), color: () => '#06b6d4', strokeWidth: 3 }]
                      }}
                      width={Math.max(width - 32, displayForecastData.length * 60)}
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
                <HourlyForecastCard data={displayForecastData} />
              </>
            ) : (
              /* 🚀 HIỂN THỊ KHI KHÔNG CÓ DỮ LIỆU DỰ BÁO THEO GIỜ */
              <View className="bg-[#151E2F] p-6 rounded-3xl border border-slate-800 mb-6 flex items-center justify-center py-12 shadow-lg">
                <Cloud className="w-12 h-12 text-slate-600 mb-4 opacity-50" />
                <Text className="text-slate-300 font-bold text-base mb-1">Chưa có dự báo theo giờ</Text>
                <Text className="text-slate-500 text-sm text-center">Dữ liệu chi tiết sẽ được hệ thống cập nhật tự động trong thời gian tới.</Text>
              </View>
            )}
          </View>

        </DataWrapper>
      </ScrollView>
      <Toast />
    </>
  );
}