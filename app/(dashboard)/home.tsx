import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { 
  Shield, Video, CloudSun, Activity, 
  ChevronRight, Zap, BarChart3, Calendar, TrendingUp 
} from 'lucide-react-native';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-[#0f172a]">
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ======================================================== */}
        {/* 🚀 HERO HEADER TRÀN VIỀN                                 */}
        {/* ======================================================== */}
        <View 
          className="bg-[#151f32] rounded-b-[40px] px-6 pb-10 shadow-2xl overflow-hidden relative"
          style={{ paddingTop: insets.top + 20 }}
        >
          <View className="absolute -top-10 -right-10 w-64 h-64 bg-cyan-500/10 rounded-full" />
          <View className="absolute top-20 -left-16 w-40 h-40 bg-purple-500/10 rounded-full" />

          <View className="flex-row justify-between items-center mb-10 z-10">
            <View className="flex-row items-center gap-2">
              <Text className="text-white font-extrabold text-xl tracking-wider">MYLONGAI</Text>
              <View className="bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30">
                <Text className="text-purple-400 text-[10px] font-bold tracking-widest">DEMO</Text>
              </View>
            </View>
            
            <TouchableOpacity className="w-10 h-10 bg-[#1e293b] rounded-full items-center justify-center border border-slate-700/80 shadow-lg">
              <Activity size={18} color="#38bdf8" />
            </TouchableOpacity>
          </View>

          <Text className="text-slate-400 text-base font-semibold mb-2 z-10">
            Xin chào, {user?.name || 'Sếp'}
          </Text>
          <Text className="text-white text-4xl font-extrabold leading-[44px] mb-14 z-10">
            Hệ thống AI đang bảo vệ mẻ bánh của bạn.
          </Text>

          <TouchableOpacity activeOpacity={0.8} className="flex-row items-center z-10 group">
            <View className="w-14 h-14 bg-cyan-400 rounded-full items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.4)] z-20">
              <Shield size={24} color="#0f172a" fill="#0f172a" />
            </View>
            <View className="flex-1 h-[2px] bg-slate-700 -ml-4 z-10" />
            <View className="flex-row items-center gap-1 pl-4">
              <Zap size={14} color="#22d3ee" />
              <Text className="text-cyan-400 text-sm font-bold uppercase tracking-wider ml-1">
                Bắt đầu Demo
              </Text>
              <View className="flex-row ml-1">
                <ChevronRight size={16} color="#22d3ee" className="opacity-100" />
                <ChevronRight size={16} color="#22d3ee" className="-ml-3 opacity-60" />
                <ChevronRight size={16} color="#22d3ee" className="-ml-3 opacity-30" />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* ======================================================== */}
        {/* 🧩 HỆ THỐNG ĐIỀU HÀNH (Modules)                          */}
        {/* ======================================================== */}
        <View className="px-6 pt-8">
          <Text className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-4 ml-1">
            Bảng điều khiển
          </Text>

          <View className="flex-row flex-wrap justify-between gap-y-4">
            
            {/* 1. Card Camera (Một nửa) */}
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

            {/* 2. Card Thời tiết (Một nửa) */}
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

            {/* 🚀 3. CARD LỊCH SỬ (Trải dài Full-width) */}
            <TouchableOpacity 
              onPress={() => router.push('/(dashboard)/history')} // Sau này bạn tạo file history.tsx nhé
              className="w-full bg-[#1e293b] p-5 rounded-3xl border border-slate-700/50 shadow-lg mt-1"
            >
              <View className="flex-row justify-between items-start mb-4">
                <View className="bg-purple-500/20 p-3 rounded-2xl border border-purple-500/20">
                  <BarChart3 size={24} color="#c084fc" />
                </View>
                <ChevronRight size={18} color="#64748b" />
              </View>
              
              <Text className="text-white font-bold text-xl mb-3">Lịch sử & Báo cáo</Text>
              
              {/* Cụm tóm tắt số liệu (Mock data từ web của bạn) */}
              <View className="flex-row items-center gap-3">
                <View className="flex-row items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                  <Calendar size={14} color="#94a3b8" />
                  <Text className="text-slate-300 text-xs font-semibold">14 mẻ bánh</Text>
                </View>
                <View className="flex-row items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                  <TrendingUp size={14} color="#34d399" />
                  <Text className="text-emerald-400 text-xs font-bold">Thành công 71.4%</Text>
                </View>
              </View>
            </TouchableOpacity>

          </View>
        </View>

      </ScrollView>
    </View>
  );
}