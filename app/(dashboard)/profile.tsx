import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  User, Settings, Bell, CircleHelp, LogOut, ChevronRight, 
  ShieldCheck, Shield, Crown, Zap, CalendarDays, Mail, CheckCircle2
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth(); 
  const router = useRouter();

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

  // 🚀 ĐỊNH NGHĨA CÁC BIẾN GIAO DIỆN DỰA VÀO ROLE
  const isPremium = user?.role === 'premium';
  const isAdmin = user?.role === 'admin';

  const getInitial = (name?: string) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  // Cấu hình màu sắc theo Role
  const coverColor = isPremium 
    ? 'bg-amber-500' 
    : isAdmin 
      ? 'bg-purple-600' 
      : 'bg-cyan-600';

  const textColor = isPremium 
    ? 'text-amber-500' 
    : isAdmin 
      ? 'text-purple-500' 
      : 'text-cyan-500';

  return (
    <SafeAreaView className="flex-1 bg-[#0f172a]" edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        <View className="mb-6">
          <Text className="text-3xl font-bold text-white mb-1">Hồ sơ cá nhân</Text>
          <Text className="text-slate-400">Quản lý thông tin tài khoản và bảo mật</Text>
        </View>

        {/* ========================================== */}
        {/* CARD THÔNG TIN USER (ĐỒNG BỘ LOGIC WEB) */}
        {/* ========================================== */}
        <View className={`bg-[#1e293b] rounded-3xl border mb-6 overflow-hidden shadow-lg ${isPremium ? 'border-amber-500/30' : 'border-slate-700/50'}`}>
          {/* Banner màu nền */}
          <View className={`h-20 w-full ${coverColor}`} />
          
          <View className="px-5 pb-6 items-center -mt-10">
            {/* Avatar chữ cái */}
            <View className="w-20 h-20 bg-[#0f172a] rounded-full items-center justify-center border-4 border-[#1e293b] relative">
              <Text className={`text-3xl font-black ${textColor}`}>
                {getInitial(user?.name)}
              </Text>
              {isPremium && (
                <View className="absolute -bottom-1 -right-1 bg-[#0f172a] rounded-full p-1">
                  <Crown size={16} color="#fbbf24" />
                </View>
              )}
            </View>

            <Text className="text-white text-xl font-bold mt-3 mb-1">{user?.name || 'Người dùng'}</Text>
            <Text className="text-slate-400 text-sm mb-4">{user?.email || 'email@mylongai.com'}</Text>

            {/* 🚀 BADGE CHỈ ĐỊNH ROLE CHUẨN MỰC */}
            <View className={`px-4 py-2 rounded-xl flex-row items-center justify-center w-full gap-2 ${
              isPremium 
                ? 'bg-amber-500' 
                : isAdmin 
                  ? 'bg-purple-500/20 border border-purple-500/30' 
                  : 'bg-slate-700/50 border border-slate-600'
            }`}>
              {isPremium ? (
                <>
                  <Crown size={16} color="#fff" />
                  <Text className="text-white font-bold text-xs uppercase tracking-wider">Gói Premium</Text>
                </>
              ) : isAdmin ? (
                <>
                  <ShieldCheck size={16} color="#c084fc" />
                  <Text className="text-purple-400 font-bold text-xs uppercase tracking-wider">Quản trị viên</Text>
                </>
              ) : (
                <>
                  <User size={16} color="#cbd5e1" />
                  <Text className="text-slate-300 font-bold text-xs uppercase tracking-wider">Gói Miễn Phí (Free)</Text>
                </>
              )}
            </View>

            {/* 🚀 HIỂN THỊ THỜI HẠN NẾU LÀ PREMIUM */}
            {isPremium && (
              <View className="mt-4 flex-row items-center justify-center gap-2 bg-amber-500/10 px-4 py-2 rounded-xl border border-amber-500/20 w-full">
                <CalendarDays size={16} color="#fbbf24" />
                <Text className="text-amber-400 text-xs font-medium">
                  Hạn dùng: {user?.premium_expired_at || user?.expiry_date 
                    ? new Date(user.premium_expired_at || user.expiry_date).toLocaleDateString('vi-VN') 
                    : '1 Tháng kể từ ngày mua'}
                </Text>
              </View>
            )}

            {/* 🚀 NÚT UPGRADE DÀNH CHO BẢN FREE */}
            {!isPremium && !isAdmin && (
              <TouchableOpacity 
                onPress={() => router.push('/premium')}
                className="w-full mt-5 bg-amber-500 py-3.5 rounded-xl flex-row items-center justify-center gap-2 shadow-lg shadow-amber-500/30"
              >
                <Zap size={18} color="#fff" />
                <Text className="text-white font-bold text-base">Nâng Cấp Premium</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ========================================== */}
        {/* 🚀 NÚT VÀO ADMIN (Chỉ hiện khi là Admin)   */}
        {/* ========================================== */}
        {isAdmin && (
          <TouchableOpacity 
            onPress={() => router.push('/(admin)')}
            className="bg-purple-500/10 p-5 rounded-3xl border border-purple-500/30 mb-6 flex-row items-center justify-between shadow-lg"
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

        {/* ========================================== */}
        {/* CHI TIẾT TÀI KHOẢN (Read Only) */}
        {/* ========================================== */}
        <View className="bg-[#1e293b] p-5 rounded-3xl border border-slate-700/50 mb-6 shadow-lg">
          <View className="flex-row items-center gap-2 mb-5 border-b border-slate-800 pb-4">
            <User size={20} color="#22d3ee" />
            <Text className="text-white font-bold text-lg">Thông tin chi tiết</Text>
          </View>

          <View className="space-y-4">
            {/* Account ID */}
            <View>
              <Text className="text-slate-400 text-xs font-medium mb-1.5 flex-row items-center">
                Account ID
              </Text>
              <View className="bg-[#0f172a] p-3 rounded-xl border border-slate-800">
                <Text className="text-slate-500 font-mono text-sm">{user?.id || '---'}</Text>
              </View>
            </View>

            {/* Họ và tên */}
            <View className="mt-4">
              <Text className="text-slate-400 text-xs font-medium mb-1.5">Họ và tên</Text>
              <View className="bg-[#0f172a] p-3 rounded-xl border border-slate-800">
                <Text className="text-slate-300 text-sm">{user?.name || '---'}</Text>
              </View>
            </View>

            {/* Email */}
            <View className="mt-4">
              <Text className="text-slate-400 text-xs font-medium mb-1.5">Email liên hệ</Text>
              <View className="bg-[#0f172a] p-3 rounded-xl border border-slate-800 flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Mail size={16} color="#64748b" />
                  <Text className="text-slate-300 text-sm">{user?.email || '---'}</Text>
                </View>
                <View className="flex-row items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                  <CheckCircle2 size={12} color="#34d399" />
                  <Text className="text-emerald-400 text-[10px] font-bold uppercase">Đã xác thực</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Nút Đăng xuất */}
        <TouchableOpacity 
          onPress={handleLogout}
          className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-2xl flex-row items-center justify-center gap-2 mt-2"
        >
          <LogOut size={20} color="#f43f5e" />
          <Text className="text-rose-500 font-bold text-base">Đăng xuất tài khoản</Text>
        </TouchableOpacity>

        <Text className="text-center text-slate-600 text-xs mt-8 font-medium">
          Phiên bản ứng dụng: 1.0.0
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}