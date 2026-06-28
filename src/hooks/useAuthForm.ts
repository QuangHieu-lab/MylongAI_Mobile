// src/hooks/useAuthForm.ts
import { useState } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { AUTH_MESSAGES } from '@/src/constants/messages';
import { toast } from '@/src/lib/toast';

export const useAuthForm = () => {
  const { login, register } = useAuth(); 
  
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
      // 🚀 Bóc tách lỗi từ Axios (FastAPI thường trả lỗi trong trường 'detail')
      const errorMessage = error.response?.data?.detail 
                        || error.response?.data?.message 
                        || error.message 
                        || AUTH_MESSAGES.ERR_LOGIN_FAIL;
      
      toast.error('Lỗi đăng nhập', errorMessage);
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
      // 🚀 Bóc tách lỗi trùng email từ Backend
      const errorMessage = error.response?.data?.detail 
                        || error.response?.data?.message 
                        || error.message 
                        || 'Đăng ký thất bại. Vui lòng thử lại.';
                        
      toast.error('Lỗi đăng ký', errorMessage);
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