// src/hooks/useAuthForm.ts
import { useState } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { AUTH_MESSAGES } from '@/src/constants/messages';
import { toast } from '@/src/lib/toast';
import { authApi } from '@/src/services/api'; // 🚀 Nhớ import authApi

export const useAuthForm = () => {
  const { login, register } = useAuth(); 
  
  // 🚀 Thêm trạng thái 'forgot' vào tab
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  
  // 🚀 State cho phần Quên mật khẩu
  const [forgotEmail, setForgotEmail] = useState('');

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
      const errorMessage = error.response?.data?.detail 
                        || error.response?.data?.message 
                        || error.message 
                        || 'Đăng ký thất bại. Vui lòng thử lại.';
                        
      toast.error('Lỗi đăng ký', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 🚀 Hàm xử lý Gửi yêu cầu Khôi phục mật khẩu
  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      toast.error('Lỗi', 'Vui lòng nhập email của bạn.');
      return;
    }

    setIsForgotLoading(true);
    try {
      await authApi.forgotPassword({ email: forgotEmail });
      toast.success('Đã gửi yêu cầu', 'Nếu email tồn tại, bạn sẽ nhận được hướng dẫn.');
      
      setActiveTab('login'); // Quay lại trang đăng nhập sau khi gửi
      setForgotEmail(''); // Reset form
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail 
                        || error.response?.data?.message 
                        || error.message 
                        || 'Có lỗi xảy ra, vui lòng thử lại.';
      toast.error('Lỗi', errorMessage);
    } finally {
      setIsForgotLoading(false);
    }
  };

  return {
    activeTab, setActiveTab,
    isLoading, isForgotLoading, // Trả thêm state loading
    showPassword, togglePassword,
    loginEmail, setLoginEmail,
    loginPassword, setLoginPassword,
    registerName, setRegisterName,
    registerEmail, setRegisterEmail,
    registerPassword, setRegisterPassword,
    forgotEmail, setForgotEmail, // Trả thêm state email quên MK
    handleLogin, handleRegister, handleForgotPassword // Trả thêm hàm
  };
};