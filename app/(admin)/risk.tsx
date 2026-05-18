import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  AlertTriangle, Cloud, Droplets, Thermometer, 
  CheckCircle2, TrendingUp, ChevronLeft, MapPin, Clock
} from 'lucide-react-native';

// Import Contexts và Components
import { useFarm } from '@/src/contexts/FarmContext';
import { FarmSelector } from '@/src/components/dashboard/FarmSelector';

// Import Data
import { mockRiskAlerts, allAdminBatches } from '@/src/types/adminMockData';

const { width } = Dimensions.get('window');

export default function RiskManagementScreen() {
  const router = useRouter();
  const { selectedFarmId } = useFarm();
  const [activeTab, setActiveTab] = useState<'active' | 'resolved'>('active');

  // Lọc dữ liệu theo Farm (Nếu chọn Tất cả thì lấy hết)
  const filteredBatches = selectedFarmId 
    ? allAdminBatches.filter(b => b.farmId === selectedFarmId)
    : allAdminBatches;

  const filteredAlerts = selectedFarmId
    ? mockRiskAlerts.filter(alert => {
        const batch = allAdminBatches.find(b => b.id === alert.batchId);
        return batch && batch.farmId === selectedFarmId;
      })
    : mockRiskAlerts;

  const activeAlerts = filteredAlerts.filter(a => a.status === 'active');
  const resolvedAlerts = filteredAlerts.filter(a => a.status === 'resolved');
  const highRiskBatches = filteredBatches.filter(b => b.riskLevel === 'high' && b.status === 'active');

  // Helper UI
  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'critical': return { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400', label: 'Nghiêm trọng' };
      case 'high': return { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', label: 'Cao' };
      case 'medium': return { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', label: 'Trung bình' };
      case 'low': return { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', label: 'Thấp' };
      default: return { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-400', label: 'Không rõ' };
    }
  };

  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'weather': return { icon: Cloud, label: 'Thời tiết' };
      case 'humidity': return { icon: Droplets, label: 'Độ ẩm' };
      case 'temperature': return { icon: Thermometer, label: 'Nhiệt độ' };
      default: return { icon: AlertTriangle, label: 'Hệ thống' };
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
            <Text className="text-white text-xl font-bold">Quản lý rủi ro</Text>
            <Text className="text-slate-400 text-xs mt-0.5">Hệ thống cảnh báo tự động</Text>
          </View>
        </View>
        <FarmSelector />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        
        {/* ================= THỐNG KÊ (STATS) ================= */}
        <View className="flex-row flex-wrap justify-between gap-y-4 mb-8">
          <View className="w-[48%] bg-[#1e293b] p-4 rounded-[24px] border border-slate-700/50 shadow-lg">
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-slate-400 text-xs font-semibold">Cảnh báo báo động</Text>
              <AlertTriangle size={16} color="#fb7185" />
            </View>
            <Text className="text-rose-400 text-3xl font-extrabold">{activeAlerts.length}</Text>
          </View>

          <View className="w-[48%] bg-[#1e293b] p-4 rounded-[24px] border border-slate-700/50 shadow-lg">
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-slate-400 text-xs font-semibold">Mẻ rủi ro cao</Text>
              <TrendingUp size={16} color="#fbbf24" />
            </View>
            <Text className="text-amber-400 text-3xl font-extrabold">{highRiskBatches.length}</Text>
          </View>

          <View className="w-[48%] bg-[#1e293b] p-4 rounded-[24px] border border-slate-700/50 shadow-lg">
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-slate-400 text-xs font-semibold">Đã giải quyết</Text>
              <CheckCircle2 size={16} color="#34d399" />
            </View>
            <Text className="text-emerald-400 text-3xl font-extrabold">{resolvedAlerts.length}</Text>
          </View>

          <View className="w-[48%] bg-[#1e293b] p-4 rounded-[24px] border border-slate-700/50 shadow-lg">
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-slate-400 text-[10px] font-semibold">Tỷ lệ giải quyết</Text>
              <CheckCircle2 size={16} color="#60a5fa" />
            </View>
            <Text className="text-blue-400 text-3xl font-extrabold">
              {filteredAlerts.length > 0 ? Math.round((resolvedAlerts.length / filteredAlerts.length) * 100) : 0}%
            </Text>
          </View>
        </View>

        {/* ================= CÁC MẺ RỦI RO CAO (HIGH RISK) ================= */}
        {highRiskBatches.length > 0 && (
          <View className="mb-8">
            <View className="flex-row items-center gap-2 mb-4">
              <AlertTriangle size={18} color="#fbbf24" />
              <Text className="text-white text-lg font-bold">Mẻ bánh rủi ro cao</Text>
            </View>
            
            {highRiskBatches.map(batch => (
              <View key={batch.id} className="bg-amber-500/10 p-4 rounded-2xl border border-amber-500/30 flex-row justify-between items-center mb-3 shadow-lg">
                <View className="flex-1 mr-2">
                  <Text className="text-white font-bold text-base mb-1">{batch.name}</Text>
                  <View className="flex-row flex-wrap gap-2">
                    <View className="flex-row items-center">
                      <MapPin size={10} color="#94a3b8" />
                      <Text className="text-slate-400 text-[10px] ml-1">{batch.location}</Text>
                    </View>
                    <View className="flex-row items-center">
                      <Droplets size={10} color="#60a5fa" />
                      <Text className="text-slate-400 text-[10px] ml-1">{batch.humidity}%</Text>
                    </View>
                    <View className="flex-row items-center">
                      <Thermometer size={10} color="#fb7185" />
                      <Text className="text-slate-400 text-[10px] ml-1">{batch.temperature}°C</Text>
                    </View>
                  </View>
                </View>
                
                <View className="items-end">
                  <Text className="text-slate-400 text-[10px] uppercase font-bold mb-1">Tiến độ</Text>
                  <Text className="text-amber-400 font-black text-xl">{batch.dryingProgress}%</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ================= DANH SÁCH CẢNH BÁO (TABS) ================= */}
        <View className="bg-[#1e293b] rounded-[32px] border border-slate-700/50 overflow-hidden shadow-lg mb-8">
          
          {/* Custom Tabs List */}
          <View className="flex-row bg-[#0f172a] p-1 m-2 rounded-2xl border border-slate-800">
            <TouchableOpacity 
              onPress={() => setActiveTab('active')}
              className={`flex-1 py-2.5 rounded-xl items-center ${activeTab === 'active' ? 'bg-blue-600' : ''}`}
            >
              <Text className={`font-bold text-sm ${activeTab === 'active' ? 'text-white' : 'text-slate-400'}`}>
                Đang hoạt động ({activeAlerts.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setActiveTab('resolved')}
              className={`flex-1 py-2.5 rounded-xl items-center ${activeTab === 'resolved' ? 'bg-blue-600' : ''}`}
            >
              <Text className={`font-bold text-sm ${activeTab === 'resolved' ? 'text-white' : 'text-slate-400'}`}>
                Đã giải quyết ({resolvedAlerts.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Nội dung Tab */}
          <View className="p-4">
            {activeTab === 'active' ? (
              // HIỂN THỊ ACTIVE ALERTS
              activeAlerts.length === 0 ? (
                <View className="py-10 items-center">
                  <CheckCircle2 size={48} color="#34d399" className="mb-3" />
                  <Text className="text-slate-400 font-semibold">Tất cả an toàn. Không có cảnh báo mới.</Text>
                </View>
              ) : (
                <View className="space-y-4">
                  {activeAlerts.map(alert => {
                    const style = getSeverityStyle(alert.severity);
                    const TypeIcon = getTypeInfo(alert.type).icon;
                    return (
                      <View key={alert.id} className="bg-[#0f172a] p-4 rounded-2xl border border-slate-800">
                        <View className="flex-row items-start gap-3">
                          <View className={`w-10 h-10 rounded-xl items-center justify-center border ${style.bg} ${style.border}`}>
                            <TypeIcon size={20} color={style.text.replace('text-', '#').replace('-400', '400')} className={style.text} />
                          </View>
                          
                          <View className="flex-1">
                            <View className="flex-row items-center gap-2 mb-1.5">
                              <Text className="text-white font-bold text-base flex-1" numberOfLines={1}>{alert.batchName}</Text>
                              <View className={`${style.bg} px-2 py-0.5 rounded border ${style.border}`}>
                                <Text className={`${style.text} text-[10px] font-bold`}>{style.label}</Text>
                              </View>
                            </View>
                            
                            <Text className="text-slate-300 text-sm mb-2">{alert.message}</Text>
                            
                            <View className="flex-row items-center justify-between mt-1">
                              <View className="flex-row items-center gap-1">
                                <Clock size={12} color="#64748b" />
                                <Text className="text-slate-500 text-[10px]">
                                  {new Date(alert.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                                <Text className="text-slate-600 text-[10px]"> • </Text>
                                <Text className="text-slate-500 text-[10px]">{alert.location}</Text>
                              </View>
                              
                              <TouchableOpacity className="bg-blue-600/20 px-3 py-1.5 rounded-lg border border-blue-500/30">
                                <Text className="text-blue-400 text-[10px] font-bold">Xử lý ngay</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      </View>
                    )
                  })}
                </View>
              )
            ) : (
              // HIỂN THỊ RESOLVED ALERTS
              resolvedAlerts.length === 0 ? (
                <View className="py-10 items-center">
                  <Text className="text-slate-500 font-semibold">Chưa có cảnh báo nào được giải quyết.</Text>
                </View>
              ) : (
                <View className="space-y-4">
                  {resolvedAlerts.map(alert => (
                    <View key={alert.id} className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/20 opacity-80">
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-slate-300 font-bold">{alert.batchName}</Text>
                        <View className="bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex-row items-center">
                          <CheckCircle2 size={10} color="#34d399" className="mr-1" />
                          <Text className="text-emerald-400 text-[10px] font-bold">Đã xử lý</Text>
                        </View>
                      </View>
                      <Text className="text-slate-400 text-xs mb-2 line-through">{alert.message}</Text>
                      <Text className="text-slate-500 text-[10px]">
                        {new Date(alert.timestamp).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}
                      </Text>
                    </View>
                  ))}
                </View>
              )
            )}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}