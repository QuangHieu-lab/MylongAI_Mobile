import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  CheckCircle2, Calendar, TrendingUp, Camera, 
  Activity, Thermometer, Droplets, Clock, AlertTriangle, 
  CheckCircle, Zap, ChevronLeft
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

// 🚀 IMPORT DATA WRAPPER
import DataWrapper from '@/src/components/ui/DataWrapper';

const { width } = Dimensions.get('window');

// ==========================================
// 🚀 MOCK DATA
// ==========================================
const MOCK_HISTORY = [
  {
    id: 'batch-17787633',
    outcome: 'early_collection',
    risk: 'high',
    location: 'Khu vực A',
    completionDuration: 284, 
    dryness: 100,
    temperature: 36.5,
    humidity: 52,
    startTime: '2026-05-14T19:55:00',
    estimatedCompletion: '2026-05-15T00:39:00',
    notes: 'Thu sớm do phát hiện mây đen kéo tới, độ ẩm tăng đột ngột.'
  },
  {
    id: 'batch-17787634',
    outcome: 'success',
    risk: 'low',
    location: 'Khu vực B',
    completionDuration: 240, 
    dryness: 95,
    temperature: 38.0,
    humidity: 45,
    startTime: '2026-05-13T08:00:00',
    estimatedCompletion: '2026-05-13T12:00:00',
  },
  {
    id: 'batch-17787635',
    outcome: 'warning_completed',
    risk: 'medium',
    location: 'Khu vực C',
    completionDuration: 310, 
    dryness: 88,
    temperature: 34.2,
    humidity: 60,
    startTime: '2026-05-12T07:30:00',
    estimatedCompletion: '2026-05-12T12:40:00',
    notes: 'Nhiệt độ phơi trung bình thấp hơn chuẩn.'
  }
];

