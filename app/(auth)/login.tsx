import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ImageBackground, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  ActivityIndicator,
  TouchableWithoutFeedback, // 👈 Import thêm để bắt sự kiện chạm
  Keyboard                  // 👈 Import thêm để ra lệnh ẩn bàn phím
} from 'react-native';
import { Activity, Sparkles, Mail, Lock, User as UserIcon } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthForm } from '@/src/hooks/useAuthForm';
import CustomInput from '@/src/components/CustomInput';

export default function LoginScreen() {
  const {
    activeTab, setActiveTab, isLoading,
    loginEmail, setLoginEmail, loginPassword, setLoginPassword,
    registerName, setRegisterName, registerEmail, setRegisterEmail,
    registerPassword, setRegisterPassword, handleLogin, handleRegister
  } = useAuthForm();

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#0f172a]"
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }} 
        bounces={false} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled" // 👈 Cho phép bấm nút Login ngay cả khi bàn phím đang mở
      >
        {/* 👈 Bọc toàn bộ nội dung để khi chạm vào vùng trống sẽ ẩn bàn phím */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1">
            
            {/* ================= PHẦN NỀN (BACKGROUND) ================= */}
            <View className="absolute top-0 left-0 right-0 h-[50%]">
              <ImageBackground 
                source={{ uri: 'https://images.unsplash.com/photo-1595859702951-409199a0ed8e?q=80&w=1000&auto=format&fit=crop' }} 
                className="flex-1"
              >
                <View className="flex-1 bg-slate-900/70" />
              </ImageBackground>
            </View>

            {/* ================= PHẦN HEADER (LOGO MYLONGAI) ================= */}
            <SafeAreaView className="relative z-10 w-full pt-12 pb-6 px-6 items-center">
              <View className="flex-row items-center justify-center gap-3 mb-2">
                <View className="w-12 h-12 bg-[#0ea5e9] rounded-2xl items-center justify-center shadow-lg">
                  <Activity size={28} color="#0f172a" />
                </View>
                <View className="justify-center">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-2xl font-bold text-white tracking-tight">MYLONGAI</Text>
                    <View className="flex-row items-center gap-1 px-1.5 py-0.5 bg-[#0ea5e9]/20 border border-[#0ea5e9]/30 rounded-md">
                      <Sparkles size={10} color="#38bdf8" />
                      <Text className="text-[10px] font-bold text-[#38bdf8]">AI</Text>
                    </View>
                  </View>
                  <Text className="text-xs text-slate-300 mt-0.5">BatchGuard System</Text>
                </View>
              </View>
              <Text className="text-slate-300 text-sm">Hệ thống AI kiểm soát quá trình phơi bánh tráng</Text>
            </SafeAreaView>

            {/* ================= PHẦN FORM ĐĂNG NHẬP / ĐĂNG KÝ ================= */}
            <View className="flex-1 justify-end">
              <View className="bg-[#1e293b] w-full rounded-t-[32px] p-6 pb-10 border-t border-slate-700/50 shadow-2xl">
                
                {/* Tabs chuyển đổi Login / Register */}
                <View className="flex-row mb-6 gap-2 mt-4">
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

                {activeTab === 'register' && (
                  <CustomInput
                    label="Họ và tên"
                    icon={UserIcon}
                    placeholder="Nguyễn Văn A"
                    value={registerName}
                    onChangeText={setRegisterName}
                    editable={!isLoading}
                  />
                )}

                <CustomInput
                  label="Email"
                  icon={Mail}
                  placeholder="email@vi-du.com"
                  keyboardType="email-address"
                  value={activeTab === 'login' ? loginEmail : registerEmail}
                  onChangeText={activeTab === 'login' ? setLoginEmail : setRegisterEmail}
                  editable={!isLoading}
                />

                <CustomInput
                  label="Mật khẩu"
                  icon={Lock}
                  placeholder="••••••••"
                  isPassword={true}
                  value={activeTab === 'login' ? loginPassword : registerPassword}
                  onChangeText={activeTab === 'login' ? setLoginPassword : setRegisterPassword}
                  editable={!isLoading}
                />

                {/* Nút Submit */}
                <TouchableOpacity 
                  onPress={activeTab === 'login' ? handleLogin : handleRegister}
                  disabled={isLoading}
                  className="w-full bg-[#0ea5e9] h-12 rounded-2xl items-center justify-center shadow-lg flex-row mt-2"
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text className="text-white text-base font-semibold">
                      {activeTab === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
                    </Text>
                  )}
                </TouchableOpacity>

                <Text className="text-center text-xs text-slate-500 mt-4">
                  Bằng cách tiếp tục, bạn đồng ý với <Text className="underline text-[#0ea5e9]">Điều khoản</Text> và <Text className="underline text-[#0ea5e9]">Chính sách bảo mật</Text> của MYLONGAI
                </Text>

              </View>
            </View>

          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}