import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Settings, Bell, CircleHelp, LogOut, ChevronRight, ShieldCheck } from 'lucide-react-native';
// Import AuthContext để lấy hàm Đăng xuất
import { useAuth } from '@/src/contexts/AuthContext';

export default function ProfileScreen() {
  // Lấy hàm logout từ Context (đảm bảo trong AuthContext của bạn đã có hàm này)
  const { logout } = useAuth(); 

  const handleLogout = () => {
    Alert.alert(
      "Đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?",
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Đăng xuất", 
          style: "destructive",
          onPress: async () => {
            try {
              if (logout) {
                await logout(); // Hàm này sẽ set user về null -> _layout.tsx tự động đẩy ra màn hình Login
              }
            } catch (error) {
              console.log("Lỗi đăng xuất", error);
            }
          }
        }
      ]
    );
  };

  // Nút Menu Component (Viết gọn để tái sử dụng)
  const MenuButton = ({ icon: Icon, title, color = "#94a3b8" }: any) => (
    <TouchableOpacity className="flex-row items-center justify-between py-4 border-b border-slate-800">
      <View className="flex-row items-center gap-3">
        <View className="w-10 h-10 rounded-full bg-slate-800 items-center justify-center">
          <Icon size={20} color={color} />
        </View>
        <Text className="text-slate-200 text-base font-medium">{title}</Text>
      </View>
      <ChevronRight size={20} color="#475569" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#0f172a]" edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        <Text className="text-2xl font-bold text-white mb-6">Tài khoản</Text>

        {/* Thông tin User */}
        <View className="bg-[#1e293b] p-5 rounded-3xl border border-slate-700/50 mb-6 flex-row items-center gap-4 shadow-lg">
          <View className="w-16 h-16 bg-[#0ea5e9] rounded-full items-center justify-center border-2 border-[#0ea5e9]/30">
            <User size={32} color="#0f172a" />
          </View>
          <View className="flex-1">
            <Text className="text-white text-xl font-bold mb-1">Quản đốc Xưởng</Text>
            <Text className="text-slate-400 text-sm">admin@mylongai.com</Text>
            <View className="flex-row items-center gap-1 mt-2 bg-emerald-500/20 self-start px-2 py-0.5 rounded-md border border-emerald-500/30">
              <ShieldCheck size={12} color="#34d399" />
              <Text className="text-emerald-400 text-xs font-semibold">Tài khoản Admin</Text>
            </View>
          </View>
        </View>

        {/* Danh sách Menu */}
        <View className="bg-[#1e293b] px-5 rounded-3xl border border-slate-700/50 mb-6">
          <MenuButton icon={Settings} title="Cài đặt hệ thống" />
          <MenuButton icon={Bell} title="Thông báo cảnh báo" />
          <MenuButton icon={CircleHelp} title="Hỗ trợ kỹ thuật" />
        </View>

        {/* Nút Đăng xuất */}
        <TouchableOpacity 
          onPress={handleLogout}
          className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-2xl flex-row items-center justify-center gap-2 mt-4"
        >
          <LogOut size={20} color="#f43f5e" />
          <Text className="text-rose-500 font-bold text-base">Đăng xuất</Text>
        </TouchableOpacity>

        <Text className="text-center text-slate-500 text-xs mt-8">
          Phiên bản ứng dụng: 1.0.0
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}