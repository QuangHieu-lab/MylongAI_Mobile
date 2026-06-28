import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  ChevronLeft, AlertTriangle, CloudLightning, Sun, 
  CheckCircle, ShieldAlert, CloudRain, Activity, Wind, Droplets
} from 'lucide-react-native';

// 🚀 IMPORT DATA WRAPPER VÀ HOOK
import DataWrapper from '@/src/components/ui/DataWrapper';
import { useWeather } from '@/src/hooks/useWeather';

export default function WeatherAlertsScreen() {
  const router = useRouter();
  const { currentWeather, advice, loading, error, refetch } = useWeather();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  // 🚀 LOGIC ĐỒNG BỘ CẢNH BÁO (GIỐNG WEATHER.TSX)
  const getSeverityConfig = () => {
    if (!currentWeather) return { color: '#34d399', bg: 'bg-emerald-500', title: 'Đang tải...', icon: Sun, action: 'Chờ dữ liệu AI...' };
    
    if (currentWeather.isRaining || currentWeather.rainChance >= 70) {
      return { 
        color: '#fb7185', bg: 'bg-red-500', 
        title: 'NGUY HIỂM: CÓ MƯA!', icon: CloudLightning, 
        action: 'KÍCH HOẠT THU BÁNH KHẨN CẤP' 
      };
    }
    if (currentWeather.rainChance >= 40) {
      return { 
        color: '#fbbf24', bg: 'bg-amber-500', 
        title: 'CẢNH BÁO RỦI RO', icon: AlertTriangle, 
        action: 'CHUẨN BỊ KÉO BẠT / THU BÁNH' 
      };
    }
    return { 
      color: '#34d399', bg: 'bg-emerald-500', 
      title: 'ĐIỀU KIỆN AN TOÀN', icon: CheckCircle, 
      action: 'TIẾP TỤC PHƠI BÌNH THƯỜNG' 
    };
  };

  const severity = getSeverityConfig();
  const StatusIcon = severity.icon;

  return (
    <SafeAreaView className="flex-1 bg-[#0f172a]" edges={['top']}>
      {/* ================= HEADER ================= */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-slate-800/50">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="w-10 h-10 bg-[#1e293b] rounded-full flex items-center justify-center border border-slate-700"
          >
            <ChevronLeft size={24} color="#f8fafc" />
          </TouchableOpacity>
          <View>
            <Text className="text-white text-xl font-bold tracking-tight">Phân tích Khí tượng</Text>
            <Text className="text-cyan-400 text-xs mt-0.5 font-bold uppercase tracking-wider">Hệ thống AI Cảnh báo</Text>
          </View>
        </View>
        <View className="w-10 h-10 bg-cyan-500/10 rounded-full flex items-center justify-center border border-cyan-500/30">
          <ShieldAlert size={20} color="#22d3ee" />
        </View>
      </View>

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#22d3ee" />}
      >
        <DataWrapper isLoading={loading && !isRefreshing} error={error} onRetry={refetch} loadingMessage="AI đang phân tích môi trường...">
          
          {currentWeather && (
            <>
              {/* BANNER CẢNH BÁO CHÍNH */}
              <View className={`w-full p-6 rounded-[32px] border mb-6 relative overflow-hidden ${severity.bg}/10 border-${severity.bg.split('-')[1]}-500/40 shadow-xl`}>
                {currentWeather.isRaining && <View className="absolute inset-0 bg-red-500/15 animate-pulse" />}
                
                <View className="items-center mb-6 mt-4 relative z-10">
                  <View className={`p-4 rounded-full ${severity.bg}/20 mb-4 border border-${severity.bg.split('-')[1]}-500/30 shadow-lg`}>
                    <StatusIcon size={48} color={severity.color} />
                  </View>
                  <Text className="text-slate-300 text-xs font-bold uppercase tracking-widest mb-2">Trạng thái môi trường</Text>
                  <Text style={{ color: severity.color }} className="text-3xl font-black uppercase text-center tracking-tight">
                    {severity.title}
                  </Text>
                  <Text className="text-slate-300 text-sm mt-3 font-medium text-center px-4">
                    {currentWeather.condition || "Đang lấy mô tả thời tiết..."}
                  </Text>
                </View>

                <View className={`bg-slate-900/80 p-4 rounded-2xl border border-${severity.bg.split('-')[1]}-500/30 items-center`}>
                  <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Lệnh Hành Động</Text>
                  <Text style={{ color: severity.color }} className="text-base font-bold text-center">
                    {severity.action}
                  </Text>
                </View>
              </View>

              {/* CHI TIẾT MƯA */}
              <Text className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-3 ml-1">Phân tích lượng mưa</Text>
              <View className="bg-[#1e293b] p-5 rounded-3xl border border-slate-700/50 flex-row items-center justify-between mb-6 shadow-lg">
                <View className="flex-row items-center gap-4">
                  <View className="bg-cyan-500/10 p-3 rounded-2xl">
                    <CloudRain size={28} color="#06b6d4" />
                  </View>
                  <View>
                    <Text className="text-slate-400 text-xs font-semibold mb-1">Khả năng mưa</Text>
                    <Text className="text-white font-black text-2xl">{currentWeather.rainChance}%</Text>
                  </View>
                </View>
                <View className="w-[1px] h-12 bg-slate-700" />
                <View className="pr-4">
                  <Text className="text-slate-400 text-xs font-semibold mb-1 text-right">Đỉnh 12h</Text>
                  <Text className="text-red-400 font-black text-2xl text-right">{currentWeather.maxPrecip12h}%</Text>
                </View>
              </View>

              {/* THÔNG SỐ KHÍ TƯỢNG */}
              <View className="flex-row flex-wrap justify-between gap-y-4 mb-6">
                <View className="w-[48%] bg-[#1e293b] p-4 rounded-3xl border border-slate-700/50">
                  <View className="flex-row items-center gap-2 mb-2">
                    <Droplets size={16} color="#3b82f6" />
                    <Text className="text-slate-400 text-[10px] font-bold uppercase">Độ ẩm</Text>
                  </View>
                  <Text className="text-white font-extrabold text-xl">{currentWeather.humidity}%</Text>
                </View>
                <View className="w-[48%] bg-[#1e293b] p-4 rounded-3xl border border-slate-700/50">
                  <View className="flex-row items-center gap-2 mb-2">
                    <Wind size={16} color="#14b8a6" />
                    <Text className="text-slate-400 text-[10px] font-bold uppercase">Sức gió</Text>
                  </View>
                  <Text className="text-white font-extrabold text-xl">{currentWeather.windSpeed} <Text className="text-xs font-medium text-slate-500">m/s</Text></Text>
                </View>
              </View>

              {/* BÁO CÁO AI */}
              {advice && advice.length > 0 && (
                <>
                  <Text className="text-indigo-400 font-bold uppercase tracking-wider text-xs mb-3 ml-1">Trợ lý AI phân tích</Text>
                  <View className="bg-indigo-900/10 p-5 rounded-3xl border border-indigo-500/20 mb-6">
                    {advice.map((adv, idx) => (
                      <View key={idx} className={`flex-row gap-3 py-3 ${idx !== advice.length - 1 ? 'border-b border-indigo-500/10' : ''}`}>
                        <View className="bg-indigo-500/20 p-1.5 rounded-full h-fit mt-0.5"><Activity size={14} color="#818cf8" /></View>
                        <Text className="text-slate-300 font-medium leading-5 pr-2 flex-1">{adv}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}

              <TouchableOpacity onPress={() => router.back()} className="w-full bg-slate-800 py-4 rounded-full border border-slate-700 items-center">
                <Text className="text-white font-bold">Quay lại Tổng quan</Text>
              </TouchableOpacity>
            </>
          )}
        </DataWrapper>
      </ScrollView>
    </SafeAreaView>
  );
}