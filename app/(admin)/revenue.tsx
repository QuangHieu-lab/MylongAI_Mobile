import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  TrendingUp, DollarSign, Users, 
  Calendar, Award, ChevronLeft, 
  CheckCircle2, Crown
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

// =========================================================================
// 🚀 DỮ LIỆU MOCK ĐỘC QUYỀN CHO GÓI PREMIUM 6 THÁNG
// =========================================================================
const PREMIUM_PRICE = 1200000; // Giá 1.2M cho 6 tháng

const mockPremiumMetrics = {
  today: PREMIUM_PRICE * 3,     // 3.6M (Hôm nay bán được 3 gói)
  week: PREMIUM_PRICE * 25,     // 30M
  month: PREMIUM_PRICE * 115,   // 138M
  totalSubscribers: 342,
  growth: { today: 12, week: 5, month: 18 }
};

const mockPremiumTransactions = [
  { id: 'tx1', user: 'Nguyễn Văn A', email: 'a.nguyen@farm.com', amount: PREMIUM_PRICE, date: '14/06/2026 09:30', status: 'success' },
  { id: 'tx2', user: 'Trần Thị B', email: 'b.tran@agri.com', amount: PREMIUM_PRICE, date: '14/06/2026 08:15', status: 'success' },
  { id: 'tx3', user: 'Lê Văn C', email: 'c.le@vietfarm.vn', amount: PREMIUM_PRICE, date: '13/06/2026 16:45', status: 'success' },
  { id: 'tx4', user: 'Phạm Thị D', email: 'd.pham@fresh.com', amount: PREMIUM_PRICE, date: '13/06/2026 10:20', status: 'success' },
  { id: 'tx5', user: 'Hoàng Văn E', email: 'e.hoang@eco.vn', amount: PREMIUM_PRICE, date: '12/06/2026 14:00', status: 'success' },
];

const mockDailyRevenue = [
  { date: '08/06', revenue: PREMIUM_PRICE * 2 },
  { date: '09/06', revenue: PREMIUM_PRICE * 3 },
  { date: '10/06', revenue: PREMIUM_PRICE * 1 },
  { date: '11/06', revenue: PREMIUM_PRICE * 5 },
  { date: '12/06', revenue: PREMIUM_PRICE * 4 },
  { date: '13/06', revenue: PREMIUM_PRICE * 8 },
  { date: '14/06', revenue: PREMIUM_PRICE * 3 },
];

const mockMonthlyRevenue = [
  { date: '01', revenue: PREMIUM_PRICE * 12 },
  { date: '02', revenue: PREMIUM_PRICE * 18 },
  { date: '03', revenue: PREMIUM_PRICE * 15 },
  { date: '04', revenue: PREMIUM_PRICE * 25 },
  { date: '05', revenue: PREMIUM_PRICE * 20 },
  { date: '06', revenue: PREMIUM_PRICE * 30 },
];

