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
  TouchableWithoutFeedback,
  Keyboard 
} from 'react-native';
import { Activity, Sparkles, Mail, Lock, User as UserIcon, ArrowLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthForm } from '@/src/hooks/useAuthForm';
import CustomInput from '@/src/components/CustomInput';

export default function LoginScreen() {
  const {
    activeTab, setActiveTab, isLoading, isForgotLoading,
    loginEmail, setLoginEmail, loginPassword, setLoginPassword,
    registerName, setRegisterName, registerEmail, setRegisterEmail,
    registerPassword, setRegisterPassword, 
    forgotEmail, setForgotEmail, 
    handleLogin, handleRegister, handleForgotPassword
  } = useAuthForm();

  return (
    <View className="flex-1 bg-[#0f172a]">
      {/* ================= PHẦN NỀN CỐ ĐỊNH ================= */}
      <View className="absolute top-0 left-0 right-0 h-full">
        <ImageBackground 
          source={{ uri: 'https://images.unsplash.com/photo-1595859702951-409199a0ed8e?q=80&w=1000&auto=format&fit=crop' }} 
          className="flex-1"
        >
          <View className="flex-1 bg-slate-900/80" />
        </ImageBackground>
      </View>

      {/* ================= NỘI DUNG CUỘN ĐƯỢC ================= */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} 
            bounces={false} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            
            {/* ================= HEADER LOGO ================= */}
            <SafeAreaView className="w-full pt-4 pb-12 px-6 items-center">
              <View className="flex-row items-center justify-center gap-3 mb-3">
                <View className="w-14 h-14 bg-[#0ea5e9] rounded-2xl items-center justify-center shadow-lg">
                  <Activity size={32} color="#0f172a" />
                </View>
                <View className="justify-center">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-3xl font-bold text-white tracking-tight">MYLONGAI</Text>
                    <View className="flex-row items-center gap-1 px-2 py-0.5 bg-[#0ea5e9]/20 border border-[#0ea5e9]/30 rounded-md">
                      <Sparkles size={12} color="#38bdf8" />
                      <Text className="text-xs font-bold text-[#38bdf8]">AI</Text>
                    </View>
                  </View>
                  <Text className="text-sm text-slate-300 mt-0.5">BatchGuard System</Text>
                </View>
              </View>
              <Text className="text-slate-300 text-sm">Hệ thống AI kiểm soát quá trình phơi</Text>
            </SafeAreaView>

            {/* ================= FORM NHẬP LIỆU ================= */}
            <View className="bg-[#1e293b]/95 mx-5 rounded-[32px] px-6 py-10 border border-slate-700/50 shadow-2xl mb-8">
              
              {activeTab === 'forgot' ? (
                /* 🚀 GIAO DIỆN QUÊN MẬT KHẨU */
                <View>
                  <Text className="text-white text-2xl font-bold mb-2 text-center">Khôi phục mật khẩu</Text>
                  <Text className="text-slate-400 text-sm mb-8 text-center px-4">
                    Nhập email bạn đã đăng ký để nhận liên kết đặt lại mật khẩu.
                  </Text>

                  <CustomInput
                    label="Email của bạn"
                    icon={Mail}
                    placeholder="email@vi-du.com"
                    keyboardType="email-address"
                    value={forgotEmail}
                    onChangeText={setForgotEmail}
                    editable={!isForgotLoading}
                  />

                  <TouchableOpacity 
                    onPress={handleForgotPassword}
                    disabled={isForgotLoading}
                    className="w-full bg-[#0ea5e9] h-14 rounded-2xl items-center justify-center shadow-lg flex-row mt-6 mb-4"
                  >
                    {isForgotLoading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text className="text-white text-lg font-bold">Gửi liên kết xác nhận</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={() => setActiveTab('login')}
                    disabled={isForgotLoading}
                    className="flex-row items-center justify-center py-3"
                  >
                    <ArrowLeft size={16} color="#94a3b8" />
                    <Text className="text-slate-400 font-medium ml-2">Quay lại đăng nhập</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                /* 🚀 GIAO DIỆN ĐĂNG NHẬP / ĐĂNG KÝ (Giữ nguyên) */
                <View>
                  <View className="flex-row mb-8 gap-2">
                    <TouchableOpacity 
                      onPress={() => setActiveTab('login')} 
                      className={`flex-1 py-3 rounded-full border ${activeTab === 'login' ? 'bg-[#0f766e] border-transparent' : 'border-slate-700 bg-transparent'}`}
                    >
                      <Text className={`text-center font-medium ${activeTab === 'login' ? 'text-white' : 'text-slate-400'}`}>Đăng nhập</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      onPress={() => setActiveTab('register')} 
                      className={`flex-1 py-3 rounded-full border ${activeTab === 'register' ? 'bg-[#0f766e] border-transparent' : 'border-slate-700 bg-transparent'}`}
                    >
                      <Text className={`text-center font-medium ${activeTab === 'register' ? 'text-white' : 'text-slate-400'}`}>Đăng ký</Text>
                    </TouchableOpacity>
                  </View>

                  <View className="gap-y-2">
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
                  </View>

                  {/* Nút gọi giao diện Quên mật khẩu */}
                  {activeTab === 'login' && (
                    <TouchableOpacity 
                      onPress={() => setActiveTab('forgot')}
                      className="items-end mt-3 mb-1"
                    >
                      <Text className="text-sm font-medium text-[#0ea5e9]">Quên mật khẩu?</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity 
                    onPress={activeTab === 'login' ? handleLogin : handleRegister}
                    disabled={isLoading}
                    className="w-full bg-[#0ea5e9] h-14 rounded-2xl items-center justify-center shadow-lg flex-row mt-6"
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text className="text-white text-lg font-bold">
                        {activeTab === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
                      </Text>
                    )}
                  </TouchableOpacity>

                  <Text className="text-center text-xs text-slate-500 mt-6 leading-5">
                    Bằng cách tiếp tục, bạn đồng ý với{"\n"}
                    <Text className="underline text-[#0ea5e9]">Điều khoản</Text> và <Text className="underline text-[#0ea5e9]">Chính sách</Text>
                  </Text>
                </View>
              )}

            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}