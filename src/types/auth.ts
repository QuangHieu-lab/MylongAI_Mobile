// src/types/auth.ts

export interface User {
  id: string; // Đã bỏ dấu ? vì user sau khi login luôn có ID
  name: string;
  email: string;
  role: 'customer' | 'premium' | 'admin' | 'disabled'; 
  premium_expired_at?: string | null; // Cần thiết để check gói Premium
  created_at?: string;
  [key: string]: any; 
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  // 🚀 Hàm quan trọng để cập nhật lại quyền user sau khi thanh toán thành công
  refetchUser: () => Promise<void>; 
}

// Cấu trúc chuẩn theo API Backend /auth/login
export interface LoginResponse {
  access_token: string; // Đúng tên trường từ Backend
  token_type: string;
  user_id: string;
  name: string;
  role: 'customer' | 'premium' | 'admin' | 'disabled';
}