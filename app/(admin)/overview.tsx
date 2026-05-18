import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  TrendingUp, TrendingDown, Activity, CheckCircle2, 
  XCircle, Clock, Camera, AlertTriangle, DollarSign, ChevronLeft, Bell
} from 'lucide-react-native';

// 👇 1. IMPORT TỪ FILE MOCK DATA DÙNG CHUNG
import { 
  mockSystemMetrics as metrics, 
  mockRevenueMetrics as revenueMetrics, 
  mockRiskAlerts as mockAlerts 
} from '@/src/types/adminMockData';

const { width } = Dimensions.get('window');

export default function AdminOverviewScreen() {
  const router = useRouter();

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}tr`;
    return `${(value / 1000).toFixed(0)}k`;
  };

  // Chỉ lấy các cảnh báo đang active (Giống logic bên Web)
  const activeAlerts = mockAlerts.filter(a => a.status === 'active').slice(0, 5);

  return (
    <SafeAreaView className="flex-1 bg-[#0f172a]" edges={['top']}>
      
      {/* ================= HEADER ================= */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-slate-800/50">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-[#1e293b] rounded-full flex items-center justify-center border border-slate-700">
            <ChevronLeft size={24} color="#f8fafc" />
          </TouchableOpacity>
          <View>
            <Text className="text-white text-xl font-bold">Tổng quan hệ thống</Text>
            <Text className="text-slate-400 text-xs mt-0.5">Admin Dashboard</Text>
          </View>
        </View>
        <TouchableOpacity className="relative w-10 h-10 bg-[#1e293b] rounded-full flex items-center justify-center border border-slate-700">
          <Bell size={20} color="#94a3b8" />
          {activeAlerts.length > 0 && (
            <View className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-[#0f172a]" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        
        {/* ================= STATS GRID 2x2 ================= */}
        <View className="flex-row flex-wrap justify-between gap-y-4 mb-6">
          {/* 1. Tổng mẻ bánh */}
          <View className="w-[48%] bg-[#1e293b] p-4 rounded-[24px] border border-slate-700/50 shadow-lg">
            <View className="flex-row items-start justify-between mb-3">
              <View className="w-10 h-10 bg-blue-500/20 rounded-full items-center justify-center">
                <Activity size={18} color="#60a5fa" />
              </View>
            </View>
            <Text className="text-slate-400 text-xs font-semibold mb-1">Mẻ bánh hôm nay</Text>
            <Text className="text-white text-3xl font-extrabold">{metrics.totalBatchesToday}</Text>
            <View className="flex-row items-center mt-1">
              <TrendingUp size={12} color="#34d399" />
              <Text className="text-emerald-400 text-[10px] ml-1 font-bold">+15% vs hôm qua</Text>
            </View>
          </View>

          {/* 2. Tỷ lệ đạt chuẩn */}
          <View className="w-[48%] bg-[#1e293b] p-4 rounded-[24px] border border-slate-700/50 shadow-lg">
            <View className="flex-row items-start justify-between mb-3">
              <View className="w-10 h-10 bg-emerald-500/20 rounded-full items-center justify-center">
                <CheckCircle2 size={18} color="#34d399" />
              </View>
            </View>
            <Text className="text-slate-400 text-xs font-semibold mb-1">Tỷ lệ đạt chuẩn</Text>
            <Text className="text-white text-3xl font-extrabold">{metrics.successRate}%</Text>
            <View className="flex-row items-center mt-1">
              <TrendingDown size={12} color="#f87171" />
              <Text className="text-red-400 text-[10px] ml-1 font-bold">-2.3% tuần trước</Text>
            </View>
          </View>

          {/* 3. Đang hoạt động */}
          <View className="w-[48%] bg-[#1e293b] p-4 rounded-[24px] border border-slate-700/50 shadow-lg">
            <View className="flex-row items-start justify-between mb-3">
              <View className="w-10 h-10 bg-cyan-500/20 rounded-full items-center justify-center">
                <Clock size={18} color="#22d3ee" />
              </View>
            </View>
            <Text className="text-slate-400 text-xs font-semibold mb-1">Đang hoạt động</Text>
            <Text className="text-white text-3xl font-extrabold">{metrics.activeBatches}</Text>
            <Text className="text-cyan-400 text-[10px] mt-1 font-bold">TB {metrics.avgDryingTime} phút/mẻ</Text>
          </View>

          {/* 4. Camera Online */}
          <View className="w-[48%] bg-[#1e293b] p-4 rounded-[24px] border border-slate-700/50 shadow-lg">
            <View className="flex-row items-start justify-between mb-3">
              <View className="w-10 h-10 bg-purple-500/20 rounded-full items-center justify-center">
                <Camera size={18} color="#c084fc" />
              </View>
            </View>
            <Text className="text-slate-400 text-xs font-semibold mb-1">Camera Online</Text>
            <Text className="text-white text-3xl font-extrabold">{metrics.camerasOnline}/{metrics.totalCameras}</Text>
            <Text className="text-amber-400 text-[10px] mt-1 font-bold">1 camera offline</Text>
          </View>
        </View>

        {/* ================= DOANH THU ================= */}
        <View className="mb-6">
          <View className="flex-row items-center gap-2 mb-3">
            <DollarSign size={18} color="#38bdf8" />
            <Text className="text-white font-bold text-lg">Doanh thu dự kiến</Text>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5 px-5">
            <View className="flex-row gap-4">
              <View className="w-36 bg-cyan-500/10 p-4 rounded-2xl border border-cyan-500/20">
                <Text className="text-cyan-400 text-xs font-semibold mb-1">Hôm nay</Text>
                <Text className="text-white text-xl font-bold">{formatCurrency(revenueMetrics.today)}</Text>
              </View>
              <View className="w-36 bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20">
                <Text className="text-blue-400 text-xs font-semibold mb-1">Tuần này</Text>
                <Text className="text-white text-xl font-bold">{formatCurrency(revenueMetrics.week)}</Text>
              </View>
              <View className="w-36 bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 mr-5">
                <Text className="text-emerald-400 text-xs font-semibold mb-1">Tháng này</Text>
                <Text className="text-white text-xl font-bold">{formatCurrency(revenueMetrics.month)}</Text>
              </View>
            </View>
          </ScrollView>
        </View>

        {/* ================= BIỂU ĐỒ (Tỷ lệ thành công 7 ngày) ================= */}
        <View className="bg-[#1e293b] p-5 rounded-3xl mb-6 border border-slate-700/50 shadow-lg">
          <Text className="text-white font-bold text-lg mb-6">Tỷ lệ thành công 7 ngày</Text>
          <View className="flex-row h-40 items-end border-b border-slate-700 pb-2 relative">
            <View className="absolute w-full border-t border-slate-800 border-dashed bottom-[25%]" />
            <View className="absolute w-full border-t border-slate-800 border-dashed bottom-[50%]" />
            <View className="absolute w-full border-t border-slate-800 border-dashed bottom-[75%]" />
            <View className="absolute w-full border-t border-slate-800 border-dashed bottom-[100%]" />

            <View className="flex-1 flex-row justify-between items-end px-2 z-10">
              {[100, 85, 88, 86, 92, 88, 86].map((val, idx) => (
                <View key={idx} className="items-center">
                  <View 
                    className="w-6 bg-emerald-500 rounded-t-sm shadow-[0_0_10px_rgba(16,185,129,0.3)]" 
                    style={{ height: `${val}%` }} 
                  />
                  <Text className="text-slate-500 text-[9px] mt-2">{12 + idx}/03</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ================= CẢNH BÁO GẦN ĐÂY ================= */}
        <View className="bg-[#1e293b] p-5 rounded-3xl border border-slate-700/50 shadow-lg mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white font-bold text-lg">Cảnh báo gần đây</Text>
            <View className="bg-rose-500/20 px-2 py-1 rounded-md border border-rose-500/30">
              <Text className="text-rose-400 text-[10px] font-bold">{activeAlerts.length} cảnh báo</Text>
            </View>
          </View>

          {activeAlerts.map(alert => (
            <View key={alert.id} className="flex-row gap-3 bg-[#0f172a] p-3 rounded-2xl border border-slate-800 mb-3">
              <View className={`w-10 h-10 rounded-xl items-center justify-center ${alert.severity === 'critical' ? 'bg-rose-500/20' : 'bg-orange-500/20'}`}>
                <AlertTriangle size={18} color={alert.severity === 'critical' ? '#fb7185' : '#fbbf24'} />
              </View>
              <View className="flex-1">
                <View className="flex-row justify-between">
                  <Text className="text-white font-bold">{alert.batchName}</Text>
                  <Text className="text-slate-500 text-xs">
                    {new Date(alert.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <Text className="text-slate-400 text-xs mt-1">{alert.message}</Text>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}