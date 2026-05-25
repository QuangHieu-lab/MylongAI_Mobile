// useAuthForm.ts
import { useState } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { AUTH_MESSAGES } from '@/src/constants/messages';
import { toast } from '@/src/lib/toast';

export const useAuthForm = () => {
  const { login, register } = useAuth(); // 👈 Lấy thẳng hàm register từ Context
  
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  const togglePassword = () => setShowPassword(prev => !prev);

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      toast.error('Lỗi', AUTH_MESSAGES.ERR_MISSING_FIELDS);
      return;
    }
    
    setIsLoading(true);
    try {
      await login(loginEmail, loginPassword);
      toast.success('Thành công', AUTH_MESSAGES.SUCCESS_LOGIN); 
    } catch (error: any) {
      // 🚀 Lấy thông báo lỗi từ Context ném ra để hiển thị
      toast.error('Lỗi đăng nhập', error.message || AUTH_MESSAGES.ERR_LOGIN_FAIL);
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
      await register(registerName, registerEmail, registerPassword);
      toast.success('Thành công', AUTH_MESSAGES.SUCCESS_REGISTER);
      
      setLoginEmail(registerEmail);
      setRegisterPassword('');
      setActiveTab('login');
    } catch (error: any) {
      // 🚀 Lấy thông báo lỗi trùng email từ Context
      toast.error('Lỗi đăng ký', error.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

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