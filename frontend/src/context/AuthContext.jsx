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
          
          console.log('✅ Auth initialized from localStorage, balance:', userData.balance);
          console.log('📍 Token preview:', storedToken.substring(0, 20) + '...');
        } catch (error) {
          console.error('Failed to parse stored user data:', error);
          localStorage.clear();
        }
      }
      setLoading(false);
    };
    
    initAuth();
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
    // Nếu không có token, không cần refresh
    if (!token) {
      console.warn('⚠️ No token available, skipping refresh');
      return null;
    }
    
    try {
      // Lấy profile đầy đủ thay vì chỉ balance
      const profileRes = await authAPI.getProfile();
      if (profileRes.success) {
        const updatedUser = profileRes.data.user;
        
        // Force update state và localStorage ngay lập tức
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        console.log('✅ Balance refreshed:', updatedUser.balance);
        return updatedUser;
      }
    } catch (error) {
      console.error('Failed to refresh user:', error.message);
      
      // Nếu lỗi 401, user sẽ bị logout bởi interceptor
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        console.warn('⚠️ Token invalid, will be redirected to login');
        return null;
      }
      
      // Fallback: chỉ lấy balance cho các lỗi khác
      try {
        const balanceRes = await userAPI.getBalance();
        if (balanceRes.success) {
          const updatedUser = {
            ...user,
            balance: balanceRes.data.balance,
          };
          
          // Force update
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          console.log('✅ Balance refreshed (fallback):', updatedUser.balance);
          return updatedUser;
        }
      } catch (err) {
        console.error('Failed to refresh balance:', err.message);
      }
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
