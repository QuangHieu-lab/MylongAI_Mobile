import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, TextInputProps } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';

// Khai báo kiểu dữ liệu cho các thuộc tính (Props) truyền vào
interface CustomInputProps extends TextInputProps {
  label: string;                  // Tên nhãn (Ví dụ: "Email", "Mật khẩu")
  icon?: any;                     // Icon của Lucide
  isPassword?: boolean;           // Cờ đánh dấu đây có phải là ô nhập mật khẩu không
}

export default function CustomInput({ 
  label, 
  icon: Icon, 
  isPassword = false, 
  ...props 
}: CustomInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className="mb-4 space-y-2">
      <Text className="text-slate-200 text-sm mb-1">{label}</Text>
      <View className="flex-row items-center h-12 border border-slate-600 rounded-2xl px-4 focus:border-[#0ea5e9]">
        
        {/* Render Icon nếu có truyền vào */}
        {Icon && <Icon size={20} color="#94a3b8" />}
        
        <TextInput
          className="flex-1 text-white ml-3 h-full"
          placeholderTextColor="#64748b"
          secureTextEntry={isPassword && !showPassword}
          autoCapitalize="none"
          {...props} // Chuyển toàn bộ các thuộc tính còn lại (value, onChangeText...) vào đây
        />

        {/* Nút ẩn/hiện chỉ xuất hiện nếu đây là ô nhập mật khẩu */}
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-1">
            {showPassword ? <EyeOff size={20} color="#94a3b8" /> : <Eye size={20} color="#94a3b8" />}
          </TouchableOpacity>
        )}

      </View>
    </View>
  );
}