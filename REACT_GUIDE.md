# ⚛️ Frontend React Guide

> Tài liệu giải thích các kiến thức React được sử dụng trong project CryptoTrading SOA

## 📋 Tổng quan công nghệ Frontend

| Công nghệ | Version | Mục đích |
|-----------|---------|----------|
| React | 19 | UI Library |
| Vite | 7 | Build tool (thay thế CRA) |
| React Router | 7 | Routing/Navigation |
| TailwindCSS | 4 | Styling |
| Axios | 1.13 | HTTP Client |
| Socket.IO Client | 4.7 | WebSocket |
| Recharts | 3 | Charts/Graphs |
| Lucide React | - | Icons |

---

## 🗂️ Cấu trúc thư mục

```
frontend/src/
├── main.jsx           ← Entry point
├── App.jsx            ← Router setup
├── index.css          ← Global styles (Tailwind)
│
├── context/           ← React Context (Global State)
│   └── AuthContext.jsx
│
├── hooks/             ← Custom Hooks
│   └── useAuth.js
│
├── services/          ← API & WebSocket
│   ├── api.js
│   └── websocket.js
│
├── components/        ← Reusable Components
│   ├── Layout.jsx
│   ├── Navbar.jsx
│   ├── Sidebar.jsx
│   └── Toast.jsx
│
└── pages/             ← Page Components
    ├── Auth.jsx
    ├── Dashboard.jsx
    ├── Trade.jsx
    └── ...
```

---

## 📚 Các vùng kiến thức React

### 1️⃣ JSX - JavaScript XML

**Khái niệm:** Cú pháp mở rộng cho phép viết HTML trong JavaScript.

```jsx
// ❌ HTML thuần
<div class="container">
  <h1>Hello</h1>
</div>

// ✅ JSX trong React
<div className="container">
  <h1>Hello</h1>
</div>
```

**Ví dụ trong project:** `components/Toast.jsx`
```jsx
function Toast({ type, message, onClose }) {
  return (
    <div className={`toast ${type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
      <span>{message}</span>
      <button onClick={onClose}>×</button>
    </div>
  );
}
```

**Lưu ý:**
- Dùng `className` thay vì `class`
- Dùng `htmlFor` thay vì `for`
- Phải có 1 root element (hoặc dùng `<>...</>` Fragment)

---

### 2️⃣ Components - Function Components

**Khái niệm:** Các khối UI độc lập, tái sử dụng được.

**Ví dụ trong project:** `components/Navbar.jsx`
```jsx
// Function Component
export default function Navbar() {
  return (
    <nav className="bg-white shadow">
      <div className="flex items-center justify-between p-4">
        <h1>CryptoTrading</h1>
        {/* ... */}
      </div>
    </nav>
  );
}
```

**Component với Props:**
```jsx
// Định nghĩa component nhận props
function CoinCard({ symbol, price, change }) {
  return (
    <div className="card">
      <h3>{symbol}</h3>
      <p>${price.toLocaleString()}</p>
      <span className={change >= 0 ? 'text-green-500' : 'text-red-500'}>
        {change}%
      </span>
    </div>
  );
}

// Sử dụng component
<CoinCard symbol="BTC" price={75000} change={2.5} />
```

---

### 3️⃣ Hooks - useState

**Khái niệm:** Quản lý state (trạng thái) trong component.

**Cú pháp:**
```jsx
const [state, setState] = useState(initialValue);
```

**Ví dụ trong project:** `pages/Auth.jsx`
```jsx
import { useState } from 'react';

export default function Auth() {
  // Khai báo state
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Toggle giữa Login/Register
  const toggleMode = () => {
    setIsLogin(!isLogin);  // Cập nhật state
    setError('');
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // API call...
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      {/* ... */}
    </form>
  );
}
```

**State với Object:**
```jsx
// State là object
const [form, setForm] = useState({
  symbol: 'BTC',
  amount: '',
  type: 'buy'
});

// Cập nhật 1 field trong object
const handleChange = (field, value) => {
  setForm(prev => ({
    ...prev,           // Giữ các field khác
    [field]: value     // Cập nhật field cần thay đổi
  }));
};

// Sử dụng
<input 
  value={form.amount}
  onChange={(e) => handleChange('amount', e.target.value)}
