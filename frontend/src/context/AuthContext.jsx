import { createContext, useState, useEffect } from 'react';
import { authAPI, userAPI } from '../services/api';
import { initializeSocket, disconnectSocket, removeAllListeners } from '../services/websocket';

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Initialize từ localStorage
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          const userData = JSON.parse(storedUser);

          // Set token và user
          setToken(storedToken);
          setUser(userData);
          initializeSocket(storedToken);
        } catch (error) {
          console.error('Failed to parse stored user data:', error);
          localStorage.clear();
        }
      }
      setLoading(false);
    };

    initAuth();

    // Listen for manual balance updates from Trade page
    const handleBalanceUpdate = (event) => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      }
    };

    window.addEventListener('balanceUpdated', handleBalanceUpdate);
    return () => window.removeEventListener('balanceUpdated', handleBalanceUpdate);
  }, []);

  // Login
  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });

      if (response.success) {
        const { user: userData, token: userToken } = response.data;

        setUser(userData);
        setToken(userToken);

        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(userData));

        // Initialize WebSocket
        initializeSocket(userToken);

        return { success: true };
      }

      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  // Register
  const register = async (email, password, fullName) => {
    try {
      const response = await authAPI.register({ email, password, fullName });

      if (response.success) {
        const { user: userData, token: userToken } = response.data;

        setUser(userData);
        setToken(userToken);

        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(userData));

        // Initialize WebSocket
        initializeSocket(userToken);

        return { success: true };
      }

      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    removeAllListeners();
    disconnectSocket();
  };

  // Refresh user data (sau khi trade)
  const refreshUser = async () => {
    if (!token) {
      return null;
    }

    try {
      const profileRes = await authAPI.getProfile();
      if (profileRes.success) {
        const updatedUser = profileRes.data.user;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      }
    } catch (error) {
      console.error('Failed to refresh user:', error.message);
    }
    return null;
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
