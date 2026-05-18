import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  TrendingUp, TrendingDown, Activity, Clock, 
  ChevronLeft, BarChart3, PieChart
} from 'lucide-react-native';

// Import Component & Data
import { FarmSelector } from '@/src/components/dashboard/FarmSelector';
import { useFarm } from '@/src/contexts/FarmContext';
import { allAdminBatches, mockDailyStats } from '@/src/types/adminMockData';

const { width } = Dimensions.get('window');

// ==========================================
// 🚀 DỮ LIỆU TỰ ĐỊNH NGHĨA CHO BIỂU ĐỒ
// ==========================================
const performanceData = [
  { month: 'T1', batches: 245, success: 220, failed: 25, avgTime: 290 },
  { month: 'T2', batches: 280, success: 252, failed: 28, avgTime: 285 },
  { month: 'T3', batches: 310, success: 285, failed: 25, avgTime: 280 },
];

export default function AnalyticsScreen() {
  const router = useRouter();
  const { selectedFarmId } = useFarm();
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'performance'>('overview');

  // ==========================================
  // LỌC DỮ LIỆU & TÍNH TOÁN (Giống Web)
  // ==========================================
  const filteredBatches = selectedFarmId
    ? allAdminBatches.filter(b => b.farmId === selectedFarmId)
    : allAdminBatches;

  const totalBatches = filteredBatches.length;
  const completedBatches = filteredBatches.filter(b => b.status === 'completed').length;
  const failedBatches = filteredBatches.filter(b => b.status === 'failed').length;
  const successRate = totalBatches > 0 ? ((completedBatches / (completedBatches + failedBatches)) * 100).toFixed(1) : "0.0";
  const avgDryingTime = 285; // phút

  return (
    <SafeAreaView className="flex-1 bg-[#0f172a]" edges={['top']}>
      
      {/* ================= HEADER ================= */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-slate-800/50">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-[#1e293b] rounded-full flex items-center justify-center border border-slate-700">
            <ChevronLeft size={24} color="#f8fafc" />
          </TouchableOpacity>
          <View>
            <Text className="text-white text-xl font-bold">Phân tích</Text>
            <Text className="text-slate-400 text-xs mt-0.5">Dữ liệu và hiệu suất</Text>
          </View>
        </View>
        <FarmSelector />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        
        {/* ================= CHỈ SỐ TỔNG QUAN (KEY METRICS) ================= */}
        <View className="flex-row flex-wrap justify-between gap-y-4 mb-6">
          <View className="w-[48%] bg-[#1e293b] p-4 rounded-[24px] border border-slate-700/50 shadow-lg">
            <View className="w-10 h-10 bg-blue-500/10 rounded-xl items-center justify-center mb-3">
              <Activity size={18} color="#60a5fa" />
            </View>
            <Text className="text-slate-400 text-xs font-semibold mb-1">Tổng mẻ bánh</Text>
            <Text className="text-white text-2xl font-bold">{totalBatches}</Text>
            <View className="flex-row items-center mt-2">
              <TrendingUp size={12} color="#34d399" />
              <Text className="text-emerald-400 text-[10px] ml-1 font-bold">+12.5%</Text>
            </View>
          </View>

          <View className="w-[48%] bg-[#1e293b] p-4 rounded-[24px] border border-slate-700/50 shadow-lg">
            <View className="w-10 h-10 bg-emerald-500/10 rounded-xl items-center justify-center mb-3">
              <TrendingUp size={18} color="#34d399" />
            </View>
            <Text className="text-slate-400 text-xs font-semibold mb-1">Tỷ lệ thành công</Text>
            <Text className="text-emerald-400 text-2xl font-bold">{successRate}%</Text>
            <View className="flex-row items-center mt-2">
              <TrendingDown size={12} color="#f87171" />
              <Text className="text-red-400 text-[10px] ml-1 font-bold">-1.2%</Text>
            </View>
          </View>

          <View className="w-[48%] bg-[#1e293b] p-4 rounded-[24px] border border-slate-700/50 shadow-lg">
            <View className="w-10 h-10 bg-cyan-500/10 rounded-xl items-center justify-center mb-3">
              <Clock size={18} color="#22d3ee" />
            </View>
            <Text className="text-slate-400 text-xs font-semibold mb-1">Thời gian TB</Text>
            <Text className="text-white text-2xl font-bold">{avgDryingTime}p</Text>
            <View className="flex-row items-center mt-2">
              <TrendingDown size={12} color="#34d399" />
              <Text className="text-emerald-400 text-[10px] ml-1 font-bold">Nhanh hơn 8p</Text>
            </View>
          </View>

          <View className="w-[48%] bg-[#1e293b] p-4 rounded-[24px] border border-slate-700/50 shadow-lg">
            <View className="w-10 h-10 bg-rose-500/10 rounded-xl items-center justify-center mb-3">
              <TrendingDown size={18} color="#fb7185" />
            </View>
            <Text className="text-slate-400 text-xs font-semibold mb-1">Batch thất bại</Text>
            <Text className="text-rose-400 text-2xl font-bold">{failedBatches}</Text>
            <View className="flex-row items-center mt-2">
              <TrendingUp size={12} color="#f87171" />
              <Text className="text-red-400 text-[10px] ml-1 font-bold">+2 batch</Text>
            </View>
          </View>
        </View>

        {/* ================= THANH ĐIỀU HƯỚNG TABS ================= */}
        <View className="flex-row bg-[#0f172a] p-1 rounded-2xl border border-slate-800 mb-6">
          <TouchableOpacity 
            onPress={() => setActiveTab('overview')}
            className={`flex-1 py-2.5 rounded-xl items-center ${activeTab === 'overview' ? 'bg-blue-600' : ''}`}
          >
            <Text className={`font-bold text-xs ${activeTab === 'overview' ? 'text-white' : 'text-slate-400'}`}>
              Tổng quan
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveTab('progress')}
            className={`flex-1 py-2.5 rounded-xl items-center ${activeTab === 'progress' ? 'bg-blue-600' : ''}`}
          >
            <Text className={`font-bold text-xs ${activeTab === 'progress' ? 'text-white' : 'text-slate-400'}`}>
              Tiến độ
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveTab('performance')}
            className={`flex-1 py-2.5 rounded-xl items-center ${activeTab === 'performance' ? 'bg-blue-600' : ''}`}
          >
            <Text className={`font-bold text-xs ${activeTab === 'performance' ? 'text-white' : 'text-slate-400'}`}>
              Hiệu suất
            </Text>
          </TouchableOpacity>
        </View>

        {/* ================= NỘI DUNG TỪNG TAB ================= */}
        
        {/* TAB 1: TỔNG QUAN */}
        {activeTab === 'overview' && (
          <View className="space-y-6">
            
            {/* Phân bố trạng thái */}
            <View className="bg-[#1e293b] p-5 rounded-3xl border border-slate-700/50 shadow-lg">
              <View className="flex-row items-center gap-2 mb-6">
                <PieChart size={18} color="#c084fc" />
                <Text className="text-white font-bold text-lg">Phân bố trạng thái</Text>
              </View>

              <View className="space-y-4">
                <View>
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-slate-400 text-xs">Hoàn thành</Text>
                    <Text className="text-emerald-400 font-bold text-xs">{completedBatches} mẻ</Text>
                  </View>
                  <View className="w-full h-2.5 bg-[#0f172a] rounded-full overflow-hidden">
                    <View className="h-full bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" style={{ width: `${(completedBatches/totalBatches)*100}%` }} />
                  </View>
                </View>

                <View>
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-slate-400 text-xs">Đang phơi</Text>
                    <Text className="text-blue-400 font-bold text-xs">{totalBatches - completedBatches - failedBatches} mẻ</Text>
                  </View>
                  <View className="w-full h-2.5 bg-[#0f172a] rounded-full overflow-hidden">
                    <View className="h-full bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" style={{ width: `${((totalBatches - completedBatches - failedBatches)/totalBatches)*100}%` }} />
                  </View>
                </View>

                <View>
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-slate-400 text-xs">Thất bại</Text>
                    <Text className="text-rose-400 font-bold text-xs">{failedBatches} mẻ</Text>
                  </View>
                  <View className="w-full h-2.5 bg-[#0f172a] rounded-full overflow-hidden">
                    <View className="h-full bg-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.5)]" style={{ width: `${(failedBatches/totalBatches)*100}%` }} />
                  </View>
                </View>
              </View>
            </View>

            {/* Số lượng batch theo ngày */}
            <View className="bg-[#1e293b] p-5 rounded-3xl border border-slate-700/50 shadow-lg">
              <View className="flex-row items-center gap-2 mb-6">
                <BarChart3 size={18} color="#38bdf8" />
                <Text className="text-white font-bold text-lg">Số lượng batch 7 ngày qua</Text>
              </View>
              
              <View className="flex-row h-40 items-end border-b border-slate-700 pb-2 relative">
                <View className="absolute w-full border-t border-slate-800 border-dashed bottom-[33%]" />
                <View className="absolute w-full border-t border-slate-800 border-dashed bottom-[66%]" />

                <View className="flex-1 flex-row justify-between items-end px-2 z-10">
                  {mockDailyStats.slice(-7).map((item, idx) => (
                    <View key={idx} className="items-center flex-1 mx-1">
                      <View 
                        className="w-full bg-emerald-500 rounded-t-sm opacity-90" 
                        style={{ height: `${(item.completed / 15) * 100}%` }} 
                      />
                      <View 
                        className="w-full bg-rose-500 rounded-t-sm opacity-90 mt-0.5" 
                        style={{ height: `${(item.failed / 15) * 100}%` }} 
                      />
                      <Text className="text-slate-500 text-[9px] mt-2">
                        {new Date(item.date).getDate()}/{new Date(item.date).getMonth()+1}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              <View className="flex-row justify-center gap-4 mt-4">
                <View className="flex-row items-center gap-1.5">
                  <View className="w-2 h-2 rounded bg-emerald-500" />
                  <Text className="text-slate-400 text-xs">Hoàn thành</Text>
                </View>
                <View className="flex-row items-center gap-1.5">
                  <View className="w-2 h-2 rounded bg-rose-500" />
                  <Text className="text-slate-400 text-xs">Thất bại</Text>
                </View>
              </View>

            </View>
          </View>
        )}

        {/* TAB 2: TIẾN ĐỘ */}
        {activeTab === 'progress' && (
          <View className="space-y-4">
            <View className="bg-blue-500/10 p-5 rounded-3xl border border-blue-500/20 shadow-lg mb-2">
              <Text className="text-blue-400 font-bold text-lg mb-1">Batch #2024-001</Text>
              <View className="flex-row justify-between mb-2">
                <Text className="text-slate-400 text-sm">Tiến độ hiện tại</Text>
                <Text className="text-white font-bold">85%</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-slate-400 text-sm">Thời gian phơi</Text>
                <Text className="text-white font-bold">8h 30m</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-slate-400 text-sm">Tốc độ khô TB</Text>
                <Text className="text-blue-400 font-bold">10%/h</Text>
              </View>
            </View>

            <View className="bg-emerald-500/10 p-5 rounded-3xl border border-emerald-500/20 shadow-lg mb-2">
              <Text className="text-emerald-400 font-bold text-lg mb-1">Batch #2024-002</Text>
              <View className="flex-row justify-between mb-2">
                <Text className="text-slate-400 text-sm">Tiến độ hiện tại</Text>
                <Text className="text-white font-bold">65%</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-slate-400 text-sm">Thời gian phơi</Text>
                <Text className="text-white font-bold">7h 00m</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-slate-400 text-sm">Tốc độ khô TB</Text>
                <Text className="text-emerald-400 font-bold">9.3%/h</Text>
              </View>
            </View>

            <View className="bg-amber-500/10 p-5 rounded-3xl border border-amber-500/20 shadow-lg">
              <Text className="text-amber-400 font-bold text-lg mb-1">Batch #2024-003</Text>
              <View className="flex-row justify-between mb-2">
                <Text className="text-slate-400 text-sm">Tiến độ hiện tại</Text>
                <Text className="text-white font-bold">45%</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-slate-400 text-sm">Thời gian phơi</Text>
                <Text className="text-white font-bold">6h 30m</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-slate-400 text-sm">Tốc độ khô TB</Text>
                <Text className="text-amber-400 font-bold">6.9%/h</Text>
              </View>
            </View>
          </View>
        )}

        {/* TAB 3: HIỆU SUẤT */}
        {activeTab === 'performance' && (
          <View className="space-y-6">
            <View className="bg-[#1e293b] p-5 rounded-3xl border border-slate-700/50 shadow-lg">
              <Text className="text-white font-bold text-lg mb-6">Hiệu suất (Q1 2026)</Text>
              
              {performanceData.map((data, idx) => (
                <View key={idx} className={`py-4 ${idx !== performanceData.length - 1 ? 'border-b border-slate-800' : ''}`}>
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-white font-bold text-lg">Tháng {data.month.replace('T', '')}</Text>
                    <Text className="text-slate-400 text-xs">Tổng {data.batches} mẻ</Text>
                  </View>
                  
                  <View className="space-y-3">
                    <View>
                      <View className="flex-row justify-between mb-1">
                        <Text className="text-slate-500 text-xs">Thành công ({data.success})</Text>
                        <Text className="text-emerald-400 font-bold text-xs">{((data.success/data.batches)*100).toFixed(1)}%</Text>
                      </View>
                      <View className="w-full h-2 bg-[#0f172a] rounded-full overflow-hidden">
                        <View className="h-full bg-emerald-500 rounded-full" style={{ width: `${(data.success/data.batches)*100}%` }} />
                      </View>
                    </View>
                    
                    <View className="flex-row justify-between items-center bg-[#0f172a] p-3 rounded-xl border border-slate-800 mt-2">
                      <View className="flex-row items-center gap-2">
                        <Clock size={14} color="#60a5fa" />
                        <Text className="text-slate-400 text-xs">Thời gian TB / Mẻ</Text>
                      </View>
                      <Text className="text-blue-400 font-bold">{data.avgTime} phút</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}