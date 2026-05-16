import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  TrendingUp, DollarSign, ShoppingCart, 
  Calendar, Award, ChevronLeft, 
  CheckCircle2, Package
} from 'lucide-react-native';

// Import Contexts và Components
import { useFarm } from '@/src/contexts/FarmContext';
import { FarmSelector } from '@/src/components/dashboard/FarmSelector';

// 👇 1. IMPORT TỪ FILE MOCK DATA 
import { 
  mockRevenueMetrics, mockBatchRevenue, mockDailyRevenue, 
  mockMonthlyRevenue, mockYearOverYearRevenue, yearOverYearSummary 
} from '@/src/types/adminMockData';

const { width } = Dimensions.get('window');

export default function RevenueScreen() {
  const router = useRouter();
  const { selectedFarmId } = useFarm();
  const [period, setPeriod] = useState<'7days' | '30days'>('7days');

  // Lọc doanh thu theo Farm đang chọn (Giống logic bên Web)
  const filteredBatchRevenue = useMemo(() => {
    return selectedFarmId 
      ? mockBatchRevenue.filter(b => b.farmId === selectedFarmId)
      : mockBatchRevenue;
  }, [selectedFarmId]);

  // Tính lại Metrics nếu đổi Farm
  const metrics = useMemo(() => {
    if (!selectedFarmId) return mockRevenueMetrics;
    
    const totalRev = filteredBatchRevenue.filter(b => b.status === 'sold').reduce((sum, b) => sum + b.totalRevenue, 0);
    const soldBatches = filteredBatchRevenue.filter(b => b.status === 'sold').length;
    
    return {
      ...mockRevenueMetrics,
      today: totalRev * 0.15,
      week: totalRev * 0.35,
      month: totalRev,
      avgPerBatch: soldBatches > 0 ? totalRev / soldBatches : 0,
    };
  }, [selectedFarmId, filteredBatchRevenue]);

  const revenueData = period === '7days' ? mockDailyRevenue : mockMonthlyRevenue;

  // Format Helpers
  const formatShort = (val: number) => val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : `${(val / 1000).toFixed(0)}K`;

  // UI Helpers
  const getQualityBadge = (grade: string) => {
    switch (grade) {
      case 'A': return { label: 'Loại A', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' };
      case 'B': return { label: 'Loại B', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' };
      case 'C': return { label: 'Loại C', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' };
      default: return { label: 'Lỗi', bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' };
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0f172a]" edges={['top']}>
      
      {/* ================= HEADER ================= */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-slate-800/50">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-[#1e293b] rounded-full flex items-center justify-center border border-slate-700">
            <ChevronLeft size={24} color="#f8fafc" />
          </TouchableOpacity>
          <View>
            <Text className="text-white text-xl font-bold">Doanh thu</Text>
            <Text className="text-slate-400 text-xs mt-0.5">Hiệu quả kinh doanh</Text>
          </View>
        </View>
        <FarmSelector />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        
        {/* ================= TỔNG QUAN DOANH THU ================= */}
        <View className="flex-row flex-wrap justify-between gap-y-4 mb-6">
          <View className="w-[48%] bg-[#1e293b] p-4 rounded-[24px] border border-slate-700/50 shadow-lg">
            <View className="w-10 h-10 bg-cyan-500/20 rounded-full items-center justify-center mb-2">
              <DollarSign size={18} color="#22d3ee" />
            </View>
            <Text className="text-slate-400 text-xs font-semibold mb-1">Hôm nay</Text>
            <Text className="text-white text-2xl font-bold">{formatShort(metrics.today)}</Text>
            <View className="flex-row items-center mt-1">
              <TrendingUp size={12} color="#34d399" />
              <Text className="text-emerald-400 text-[10px] ml-1 font-bold">+{metrics.growth.today}% vs qua</Text>
            </View>
          </View>

          <View className="w-[48%] bg-[#1e293b] p-4 rounded-[24px] border border-slate-700/50 shadow-lg">
            <View className="w-10 h-10 bg-blue-500/20 rounded-full items-center justify-center mb-2">
              <ShoppingCart size={18} color="#60a5fa" />
            </View>
            <Text className="text-slate-400 text-xs font-semibold mb-1">Tuần này</Text>
            <Text className="text-white text-2xl font-bold">{formatShort(metrics.week)}</Text>
            <View className="flex-row items-center mt-1">
              <TrendingUp size={12} color="#34d399" />
              <Text className="text-emerald-400 text-[10px] ml-1 font-bold">+{metrics.growth.week}% vs trước</Text>
            </View>
          </View>

          <View className="w-[48%] bg-[#1e293b] p-4 rounded-[24px] border border-slate-700/50 shadow-lg">
            <View className="w-10 h-10 bg-emerald-500/20 rounded-full items-center justify-center mb-2">
              <Calendar size={18} color="#34d399" />
            </View>
            <Text className="text-slate-400 text-xs font-semibold mb-1">Tháng này</Text>
            <Text className="text-white text-2xl font-bold">{formatShort(metrics.month)}</Text>
            <View className="flex-row items-center mt-1">
              <TrendingUp size={12} color="#34d399" />
              <Text className="text-emerald-400 text-[10px] ml-1 font-bold">+{metrics.growth.month}% vs trước</Text>
            </View>
          </View>

          <View className="w-[48%] bg-[#1e293b] p-4 rounded-[24px] border border-slate-700/50 shadow-lg">
            <View className="w-10 h-10 bg-purple-500/20 rounded-full items-center justify-center mb-2">
              <Award size={18} color="#c084fc" />
            </View>
            <Text className="text-slate-400 text-xs font-semibold mb-1">Giá trị TB/Mẻ</Text>
            <Text className="text-white text-2xl font-bold">{formatShort(metrics.avgPerBatch)}</Text>
            <Text className="text-purple-400 text-[10px] mt-1 font-bold">{metrics.conversionRate}% chuyển đổi</Text>
          </View>
        </View>

        {/* ================= BIỂU ĐỒ DOANH THU ================= */}
        <View className="bg-[#1e293b] p-5 rounded-3xl mb-6 border border-slate-700/50 shadow-lg">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-white font-bold text-lg">Biểu đồ doanh thu</Text>
            <View className="flex-row bg-[#0f172a] rounded-lg border border-slate-700 p-1">
              <TouchableOpacity 
                onPress={() => setPeriod('7days')}
                className={`px-3 py-1 rounded-md ${period === '7days' ? 'bg-cyan-500' : ''}`}
              >
                <Text className={`text-xs font-bold ${period === '7days' ? 'text-[#0f172a]' : 'text-slate-400'}`}>7 ngày</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setPeriod('30days')}
                className={`px-3 py-1 rounded-md ${period === '30days' ? 'bg-cyan-500' : ''}`}
              >
                <Text className={`text-xs font-bold ${period === '30days' ? 'text-[#0f172a]' : 'text-slate-400'}`}>30 ngày</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Custom Bar Chart - Dynamic based on period */}
          <View className="flex-row h-40 items-end border-b border-slate-700 pb-2 relative">
            <View className="absolute w-full border-t border-slate-800 border-dashed bottom-[33%]" />
            <View className="absolute w-full border-t border-slate-800 border-dashed bottom-[66%]" />

            <View className="flex-1 flex-row justify-between items-end px-2 z-10">
              {revenueData.slice(-7).map((item, idx) => {
                // Tạo số liệu phần trăm ảo để vẽ biểu đồ dựa vào doanh thu
                const heightPercent = Math.min((item.revenue / (period === '7days' ? 10000000 : 15000000)) * 100, 100);
                
                return (
                  <View key={idx} className="items-center">
                    <View 
                      className="w-7 bg-cyan-400 rounded-t-md shadow-[0_0_10px_rgba(34,211,238,0.5)]" 
                      style={{ height: `${heightPercent}%` }} 
                    />
                    <Text className="text-slate-500 text-[9px] mt-2">
                      {period === '7days' ? item.date : new Date(item.date).getDate()}
                    </Text>
                  </View>
                )
              })}
            </View>
          </View>
        </View>

        {/* ================= DANH SÁCH THEO MẺ BÁNH ================= */}
        <Text className="text-white text-lg font-bold mb-4 mt-2">Doanh thu theo mẻ bánh</Text>
        <View className="space-y-4 mb-8">
          {filteredBatchRevenue.length > 0 ? filteredBatchRevenue.map(batch => {
            const quality = getQualityBadge(batch.qualityGrade);
            return (
              <View key={batch.id} className="bg-[#1e293b] p-4 rounded-2xl border border-slate-700/50 flex-row justify-between items-center mb-3">
                <View>
                  <View className="flex-row items-center gap-2 mb-1">
                    <Text className="text-white font-bold text-base">{batch.batchName}</Text>
                    <View className={`${quality.bg} border ${quality.border} px-2 py-0.5 rounded`}>
                      <Text className={`${quality.text} text-[10px] font-bold`}>{quality.label}</Text>
                    </View>
                  </View>
                  <View className="flex-row items-center gap-3">
                    <Text className="text-slate-400 text-xs">{batch.quantity} kg</Text>
                    <Text className="text-slate-500 text-xs">•</Text>
                    <Text className="text-slate-400 text-xs">{formatShort(batch.pricePerKg)}/kg</Text>
                  </View>
                </View>

                <View className="items-end">
                  <Text className="text-cyan-400 font-bold text-lg">{formatShort(batch.totalRevenue)}</Text>
                  {batch.status === 'sold' ? (
                    <View className="flex-row items-center gap-1 mt-1">
                      <CheckCircle2 size={12} color="#34d399" />
                      <Text className="text-emerald-400 text-[10px] font-semibold">Đã bán</Text>
                    </View>
                  ) : (
                    <View className="flex-row items-center gap-1 mt-1">
                      <Package size={12} color="#fbbf24" />
                      <Text className="text-amber-400 text-[10px] font-semibold">Trong kho</Text>
                    </View>
                  )}
                </View>
              </View>
            )
          }) : (
             <Text className="text-slate-500 text-center py-4">Không có mẻ bánh nào cho cơ sở này.</Text>
          )}
        </View>

        {/* ================= SO SÁNH YOY ================= */}
        <View className="mb-4">
          <Text className="text-white text-lg font-bold mb-1">So sánh YoY (2026 vs 2025)</Text>
          <Text className="text-slate-400 text-xs mb-4">Tăng trưởng theo từng tháng</Text>
        </View>

        <View className="bg-[#1e293b] p-5 rounded-3xl border border-slate-700/50 shadow-lg">
          {mockYearOverYearRevenue.map((item, idx) => {
            const isCompleted = item.currentYear > 0;
            // Tính phần trăm ảo cho thanh ngang (so với max 300 triệu)
            const pct2025 = (item.previousYear / 300000000) * 100;
            const pct2026 = isCompleted ? (item.currentYear / 300000000) * 100 : 0;

            return (
              <View key={idx} className={`py-4 ${idx !== mockYearOverYearRevenue.length - 1 ? 'border-b border-slate-800' : ''} ${!isCompleted ? 'opacity-40' : ''}`}>
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-white font-bold">{item.month}</Text>
                  {isCompleted && (
                    <View className="flex-row items-center bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                      <TrendingUp size={12} color="#34d399" />
                      <Text className="text-emerald-400 text-[10px] font-bold ml-1">+{item.growth.toFixed(1)}%</Text>
                    </View>
                  )}
                </View>
                
                <View className="space-y-2 mb-2">
                  <View className="flex-row items-center gap-3">
                    <Text className="text-slate-500 text-[10px] w-8">2025</Text>
                    <View className="flex-1 h-3 bg-[#0f172a] rounded-full overflow-hidden">
                      <View className="h-full bg-slate-500 rounded-full" style={{ width: `${pct2025}%` }} />
                    </View>
                  </View>
                  {isCompleted && (
                    <View className="flex-row items-center gap-3 mt-2">
                      <Text className="text-blue-400 font-bold text-[10px] w-8">2026</Text>
                      <View className="flex-1 h-3 bg-[#0f172a] rounded-full overflow-hidden">
                        <View className="h-full bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" style={{ width: `${pct2026}%` }} />
                      </View>
                    </View>
                  )}
                </View>
              </View>
            )
          })}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}