export default function RevenueScreen() {
  const router = useRouter();
  const [period, setPeriod] = useState<'7days' | '30days'>('7days');

  const revenueData = period === '7days' ? mockDailyRevenue : mockMonthlyRevenue;

  // Format Helpers (VD: 1.200.000 -> 1.2M)
  const formatShort = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    return `${(val / 1000).toFixed(0)}K`;
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
            <Text className="text-white text-xl font-bold">Doanh thu Premium</Text>
            <Text className="text-amber-400 text-xs mt-0.5 font-medium">Chỉ bán gói 6 tháng</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        
        {/* ================= TỔNG QUAN DOANH THU ================= */}
        <View className="flex-row flex-wrap justify-between gap-y-4 mb-6">
          <View className="w-[48%] bg-[#1e293b] p-4 rounded-[24px] border border-slate-700/50 shadow-lg">
            <View className="w-10 h-10 bg-amber-500/20 rounded-full items-center justify-center mb-2">
              <DollarSign size={18} color="#fbbf24" />
            </View>
            <Text className="text-slate-400 text-xs font-semibold mb-1">Doanh thu hôm nay</Text>
            <Text className="text-white text-2xl font-bold">{formatShort(mockPremiumMetrics.today)}</Text>
            <View className="flex-row items-center mt-1">
              <TrendingUp size={12} color="#34d399" />
              <Text className="text-emerald-400 text-[10px] ml-1 font-bold">+{mockPremiumMetrics.growth.today}% vs qua</Text>
            </View>
          </View>

          <View className="w-[48%] bg-[#1e293b] p-4 rounded-[24px] border border-slate-700/50 shadow-lg">
            <View className="w-10 h-10 bg-amber-500/20 rounded-full items-center justify-center mb-2">
              <Calendar size={18} color="#fbbf24" />
            </View>
            <Text className="text-slate-400 text-xs font-semibold mb-1">Doanh thu tuần này</Text>
            <Text className="text-white text-2xl font-bold">{formatShort(mockPremiumMetrics.week)}</Text>
            <View className="flex-row items-center mt-1">
              <TrendingUp size={12} color="#34d399" />
              <Text className="text-emerald-400 text-[10px] ml-1 font-bold">+{mockPremiumMetrics.growth.week}% vs tuần trước</Text>
            </View>
          </View>

          <View className="w-[48%] bg-[#1e293b] p-4 rounded-[24px] border border-slate-700/50 shadow-lg">
            <View className="w-10 h-10 bg-amber-500/20 rounded-full items-center justify-center mb-2">
              <Award size={18} color="#fbbf24" />
            </View>
            <Text className="text-slate-400 text-xs font-semibold mb-1">Doanh thu tháng này</Text>
            <Text className="text-white text-2xl font-bold">{formatShort(mockPremiumMetrics.month)}</Text>
            <View className="flex-row items-center mt-1">
              <TrendingUp size={12} color="#34d399" />
              <Text className="text-emerald-400 text-[10px] ml-1 font-bold">+{mockPremiumMetrics.growth.month}% vs tháng trước</Text>
            </View>
          </View>

          <View className="w-[48%] bg-[#1e293b] p-4 rounded-[24px] border border-slate-700/50 shadow-lg">
            <View className="w-10 h-10 bg-amber-500/20 rounded-full items-center justify-center mb-2">
              <Users size={18} color="#fbbf24" />
            </View>
            <Text className="text-slate-400 text-xs font-semibold mb-1">Tổng KH Premium</Text>
            <Text className="text-white text-2xl font-bold">{mockPremiumMetrics.totalSubscribers}</Text>
            <Text className="text-amber-400 text-[10px] mt-1 font-bold">Người dùng đang Active</Text>
          </View>
        </View>

        {/* ================= BIỂU ĐỒ DOANH THU ================= */}
        <View className="bg-[#1e293b] p-5 rounded-3xl mb-6 border border-slate-700/50 shadow-lg">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-white font-bold text-lg">Tăng trưởng doanh thu</Text>
            <View className="flex-row bg-[#0f172a] rounded-lg border border-slate-700 p-1">
              <TouchableOpacity 
                onPress={() => setPeriod('7days')}
                className={`px-3 py-1 rounded-md ${period === '7days' ? 'bg-amber-500' : ''}`}
              >
                <Text className={`text-xs font-bold ${period === '7days' ? 'text-[#0f172a]' : 'text-slate-400'}`}>7 ngày</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setPeriod('30days')}
                className={`px-3 py-1 rounded-md ${period === '30days' ? 'bg-amber-500' : ''}`}
              >
                <Text className={`text-xs font-bold ${period === '30days' ? 'text-[#0f172a]' : 'text-slate-400'}`}>30 ngày</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View className="flex-row h-40 items-end border-b border-slate-700 pb-2 relative">
            <View className="absolute w-full border-t border-slate-800 border-dashed bottom-[33%]" />
            <View className="absolute w-full border-t border-slate-800 border-dashed bottom-[66%]" />

            <View className="flex-1 flex-row justify-between items-end px-2 z-10">
              {revenueData.slice(-7).map((item, idx) => {
                const heightPercent = Math.min((item.revenue / (period === '7days' ? 10000000 : 40000000)) * 100, 100);
                
                return (
                  <View key={idx} className="items-center">
                    <View 
                      className="w-7 bg-amber-400 rounded-t-md shadow-[0_0_10px_rgba(251,191,36,0.5)]" 
                      style={{ height: `${heightPercent}%` }} 
                    />
                    <Text className="text-slate-500 text-[9px] mt-2">
                      {period === '7days' ? item.date : `T${item.date}`}
                    </Text>
                  </View>
                )
              })}
            </View>
          </View>
        </View>

        {/* ================= DANH SÁCH KHÁCH HÀNG MUA GÓI PREMIUM ================= */}
        <View className="flex-row justify-between items-end mb-4 mt-2">
          <Text className="text-white text-lg font-bold">Giao dịch mới nhất</Text>
          <Text className="text-slate-400 text-xs font-medium">Chỉ gói 6 Tháng</Text>
        </View>
        
        <View className="space-y-4 mb-8">
          {mockPremiumTransactions.map(tx => (
            <View key={tx.id} className="bg-[#1e293b] p-4 rounded-2xl border border-slate-700/50 flex-row justify-between items-center mb-3">
              <View className="flex-1">
                <View className="flex-row items-center gap-2 mb-1">
                  <Text className="text-white font-bold text-base">{tx.user}</Text>
                  
                  {/* Badge Gói Premium màu Gold */}
                  <View className="flex-row items-center gap-1 bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded">
                    <Crown size={10} color="#fbbf24" />
                    <Text className="text-amber-400 text-[10px] font-bold uppercase tracking-wider">Premium</Text>
                  </View>
                </View>
                <Text className="text-slate-400 text-xs mb-1">{tx.email}</Text>
                <Text className="text-slate-500 text-[10px]">{tx.date}</Text>
              </View>

              <View className="items-end pl-2">
                <Text className="text-amber-400 font-bold text-lg">+{formatShort(tx.amount)}</Text>
                <Text className="text-slate-400 text-[10px] font-medium mb-1">Gói 6 Tháng</Text>
                <View className="flex-row items-center gap-1">
                  <CheckCircle2 size={12} color="#34d399" />
                  <Text className="text-emerald-400 text-[10px] font-bold">Đã thanh toán</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}