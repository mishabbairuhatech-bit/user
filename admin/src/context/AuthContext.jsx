import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import API from '../services/endpoints';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(API.GET_ME)
      .then((res) => {
        setUser(res.data.data || res.data);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post(API.LOGOUT);
    } catch {
      // ignore — clear local state regardless
    }
    setUser(null);
  }, []);

  // Listen for auth:expired from api interceptor (refresh token failed)
  useEffect(() => {
    const handleAuthExpired = () => {
      setUser(null);
    };
    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, []);

  const login = async (email, password, options = {}) => {
    try {
      const payload = {
        email,
        password,
        device_name: options.device_name || 'Web Browser',
        device_type: options.device_type || 'web',
        latitude: options.latitude || null,
        longitude: options.longitude || null,
      };
      console.log('Login API payload:', { ...payload, password: '***' });
      const res = await api.post(API.LOGIN, payload);
      const data = res.data.data || res.data;

      // MFA required — return the mfa payload so LoginPage can handle it
      if (data.mfa_required) {
        return data;
      }

      // Cookies are set by the server — fetch user profile
      const meRes = await api.get(API.GET_ME);
      setUser(meRes.data.data || meRes.data);

      return data;
    } catch (error) {
      throw error;
    }
  };

  // Fetch user profile (used after OAuth/One Tap login)
  const fetchUser = useCallback(async () => {
    try {
      const meRes = await api.get(API.GET_ME);
      setUser(meRes.data.data || meRes.data);
      return meRes.data.data || meRes.data;
    } catch (error) {
      setUser(null);
      throw error;
    }
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    fetchUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