/>
```

**State với Array:**
```jsx
const [notifications, setNotifications] = useState([]);

// Thêm item
setNotifications(prev => [...prev, newNotification]);

// Xóa item
setNotifications(prev => prev.filter(n => n.id !== idToRemove));

// Cập nhật item
setNotifications(prev => 
  prev.map(n => n.id === id ? { ...n, status: 'read' } : n)
);
```

---

### 4️⃣ Hooks - useEffect

**Khái niệm:** Xử lý side effects (gọi API, subscriptions, DOM manipulation).

**Cú pháp:**
```jsx
useEffect(() => {
  // Effect code
  return () => {
    // Cleanup (optional)
  };
}, [dependencies]);
```

**Các patterns phổ biến:**

```jsx
// 1. Chạy 1 lần khi component mount
useEffect(() => {
  fetchData();
}, []);  // Empty dependency array

// 2. Chạy khi dependency thay đổi
useEffect(() => {
  fetchCoinPrice(coinId);
}, [coinId]);  // Chạy lại khi coinId thay đổi

// 3. Cleanup khi unmount
useEffect(() => {
  const timer = setInterval(() => {
    fetchPrices();
  }, 30000);

  return () => clearInterval(timer);  // Cleanup
}, []);
```

**Ví dụ trong project:** `pages/Dashboard.jsx`
```jsx
export default function Dashboard() {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch prices khi component mount
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setLoading(true);
        const response = await api.get('/market/prices');
        setPrices(response.data.data);
      } catch (error) {
        console.error('Failed to fetch prices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
    
    // Auto refresh mỗi 2 phút
    const interval = setInterval(fetchPrices, 120000);
    
    return () => clearInterval(interval);  // Cleanup
  }, []);

  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {prices.map(coin => (
        <CoinCard key={coin.id} {...coin} />
      ))}
    </div>
  );
}
```

---

### 5️⃣ Hooks - useContext

**Khái niệm:** Chia sẻ state giữa các components mà không cần truyền props.

**Ví dụ trong project:** `context/AuthContext.jsx`
```jsx
import { createContext, useContext, useState, useEffect } from 'react';

// 1. Tạo Context
const AuthContext = createContext(null);

