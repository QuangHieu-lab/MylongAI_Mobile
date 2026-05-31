import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { 
  LayoutDashboard, Factory, PackageCheck, Camera, 
  AlertTriangle, DollarSign, LineChart, Users, 
  Settings, LogOut, Activity 
} from 'lucide-react-native';

const ADMIN_MENU = [
  { path: '/(admin)/overview', icon: LayoutDashboard, label: 'Tổng quan', color: '#3b82f6' }, // Blue
  { path: '/(admin)/farms', icon: Factory, label: 'Khu vực và thiết bị', color: '#10b981' }, // Emerald
  { path: '/(admin)/batches', icon: PackageCheck, label: 'Mẻ bánh', color: '#f59e0b' }, // Amber
  { path: '/(admin)/cameras', icon: Camera, label: 'Camera AI', color: '#06b6d4' }, // Cyan
  { path: '/(admin)/risks', icon: AlertTriangle, label: 'Thư viện lỗi AI', color: '#ef4444' }, // Red
  { path: '/(admin)/revenue', icon: DollarSign, label: 'Doanh thu', color: '#22c55e' }, // Green
  { path: '/(admin)/analytics', icon: LineChart, label: 'Phân tích', color: '#8b5cf6' }, // Violet
  { path: '/(admin)/users', icon: Users, label: 'Người dùng', color: '#ec4899' }, // Pink
  { path: '/(admin)/settings', icon: Settings, label: 'Cài đặt', color: '#94a3b8' }, // Slate
];

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <View className="flex-1 bg-[#0f172a]">
      {/* --- HEADER --- */}
      <View className="pt-14 pb-6 px-6 bg-[#1e293b] border-b border-slate-800 rounded-b-3xl shadow-lg">
        <View className="flex-row items-center gap-4">
          <View className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <Activity size={24} color="#ffffff" />
          </View>
          <View>
            <Text className="text-white text-2xl font-bold tracking-tight">MYLONGAI</Text>
            <Text className="text-cyan-400 text-sm font-semibold tracking-wider uppercase mt-0.5">Admin Dashboard</Text>
          </View>
        </View>
      </View>

      {/* --- MENU GRID --- */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24 }}>
        <Text className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-4 ml-1">
          Quản lý hệ thống
        </Text>

        <View className="flex-row flex-wrap justify-between gap-y-4">
          {ADMIN_MENU.map((item, index) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={index}
                onPress={() => router.push(item.path as any)}
                className="w-[48%] bg-[#1e293b] p-5 rounded-[24px] border border-slate-700/50 shadow-lg items-center justify-center"
              >
                <View 
                  className="w-14 h-14 rounded-full mb-3 items-center justify-center" 
                  style={{ backgroundColor: `${item.color}15` }} // Nền mờ 15% opacity
                >
                  <Icon size={28} color={item.color} />
                </View>
                <Text className="text-slate-200 font-semibold text-center">{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* --- NÚT ĐĂNG XUẤT --- */}
        <TouchableOpacity 
          onPress={handleLogout}
          className="mt-8 mb-10 flex-row items-center justify-center bg-red-500/10 p-4 rounded-2xl border border-red-500/30"
        >
          <LogOut size={20} color="#f87171" className="mr-2" />
          <Text className="text-red-400 font-bold text-lg">Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}