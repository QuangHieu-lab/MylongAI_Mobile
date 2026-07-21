import { registerGlobals } from '@livekit/react-native';
registerGlobals();
import '@/global.css';
import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useRouter, useSegments, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { ThemeProvider } from '@react-navigation/native';
import { NAV_THEME } from '@/src/lib/theme';
import { PortalHost } from '@rn-primitives/portal';

// Import Contexts
import { AuthProvider, useAuth } from '@/src/contexts/AuthContext';
import { WeatherProvider } from '../src/contexts/WeatherContext';
import { FarmProvider } from '@/src/contexts/FarmContext';
// Import Toast & Icons
import Toast, { ToastConfig } from 'react-native-toast-message';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react-native';

export { ErrorBoundary } from 'expo-router';

// ---------------------------------------------------------
// 1️⃣ CẤU HÌNH GIAO DIỆN TOAST (CHUẨN SHADCN UI)
// ---------------------------------------------------------
const toastConfig: ToastConfig = {
  success: (props: any) => (
    <View className="flex-row items-center bg-slate-800 border-l-4 border-sky-500 rounded-2xl px-4 py-3 w-[90%] shadow-2xl shadow-sky-500/20 mt-10">
      <CheckCircle2 color="#0ea5e9" size={28} />
      <View className="ml-3 flex-1">
        <Text className="text-white font-bold text-base">{props.text1}</Text>
        {props.text2 ? <Text className="text-slate-400 text-sm mt-0.5">{props.text2}</Text> : null}
      </View>
    </View>
  ),
  error: (props: any) => (
    <View className="flex-row items-center bg-slate-800 border-l-4 border-red-500 rounded-2xl px-4 py-3 w-[90%] shadow-2xl shadow-red-500/20 mt-10">
      <AlertCircle color="#ef4444" size={28} />
      <View className="ml-3 flex-1">
        <Text className="text-white font-bold text-base">{props.text1}</Text>
        {props.text2 ? <Text className="text-slate-400 text-sm mt-0.5">{props.text2}</Text> : null}
      </View>
    </View>
  ),
  info: (props: any) => (
    <View className="flex-row items-center bg-slate-800 border-l-4 border-blue-400 rounded-2xl px-4 py-3 w-[90%] shadow-2xl shadow-blue-500/20 mt-10">
      <Info color="#60a5fa" size={28} />
      <View className="ml-3 flex-1">
        <Text className="text-white font-bold text-base">{props.text1}</Text>
        {props.text2 ? <Text className="text-slate-400 text-sm mt-0.5">{props.text2}</Text> : null}
      </View>
    </View>
  )
};

// ---------------------------------------------------------
// 2️⃣ ROUTE GUARD (TRẠM KIỂM SOÁT)
// ---------------------------------------------------------
function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; 

    const inAuthGroup = segments[0] === '(auth)';
 const isIndex = (segments as string[]).length === 0;
    if (!user && !inAuthGroup && !isIndex) {
      router.replace('/'); 
    } else if (user && (inAuthGroup || isIndex)) {
      router.replace('/(dashboard)/home');
    }
  }, [user, isLoading, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(dashboard)" options={{ headerShown: false }} />
    </Stack>
  );
}

// ---------------------------------------------------------
// 3️⃣ ROOT LAYOUT GỐC
// ---------------------------------------------------------
export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <AuthProvider>
        <FarmProvider>
        <WeatherProvider>
          <RootLayoutNav />
          <PortalHost />
        </WeatherProvider>
        </FarmProvider>
      </AuthProvider>
      
      {/* KHAI BÁO TOAST Ở DƯỚI CÙNG ĐỂ NÓ NỔI LÊN TRÊN MỌI MÀN HÌNH */}
      <Toast config={toastConfig} /> 
    </ThemeProvider>
  );
}