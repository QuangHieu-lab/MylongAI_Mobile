import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  Search, Filter, TrendingUp, CheckCircle2, 
  XCircle, Clock, ChevronLeft, MapPin, Thermometer, 
  Droplets, ChevronRight
} from 'lucide-react-native';

// Import Contexts và Components
import { useFarm } from '@/src/contexts/FarmContext';
import { FarmSelector } from '@/src/components/dashboard/FarmSelector';

// ==========================================
// 🚀 MOCK DATA
// ==========================================
const MOCK_BATCHES = [
  { id: 'b1', name: 'Mẻ bánh sáng #01', location: 'Sân phơi A1', status: 'active', progress: 65, risk: 'low', temp: 36.5, humidity: 45, startTime: '2026-05-16T08:00:00' },
  { id: 'b2', name: 'Mẻ bánh sáng #02', location: 'Sân phơi A2', status: 'active', progress: 40, risk: 'medium', temp: 35.0, humidity: 55, startTime: '2026-05-16T09:30:00' },
  { id: 'b3', name: 'Mẻ chiều qua #01', location: 'Sân phơi B1', status: 'completed', progress: 100, risk: 'low', temp: 38.2, humidity: 42, startTime: '2026-05-15T13:00:00' },
  { id: 'b4', name: 'Mẻ chiều qua #02', location: 'Sân phơi B2', status: 'failed', progress: 80, risk: 'high', temp: 32.1, humidity: 85, startTime: '2026-05-15T14:30:00' },
];

