import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { 
  Shield, Video, CloudSun, Activity, 
  ChevronRight, BarChart3, Calendar, TrendingUp,
  Mic, Volume2, Radio 
} from 'lucide-react-native';

// LƯU Ý: Import DataWrapper theo đúng đường dẫn của bạn
import DataWrapper from '@/src/components/ui/DataWrapper'; 

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // ================= STATE QUẢN LÝ TẢI DỮ LIỆU =================
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Giả lập hàm gọi API lấy số liệu Dashboard
  const fetchDashboardData = async () => {
    setError(null);
    try {
      // TODO: Thay bằng API thật của bạn
      await new Promise(resolve => setTimeout(resolve, 1500)); // Giả lập mạng chậm 1.5s
      
      // Bỏ comment dòng dưới để test giao diện Lỗi
      // throw new Error("Mất kết nối đến máy chủ AI. Vui lòng kiểm tra lại mạng!"); 
    } catch (err: any) {
      setError(err.message || "Đã có lỗi xảy ra khi tải dữ liệu.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Gọi lần đầu khi mở app
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Xử lý khi người dùng kéo màn hình xuống để tải lại
  const onRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardData();
  };

  return (
    <View className="flex-1 bg-[#0f172a]">
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        // Thêm tính năng kéo để tải lại
        refreshControl={
          <RefreshControl 
            refreshing={isRefreshing} 
            onRefresh={onRefresh} 
            tintColor="#38bdf8" 
            colors={['#38bdf8']} 
            progressBackgroundColor="#1e293b" 
          />
        }
      >
        {/* ======================================================== */}
        {/* 🚀 HERO HEADER TRÀN VIỀN (Luôn hiển thị không bị che bởi Loading) */}
        {/* ======================================================== */}
        <View 
          className="bg-[#151f32] rounded-b-[40px] px-6 pb-12 shadow-2xl overflow-hidden relative"
          style={{ paddingTop: insets.top + 20 }}
        >
          {/* Background decorations */}
          <View className="absolute -top-10 -right-10 w-64 h-64 bg-cyan-500/10 rounded-full" />
          <View className="absolute top-20 -left-16 w-40 h-40 bg-purple-500/10 rounded-full" />

          {/* Header Top Bar */}
          <View className="flex-row justify-between items-center mb-10 z-10">
            <View className="flex-row items-center gap-2">
              <Text className="text-white font-extrabold text-xl tracking-wider">MYLONGAI</Text>
              <View className="bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                <Text className="text-emerald-400 text-[10px] font-bold tracking-widest">PRO</Text>
              </View>
            </View>
            
            <TouchableOpacity className="w-10 h-10 bg-[#1e293b] rounded-full items-center justify-center border border-slate-700/80 shadow-lg">
              <Activity size={18} color="#38bdf8" />
            </TouchableOpacity>
          </View>

          {/* Welcome Text */}
          <Text className="text-slate-400 text-base font-semibold mb-2 z-10">
            Xin chào, {user?.name || 'Sếp'}
          </Text>
          <Text className="text-white text-4xl font-extrabold leading-[44px] mb-6 z-10">
            Hệ thống AI đang bảo vệ mẻ bánh của bạn.
          </Text>

          {/* Icon Shield Decorative */}
          <View className="w-14 h-14 bg-cyan-400 rounded-full items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.4)] z-20">
            <Shield size={24} color="#0f172a" fill="#0f172a" />
          </View>
        </View>

        {/* ======================================================== */}
        {/* 🧩 HỆ THỐNG ĐIỀU HÀNH (Được bọc bởi DataWrapper)         */}
        {/* ======================================================== */}
        <View className="px-6 pt-8">
          <Text className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-4 ml-1">
            Bảng điều khiển
          </Text>

          {/* 🚀 SỬ DỤNG DATA WRAPPER TẠI ĐÂY */}
          <DataWrapper 
            isLoading={isLoading} 
            error={error} 
            onRetry={fetchDashboardData}
            loadingMessage="Đang đồng bộ dữ liệu AI..."
          >
            <View className="flex-row flex-wrap justify-between gap-y-4">
              
              {/* 1. Card Camera */}
              <TouchableOpacity 
                onPress={() => router.push('/(dashboard)/camera')}
                className="w-[48%] bg-[#1e293b] p-5 rounded-3xl border border-slate-700/50 shadow-lg"
              >
                <View className="flex-row justify-between items-start mb-4">
                  <View className="bg-cyan-500/20 p-3 rounded-2xl border border-cyan-500/20">
                    <Video size={24} color="#06b6d4" />
                  </View>
                  <ChevronRight size={18} color="#64748b" />
                </View>
                <Text className="text-white font-bold text-lg mb-1">Camera AI</Text>
                <View className="flex-row items-center gap-1.5">
                  <View className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <Text className="text-emerald-400 text-xs font-semibold">Đang hoạt động</Text>
                </View>
              </TouchableOpacity>

              {/* 2. Card Thời tiết */}
              <TouchableOpacity 
                onPress={() => router.push('/(dashboard)/weather')}
                className="w-[48%] bg-[#1e293b] p-5 rounded-3xl border border-slate-700/50 shadow-lg"
              >
                <View className="flex-row justify-between items-start mb-4">
                  <View className="bg-orange-500/20 p-3 rounded-2xl border border-orange-500/20">
                    <CloudSun size={24} color="#f97316" />
                  </View>
                  <ChevronRight size={18} color="#64748b" />
                </View>
                <Text className="text-white font-bold text-lg mb-1">Thời tiết</Text>
                <Text className="text-slate-400 text-xs font-semibold">Cập nhật lúc 19:08</Text>
              </TouchableOpacity>

              {/* 3. CARD LỊCH SỬ */}
             

              {/* 4. CARD AI VOICE ALERT */}
              <TouchableOpacity 
                onPress={() => router.push('/(dashboard)/voice' as any)}
                className="w-full bg-[#1e293b] p-5 rounded-3xl border border-slate-700/50 shadow-lg mt-1 relative overflow-hidden"
              >
                <View className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />
                <View className="flex-row justify-between items-start mb-4 z-10">
                  <View className="bg-indigo-500/20 p-3 rounded-2xl border border-indigo-500/30">
                    <Mic size={24} color="#818cf8" />
                  </View>
                  <ChevronRight size={18} color="#64748b" />
                </View>
                <Text className="text-white font-bold text-xl mb-1 z-10">Cảnh báo Giọng nói</Text>
                <Text className="text-slate-400 text-sm mb-4 z-10">AI Voice Assistant tự động</Text>
                <View className="flex-row items-center gap-3 z-10">
                  <View className="flex-row items-center gap-1.5 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/30">
                    <Volume2 size={14} color="#818cf8" />
                    <Text className="text-indigo-400 text-xs font-bold uppercase tracking-wider">Đang bật</Text>
                  </View>
                  <View className="flex-row items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                    <Radio size={14} color="#94a3b8" />
                    <Text className="text-slate-300 text-xs font-semibold">4 thông báo chờ</Text>
                  </View>
                </View>
              </TouchableOpacity>

            </View>
          </DataWrapper>
          
        </View>
      </ScrollView>
    </View>
  );
}