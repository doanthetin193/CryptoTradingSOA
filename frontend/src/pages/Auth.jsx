import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Zap, Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';

export default function Auth() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        if (!formData.fullName) {
          setError('Vui lòng nhập họ tên');
          setLoading(false);
          return;
        }
        result = await register(formData.email, formData.password, formData.fullName);
      }

      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message || 'Đã xảy ra lỗi');
      }
    } catch (err) {
      setError(err.message || 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-crypto-dark flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[var(--accent-primary)] rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[var(--accent-secondary)] rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-[var(--accent-primary)] to-transparent opacity-5 blur-3xl"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-crypto rounded-2xl flex items-center justify-center animate-pulse-glow">
                <Zap className="w-10 h-10 text-black" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-[var(--accent-secondary)] rounded-lg flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-gradient-crypto">CryptoTrading</span>
            <span className="text-crypto-secondary"> SOA</span>
          </h1>
          <p className="text-crypto-muted">
            {isLogin ? 'Đăng nhập để tiếp tục giao dịch' : 'Tạo tài khoản và bắt đầu giao dịch'}
          </p>
        </div>

        {/* Form Card */}
        <div className="crypto-card !p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name (Register only) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-crypto-secondary mb-2">
                  Họ và tên
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-crypto-muted" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="crypto-input pl-12"
                    placeholder="Nguyễn Văn A"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-crypto-secondary mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-crypto-muted" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="crypto-input pl-12"
                  placeholder="email@example.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-crypto-secondary mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-crypto-muted" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="crypto-input pl-12"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
              {!isLogin && (
                <p className="mt-2 text-xs text-crypto-muted">Tối thiểu 6 ký tự</p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-[rgba(239,68,68,0.1)] border border-[var(--error)] text-[var(--error)] px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="crypto-btn crypto-btn-primary w-full py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{isLogin ? 'Đăng nhập' : 'Đăng ký'}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Login/Register */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setFormData({ email: '', password: '', fullName: '' });
              }}
              className="text-crypto-accent hover:text-[var(--accent-secondary)] font-medium transition"
            >
              {isLogin ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
            </button>
          </div>

          {/* Bonus Info */}
          {!isLogin && (
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-[rgba(0,212,170,0.1)] to-[rgba(139,92,246,0.1)] border border-[var(--border)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-crypto flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-black" />
                </div>
                <div>
                  <p className="text-sm text-crypto-primary font-medium">
                    🎁 Nhận ngay <span className="text-crypto-accent font-bold">$1,000 USDT</span> ảo!
                  </p>
                  <p className="text-xs text-crypto-muted">Bắt đầu giao dịch ngay khi đăng ký</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-crypto-muted text-sm mt-8">
          Bằng việc tiếp tục, bạn đồng ý với{' '}
          <span className="text-crypto-accent cursor-pointer hover:underline">Điều khoản sử dụng</span>
        </p>
      </div>
    </div>
  );
}
