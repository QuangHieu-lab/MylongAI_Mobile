import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, 
  ActivityIndicator, Image, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { 
  ChevronLeft, CheckCircle2, QrCode, AlertTriangle, 
  Zap, CreditCard, Copy, ShieldCheck 
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';

// Tùy chỉnh import theo đúng đường dẫn của bạn
import { paymentApi, authApi } from '@/src/services/api';
import { useAuth } from '@/src/contexts/AuthContext';

const { width } = Dimensions.get('window');

export default function PremiumScreen() {
  const router = useRouter();
  const { refetchUser } = useAuth();

  const [order, setOrder] = useState<any>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ==============================================
  // 1. GỌI API TẠO ĐƠN HÀNG LẤY QR 
  // ==============================================
  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);

    try {
      const currentProfileRes: any = await authApi.getMe(); // Sửa getProfile() thành getMe() theo AuthContext
      const currentProfile = currentProfileRes?.data || currentProfileRes;
      const initialExp = currentProfile?.premium_expired_at || null;

      const res: any = await paymentApi.createOrder();
      const data = res?.data || res;
      setOrder(data); 

      startPolling(initialExp);
    } catch (err: any) {
      if (err.response?.status === 400) {
        Toast.show({ type: 'info', text1: 'Đang hoạt động', text2: 'Bạn đã có gói Premium đang hoạt động!' });
      } else {
        setError(err.response?.data?.detail || err.message || "Lỗi hệ thống, không thể tạo đơn hàng.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ==============================================
  // 2. POLLING: KIỂM TRA PROFILE CHỜ THANH TOÁN
  // ==============================================
  const startPolling = (initialExp: string | null) => {
    pollIntervalRef.current = setInterval(async () => {
      try {
        const res: any = await authApi.getMe();
        const profile = res?.data || res;
        const newExp = profile?.premium_expired_at || null;

        if (profile.role === 'premium' && newExp !== initialExp) {
          stopPolling();
          setIsPaid(true);

          if (refetchUser) {
            await refetchUser();
          }
        }
      } catch (err) {
        console.error("Lỗi khi poll profile:", err);
      }
    }, 5000);

    timeoutRef.current = setTimeout(() => {
      stopPolling();
      setError("Mã QR đã hết hạn (quá 15 phút). Vui lòng trở lại để tạo đơn mới.");
      setOrder(null);
    }, 15 * 60 * 1000);
  };

  const stopPolling = () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  useEffect(() => {
    return () => stopPolling();
  }, []);

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Toast.show({ type: 'success', text1: 'Đã copy vào khay nhớ tạm!' });
  };

  // ==============================================
  // GIAO DIỆN 3: THÀNH CÔNG
  // ==============================================
  if (isPaid) {
    return (
      <SafeAreaView className="flex-1 bg-[#0f172a] justify-center items-center p-6">
        <View className="w-full bg-[#1e293b] p-8 rounded-[32px] border border-emerald-500/30 items-center">
          <View className="w-24 h-24 bg-emerald-500/20 rounded-full items-center justify-center mb-6">
            <CheckCircle2 size={56} color="#34d399" />
          </View>
          <Text className="text-3xl font-bold text-white mb-4">Nâng Cấp Xong!</Text>
          <Text className="text-slate-400 text-center text-base mb-8 leading-relaxed">
            Tài khoản của bạn đã được kích hoạt gói Premium. Hệ thống đã cập nhật đặc quyền thành công.
          </Text>
          <TouchableOpacity 
            onPress={() => router.replace('/(dashboard)/home')}
            className="w-full bg-emerald-500 py-4 rounded-2xl items-center shadow-lg"
          >
            <Text className="text-white font-bold text-lg">Về bảng điều khiển</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ==============================================
  // GIAO DIỆN 2: CHỜ THANH TOÁN (HIỂN THỊ QR)
  // ==============================================
  if (order) {
    return (
      <SafeAreaView className="flex-1 bg-[#0f172a]">
        <View className="flex-row items-center gap-3 px-6 py-4 border-b border-slate-800/50">
          <TouchableOpacity onPress={() => { stopPolling(); setOrder(null); }} className="w-10 h-10 bg-[#1e293b] rounded-full items-center justify-center">
            <ChevronLeft size={24} color="#f8fafc" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Thanh toán Premium</Text>
        </View>
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
          
          <View className="items-center mb-8">
            <View className="bg-white p-4 rounded-3xl w-[260px] h-[260px] items-center justify-center mb-6 shadow-2xl">
              <Image source={{ uri: order.qr_url }} style={{ width: 230, height: 230 }} resizeMode="contain" />
            </View>
            <View className="flex-row items-center gap-3 bg-orange-500/10 px-5 py-3 rounded-full border border-orange-500/20">
              <ActivityIndicator color="#f97316" />
              <Text className="text-orange-400 font-semibold">Hệ thống đang chờ thanh toán...</Text>
            </View>
          </View>

          <View className="bg-[#1e293b] rounded-[24px] p-5 border border-slate-700/50">
            <View className="flex-row items-center gap-2 mb-4">
              <ShieldCheck size={20} color="#34d399" />
              <Text className="text-white font-bold text-lg">Thông tin chuyển khoản</Text>
            </View>
            
            <View className="space-y-4">
              <View className="flex-row justify-between items-center border-b border-slate-700/50 pb-3">
                <Text className="text-slate-400">Gói đăng ký:</Text>
                <View className="bg-cyan-500/10 px-2 py-1 rounded">
                  <Text className="font-bold text-cyan-400 text-xs">Tháng thứ {order.month_number || 1}</Text>
                </View>
              </View>

              <View className="flex-row justify-between items-center border-b border-slate-700/50 pb-3">
                <Text className="text-slate-400">Ngân hàng:</Text>
                <Text className="font-bold text-white">{order.bank_name}</Text>
              </View>

              <View className="flex-row justify-between items-center border-b border-slate-700/50 pb-3">
                <Text className="text-slate-400">Chủ thẻ:</Text>
                <Text className="font-bold text-white max-w-[150px]" numberOfLines={1}>{order.account_name}</Text>
              </View>

              <View className="flex-row justify-between items-center border-b border-slate-700/50 pb-3">
                <Text className="text-slate-400">Số tài khoản:</Text>
                <TouchableOpacity onPress={() => copyToClipboard(order.bank_account)} className="flex-row items-center gap-2">
                  <Text className="font-bold text-cyan-400 text-base">{order.bank_account}</Text>
                  <View className="bg-slate-800 p-1.5 rounded"><Copy size={14} color="#94a3b8" /></View>
                </TouchableOpacity>
              </View>

              <View className="flex-row justify-between items-center border-b border-slate-700/50 pb-3">
                <Text className="text-slate-400">Số tiền:</Text>
                <Text className="font-black text-emerald-400 text-xl">{Number(order.amount).toLocaleString('vi-VN')} đ</Text>
              </View>

              <View className="flex-row justify-between items-center pt-2">
                <Text className="text-slate-400">Nội dung:</Text>
                <TouchableOpacity onPress={() => copyToClipboard(order.content)} className="flex-row items-center gap-2 bg-orange-500/10 px-3 py-2 rounded-xl border border-orange-500/20">
                  <Text className="text-orange-400 font-bold text-base tracking-widest">{order.content}</Text>
                  <Copy size={16} color="#f97316" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View className="flex-row items-start gap-3 bg-amber-500/10 p-4 rounded-2xl border border-amber-500/30 mt-6">
            <AlertTriangle size={20} color="#fbbf24" className="mt-0.5 flex-shrink-0" />
            <Text className="text-amber-400 text-xs leading-relaxed flex-1">
              Nếu bạn chuyển khoản thủ công, vui lòng ghi chính xác <Text className="font-bold text-amber-300">Nội dung chuyển khoản</Text> để hệ thống tự động kích hoạt.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ==============================================
  // GIAO DIỆN 1: TRƯỚC KHI TẠO ĐƠN
  // ==============================================
  return (
    <SafeAreaView className="flex-1 bg-[#0f172a]" edges={['top']}>
      <View className="flex-row items-center gap-3 px-6 py-4 border-b border-slate-800/50">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-[#1e293b] rounded-full items-center justify-center border border-slate-700">
          <ChevronLeft size={24} color="#f8fafc" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Nâng cấp tài khoản</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        <View className="bg-[#1e293b] rounded-[32px] overflow-hidden border border-slate-700/50 shadow-xl mb-6">
          <View className="bg-gradient-to-b from-purple-500/20 to-transparent p-6 items-center">
            <Zap size={32} color="#c084fc" className="mb-3" />
            <Text className="text-2xl font-bold text-white text-center">Toàn Bản Quyền</Text>
            <Text className="text-slate-400 text-center text-sm mt-2">Nâng cấp hệ thống giám sát lên mức tối đa</Text>
          </View>

          <View className="p-6">
            {error && (
              <View className="flex-row items-center gap-3 bg-red-500/10 p-4 rounded-2xl border border-red-500/20 mb-6">
                <AlertTriangle size={20} color="#f87171" style={{ flexShrink: 0 }} />
                <Text className="text-red-400 flex-1 text-sm">{error}</Text>
              </View>
            )}

            <Text className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-3 text-center">Bảng Giá Premium</Text>
            
            <View className="bg-[#0f172a] rounded-2xl p-4 border border-slate-800 mb-3 flex-row justify-between items-center shadow-inner">
              <Text className="text-slate-300 font-medium">Tháng 1 & 2:</Text>
              <View className="items-end">
                <Text className="font-extrabold text-xl text-purple-400">299.000đ</Text>
                <Text className="text-slate-500 text-[10px]">/tháng</Text>
              </View>
            </View>

            <View className="bg-[#0f172a] rounded-2xl p-4 border border-slate-800 mb-4 flex-row justify-between items-center shadow-inner">
              <Text className="text-slate-300 font-medium">Từ tháng 3:</Text>
              <View className="items-end">
                <Text className="font-extrabold text-xl text-cyan-400">399.000đ</Text>
                <Text className="text-slate-500 text-[10px]">/tháng</Text>
              </View>
            </View>

            <View className="bg-emerald-500/10 px-4 py-3 rounded-2xl border border-emerald-500/20 mb-8">
              <Text className="text-emerald-400 text-center text-[10px] leading-relaxed">
                Hệ thống sẽ tự động nhận diện và tính toán giá dựa trên lịch sử tài khoản của bạn.
              </Text>
            </View>

            <Text className="text-white font-bold text-base mb-4 text-center">Đặc quyền Premium:</Text>
            <View className="space-y-4 mb-8">
              {[
                "Xem lịch sử cảm biến không giới hạn",
                "AI Nhận diện bánh không giới hạn",
                "Quản lý Camera không giới hạn",
                "Nhận Khuyến nghị thời tiết thông minh",
                "AI dự đoán chính xác thời gian phơi"
              ].map((text, i) => (
                <View key={i} className="flex-row items-center gap-3">
                  <CheckCircle2 size={20} color="#10b981" />
                  <Text className="text-slate-300 text-sm">{text}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity 
              onPress={handleUpgrade}
              disabled={loading}
              className="w-full bg-purple-600 flex-row justify-center items-center gap-3 py-4 rounded-2xl"
              style={{ backgroundColor: loading ? '#64748b' : '#9333ea' }} // Fallback mầu nếu tailwind gradient lỗi
            >
              {loading ? <ActivityIndicator color="#fff" /> : <CreditCard size={24} color="#fff" />}
              <Text className="text-white font-bold text-base">
                {loading ? "Đang tạo mã..." : "Nâng Cấp Premium"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}