export default function HistoryScreen() {
  const router = useRouter();

  // ================= STATE QUẢN LÝ TẢI DỮ LIỆU =================
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State lưu dữ liệu
  const [batchHistory, setBatchHistory] = useState<typeof MOCK_HISTORY>([]);

  // Giả lập hàm gọi API lấy lịch sử
  const fetchHistoryData = async () => {
    setError(null);
    try {
      // TODO: Đổi thành API thật của bạn sau này
      await new Promise(resolve => setTimeout(resolve, 1500)); // Giả lập chờ 1.5s
      
      // Bỏ comment dòng dưới nếu muốn test giao diện Lỗi
      // throw new Error("Mất kết nối máy chủ. Không thể tải lịch sử!");

      setBatchHistory(MOCK_HISTORY);
    } catch (err: any) {
      setError(err.message || "Đã có lỗi xảy ra khi tải lịch sử.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Gọi lần đầu khi vào trang
  useEffect(() => {
    fetchHistoryData();
  }, []);

  // Hàm Refresh khi vuốt xuống
  const onRefresh = () => {
    setIsRefreshing(true);
    fetchHistoryData();
  };

  // ================= CÁC BIẾN & HÀM TIỆN ÍCH =================
  const totalBatches = 14;
  const successRate = 71.4;
  const avgCompletionTime = '4h 29m';
  const aiAccuracy = 95;
  const successCount = 10;
  const earlyCollectionCount = 3;
  const warningCompletedCount = 1;

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getOutcomeInfo = (outcome: string) => {
    switch (outcome) {
      case 'success':
        return { label: 'Thành công', color: '#34d399', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: CheckCircle };
      case 'early_collection':
        return { label: 'Thu sớm', color: '#fbbf24', bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: Clock };
      case 'warning_completed':
        return { label: 'Hoàn thành có cảnh báo', color: '#f97316', bg: 'bg-orange-500/10', border: 'border-orange-500/30', icon: AlertTriangle };
      default:
        return { label: 'Hoàn thành', color: '#94a3b8', bg: 'bg-slate-800', border: 'border-slate-700', icon: CheckCircle2 };
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'high': return <View className="bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30"><Text className="text-rose-400 text-[10px] font-bold">Rủi ro cao</Text></View>;
      case 'medium': return <View className="bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30"><Text className="text-amber-400 text-[10px] font-bold">Rủi ro TB</Text></View>;
      case 'low': return <View className="bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30"><Text className="text-emerald-400 text-[10px] font-bold">Rủi ro thấp</Text></View>;
      default: return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0f172a]" edges={['top']}>
      
      {/* ================= HEADER (Không bao giờ bị ẩn) ================= */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-[#1e293b] rounded-full flex items-center justify-center border border-slate-700">
            <ChevronLeft size={24} color="#f8fafc" />
          </TouchableOpacity>
          <View>
            <Text className="text-white text-xl font-bold">Lịch sử mẻ bánh</Text>
            <Text className="text-slate-400 text-xs mt-0.5">Dữ liệu được phát hiện tự động</Text>
          </View>
        </View>
        <View className="flex-row items-center gap-1.5 px-3 py-1.5 bg-purple-500/20 border border-purple-500/40 rounded-lg">
          <Camera size={14} color="#c084fc" />
          <Text className="text-purple-400 text-xs font-bold">AI Active</Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#c084fc" colors={['#c084fc']} />}
      >
        
        {/* 🚀 BỌC TOÀN BỘ PHẦN BÊN DƯỚI BẰNG DATA WRAPPER */}
        <DataWrapper 
          isLoading={isLoading && !isRefreshing} 
          error={error} 
          onRetry={fetchHistoryData}
          loadingMessage="Đang đồng bộ dữ liệu lịch sử..."
        >
          {/* ================================================= */}
          {/* 1. TOP 4 STATS CARDS */}
          {/* ================================================= */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 -mx-5 px-5">
            <View className="flex-row gap-4">
              {/* Tổng số */}
              <View className="w-40 bg-[#E2E8F0] p-4 rounded-[24px] shadow-lg">
                <View className="flex-row justify-between items-center mb-3">
                  <View className="w-10 h-10 bg-[#0284C7] rounded-full items-center justify-center"><Calendar size={20} color="#fff" /></View>
                  <Text className="text-[#0369A1] text-[10px] font-bold bg-white/60 px-2 py-1 rounded-full">Tổng số</Text>
                </View>
                <Text className="text-slate-600 text-xs font-semibold mb-1">Tổng mẻ bánh</Text>
                <Text className="text-[#0369A1] text-3xl font-black">{totalBatches}</Text>
              </View>

              {/* Tỷ lệ */}
              <View className="w-44 bg-[#DCFCE7] p-4 rounded-[24px] shadow-lg">
                <View className="flex-row justify-between items-center mb-3">
                  <View className="w-10 h-10 bg-[#16A34A] rounded-full items-center justify-center"><CheckCircle size={20} color="#fff" /></View>
                  <View className="flex-row items-center gap-1 bg-white/60 px-2 py-1 rounded-full">
                    <TrendingUp size={12} color="#15803D" /><Text className="text-[#15803D] text-[10px] font-bold">Xuất sắc</Text>
                  </View>
                </View>
                <Text className="text-slate-600 text-xs font-semibold mb-1">Tỷ lệ thành công</Text>
                <View className="flex-row items-baseline gap-1">
                  <Text className="text-[#15803D] text-3xl font-black">{successRate}%</Text>
                  <Text className="text-[#15803D]/70 text-xs font-bold">({successCount}/{totalBatches})</Text>
                </View>
              </View>

              {/* Thời gian */}
              <View className="w-40 bg-[#DBEAFE] p-4 rounded-[24px] shadow-lg">
                <View className="flex-row justify-between items-center mb-3">
                  <View className="w-10 h-10 bg-[#2563EB] rounded-full items-center justify-center"><Clock size={20} color="#fff" /></View>
                  <Text className="text-[#1D4ED8] text-[10px] font-bold bg-white/60 px-2 py-1 rounded-full">Trung bình</Text>
                </View>
                <Text className="text-slate-600 text-xs font-semibold mb-1">Thời gian TB</Text>
                <Text className="text-[#1D4ED8] text-3xl font-black">{avgCompletionTime}</Text>
              </View>

              {/* AI */}
              <View className="w-36 bg-[#F3E8FF] p-4 rounded-[24px] shadow-lg mr-5">
                <View className="flex-row justify-between items-center mb-3">
                  <View className="w-10 h-10 bg-[#9333EA] rounded-full items-center justify-center"><Activity size={20} color="#fff" /></View>
                  <Text className="text-[#6B21A8] text-[10px] font-bold bg-white/60 px-2 py-1 rounded-full">AI</Text>
                </View>
                <Text className="text-slate-600 text-xs font-semibold mb-1">Độ chính xác AI</Text>
                <Text className="text-[#6B21A8] text-3xl font-black">{aiAccuracy}%</Text>
              </View>
            </View>
          </ScrollView>

          {/* ================================================= */}
          {/* 2. BIỂU ĐỒ (Custom Bar Chart thuần React Native)  */}
          {/* ================================================= */}
          <View className="bg-[#1e293b] p-5 rounded-3xl mb-6 border border-slate-700/50 shadow-lg">
            <Text className="text-white font-bold text-lg mb-6">Thời gian hoàn thành 8 batch gần nhất</Text>
            
            <View className="flex-row h-40 items-end border-b border-slate-700 pb-2 relative">
              <View className="absolute w-full border-t border-slate-800 border-dashed bottom-[25%]" />
              <View className="absolute w-full border-t border-slate-800 border-dashed bottom-[50%]" />
              <View className="absolute w-full border-t border-slate-800 border-dashed bottom-[75%]" />
              <View className="absolute w-full border-t border-slate-800 border-dashed bottom-[100%]" />

              <View className="flex-1 flex-row justify-between items-end px-2 z-10">
                {[4.2, 5.2, 4.0, 4.3, 4.6, 4.8, 4.3, 4.6].map((val, idx) => (
                  <View key={idx} className="items-center">
                    <View className="w-7 bg-blue-500 rounded-t-md shadow-[0_0_10px_rgba(59,130,246,0.3)]" style={{ height: `${(val / 8) * 100}%` }} />
                    <Text className="text-slate-500 text-[10px] mt-2">#{8-idx}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* ================================================= */}
          {/* 3. TÓM TẮT TRẠNG THÁI (OUTCOME SUMMARY)           */}
          {/* ================================================= */}
          <View className="flex-row flex-wrap justify-between gap-y-4 mb-8">
            <View className="w-[48%] bg-emerald-500/10 p-4 rounded-[24px] border border-emerald-500/30">
              <Text className="text-emerald-400 text-xs font-semibold mb-1">Thành công hoàn toàn</Text>
              <View className="flex-row items-center justify-between">
                <Text className="text-emerald-500 text-3xl font-black">{successCount}</Text>
                <CheckCircle size={24} color="#34d399" />
              </View>
            </View>

            <View className="w-[48%] bg-amber-500/10 p-4 rounded-[24px] border border-amber-500/30">
              <Text className="text-amber-400 text-xs font-semibold mb-1">Thu sớm</Text>
              <View className="flex-row items-center justify-between">
                <Text className="text-amber-500 text-3xl font-black">{earlyCollectionCount}</Text>
                <Clock size={24} color="#fbbf24" />
              </View>
            </View>

            <View className="w-full bg-orange-500/10 p-4 rounded-[24px] border border-orange-500/30 flex-row justify-between items-center">
              <View>
                <Text className="text-orange-400 text-xs font-semibold mb-1">Hoàn thành có cảnh báo</Text>
                <Text className="text-orange-500 text-3xl font-black">{warningCompletedCount}</Text>
              </View>
              <AlertTriangle size={32} color="#f97316" />
            </View>
          </View>

          {/* ================================================= */}
          {/* 4. DANH SÁCH CHI TIẾT CÁC BATCH ĐÃ HOÀN THÀNH     */}
          {/* ================================================= */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white text-lg font-bold">Chi tiết mẻ bánh</Text>
            <View className="bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
              <Text className="text-slate-300 text-xs">{batchHistory.length} batch</Text>
            </View>
          </View>

          <View className="space-y-4">
            {batchHistory.map((batch) => {
              const outInfo = getOutcomeInfo(batch.outcome);
              const OutIcon = outInfo.icon;

              return (
                <View key={batch.id} className={`bg-[#1e293b] p-5 rounded-3xl border ${outInfo.border} shadow-lg mb-4`}>
                  
                  {/* Header Item */}
                  <View className="flex-row items-start mb-4">
                    <View className={`w-12 h-12 rounded-2xl flex items-center justify-center ${outInfo.bg} border ${outInfo.border} mr-3`}>
                      <OutIcon size={24} color={outInfo.color} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white text-lg font-bold mb-1">Batch #{batch.id.split('-')[1]}</Text>
                      <View className="flex-row flex-wrap gap-2">
                        <View className={`${outInfo.bg} px-2 py-0.5 rounded border ${outInfo.border}`}>
                          <Text style={{ color: outInfo.color, fontSize: 10, fontWeight: 'bold' }}>{outInfo.label}</Text>
                        </View>
                        {getRiskBadge(batch.risk)}
                        <View className="bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30 flex-row items-center gap-1">
                          <Camera size={10} color="#c084fc" />
                          <Text className="text-purple-400 text-[10px] font-bold">AI Detected</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Các chỉ số (Grid) */}
                  <View className="flex-row flex-wrap justify-between gap-y-3 mb-4">
                    <View className="w-[48%] bg-[#0f172a] p-3 rounded-2xl border border-slate-800">
                      <Text className="text-slate-500 text-[10px] mb-1">Vị trí</Text>
                      <Text className="text-slate-200 font-bold">{batch.location}</Text>
                    </View>
                    <View className="w-[48%] bg-blue-500/10 p-3 rounded-2xl border border-blue-500/20">
                      <View className="flex-row items-center gap-1 mb-1">
                        <Clock size={12} color="#60a5fa" /><Text className="text-blue-400 text-[10px]">Thời gian</Text>
                      </View>
                      <Text className="text-blue-400 font-bold">{formatDuration(batch.completionDuration)}</Text>
                    </View>
                    <View className="w-[30%] bg-cyan-500/10 p-3 rounded-2xl border border-cyan-500/20">
                      <Text className="text-cyan-500 text-[10px] mb-1">Độ khô</Text>
                      <Text className="text-cyan-400 font-bold">{batch.dryness}%</Text>
                    </View>
                    <View className="w-[30%] bg-orange-500/10 p-3 rounded-2xl border border-orange-500/20">
                      <Text className="text-orange-400 text-[10px] mb-1">Nhiệt độ</Text>
                      <Text className="text-orange-300 font-bold">{batch.temperature}°C</Text>
                    </View>
                    <View className="w-[30%] bg-blue-500/10 p-3 rounded-2xl border border-blue-500/20">
                      <Text className="text-blue-400 text-[10px] mb-1">Độ ẩm</Text>
                      <Text className="text-blue-300 font-bold">{batch.humidity}%</Text>
                    </View>
                  </View>

                  {/* Ghi chú rủi ro (nếu có) */}
                  {batch.notes && (
                    <View className="bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 flex-row items-start gap-2 mb-3">
                      <Zap size={14} color="#fb7185" className="mt-0.5" />
                      <Text className="text-rose-300 text-xs flex-1">{batch.notes}</Text>
                    </View>
                  )}

                  {/* Timeline */}
                  <View className="bg-[#0f172a] p-3 rounded-xl border border-slate-800 flex-row items-center justify-between">
                    <Text className="text-slate-500 text-xs font-semibold">Timeline</Text>
                    <Text className="text-slate-300 text-xs font-mono">
                      19:55 - 14/05  →  00:39
                    </Text>
                  </View>

                </View>
              );
            })}
          </View>
          
        </DataWrapper>
      </ScrollView>
    </SafeAreaView>
  );
}