// 2. Tạo Provider Component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Check auth on mount
  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/users/login', { email, password });
    const { user, token } = response.data.data;
    
    setUser(user);
    setToken(token);
    localStorage.setItem('token', token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  // Giá trị chia sẻ cho toàn app
  const value = {
    user,
    token,
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
}

// 3. Custom hook để sử dụng context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

**Sử dụng trong App:**
```jsx
// main.jsx - Wrap app với Provider
import { AuthProvider } from './context/AuthContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
```

**Sử dụng trong Components:**
```jsx
// Bất kỳ component nào
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav>
      {isAuthenticated ? (
        <>
          <span>Xin chào, {user.fullName}</span>
          <button onClick={logout}>Đăng xuất</button>
        </>
      ) : (
        <Link to="/auth">Đăng nhập</Link>
      )}
    </nav>
  );
}
```

---

### 6️⃣ Custom Hooks

**Khái niệm:** Tách logic có thể tái sử dụng thành hook riêng.

**Ví dụ trong project:** `hooks/useAuth.js`
```jsx
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export function useAuth() {
  return useContext(AuthContext);
}
```

**Custom hook phức tạp hơn:**
```jsx
// hooks/useFetch.js
import { useState, useEffect } from 'react';
import api from '../services/api';

export function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get(url);
        setData(response.data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
}

// Sử dụng
function Portfolio() {
  const { data: portfolio, loading, error } = useFetch('/portfolio');
  
  if (loading) return <Loading />;
  if (error) return <Error message={error} />;
  
  return <PortfolioDisplay data={portfolio} />;
}
```

---

### 7️⃣ React Router

**Khái niệm:** Điều hướng giữa các trang trong SPA.

**Ví dụ trong project:** `App.jsx`
```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/auth" />;
  
  return children;
}

// Admin Route
function AdminRoute({ children }) {
  const { user } = useAuth();
  
  if (user?.role !== 'admin') return <Navigate to="/" />;
  
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/auth" element={<Auth />} />
        
        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/trade" element={
          <ProtectedRoute>
            <Layout>
              <Trade />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/coin/:coinId" element={
          <ProtectedRoute>
            <Layout>
              <CoinDetail />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Admin routes */}
        <Route path="/admin" element={
          <AdminRoute>
            <Layout>
              <Admin />
            </Layout>
          </AdminRoute>
        } />
        
        {/* 404 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
```

**Navigation:**
```jsx
import { useNavigate, useParams, Link } from 'react-router-dom';

function CoinCard({ coin }) {
  const navigate = useNavigate();

  // Programmatic navigation
  const handleClick = () => {
    navigate(`/coin/${coin.id}`);
  };

  return (
    <div onClick={handleClick}>
      {/* Hoặc dùng Link */}
      <Link to={`/coin/${coin.id}`}>{coin.name}</Link>
    </div>
  );
}

// Lấy params từ URL
function CoinDetail() {
  const { coinId } = useParams();  // từ /coin/:coinId
  
  useEffect(() => {
    fetchCoinDetail(coinId);
  }, [coinId]);
}
```

---

### 8️⃣ Conditional Rendering

**Các patterns phổ biến:**

```jsx
function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  // 1. If-else với return sớm
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!data) return <EmptyState />;

  // 2. Ternary operator
  return (
    <div>
      {user.role === 'admin' ? <AdminPanel /> : <UserPanel />}
    </div>
  );

  // 3. Logical AND (&&)
  return (
    <div>
      {isLoggedIn && <UserMenu />}
      {notifications.length > 0 && <NotificationBadge count={notifications.length} />}
    </div>
  );

  // 4. Nullish coalescing
  return (
    <div>
      <p>Balance: ${user.balance ?? 'N/A'}</p>
    </div>
  );
}
```

**Ví dụ trong project:** `pages/Trade.jsx`
```jsx
function Trade() {
  const [orderType, setOrderType] = useState('buy');

  return (
    <div>
      {/* Tab buttons */}
      <div className="flex">
        <button 
          className={orderType === 'buy' ? 'bg-green-500' : 'bg-gray-200'}
          onClick={() => setOrderType('buy')}
        >
          Mua
        </button>
        <button 
          className={orderType === 'sell' ? 'bg-red-500' : 'bg-gray-200'}
          onClick={() => setOrderType('sell')}
        >
          Bán
        </button>
      </div>

      {/* Conditional form */}
      {orderType === 'buy' ? (
        <BuyForm />
      ) : (
        <SellForm />
      )}
    </div>
  );
}
```

---

### 9️⃣ Lists & Keys

**Khái niệm:** Render danh sách với `.map()` và unique key.

```jsx
function CoinList({ coins }) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {coins.map(coin => (
        // Key phải unique và stable
        <CoinCard 
          key={coin.id}  // ✅ Dùng id
          // key={index}  // ❌ Tránh dùng index
          coin={coin}
        />
      ))}
    </div>
  );
}
```

**Ví dụ trong project:** `pages/History.jsx`
```jsx
function History() {
  const [trades, setTrades] = useState([]);

  return (
    <table>
      <thead>
        <tr>
          <th>Loại</th>
          <th>Coin</th>
          <th>Số lượng</th>
          <th>Giá</th>
          <th>Thời gian</th>
        </tr>
      </thead>
      <tbody>
        {trades.map(trade => (
          <tr key={trade._id}>
            <td className={trade.type === 'buy' ? 'text-green-500' : 'text-red-500'}>
              {trade.type === 'buy' ? 'Mua' : 'Bán'}
            </td>
            <td>{trade.symbol}</td>
            <td>{trade.amount}</td>
            <td>${trade.price.toLocaleString()}</td>
            <td>{new Date(trade.executedAt).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

### 🔟 Form Handling

**Controlled Components:**
```jsx
function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error khi user sửa
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email là bắt buộc';
    if (!formData.password) newErrors.password = 'Mật khẩu là bắt buộc';
    if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu tối thiểu 6 ký tự';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    try {
      await login(formData.email, formData.password);
    } catch (error) {
      setErrors({ form: error.message });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          className={errors.email ? 'border-red-500' : ''}
        />
        {errors.email && <span className="text-red-500">{errors.email}</span>}
      </div>
      
      <div>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Mật khẩu"
        />
        {errors.password && <span className="text-red-500">{errors.password}</span>}
      </div>
      
      {errors.form && <div className="text-red-500">{errors.form}</div>}
      
      <button type="submit">Đăng nhập</button>
    </form>
  );
}
```

---

### 1️⃣1️⃣ API Integration với Axios

**Ví dụ trong project:** `services/api.js`
```jsx
import axios from 'axios';

