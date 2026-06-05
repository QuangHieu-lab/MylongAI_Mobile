import { Tabs } from 'expo-router';
import { Home, Camera, Settings, BrainCircuit,CloudSun ,User } from 'lucide-react-native';
// 1. Thêm 2 thư viện này để xử lý Safe Area và nhận diện HĐH
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';

export default function DashboardLayout() {
  // 2. Lấy thông số vùng an toàn của máy người dùng đang chạy app
  const insets = useSafeAreaInsets();

  return (
    <Tabs 
      screenOptions={{ 
        headerShown: false, // Ẩn thanh tiêu đề mặc định ở trên cùng
        tabBarActiveTintColor: '#9333ea', // Màu khi tab được chọn (Màu tím)
        tabBarInactiveTintColor: '#64748b', // Màu khi tab không được chọn (Xám)
        tabBarStyle: {
          // 3. CẬP NHẬT CHIỀU CAO & PADDING ĐỘNG TẠI ĐÂY
          height: 65 + insets.bottom, 
          // Nếu là Android thì cộng thêm 1 khoảng đệm nhỏ cho đẹp, iOS thì dùng luôn insets.bottom (do iOS tự có khoảng trống đẹp rồi)
          paddingBottom: Platform.OS === 'android' ? insets.bottom + 8 : Math.max(insets.bottom, 10),
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        }
      }}
    >
      {/* Tab 1: Tổng quan (Home) */}
      <Tabs.Screen 
        name="home" 
        options={{ 
          title: 'Tổng quan',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />
        }} 
      />

      {/* Tab 2: Camera Giám sát */}
      <Tabs.Screen 
        name="camera" 
        options={{ 
           href: null,
          title: 'Camera',
          tabBarIcon: ({ color }) => <Camera size={24} color={color} />
        }} 
      />
<Tabs.Screen 
        name="weather" 
        options={{ title: 'Thời tiết', href: null,tabBarIcon: ({ color }) => <CloudSun color={color} size={24} /> }} 
      />

      <Tabs.Screen 
        name="voice" 
        options={{ title: 'Giọng nói', href: null,tabBarIcon: ({ color }) => <CloudSun color={color} size={24} /> }} 
      />
        <Tabs.Screen 
        name="weather-alerts" 
        options={{ title: 'Giọng nói', href: null,tabBarIcon: ({ color }) => <CloudSun color={color} size={24} /> }} 
      />
      {/* Tab 3: Nhận diện AI (YOLO) */}
      <Tabs.Screen 
        name="ai-detect" 
        options={{ 
          title: 'YOLO AI',
          tabBarIcon: ({ color }) => <BrainCircuit size={24} color={color} />
        }} 
      />
      
      {/* MÀN HÌNH ẨN: Quét Realtime */}
      <Tabs.Screen 
        name="realtime-scan" 
        options={{ 
          href: null, // BÍ QUYẾT LÀ ĐÂY: Dòng này giúp giấu Tab này khỏi thanh Bottom Bar!
          headerShown: false,
          tabBarStyle: { display: 'none' } // Tắt luôn thanh menu dưới đáy khi đang mở Camera cho rộng
        }} 
      />
      <Tabs.Screen name="history" options={{ href: null, headerShown: false }
    } />
      {/* Tab 4: Cá nhân */}
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: 'Cá nhân',
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }} 
      />
    </Tabs>
  );
}