import { useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '@/src/contexts/AuthContext';
import { AUTH_MESSAGES } from '@/src/constants/messages';
// import { authService } from '@/src/services/auth.service'; // Bỏ comment khi có service thật
import { toast } from '@/src/lib/toast'; // 👈 Import tiện ích Toast

export const useAuthForm = () => {
  const { login } = useAuth();
  
  // Trạng thái chung
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Trạng thái Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  const togglePassword = () => setShowPassword(prev => !prev);

  // Xử lý Đăng nhập
  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      toast.error('Lỗi', AUTH_MESSAGES.ERR_MISSING_FIELDS); //  Gọi lỗi
      return;
    }
    
    setIsLoading(true);
    try {
      await login(loginEmail, loginPassword);
      toast.success('Thành công', AUTH_MESSAGES.SUCCESS_LOGIN); //  Gọi thành công
    } catch (error) {
      toast.error('Lỗi', AUTH_MESSAGES.ERR_LOGIN_FAIL);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!registerName || !registerEmail || !registerPassword) {
      toast.error('Lỗi', AUTH_MESSAGES.ERR_MISSING_REGISTER);
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Thành công', AUTH_MESSAGES.SUCCESS_REGISTER);
      
      setRegisterPassword('');
      setActiveTab('login');
    } catch (error) {
      toast.error('Lỗi', 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Trả về những gì UI cần
  return {
    activeTab, setActiveTab,
    isLoading,
    showPassword, togglePassword,
    loginEmail, setLoginEmail,
    loginPassword, setLoginPassword,
    registerName, setRegisterName,
    registerEmail, setRegisterEmail,
    registerPassword, setRegisterPassword,
    handleLogin, handleRegister
  };
};