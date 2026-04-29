import { useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '@/src/contexts/AuthContext';
import { AUTH_MESSAGES } from '@/src/constants/messages';
// import { authService } from '@/src/services/auth.service'; // Bỏ comment khi có service thật

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
      Alert.alert('Lỗi', AUTH_MESSAGES.ERR_MISSING_FIELDS);
      return;
    }
    
    setIsLoading(true);
    try {
      await login(loginEmail, loginPassword);
      Alert.alert('Thành công', AUTH_MESSAGES.SUCCESS_LOGIN);
    } catch (error) {
      Alert.alert('Lỗi', AUTH_MESSAGES.ERR_LOGIN_FAIL);
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý Đăng ký
  const handleRegister = async () => {
    if (!registerName || !registerEmail || !registerPassword) {
      Alert.alert('Lỗi', AUTH_MESSAGES.ERR_MISSING_REGISTER);
      return;
    }

    setIsLoading(true);
    try {
      // Gọi service đăng ký ở đây: await authService.register(registerName, registerEmail, registerPassword);
      
      // Giả lập API delay:
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert('Thành công', AUTH_MESSAGES.SUCCESS_REGISTER);
      // Reset form và chuyển về tab login
      setRegisterPassword('');
      setActiveTab('login');
    } catch (error) {
      Alert.alert('Lỗi', 'Đăng ký thất bại. Vui lòng thử lại.');
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