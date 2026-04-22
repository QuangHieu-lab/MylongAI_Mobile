import '@/global.css';
import { useEffect } from 'react';
import { useRouter, useSegments, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { ThemeProvider } from '@react-navigation/native';
import { NAV_THEME } from '@/src/lib/theme';
import { PortalHost } from '@rn-primitives/portal';

// Import AuthProvider và Hook
import { AuthProvider, useAuth } from '@/src/contexts/AuthContext';

export { ErrorBoundary } from 'expo-router';

// Component con này dùng để truy cập useAuth() (vì nó phải nằm TRONG AuthProvider)
function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // Route Guard: Theo dõi trạng thái user và tự động chuyển trang
  useEffect(() => {
    if (isLoading) return; // Đang check token thì chưa làm gì cả

    // Kiểm tra xem người dùng đang ở nhóm màn hình nào (auth hay dashboard)
    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // 1. Chưa đăng nhập mà cố tình vào màn hình khác -> Đuổi về trang Login
      router.push('/(auth)/login');
    } else if (user && inAuthGroup) {
      // 2. Đã đăng nhập rồi mà lỡ ở trang Login/Register -> Đẩy thẳng vào Dashboard
      router.push('/(dashboard)/home');
    }
  }, [user, isLoading, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(dashboard)" options={{ headerShown: false }} />
  
    </Stack>
  );
}

// Layout gốc
export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <AuthProvider>
        <RootLayoutNav />
        <PortalHost />
      </AuthProvider>
    </ThemeProvider>
  );
}