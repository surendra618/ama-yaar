import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [merchant, setMerchant] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('lxw_token');
    if (token) {
      loadProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const loadProfile = async () => {
    try {
      const res = await api.get('/auth/profile');
      if (res.data?.success) {
        setMerchant(res.data.merchant);
        setWalletBalance(res.data.merchant.walletBalance || 0);
      }
    } catch (err) {
      console.warn('Profile load failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshBalance = async () => {
    try {
      const res = await api.get('/wallet/balance');
      if (res.data?.success) {
        setWalletBalance(res.data.balance);
      }
    } catch (err) {
      console.warn('Failed to fetch wallet balance:', err.message);
    }
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.success) {
      localStorage.setItem('lxw_token', res.data.token);
      localStorage.setItem('lxw_merchant', JSON.stringify(res.data.merchant));
      setMerchant(res.data.merchant);
      setWalletBalance(res.data.merchant.walletBalance || 0);
      return res.data;
    }
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    if (res.data?.success) {
      localStorage.setItem('lxw_token', res.data.token);
      localStorage.setItem('lxw_merchant', JSON.stringify(res.data.merchant));
      setMerchant(res.data.merchant);
      setWalletBalance(res.data.merchant.walletBalance || 0);
      return res.data;
    }
  };

  const logout = () => {
    localStorage.removeItem('lxw_token');
    localStorage.removeItem('lxw_merchant');
    setMerchant(null);
    window.location.href = '/login';
  };

  const [switchModalOpen, setSwitchModalOpen] = useState(false);
  const [switchTargetPortal, setSwitchTargetPortal] = useState('admin'); // 'admin' | 'merchant'

  const openSwitchModal = (target = 'admin') => {
    setSwitchTargetPortal(target);
    setSwitchModalOpen(true);
  };

  const switchUser = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.success) {
      localStorage.setItem('lxw_token', res.data.token);
      localStorage.setItem('lxw_merchant', JSON.stringify(res.data.merchant));
      setMerchant(res.data.merchant);
      setWalletBalance(res.data.merchant.walletBalance || 0);
      setSwitchModalOpen(false);
      return res.data;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        merchant,
        walletBalance,
        setWalletBalance,
        refreshBalance,
        login,
        register,
        logout,
        loading,
        switchUser,
        switchModalOpen,
        setSwitchModalOpen,
        switchTargetPortal,
        setSwitchTargetPortal,
        openSwitchModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
