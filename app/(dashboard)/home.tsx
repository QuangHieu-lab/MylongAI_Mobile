import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Settings, Play, Sparkles } from 'lucide-react-native';

// Import useAuth để lấy thông tin user và hàm Đăng xuất
import { useAuth } from '@/src/contexts/AuthContext';

// ================= DỮ LIỆU MẪU (SAMPLE DATA) =================
// Dữ liệu này sẽ được dùng khi mô phỏng bắt đầu
const MOCK_BATCH_DATA = {
  batchId: "BTM-2026-04",
  productName: "Bánh tráng Mỹ Lồng (Truyền thống)",
  startTime: new Date().toISOString(),
  environment: {
    initialTemp: 34.5, // Nhiệt độ ban đầu
    initialHumidity: 55, // Độ ẩm ban đầu
    weatherForecast: "Nắng gắt, có mây nhẹ",
  },
  aiTargets: {
    targetDryness: 85, // Độ khô tiêu chuẩn (%)
    estimatedDuration: "4h 30m"
  }
};
// =============================================================

export default function DemoSimulationScreen() {
  const router = useRouter();
  const { user, logout } = useAuth(); // Lấy data user hiện tại
  const [isSimulating, setIsSimulating] = useState(false);

  const handleStartSimulation = () => {
    setIsSimulating(true);
    
    // Hiện thông báo lấy dữ liệu mẫu
    Alert.alert(
      "Bắt đầu mô phỏng",
      `Đang tải dữ liệu mẻ bánh: ${MOCK_BATCH_DATA.batchId}\nMục tiêu: Đạt độ khô ${MOCK_BATCH_DATA.aiTargets.targetDryness}%`,
      [
        { 
          text: "Vào Camera", 
          onPress: () => router.push('/(dashboard)/camera') 
          // Chuyển sang màn hình Camera AI mà chúng ta đã code trước đó
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn thoát?", [
      { text: "Hủy", style: "cancel" },
      { text: "Đăng xuất", style: "destructive", onPress: () => logout() }
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f8f9fc]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
        <TouchableOpacity className="p-2 bg-slate-100 rounded-full" onPress={handleLogout}>
          <ArrowLeft size={20} color="#333" />
        </TouchableOpacity>
        
        <View className="items-center">
          <View className="flex-row items-center gap-2">
            <Text className="text-xl font-bold text-slate-900 tracking-tight">MYLONGAI</Text>
            <View className="flex-row items-center gap-1 px-1.5 py-0.5 bg-purple-100 border border-purple-200 rounded-md">
              <Sparkles size={10} color="#9333ea" />
              <Text className="text-[10px] font-bold text-purple-700">DEMO</Text>
            </View>
          </View>
          <Text className="text-xs text-slate-500">Mô phỏng phơi bánh</Text>
        </View>

        <TouchableOpacity className="p-2 bg-slate-200/80 rounded-full">
          <Settings size={20} color="#475569" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, flexGrow: 1, justifyContent: 'center' }}>
        
        {/* Lời chào user (Dữ liệu từ AuthContext) */}
        <Text className="text-center text-slate-500 mb-6">
          Xin chào, <Text className="font-bold text-purple-600">{user?.name || user?.email || 'Quản trị viên'}</Text>!
        </Text>

        {/* Card Main */}
        <View className="bg-white/60 p-8 rounded-[32px] border border-purple-100 shadow-sm items-center mx-2">
          
          {/* Icon Play lớn */}
          <View className="w-20 h-20 bg-[#9333ea] rounded-3xl items-center justify-center mb-6 shadow-lg shadow-purple-500/30">
            <Play size={40} color="#fff" fill="#fff" className="ml-2" />
          </View>

          <Text className="text-2xl font-extrabold text-slate-900 mb-4 text-center">
            Demo BatchGuard
          </Text>

          <Text className="text-slate-500 text-center mb-10 leading-relaxed px-2">
            Trải nghiệm hệ thống AI theo dõi quá trình phơi bánh tráng thực tế. Giám sát rủi ro thời tiết tự động.
          </Text>

          {/* Nút Bắt đầu */}
          <TouchableOpacity 
            onPress={handleStartSimulation}
            className="w-full bg-[#9333ea] py-4 rounded-2xl flex-row items-center justify-center gap-2 shadow-lg shadow-purple-500/25 active:scale-95 transition-transform"
          >
            <Play size={20} color="#fff" fill="#fff" />
            <Text className="text-white font-bold text-lg">Bắt đầu mô phỏng</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}