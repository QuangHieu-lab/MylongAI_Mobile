import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  Alert,
  ActivityIndicator,
  ImageBackground
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, User as UserIcon, Eye, EyeOff, Activity, Sparkles, X } from 'lucide-react-native';

// Import Custom Hook Auth của bạn
import { useAuth } from '@/src/contexts/AuthContext';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      await register(name, email, password);
      Alert.alert('Thành công', 'Tạo tài khoản thành công! Vui lòng đăng nhập.', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') }
      ]);
    } catch (error) {
      Alert.alert('Đăng ký thất bại', 'Có lỗi xảy ra, vui lòng thử lại sau.');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#0f172a]"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false} showsVerticalScrollIndicator={false}>
        
        {/* Phần Nền Hình Ảnh (Giống Login) */}
        <View className="absolute top-0 left-0 right-0 h-[50%]">
          <ImageBackground 
            source={{ uri: 'https://images.unsplash.com/photo-1595859702951-409199a0ed8e?q=80&w=1000&auto=format&fit=crop' }} 
            className="flex-1"
          >
            <View className="flex-1 bg-slate-900/75" />
          </ImageBackground>
        </View>

        {/* Header Logo */}
        <SafeAreaView className="relative z-10 w-full pt-12 pb-6 px-6 items-center">
          <View className="flex-row items-center justify-center gap-3 mb-2">
            <View className="w-12 h-12 bg-cyan-400 rounded-2xl items-center justify-center shadow-lg">
              <Activity size={28} color="#0a0f24" />
            </View>
            <View className="justify-center">
              <View className="flex-row items-center gap-2">
                <Text className="text-2xl font-bold text-white tracking-tight">MYLONGAI</Text>
                <View className="flex-row items-center gap-1 px-1.5 py-0.5 bg-cyan-400/20 border border-cyan-400/30 rounded-md">
                  <Sparkles size={10} color="#22d3ee" />
                  <Text className="text-[10px] font-bold text-cyan-400">AI</Text>
                </View>
              </View>
              <Text className="text-xs text-slate-300 mt-0.5">BatchGuard System</Text>
            </View>
          </View>
          <Text className="text-slate-300 text-sm">Hệ thống AI kiểm soát quá trình phơi bánh tráng</Text>
        </SafeAreaView>

        {/* Card Form Đăng ký */}
        <View className="flex-1 justify-end mt-4">
          <View className="bg-[#1e293b] w-full rounded-t-[32px] p-6 pb-10 border-t border-slate-700/50 shadow-2xl">
            
            <View className="items-center mb-6 mt-2">
              <Text className="text-white text-2xl font-semibold mb-1">Tạo tài khoản mới</Text>
              <Text className="text-slate-400 text-sm">Điền thông tin để tham gia hệ thống giám sát</Text>
            </View>

            {/* Segmented Control (Tabs) */}
            <View className="flex-row mb-6 bg-slate-900/50 rounded-full p-1 border border-slate-700/50">
              <TouchableOpacity 
                onPress={() => router.replace('/(auth)/login')} // Bấm vào đây sẽ chuyển về trang Login
                className="flex-1 py-2.5 rounded-full bg-transparent"
              >
                <Text className="text-center font-medium text-slate-400">Đăng nhập</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                activeOpacity={1}
                className="flex-1 py-2.5 rounded-full bg-cyan-500 shadow-sm"
              >
                <Text className="text-center font-bold text-slate-900">Đăng ký</Text>
              </TouchableOpacity>
            </View>

            {/* Input: Họ và tên */}
            <View className="mb-4 space-y-2">
              <Text className="text-slate-200 text-sm font-medium mb-1.5">Họ và tên</Text>
              <View className="flex-row items-center h-12 border border-slate-600 rounded-2xl px-4 bg-slate-900/50 focus:border-cyan-400">
                <UserIcon size={20} color="#94a3b8" />
                <TextInput
                  className="flex-1 text-white ml-3 h-full"
                  placeholder="Nguyễn Văn A"
                  placeholderTextColor="#64748b"
                  value={name}
                  onChangeText={setName}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Input: Email */}
            <View className="mb-4 space-y-2">
              <Text className="text-slate-200 text-sm font-medium mb-1.5">Email</Text>
              <View className="flex-row items-center h-12 border border-slate-600 rounded-2xl px-4 bg-slate-900/50 focus:border-cyan-400">
                <Mail size={20} color="#94a3b8" />
                <TextInput
                  className="flex-1 text-white ml-3 h-full"
                  placeholder="email@example.com"
                  placeholderTextColor="#64748b"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Input: Mật khẩu */}
            <View className="mb-8 space-y-2">
              <Text className="text-slate-200 text-sm font-medium mb-1.5">Mật khẩu</Text>
              <View className="flex-row items-center h-12 border border-slate-600 rounded-2xl px-4 bg-slate-900/50 focus:border-cyan-400">
                <Lock size={20} color="#94a3b8" />
                <TextInput
                  className="flex-1 text-white ml-3 h-full"
                  placeholder="••••••••"
                  placeholderTextColor="#64748b"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  editable={!isLoading}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-1">
                  {showPassword ? <EyeOff size={20} color="#94a3b8" /> : <Eye size={20} color="#94a3b8" />}
                </TouchableOpacity>
              </View>
            </View>

            {/* Nút Tạo tài khoản */}
            <TouchableOpacity 
              onPress={handleRegister}
              disabled={isLoading}
              className="w-full bg-cyan-500 h-12 rounded-2xl items-center justify-center shadow-lg shadow-cyan-500/30 flex-row"
            >
              {isLoading ? (
                <ActivityIndicator color="#0f172a" size="small" />
              ) : (
                <Text className="text-slate-900 text-base font-bold">
                  Tạo tài khoản
                </Text>
              )}
            </TouchableOpacity>

            {/* Điều khoản */}
            <Text className="text-center text-xs text-slate-500 mt-6">
              Bằng cách đăng ký, bạn đồng ý với <Text className="text-cyan-500 underline">Điều khoản</Text> và <Text className="text-cyan-500 underline">Chính sách bảo mật</Text> của MYLONGAI
            </Text>

          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}