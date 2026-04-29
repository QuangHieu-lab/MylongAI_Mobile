import { Redirect } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { user, isLoading } = useAuth();

  // 1. Trong lúc đang đọc bộ nhớ xem có Token đăng nhập không -> Hiện vòng xoay chờ
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#f8f9fc]">
        <ActivityIndicator size="large" color="#9333ea" />
      </View>
    );
  }

  // 2. Nếu chưa đăng nhập -> Đẩy ra cổng Auth (Login)
  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  // 3. Nếu đã đăng nhập -> Cho phép vào Dashboard (Màn hình code bạn vừa gửi)
  return <Redirect href="/(dashboard)/home" />;
}