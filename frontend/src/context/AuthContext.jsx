import { createContext, useState, useEffect } from 'react';
import { authAPI, userAPI } from '../services/api';
import { initializeSocket, disconnectSocket } from '../services/websocket';

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Initialize từ localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      initializeSocket(storedToken);
    }
    setLoading(false);
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
    disconnectSocket();
  };

  // Refresh user data (sau khi trade)
  const refreshUser = async () => {
    try {
      const balanceRes = await userAPI.getBalance();
      if (balanceRes.success) {
        const updatedUser = {
          ...user,
          balance: balanceRes.data.balance,
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
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
