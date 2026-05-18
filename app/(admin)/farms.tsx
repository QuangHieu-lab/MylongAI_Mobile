import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  Factory, MapPin, Camera, PackageCheck, 
  Search, Plus, ChevronLeft, Edit, Trash2, Activity, XCircle
} from 'lucide-react-native';

// ==========================================
// 🚀 MOCK DATA: DANH SÁCH CÁC HỘ/XƯỞNG
// ==========================================
const MOCK_FARMS = [
  { id: 'f1', name: 'Hộ Bánh Tráng Cô Ba', address: 'Khu vực 1, Mỹ Lồng', status: 'active', cameras: 2, batches: 156 },
  { id: 'f2', name: 'Xưởng Phơi Chú Tư', address: 'Khu vực 2, Mỹ Lồng', status: 'active', cameras: 4, batches: 420 },
  { id: 'f3', name: 'HTX Sáu Sương', address: 'Khu vực 3, Mỹ Lồng', status: 'inactive', cameras: 0, batches: 0 },
  { id: 'f4', name: 'Lò Bánh Tráng Chín Đều', address: 'Khu vực 4, Mỹ Lồng', status: 'active', cameras: 1, batches: 89 },
];

export default function FarmManagementScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Lọc dữ liệu theo tìm kiếm
  const filteredFarms = MOCK_FARMS.filter(farm => 
    farm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    farm.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = MOCK_FARMS.filter(f => f.status === 'active').length;

  return (
    <SafeAreaView className="flex-1 bg-[#0f172a]" edges={['top']}>
      
      {/* ================= HEADER ================= */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-slate-800/50">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="w-10 h-10 bg-[#1e293b] rounded-full flex items-center justify-center border border-slate-700"
          >
            <ChevronLeft size={24} color="#f8fafc" />
          </TouchableOpacity>
          <View>
            <Text className="text-white text-xl font-bold">Quản lý Hộ/Xưởng</Text>
            <Text className="text-slate-400 text-xs mt-0.5">Hệ thống phơi bánh tráng</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        
        {/* ================= STATS & THÊM MỚI ================= */}
        <View className="flex-row justify-between mb-6">
          <View className="w-[48%] bg-[#1e293b] p-4 rounded-[24px] border border-slate-700/50 shadow-lg">
            <View className="w-10 h-10 bg-blue-500/20 rounded-full items-center justify-center mb-2">
              <Factory size={20} color="#60a5fa" />
            </View>
            <Text className="text-slate-400 text-xs font-semibold">Tổng số hộ</Text>
            <Text className="text-white text-2xl font-bold">{MOCK_FARMS.length}</Text>
          </View>

          <View className="w-[48%] bg-[#1e293b] p-4 rounded-[24px] border border-slate-700/50 shadow-lg">
            <View className="w-10 h-10 bg-emerald-500/20 rounded-full items-center justify-center mb-2">
              <Activity size={20} color="#34d399" />
            </View>
            <Text className="text-slate-400 text-xs font-semibold">Đang hoạt động</Text>
            <Text className="text-emerald-400 text-2xl font-bold">{activeCount}</Text>
          </View>
        </View>

        <TouchableOpacity className="w-full bg-blue-600 py-3.5 rounded-2xl flex-row items-center justify-center shadow-lg shadow-blue-600/30 mb-6">
          <Plus size={20} color="#ffffff" className="mr-2" />
          <Text className="text-white font-bold text-base">Thêm cơ sở mới</Text>
        </TouchableOpacity>

        {/* ================= THANH TÌM KIẾM ================= */}
        <View className="mb-6 relative justify-center">
          <View className="absolute left-4 z-10">
            <Search size={20} color="#64748b" />
          </View>
          <TextInput
            placeholder="Tìm kiếm tên hoặc địa chỉ..."
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="bg-[#1e293b] text-white pl-12 pr-4 py-4 rounded-2xl border border-slate-700/50"
          />
        </View>

        {/* ================= DANH SÁCH CÁC HỘ (CARDS) ================= */}
        <Text className="text-white text-lg font-bold mb-4">Danh sách cơ sở ({filteredFarms.length})</Text>

        {filteredFarms.map((farm) => (
          <View key={farm.id} className="bg-[#1e293b] p-5 rounded-[24px] border border-slate-700/50 shadow-lg mb-4">
            
            {/* Header Card: Icon, Tên, Badge Trạng thái */}
            <View className="flex-row justify-between items-start mb-4">
              <View className="flex-row flex-1 mr-3">
                <View className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center mr-3">
                  <Factory size={24} color="#60a5fa" />
                </View>
                <View className="flex-1 justify-center">
                  <Text className="text-white font-bold text-base mb-1" numberOfLines={1}>{farm.name}</Text>
                  <View className="flex-row items-center">
                    <MapPin size={12} color="#94a3b8" />
                    <Text className="text-slate-400 text-xs ml-1" numberOfLines={1}>{farm.address}</Text>
                  </View>
                </View>
              </View>

              <View className={`px-2.5 py-1 rounded-full border ${farm.status === 'active' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-800 border-slate-600'}`}>
                <Text className={`text-[10px] font-bold uppercase ${farm.status === 'active' ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {farm.status === 'active' ? 'Hoạt động' : 'Tạm ngưng'}
                </Text>
              </View>
            </View>

            {/* Thông số (Chỉ hiện nếu đang hoạt động) */}
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1 bg-[#0f172a] p-3 rounded-xl border border-slate-800 flex-row items-center">
                <Camera size={16} color="#06b6d4" />
                <View className="ml-2">
                  <Text className="text-slate-500 text-[10px] uppercase">Camera</Text>
                  <Text className="text-cyan-400 font-bold">{farm.cameras} thiết bị</Text>
                </View>
              </View>
              <View className="flex-1 bg-[#0f172a] p-3 rounded-xl border border-slate-800 flex-row items-center">
                <PackageCheck size={16} color="#c084fc" />
                <View className="ml-2">
                  <Text className="text-slate-500 text-[10px] uppercase">Tổng mẻ</Text>
                  <Text className="text-purple-400 font-bold">{farm.batches} mẻ</Text>
                </View>
              </View>
            </View>

            {/* Hành động (Sửa / Xóa) */}
            <View className="flex-row justify-end gap-3 pt-4 border-t border-slate-700/50">
              <TouchableOpacity className="bg-slate-800 px-4 py-2.5 rounded-xl flex-row items-center border border-slate-700">
                <Edit size={16} color="#60a5fa" />
                <Text className="text-blue-400 text-sm font-semibold ml-2">Sửa</Text>
              </TouchableOpacity>
              <TouchableOpacity className="bg-rose-500/10 px-4 py-2.5 rounded-xl flex-row items-center border border-rose-500/20">
                <Trash2 size={16} color="#fb7185" />
                <Text className="text-rose-400 text-sm font-semibold ml-2">Xóa</Text>
              </TouchableOpacity>
            </View>

          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}