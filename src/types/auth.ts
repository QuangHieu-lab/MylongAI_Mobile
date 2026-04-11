// src/types/auth.ts

export interface User {
  id?: string;
  name?: string;
  email: string;
  role?: string;
  [key: string]: any; 
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Bạn có thể định nghĩa thêm cấu trúc dữ liệu trả về từ API ở đây
export interface LoginResponse {
  token: string;
  user: User;
}