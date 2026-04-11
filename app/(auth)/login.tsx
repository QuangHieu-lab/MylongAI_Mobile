import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ImageBackground, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Activity, Sparkles, Mail, Lock, Eye, EyeOff, X } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const router = useRouter();
  
  // Trạng thái (State)
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form Đăng nhập
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Form Đăng ký
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  // Xử lý đăng nhập
  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }
    
    setIsLoading(true);
    // Giả lập gọi API
    setTimeout(() => {
      setIsLoading(false);
      // Chuyển hướng sau khi đăng nhập thành công (thay đổi route tùy dự án của bạn)
      // router.replace('/(dashboard)'); 
      Alert.alert('Thành công', 'Đăng nhập thành công!');
    }, 1500);
  };

  // Xử lý đăng ký
  const handleRegister = async () => {
    if (!registerName || !registerEmail || !registerPassword) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert('Thành công', 'Tạo tài khoản thành công!');
      setActiveTab('login');
    }, 1500);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#0f172a]"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false} showsVerticalScrollIndicator={false}>
        
        {/* Phần Nền (Background Image) */}
        <View className="absolute top-0 left-0 right-0 h-[50%]">
          <ImageBackground 
            source={{ uri: 'https://images.unsplash.com/photo-1595859702951-409199a0ed8e?q=80&w=1000&auto=format&fit=crop' }} 
            className="flex-1"
          >
            {/* Lớp phủ màu đen gradient (Overlay) */}
            <View className="flex-1 bg-slate-900/70" />
          </ImageBackground>
        </View>

        {/* Phần Header (Logo) */}
        <SafeAreaView className="relative z-10 w-full pt-12 pb-6 px-6 items-center">
          <View className="flex-row items-center justify-center gap-3 mb-2">
            <View className="w-12 h-12 bg-sky-400 rounded-2xl items-center justify-center shadow-lg">
              <Activity size={28} color="#0a0f24" />
            </View>
            <View className="justify-center">
              <View className="flex-row items-center gap-2">
                <Text className="text-2xl font-bold text-white tracking-tight">MYLONGAI</Text>
                <View className="flex-row items-center gap-1 px-1.5 py-0.5 bg-sky-400/20 border border-sky-400/30 rounded-md">
                  <Sparkles size={10} color="#38bdf8" />
                  <Text className="text-[10px] font-bold text-sky-400">AI</Text>
                </View>
              </View>
              <Text className="text-xs text-slate-300 mt-0.5">BatchGuard System</Text>
            </View>
          </View>
          <Text className="text-slate-300 text-sm">Hệ thống AI kiểm soát quá trình phơi bánh tráng</Text>
        </SafeAreaView>

        {/* Phần View đẩy nội dung xuống dưới cùng */}
        <View className="flex-1 justify-end">
          
          {/* Card Đăng nhập / Đăng ký (Bottom Sheet Style) */}
          <View className="bg-[#1e293b] w-full rounded-t-[32px] p-6 pb-10 border-t border-slate-700/50 shadow-2xl">
            
            {/* Nút đóng (X) */}
            <TouchableOpacity className="absolute right-6 top-6 w-8 h-8 bg-slate-700/50 rounded-full items-center justify-center z-20">
              <X size={20} color="#cbd5e1" />
            </TouchableOpacity>

            <View className="items-center mb-6 mt-2">
              <Text className="text-white text-2xl font-semibold mb-1">Chào mừng trở lại</Text>
              <Text className="text-slate-400 text-sm">Đăng nhập để truy cập hệ thống giám sát</Text>
            </View>

            {/* Custom Tabs */}
            <View className="flex-row mb-6 gap-2">
              <TouchableOpacity 
                onPress={() => setActiveTab('login')}
                className={`flex-1 py-2.5 rounded-full border ${activeTab === 'login' ? 'bg-[#0f766e] border-transparent' : 'border-slate-700 bg-transparent'}`}
              >
                <Text className={`text-center font-medium ${activeTab === 'login' ? 'text-white' : 'text-slate-400'}`}>Đăng nhập</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => setActiveTab('register')}
                className={`flex-1 py-2.5 rounded-full border ${activeTab === 'register' ? 'bg-[#0f766e] border-transparent' : 'border-slate-700 bg-transparent'}`}
              >
                <Text className={`text-center font-medium ${activeTab === 'register' ? 'text-white' : 'text-slate-400'}`}>Đăng ký</Text>
              </TouchableOpacity>
            </View>

            {/* Form Fields */}
            {activeTab === 'register' && (
              <View className="mb-4 space-y-2">
                <Text className="text-slate-200 text-sm mb-1">Họ và tên</Text>
                <View className="h-12 border border-slate-600 rounded-2xl px-4 justify-center">
                  <TextInput
                    className="flex-1 text-white"
                    placeholder="Nguyễn Văn A"
                    placeholderTextColor="#64748b"
                    value={registerName}
                    onChangeText={setRegisterName}
                    editable={!isLoading}
                  />
                </View>
              </View>
            )}

            <View className="mb-4 space-y-2">
              <Text className="text-slate-200 text-sm mb-1">Email</Text>
              <View className="flex-row items-center h-12 border border-slate-600 rounded-2xl px-4">
                <Mail size={20} color="#94a3b8" />
                <TextInput
                  className="flex-1 text-white ml-3"
                  placeholder="email@vi-du.com"
                  placeholderTextColor="#64748b"
                  value={activeTab === 'login' ? loginEmail : registerEmail}
                  onChangeText={activeTab === 'login' ? setLoginEmail : setRegisterEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>
            </View>

            <View className="mb-6 space-y-2">
              <Text className="text-slate-200 text-sm mb-1">Mật khẩu</Text>
              <View className="flex-row items-center h-12 border border-slate-600 rounded-2xl px-4">
                <Lock size={20} color="#94a3b8" />
                <TextInput
                  className="flex-1 text-white ml-3"
                  placeholder="••••••••"
                  placeholderTextColor="#64748b"
                  secureTextEntry={!showPassword}
                  value={activeTab === 'login' ? loginPassword : registerPassword}
                  onChangeText={activeTab === 'login' ? setLoginPassword : setRegisterPassword}
                  editable={!isLoading}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-1">
                  {showPassword ? <EyeOff size={20} color="#94a3b8" /> : <Eye size={20} color="#94a3b8" />}
                </TouchableOpacity>
              </View>
            </View>

            {/* Nút Đăng Nhập / Đăng ký */}
            <TouchableOpacity 
              onPress={activeTab === 'login' ? handleLogin : handleRegister}
              disabled={isLoading}
              className="w-full bg-[#0ea5e9] h-12 rounded-2xl items-center justify-center shadow-lg flex-row"
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text className="text-white text-base font-semibold">
                  {activeTab === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
               </Text>
              )}
            </TouchableOpacity>

            {/* Đăng nhập bằng Google */}
            <View className="mt-8 mb-6">
              <View className="flex-row items-center justify-center">
                <View className="flex-1 h-[1px] bg-slate-600" />
                <Text className="mx-4 text-slate-500 text-xs">hoặc đăng nhập bằng</Text>
                <View className="flex-1 h-[1px] bg-slate-600" />
              </View>
              
              <TouchableOpacity className="w-full mt-6 flex-row h-12 border border-slate-600 rounded-full items-center justify-center">
                <Text className="text-white text-base font-medium">Tiếp tục với Google</Text>
              </TouchableOpacity>
            </View>

            <Text className="text-center text-xs text-slate-500 mt-2">
              Bằng cách tiếp tục, bạn đồng ý với <Text className="underline">Điều khoản</Text> và <Text className="underline">Chính sách bảo mật</Text> của MYLONGAI
            </Text>

          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}