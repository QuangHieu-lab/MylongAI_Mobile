import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// Thêm Shield để làm icon cho nút Admin
import { User, Settings, Bell, CircleHelp, LogOut, ChevronRight, ShieldCheck, Shield } from 'lucide-react-native';
import { useRouter } from 'expo-router'; // 👈 Import thêm useRouter để chuyển trang
import { useAuth } from '@/src/contexts/AuthContext';

export default function ProfileScreen() {
  // 👈 Lấy thêm thông tin user từ Context
  const { user, logout } = useAuth(); 
  const router = useRouter(); // 👈 Khởi tạo router

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
                await logout(); 
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

        {/* Thông tin User (Đã làm cho Dynamic dựa theo dữ liệu user thật) */}
        <View className="bg-[#1e293b] p-5 rounded-3xl border border-slate-700/50 mb-6 flex-row items-center gap-4 shadow-lg">
          <View className="w-16 h-16 bg-[#0ea5e9] rounded-full items-center justify-center border-2 border-[#0ea5e9]/30">
            <User size={32} color="#0f172a" />
          </View>
          <View className="flex-1">
            <Text className="text-white text-xl font-bold mb-1">{user?.name || 'Người dùng'}</Text>
            <Text className="text-slate-400 text-sm">{user?.email || 'email@mylongai.com'}</Text>
            
            {user?.role === 'admin' ? (
              <View className="flex-row items-center gap-1 mt-2 bg-emerald-500/20 self-start px-2 py-0.5 rounded-md border border-emerald-500/30">
                <ShieldCheck size={12} color="#34d399" />
                <Text className="text-emerald-400 text-xs font-semibold">Tài khoản Admin</Text>
              </View>
            ) : (
              <View className="flex-row items-center gap-1 mt-2 bg-blue-500/20 self-start px-2 py-0.5 rounded-md border border-blue-500/30">
                <User size={12} color="#60a5fa" />
                <Text className="text-blue-400 text-xs font-semibold">Tài khoản Nhân viên</Text>
              </View>
            )}
          </View>
        </View>

        {/* ========================================== */}
        {/* 🚀 NÚT VÀO ADMIN (Chỉ hiện khi là Admin)   */}
        {/* ========================================== */}
        {user?.role === 'admin' && (
          <TouchableOpacity 
            onPress={() => router.push('/(admin)')}
            className="bg-purple-500/10 p-5 rounded-3xl border border-purple-500/30 mb-6 flex-row items-center justify-between shadow-lg shadow-purple-500/10"
          >
            <View className="flex-row items-center gap-4">
              <View className="w-12 h-12 rounded-full bg-purple-500/20 items-center justify-center">
                <Shield size={24} color="#c084fc" />
              </View>
              <View>
                <Text className="text-purple-400 font-bold text-lg mb-0.5">Quản trị hệ thống</Text>
                <Text className="text-purple-400/70 text-sm">Vào Admin Dashboard</Text>
              </View>
            </View>
            <ChevronRight size={20} color="#c084fc" />
          </TouchableOpacity>
        )}

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