export default function BatchManagementScreen() {
  const router = useRouter();
  
  // Hooks
  const { selectedFarmId } = useFarm();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'failed'>('all');

  // Lọc dữ liệu
  const filteredBatches = MOCK_BATCHES.filter(batch => {
    const matchesSearch = batch.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          batch.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || batch.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Thống kê (dựa trên dữ liệu gốc)
  const activeCount = MOCK_BATCHES.filter(b => b.status === 'active').length;
  const completedCount = MOCK_BATCHES.filter(b => b.status === 'completed').length;
  const failedCount = MOCK_BATCHES.filter(b => b.status === 'failed').length;

  // UI Helpers
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active': return { label: 'Đang phơi', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' };
      case 'completed': return { label: 'Hoàn thành', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' };
      case 'failed': return { label: 'Thất bại', bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' };
      default: return { label: 'Không rõ', bg: 'bg-slate-800', text: 'text-slate-400', border: 'border-slate-700' };
    }
  };

  const getRiskColor = (risk: string) => {
    if (risk === 'low') return 'text-emerald-400 border-emerald-500/50';
    if (risk === 'medium') return 'text-amber-400 border-amber-500/50';
    return 'text-rose-400 border-rose-500/50';
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
            <Text className="text-white text-xl font-bold">Quản lý mẻ bánh</Text>
            <Text className="text-slate-400 text-xs mt-0.5">Theo dõi quá trình phơi</Text>
          </View>
        </View>
        
        {/* COMPONENT CHỌN TRANG TRẠI CHÍNH THỨC */}
        <FarmSelector />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        
        {/* ================= SUMMARY CARDS ================= */}
        <View className="flex-row flex-wrap justify-between gap-y-4 mb-6">
          <View className="w-[48%] bg-[#1e293b] p-4 rounded-[24px] border border-slate-700/50 shadow-lg">
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-slate-400 text-xs font-semibold">Tổng số mẻ</Text>
              <TrendingUp size={16} color="#60a5fa" />
            </View>
            <Text className="text-white text-3xl font-extrabold">{MOCK_BATCHES.length}</Text>
          </View>

          <View className="w-[48%] bg-[#1e293b] p-4 rounded-[24px] border border-slate-700/50 shadow-lg">
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-slate-400 text-xs font-semibold">Đang hoạt động</Text>
              <Clock size={16} color="#60a5fa" />
            </View>
            <Text className="text-blue-400 text-3xl font-extrabold">{activeCount}</Text>
          </View>

          <View className="w-[48%] bg-[#1e293b] p-4 rounded-[24px] border border-slate-700/50 shadow-lg">
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-slate-400 text-xs font-semibold">Hoàn thành</Text>
              <CheckCircle2 size={16} color="#34d399" />
            </View>
            <Text className="text-emerald-400 text-3xl font-extrabold">{completedCount}</Text>
          </View>

          <View className="w-[48%] bg-[#1e293b] p-4 rounded-[24px] border border-slate-700/50 shadow-lg">
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-slate-400 text-xs font-semibold">Thất bại</Text>
              <XCircle size={16} color="#fb7185" />
            </View>
            <Text className="text-rose-400 text-3xl font-extrabold">{failedCount}</Text>
          </View>
        </View>

        {/* ================= BỘ LỌC (TÌM KIẾM & TRẠNG THÁI) ================= */}
        <View className="mb-6">
          <View className="relative justify-center mb-3">
            <View className="absolute left-4 z-10"><Search size={18} color="#64748b" /></View>
            <TextInput
              placeholder="Tìm kiếm tên hoặc vị trí..."
              placeholderTextColor="#64748b"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="bg-[#1e293b] text-white pl-11 pr-4 py-3 rounded-xl border border-slate-700/50"
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5 px-5">
            <View className="flex-row gap-2">
              <TouchableOpacity 
                onPress={() => setStatusFilter('all')}
                className={`flex-row items-center px-4 py-2 rounded-lg border ${statusFilter === 'all' ? 'bg-blue-600 border-blue-500' : 'bg-slate-800 border-slate-700'}`}
              >
                <Filter size={14} color={statusFilter === 'all' ? '#fff' : '#94a3b8'} className="mr-2" />
                <Text className={`text-sm font-semibold ${statusFilter === 'all' ? 'text-white' : 'text-slate-300'}`}>Tất cả</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => setStatusFilter('active')}
                className={`px-4 py-2 rounded-lg border ${statusFilter === 'active' ? 'bg-blue-600 border-blue-500' : 'bg-slate-800 border-slate-700'}`}
              >
                <Text className={`text-sm font-semibold ${statusFilter === 'active' ? 'text-white' : 'text-slate-300'}`}>Đang phơi</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => setStatusFilter('completed')}
                className={`px-4 py-2 rounded-lg border ${statusFilter === 'completed' ? 'bg-blue-600 border-blue-500' : 'bg-slate-800 border-slate-700'}`}
              >
                <Text className={`text-sm font-semibold ${statusFilter === 'completed' ? 'text-white' : 'text-slate-300'}`}>Hoàn thành</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => setStatusFilter('failed')}
                className={`px-4 py-2 rounded-lg border ${statusFilter === 'failed' ? 'bg-blue-600 border-blue-500' : 'bg-slate-800 border-slate-700'}`}
              >
                <Text className={`text-sm font-semibold ${statusFilter === 'failed' ? 'text-white' : 'text-slate-300'}`}>Thất bại</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>

        {/* ================= DANH SÁCH MẺ BÁNH (CARD VIEW) ================= */}
        <Text className="text-white text-lg font-bold mb-4">Danh sách ({filteredBatches.length})</Text>

        <View className="space-y-4">
          {filteredBatches.map(batch => {
            const statusInfo = getStatusInfo(batch.status);
            
            return (
              <TouchableOpacity 
                key={batch.id} 
                className="bg-[#1e293b] p-4 rounded-[24px] border border-slate-700/50 shadow-lg mb-4"
                onPress={() => console.log('Chuyển tới chi tiết mẻ', batch.id)}
              >
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1">
                    <Text className="text-white font-bold text-lg mb-1">{batch.name}</Text>
                    <View className="flex-row items-center">
                      <MapPin size={12} color="#94a3b8" />
                      <Text className="text-slate-400 text-xs ml-1">{batch.location}</Text>
                    </View>
                  </View>
                  <View className={`${statusInfo.bg} border ${statusInfo.border} px-2.5 py-1 rounded-full`}>
                    <Text className={`${statusInfo.text} text-[10px] font-bold uppercase`}>{statusInfo.label}</Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View className="mb-4">
                  <View className="flex-row justify-between mb-1.5">
                    <Text className="text-slate-400 text-[10px] uppercase font-semibold">Tiến độ</Text>
                    <Text className="text-white text-[10px] font-bold">{batch.progress}%</Text>
                  </View>
                  <View className="h-2 w-full bg-[#0f172a] rounded-full overflow-hidden">
                    <View 
                      className={`h-full rounded-full ${batch.progress >= 80 ? 'bg-emerald-500' : batch.progress >= 50 ? 'bg-blue-500' : 'bg-amber-500'}`} 
                      style={{ width: `${batch.progress}%` }} 
                    />
                  </View>
                </View>

                {/* Chỉ số lưới (Grid) */}
                <View className="flex-row justify-between items-center bg-[#0f172a] p-3 rounded-xl border border-slate-800">
                  <View className="flex-row items-center gap-1.5">
                    <Thermometer size={14} color="#f87171" />
                    <Text className="text-slate-300 text-xs font-semibold">{batch.temp}°C</Text>
                  </View>
                  <View className="w-[1px] h-4 bg-slate-700" />
                  <View className="flex-row items-center gap-1.5">
                    <Droplets size={14} color="#60a5fa" />
                    <Text className="text-slate-300 text-xs font-semibold">{batch.humidity}%</Text>
                  </View>
                  <View className="w-[1px] h-4 bg-slate-700" />
                  <View className={`border px-2 py-0.5 rounded ${getRiskColor(batch.risk)}`}>
                    <Text className={`text-[10px] font-bold ${getRiskColor(batch.risk).split(' ')[0]}`}>
                      Rủi ro {batch.risk === 'low' ? 'thấp' : batch.risk === 'medium' ? 'TB' : 'cao'}
                    </Text>
                  </View>
                  <ChevronRight size={16} color="#64748b" />
                </View>

              </TouchableOpacity>
            )
          })}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}