// Tạo instance với config mặc định
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - Thêm token vào mỗi request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Xử lý lỗi chung
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired - logout
      localStorage.removeItem('token');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export default api;
```

**Sử dụng:**
```jsx
// GET request
const fetchPrices = async () => {
  const response = await api.get('/market/prices');
  return response.data.data;
};

// POST request
const buyCoins = async (symbol, amount) => {
  const response = await api.post('/trade/buy', {
    symbol,
    coinId: symbol.toLowerCase(),
    amount
  });
  return response.data;
};

// PUT request
const updateProfile = async (data) => {
  const response = await api.put('/users/profile', data);
  return response.data;
};

// DELETE request
const deleteAlert = async (alertId) => {
  const response = await api.delete(`/notifications/alert/${alertId}`);
  return response.data;
};
```

---

### 1️⃣2️⃣ WebSocket với Socket.IO

**Ví dụ trong project:** `services/websocket.js`
```jsx
import { io } from 'socket.io-client';

let socket = null;

export const connectWebSocket = (token) => {
  socket = io('http://localhost:3000', {
    auth: { token }
  });

  socket.on('connect', () => {
    console.log('WebSocket connected');
  });

  socket.on('disconnect', () => {
    console.log('WebSocket disconnected');
  });

  return socket;
};

export const disconnectWebSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
```

**Sử dụng trong Component:**
```jsx
function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const socket = getSocket();
    
    if (socket) {
      // Lắng nghe event từ server
      socket.on('notification', (data) => {
        setNotifications(prev => [data, ...prev]);
        // Hiển thị toast
        showToast('info', data.title);
      });

      socket.on('trade_completed', (data) => {
        // Cập nhật UI
        refreshBalance();
      });

      socket.on('price_alert', (data) => {
        showToast('warning', `${data.symbol} đã đạt $${data.currentPrice}`);
      });
    }

    // Cleanup
    return () => {
      if (socket) {
        socket.off('notification');
        socket.off('trade_completed');
        socket.off('price_alert');
      }
    };
  }, []);
}
```

---

## 📊 Tổng kết các Hooks được sử dụng

| Hook | Mục đích | Ví dụ |
|------|----------|-------|
| `useState` | Quản lý local state | Form data, loading, error |
| `useEffect` | Side effects | Fetch API, subscriptions |
| `useContext` | Global state | Auth, Theme |
| `useNavigate` | Programmatic navigation | Redirect sau login |
| `useParams` | Lấy URL params | coinId từ /coin/:coinId |
| `useLocation` | Lấy current URL | Active menu item |

---

## 🎯 Best Practices

### 1. Component nhỏ, đơn nhiệm
```jsx
// ❌ Component quá lớn
function Dashboard() {
  // 500 lines of code...
}

// ✅ Tách thành nhiều components
function Dashboard() {
  return (
    <div>
      <PriceTable />
      <PortfolioSummary />
      <RecentTrades />
    </div>
  );
}
```

### 2. Tách logic vào Custom Hooks
```jsx
// ❌ Logic trong component
function Portfolio() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { /* fetch logic */ }, []);
  // ...
}

// ✅ Tách vào custom hook
function Portfolio() {
  const { data, loading, error } = usePortfolio();
  // Component chỉ lo render
}
```

### 3. Avoid prop drilling với Context
```jsx
// ❌ Truyền props qua nhiều cấp
<App user={user}>
  <Layout user={user}>
    <Navbar user={user}>
      <UserMenu user={user} />
    </Navbar>
  </Layout>
</App>

// ✅ Dùng Context
<AuthProvider>
  <App>
    <Layout>
      <Navbar>
        <UserMenu />  {/* useAuth() */}
      </Navbar>
    </Layout>
  </App>
</AuthProvider>
```

---

**Tiếp theo:** Đọc `TAILWIND_GUIDE.md` để hiểu về styling với TailwindCSS.
