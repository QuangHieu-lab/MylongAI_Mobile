import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@/src/contexts/AuthContext';
import { toast } from '@/src/lib/toast';

export default function AdminLayout() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // ROUTE GUARD: Kiểm tra quyền truy cập mỗi khi mở khu vực Admin
  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      // 1. Nếu chưa đăng nhập -> Đẩy ra ngoài màn hình Login
      toast.error('Từ chối', 'Vui lòng đăng nhập để truy cập');
      router.replace('/(auth)/login');
    } else if (user.role !== 'admin') {
      // 2. Nếu đã đăng nhập nhưng KHÔNG phải admin -> Đuổi về Dashboard của người dùng thường
      toast.error('Không có quyền', 'Bạn không có quyền truy cập trang quản trị');
      router.replace('/(dashboard)/home'); 
    }
  }, [user, isLoading]);

  // Trong lúc chờ hệ thống check Token và Quyền thì hiển thị màn hình chờ (Loading)
  if (isLoading || !user || user.role !== 'admin') {
    return (
      <View className="flex-1 justify-center items-center bg-[#0f172a]">
        <ActivityIndicator size="large" color="#38bdf8" />
      </View>
    );
  }

  // Vượt qua hết các bước kiểm tra -> Hiển thị danh sách các màn hình Admin
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="users" />
      {/* Các trang Admin chúng ta vừa xây dựng */}
  <Stack.Screen name="overview" />
  <Stack.Screen name="revenue" />
  <Stack.Screen name="batches" />
  <Stack.Screen name="cameras" />
  <Stack.Screen name="risks" />
  <Stack.Screen name="analytics" />
  <Stack.Screen name="settings" />
      {/* Sau này bạn tạo file nào trong thư mục (admin) thì khai báo thêm vào đây */}
      {/* <Stack.Screen name="farms" /> */}
      {/* <Stack.Screen name="batches" /> */}
    </Stack>
  );
}