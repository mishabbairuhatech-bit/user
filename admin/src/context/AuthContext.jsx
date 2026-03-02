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

  const login = async (email, password) => {
    try {
      const res = await api.post(API.LOGIN, { email, password });
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

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
