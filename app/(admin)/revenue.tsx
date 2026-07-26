import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, 
  ActivityIndicator, RefreshControl 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  TrendingUp, DollarSign, Users, 
  Calendar, Award, ChevronLeft, 
  CheckCircle2, Crown, Activity, XCircle, Clock, Hash
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';

// 🚀 IMPORT API 
import { paymentApi } from '@/src/services/api';

export default function RevenueScreen() {
  const router = useRouter();
  const [period, setPeriod] = useState<'7days' | '30days'>('7days');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // States dữ liệu thật
  const [transactions, setTransactions] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    today: 0,
    week: 0,
    month: 0,
    totalSubscribers: 0
  });

  // =========================================================================
  // 1️⃣ LẤY DỮ LIỆU ĐƠN HÀNG THẬT TỪ API
  // =========================================================================
  const fetchData = async () => {
    try {
      const buyersRes: any = await paymentApi.getBuyers();
      
      let buyersList = [];
      if (buyersRes?.data?.data && Array.isArray(buyersRes.data.data)) {
          buyersList = buyersRes.data.data;
      } else if (buyersRes?.data && Array.isArray(buyersRes.data)) {
          buyersList = buyersRes.data;
      } else if (Array.isArray(buyersRes)) {
          buyersList = buyersRes;
      }

      if (buyersList.length > 0) {
        const sortedData = buyersList.sort((a: any, b: any) => {
          const dateA = new Date(a.paid_at || a.created_at || 0).getTime();
          const dateB = new Date(b.paid_at || b.created_at || 0).getTime();
          return dateB - dateA;
        });

        // Map dữ liệu
        const mappedTxs = sortedData.map((s: any) => {
          const rawDate = new Date(s.paid_at || s.created_at || new Date());
          return {
            id: s.order_code || Math.random().toString(),
            orderCode: s.order_code || 'N/A',
            user: s.full_name || 'Khách hàng', 
            email: s.email || 'Chưa cập nhật',        
            amount: Number(s.amount) || 0,
            rawDate: rawDate, 
            date: rawDate.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }),
            status: s.status || 'pending'
          }
        });

        setTransactions(mappedTxs);

        const successfulTxs = mappedTxs.filter((tx: any) => tx.status === 'paid' || tx.status === 'success');
        
        // 🚀 TỰ ĐỘNG TÍNH TOÁN DOANH THU TRÊN FRONTEND TỪ ĐƠN HÀNG THỰC TẾ
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const startOfWeek = startOfToday - (7 * 24 * 60 * 60 * 1000); 
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

        let calcToday = 0;
        let calcWeek = 0;
        let calcMonth = 0;

        successfulTxs.forEach((tx: any) => {
          const txTime = tx.rawDate.getTime();
          if (txTime >= startOfToday) calcToday += tx.amount;
          if (txTime >= startOfWeek) calcWeek += tx.amount;
          if (txTime >= startOfMonth) calcMonth += tx.amount;
        });

        setMetrics({
          today: calcToday,
          week: calcWeek,
          month: calcMonth,
          totalSubscribers: successfulTxs.length, 
        });
      } else {
        setTransactions([]);
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể tải dữ liệu doanh thu.' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // =========================================================================
  // 2️⃣ TÍNH TOÁN BIỂU ĐỒ ĐỘNG BẰNG USEMEMO
  // =========================================================================
  const chartData = useMemo(() => {
    const daysToLookBack = period === '7days' ? 7 : 30;
    const data: any[] = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0); 

    for (let i = daysToLookBack - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      data.push({
        timestamp: d.getTime(),
        dateStr: `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`,
        revenue: 0,
      });
    }

    transactions.forEach((tx) => {
      if (tx.status !== 'paid' && tx.status !== 'success') return;
      const txDate = new Date(tx.rawDate);
      txDate.setHours(0, 0, 0, 0); 
      
      const match = data.find(item => item.timestamp === txDate.getTime());
      if (match) {
        match.revenue += tx.amount;
      }
    });

    return data;
  }, [transactions, period]);

  // Tìm đỉnh doanh thu cao nhất để vẽ chiều cao cột %
  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 100000); 

  // =========================================================================
  // 3️⃣ FORMAT HELPERS
  // =========================================================================
  const formatShort = (val: number) => {
    if (val === 0) return "0đ";
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    return `${(val / 1000).toFixed(0)}K`;
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(val);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0f172a]" edges={['top']}>
      
      {/* HEADER */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-slate-800/50">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-[#1e293b] rounded-full flex items-center justify-center border border-slate-700">
            <ChevronLeft size={24} color="#f8fafc" />
          </TouchableOpacity>
          <View>
            <Text className="text-white text-xl font-bold">Doanh thu Premium</Text>
            <Text className="text-cyan-400 text-xs mt-0.5 font-medium">Lịch sử người dùng đăng ký</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22d3ee" />}
      >
        
        {loading ? (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator size="large" color="#22d3ee" />
            <Text className="text-slate-400 mt-4 font-medium">Đang đồng bộ dữ liệu giao dịch...</Text>
          </View>
        ) : (
          <>
            {/* TỔNG QUAN DOANH THU */}
            <View className="flex-row flex-wrap justify-between gap-y-4 mb-6">
              <View className="w-[48%] bg-[#1e293b] p-4 rounded-[24px] border border-slate-700/50 shadow-lg">
                <View className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-full items-center justify-center mb-2">
                  <DollarSign size={18} color="#34d399" />
                </View>
                <Text className="text-slate-400 text-xs font-semibold mb-1">Doanh thu hôm nay</Text>
                <Text className="text-white text-2xl font-bold">{formatShort(metrics.today)}</Text>
              </View>

              <View className="w-[48%] bg-[#1e293b] p-4 rounded-[24px] border border-slate-700/50 shadow-lg">
                <View className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/20 rounded-full items-center justify-center mb-2">
                  <Calendar size={18} color="#22d3ee" />
                </View>
                <Text className="text-slate-400 text-xs font-semibold mb-1">Doanh thu tuần này</Text>
                <Text className="text-white text-2xl font-bold">{formatShort(metrics.week)}</Text>
              </View>

              <View className="w-[48%] bg-[#1e293b] p-4 rounded-[24px] border border-slate-700/50 shadow-lg">
                <View className="w-10 h-10 bg-purple-500/10 border border-purple-500/20 rounded-full items-center justify-center mb-2">
                  <TrendingUp size={18} color="#c084fc" />
                </View>
                <Text className="text-slate-400 text-xs font-semibold mb-1">Doanh thu tháng này</Text>
                <Text className="text-white text-2xl font-bold">{formatShort(metrics.month)}</Text>
              </View>

              <View className="w-[48%] bg-[#1e293b] p-4 rounded-[24px] border border-slate-700/50 shadow-lg">
                <View className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-full items-center justify-center mb-2">
                  <Users size={18} color="#fbbf24" />
                </View>
                <Text className="text-slate-400 text-xs font-semibold mb-1">Tổng KH Premium</Text>
                <Text className="text-white text-2xl font-bold">{metrics.totalSubscribers}</Text>
              </View>
            </View>

            {/* BIỂU ĐỒ DOANH THU ĐỘNG */}
            <View className="bg-[#1e293b] p-5 rounded-3xl mb-6 border border-slate-700/50 shadow-lg">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-white font-bold text-lg">Tăng trưởng</Text>
                <View className="flex-row bg-[#0f172a] rounded-lg border border-slate-700 p-1">
                  <TouchableOpacity 
                    onPress={() => setPeriod('7days')}
                    className={`px-3 py-1 rounded-md ${period === '7days' ? 'bg-cyan-500' : ''}`}
                  >
                    <Text className={`text-xs font-bold ${period === '7days' ? 'text-white' : 'text-slate-400'}`}>7 ngày</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => setPeriod('30days')}
                    className={`px-3 py-1 rounded-md ${period === '30days' ? 'bg-cyan-500' : ''}`}
                  >
                    <Text className={`text-xs font-bold ${period === '30days' ? 'text-white' : 'text-slate-400'}`}>30 ngày</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View className="flex-row h-40 items-end border-b border-slate-700 pb-2 relative">
                <View className="absolute w-full border-t border-slate-800 border-dashed bottom-[33%]" />
                <View className="absolute w-full border-t border-slate-800 border-dashed bottom-[66%]" />

                <View className="flex-1 flex-row justify-between items-end px-2 z-10">
                  {chartData.slice(period === '7days' ? -7 : -15).map((item, idx) => {
                    // Tính % chiều cao so với ngày cao nhất
                    const heightPercent = Math.max(Math.min((item.revenue / maxRevenue) * 100, 100), 2); 
                    
                    return (
                      <View key={idx} className="items-center flex-1">
                        <View 
                          className="w-4 sm:w-6 bg-cyan-400 rounded-t-sm shadow-[0_0_10px_rgba(34,211,238,0.5)]" 
                          style={{ height: `${heightPercent}%` }} 
                        />
                        <Text className="text-slate-500 text-[8px] mt-2">
                          {period === '7days' ? item.dateStr : (idx % 2 === 0 ? item.dateStr : '')}
                        </Text>
                      </View>
                    )
                  })}
                </View>
              </View>
            </View>

            {/* DANH SÁCH GIAO DỊCH */}
            <View className="flex-row justify-between items-end mb-4 mt-2">
              <View className="flex-row items-center gap-2">
                <Activity size={18} color="#22d3ee" />
                <Text className="text-white text-lg font-bold">Giao dịch gần đây</Text>
              </View>
            </View>
            
            <View className="space-y-3 mb-8">
              {transactions.length > 0 ? (
                transactions.map(tx => (
                  <View key={tx.id} className="bg-[#1e293b] p-4 rounded-2xl border border-slate-700/50 flex-row justify-between items-center">
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2 mb-1">
                        <Text className="text-white font-bold text-base" numberOfLines={1}>{tx.user}</Text>
                        
                        {/* Phân loại Badge Gói */}
                        {tx.amount >= 99000 ? (
                          <View className="flex-row items-center gap-1 bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 rounded">
                            <Crown size={10} color="#c084fc" />
                            <Text className="text-purple-400 text-[9px] font-bold uppercase tracking-wider">1 Năm</Text>
                          </View>
                        ) : (
                          <View className="flex-row items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                            <Activity size={10} color="#fbbf24" />
                            <Text className="text-amber-400 text-[9px] font-bold uppercase tracking-wider">1 Tháng</Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-slate-400 text-xs mb-1.5" numberOfLines={1}>{tx.email}</Text>
                      <View className="flex-row items-center gap-1">
                        <Hash size={10} color="#64748b" />
                        <Text className="text-slate-500 text-[10px] font-mono">{tx.orderCode} • {tx.date}</Text>
                      </View>
                    </View>

                    <View className="items-end pl-2">
                      <Text className={`font-bold text-lg mb-1.5 ${tx.status === 'paid' || tx.status === 'success' ? 'text-emerald-400' : 'text-slate-400'}`}>
                        +{formatShort(tx.amount)}
                      </Text>
                      
                      {/* Phân loại Trạng thái */}
                      {tx.status === 'paid' || tx.status === 'success' ? (
                        <View className="flex-row items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded">
                          <CheckCircle2 size={10} color="#34d399" />
                          <Text className="text-emerald-400 text-[9px] font-bold uppercase">Thành công</Text>
                        </View>
                      ) : tx.status === 'pending' ? (
                        <View className="flex-row items-center gap-1 bg-amber-500/10 px-2 py-1 rounded">
                          <Clock size={10} color="#fbbf24" />
                          <Text className="text-amber-400 text-[9px] font-bold uppercase">Chờ xử lý</Text>
                        </View>
                      ) : (
                        <View className="flex-row items-center gap-1 bg-rose-500/10 px-2 py-1 rounded">
                          <XCircle size={10} color="#fb7185" />
                          <Text className="text-rose-400 text-[9px] font-bold uppercase">Đã hủy</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))
              ) : (
                <View className="py-10 items-center justify-center bg-[#1e293b] rounded-2xl border border-slate-700/50">
                  <Text className="text-slate-500">Chưa có giao dịch nào.</Text>
                </View>
              )}
            </View>
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}