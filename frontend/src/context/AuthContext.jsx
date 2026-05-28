import { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize Auth: Fetch profile if token exists in localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('aether_jwt_token');
      if (token) {
        try {
          const res = await api.get('/api/auth/profile');
          if (res.success) {
            setUser(res.user);
          } else {
            localStorage.removeItem('aether_jwt_token');
          }
        } catch (err) {
          console.error('Session restore failed:', err);
          localStorage.removeItem('aether_jwt_token');
        }
      }
      setLoading(false);
    };

    initializeAuth();

    // Listen to global logout events from API utility
    const handleLogoutEvent = () => {
      setUser(null);
    };

    window.addEventListener('auth-logout', handleLogoutEvent);
    return () => window.removeEventListener('auth-logout', handleLogoutEvent);
  }, []);

  // Login action
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', { email, password });
      if (res.success && res.token) {
        localStorage.setItem('aether_jwt_token', res.token);
        setUser(res.user);
        return { success: true };
      }
      return { success: false, message: 'Invalid credentials' };
    } catch (err) {
      return { success: false, message: err.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  // Register action
  const register = async (name, email, password, role) => {
    setLoading(true);
    try {
      const res = await api.post('/api/auth/register', { name, email, password, role });
      if (res.success && res.token) {
        localStorage.setItem('aether_jwt_token', res.token);
        setUser(res.user);
        return { success: true };
      }
      return { success: false, message: 'Registration failed' };
    } catch (err) {
      return { success: false, message: err.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  // Logout action
  const logout = () => {
    localStorage.removeItem('aether_jwt_token');
    setUser(null);
  };

  // Update profile action
  const updateProfile = async (profileData) => {
    try {
      const res = await api.put('/api/auth/profile', profileData);
      if (res.success) {
        setUser(res.user);
        return { success: true };
      }
      return { success: false, message: 'Profile update failed' };
    } catch (err) {
      return { success: false, message: err.message || 'Profile update failed' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
