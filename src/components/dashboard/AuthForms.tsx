// src/components/auth/AuthForms.tsx
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react-native';

// 🚀 Import cái hook bạn vừa viết (sửa lại đường dẫn nếu cần)
import { useAuthForm } from '../../hooks/useAuthForm'; 

export function AuthForms() {
  // Rút toàn bộ state và hàm từ Hook ra để xài
  const {
    activeTab, setActiveTab,
    isLoading,
    showPassword, togglePassword,
    loginEmail, setLoginEmail,
    loginPassword, setLoginPassword,
    registerName, setRegisterName,
    registerEmail, setRegisterEmail,
    registerPassword, setRegisterPassword,
    handleLogin, handleRegister
  } = useAuthForm();

  const isLogin = activeTab === 'login';

  return (
    <View className="bg-slate-800/80 backdrop-blur-md p-6 rounded-3xl border-2 border-slate-700 shadow-2xl shadow-sky-500/10 w-full max-w-md mx-auto">
      
      {/* --- NÚT LẬT TAB (ĐĂNG NHẬP / ĐĂNG KÝ) --- */}
      <View className="flex-row bg-slate-900 rounded-xl p-1 mb-6">
        <TouchableOpacity 
          className={`flex-1 py-3 rounded-lg items-center ${isLogin ? 'bg-slate-700 shadow-sm' : ''}`}
          onPress={() => setActiveTab('login')}
        >
          <Text className={`font-bold ${isLogin ? 'text-white' : 'text-slate-400'}`}>Đăng Nhập</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className={`flex-1 py-3 rounded-lg items-center ${!isLogin ? 'bg-slate-700 shadow-sm' : ''}`}
          onPress={() => setActiveTab('register')}
        >
          <Text className={`font-bold ${!isLogin ? 'text-white' : 'text-slate-400'}`}>Đăng Ký</Text>
        </TouchableOpacity>
      </View>

      {/* --- KHU VỰC NHẬP LIỆU --- */}
      <View className="space-y-4">
        {/* Chỉ hiện tên khi ở tab Đăng ký */}
        {!isLogin && (
          <View className="flex-row items-center bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 mb-4">
            <User color="#64748b" size={20} />
            <TextInput 
              placeholder="Họ và tên" 
              placeholderTextColor="#64748b"
              className="flex-1 ml-3 text-white"
              value={registerName}
              onChangeText={setRegisterName}
            />
          </View>
        )}

        {/* Ô nhập Email (Tự động chuyển đổi state theo Tab) */}
        <View className="flex-row items-center bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 mb-4">
          <Mail color="#64748b" size={20} />
          <TextInput 
            placeholder="Email công việc" 
            placeholderTextColor="#64748b"
            keyboardType="email-address"
            autoCapitalize="none"
            className="flex-1 ml-3 text-white"
            value={isLogin ? loginEmail : registerEmail}
            onChangeText={isLogin ? setLoginEmail : setRegisterEmail}
          />
        </View>

        {/* Ô nhập Mật khẩu (Có nút ẩn/hiện) */}
        <View className="flex-row items-center bg-slate-900 border border-slate-700 rounded-xl px-4 py-3">
          <Lock color="#64748b" size={20} />
          <TextInput 
            placeholder="Mật khẩu" 
            placeholderTextColor="#64748b"
            secureTextEntry={!showPassword}
            className="flex-1 ml-3 text-white"
            value={isLogin ? loginPassword : registerPassword}
            onChangeText={isLogin ? setLoginPassword : setRegisterPassword}
          />
          <TouchableOpacity onPress={togglePassword} className="p-1">
            {showPassword ? (
              <Eye color="#38bdf8" size={20} />
            ) : (
              <EyeOff color="#64748b" size={20} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* --- NÚT BẤM XÁC NHẬN --- */}
      <TouchableOpacity 
        onPress={isLogin ? handleLogin : handleRegister}
        disabled={isLoading}
        className={`mt-8 py-4 rounded-xl items-center flex-row justify-center ${isLoading ? 'bg-sky-500/50' : 'bg-sky-500'}`}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" /> 
        ) : (
          <Text className="text-navy-950 font-bold text-lg">
            {isLogin ? 'Bắt đầu giám sát' : 'Tạo tài khoản'}
          </Text>
        )}
      </TouchableOpacity>

    </View>
  );
}