import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Users, DollarSign, UserCheck, UserX, Trash2, Search, RefreshCw, Shield, X } from 'lucide-react';
import Toast from '../components/Toast';

export default function Admin() {
  const { user: currentUser, refreshUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceDescription, setBalanceDescription] = useState('');
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchData();
  }, [currentPage, searchTerm]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        adminAPI.getSystemStats(),
        adminAPI.getAllUsers({ page: currentPage, limit: 10, search: searchTerm }),
      ]);

      if (statsRes.success) {
        setStats(statsRes.data);
      }

      if (usersRes.success) {
        setUsers(usersRes.data.users);
        setPagination(usersRes.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      showToast('error', error.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId) => {
    if (!confirm('Bạn có chắc muốn thay đổi trạng thái người dùng này?')) return;

    try {
      const res = await adminAPI.toggleUserStatus(userId);
      if (res.success) {
        showToast('success', res.message);
        fetchData();
      }
    } catch (error) {
      showToast('error', error.message || 'Failed to toggle status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Bạn có chắc muốn XÓA người dùng này? Hành động không thể hoàn tác!')) return;

    try {
      const res = await adminAPI.deleteUser(userId);
      if (res.success) {
        showToast('success', 'Xóa người dùng thành công');
        fetchData();
      }
    } catch (error) {
      showToast('error', error.message || 'Failed to delete user');
    }
  };

  const handleUpdateBalance = async () => {
    if (!balanceAmount || isNaN(balanceAmount)) {
      showToast('error', 'Vui lòng nhập số tiền hợp lệ');
      return;
    }

    try {
      const res = await adminAPI.updateUserBalance(
        selectedUser._id,
        parseFloat(balanceAmount),
        balanceDescription
      );

      if (res.success) {
        showToast('success', 'Cập nhật số dư thành công');
        setShowBalanceModal(false);
        setBalanceAmount('');
        setBalanceDescription('');
        setSelectedUser(null);
        fetchData();

        if (currentUser && selectedUser._id === currentUser.id) {
          await refreshUser();
        }
      }
    } catch (error) {
      showToast('error', error.message || 'Failed to update balance');
    }
  };

  const openBalanceModal = (user) => {
    setSelectedUser(user);
    setShowBalanceModal(true);
  };

  const showToast = (type, message) => {
    setToast({ type, message, id: Date.now() });
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 rounded-full border-4 border-[var(--border)]"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[var(--accent-primary)] animate-spin"></div>
          </div>
          <p className="text-crypto-secondary">Đang tải Admin Panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 min-w-[300px]">
          <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-crypto-primary">Admin Panel</h1>
            <p className="text-crypto-muted">Quản lý người dùng và hệ thống</p>
          </div>
        </div>
        <button
          onClick={fetchData}
          className="crypto-btn crypto-btn-secondary"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            icon={<Users className="w-6 h-6" />}
            title="Tổng Users"
            value={stats.totalUsers}
            color="blue"
          />
          <StatCard
            icon={<UserCheck className="w-6 h-6" />}
            title="Users Active"
            value={stats.activeUsers}
            color="green"
          />
          <StatCard
            icon={<UserX className="w-6 h-6" />}
            title="Users Blocked"
            value={stats.inactiveUsers}
            color="red"
          />
          <StatCard
            icon={<DollarSign className="w-6 h-6" />}
            title="Tổng Balance"
            value={`$${stats.totalBalance?.toLocaleString() || 0}`}
            color="accent"
          />
        </div>
      )}

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-crypto-muted w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm theo email hoặc tên..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="crypto-input pl-12"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="crypto-card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="crypto-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th className="text-right">Balance</th>
                <th>Status</th>
                <th>Role</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12">
                    <Users className="w-12 h-12 text-crypto-muted opacity-30 mx-auto mb-2" />
                    <p className="text-crypto-muted">Không tìm thấy user</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-crypto-hover transition">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className={`coin-icon text-white text-sm ${user.role === 'admin'
                            ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                            : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                          }`}>
                          {user.fullName?.substring(0, 1) || 'U'}
                        </div>
                        <span className="font-medium text-crypto-primary">{user.fullName}</span>
                      </div>
                    </td>
                    <td className="text-crypto-secondary">{user.email}</td>
                    <td className="text-right font-bold text-crypto-accent">
                      ${user.balance?.toLocaleString()}
                    </td>
                    <td>
                      <span className={`crypto-badge ${user.isActive ? 'crypto-badge-success' : 'crypto-badge-error'
                        }`}>
                        {user.isActive ? '✓ Active' : '✕ Blocked'}
                      </span>
                    </td>
                    <td>
                      <span className={`crypto-badge ${user.role === 'admin'
                          ? 'bg-[rgba(139,92,246,0.1)] text-[#8b5cf6]'
                          : 'bg-crypto-hover text-crypto-secondary'
                        }`}>
                        {user.role === 'admin' ? '👑 Admin' : 'User'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggleStatus(user._id)}
                          className={`p-2 rounded-lg transition ${user.isActive
                              ? 'text-[var(--error)] hover:bg-[rgba(239,68,68,0.1)]'
                              : 'text-[var(--success)] hover:bg-[rgba(16,185,129,0.1)]'
                            }`}
                          title={user.isActive ? 'Block User' : 'Unblock User'}
                        >
                          {user.isActive ? <UserX className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                        </button>
                        <button
                          onClick={() => openBalanceModal(user)}
                          className="p-2 text-crypto-accent hover:bg-[rgba(0,212,170,0.1)] rounded-lg transition"
                          title="Update Balance"
                        >
                          <DollarSign className="w-5 h-5" />
                        </button>
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="p-2 text-[var(--error)] hover:bg-[rgba(239,68,68,0.1)] rounded-lg transition"
                            title="Delete User"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="p-4 border-t border-crypto flex items-center justify-between">
            <p className="text-sm text-crypto-muted">
              Hiển thị {(currentPage - 1) * 10 + 1} - {Math.min(currentPage * 10, pagination.total)} / {pagination.total} users
            </p>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg font-medium transition ${page === currentPage
                      ? 'bg-gradient-crypto text-black'
                      : 'bg-crypto-hover text-crypto-secondary hover:text-crypto-primary'
                    }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Balance Update Modal */}
      {showBalanceModal && selectedUser && (
        <div className="crypto-modal-overlay">
          <div className="crypto-modal">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-crypto-primary">Cập nhật số dư</h2>
              <button
                onClick={() => {
                  setShowBalanceModal(false);
                  setBalanceAmount('');
                  setBalanceDescription('');
                  setSelectedUser(null);
                }}
                className="p-2 hover:bg-crypto-hover rounded-lg transition"
              >
                <X className="w-5 h-5 text-crypto-muted" />
              </button>
            </div>

            <div className="mb-6 p-4 bg-crypto-secondary rounded-xl border border-crypto">
              <p className="text-crypto-muted text-sm">User</p>
              <p className="font-bold text-crypto-primary">{selectedUser.fullName}</p>
              <p className="text-crypto-muted text-sm mt-2">Số dư hiện tại</p>
              <p className="font-bold text-crypto-accent text-xl">${selectedUser.balance?.toLocaleString()}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-crypto-secondary mb-2">
                  Số tiền (+ hoặc -)
                </label>
                <input
                  type="number"
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                  placeholder="vd: +500 hoặc -200"
                  className="crypto-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-crypto-secondary mb-2">
                  Lý do (tùy chọn)
                </label>
                <input
                  type="text"
                  value={balanceDescription}
                  onChange={(e) => setBalanceDescription(e.target.value)}
                  placeholder="Lý do điều chỉnh"
                  className="crypto-input"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleUpdateBalance}
                  className="crypto-btn crypto-btn-primary flex-1"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Cập nhật</span>
                </button>
                <button
                  onClick={() => {
                    setShowBalanceModal(false);
                    setBalanceAmount('');
                    setBalanceDescription('');
                    setSelectedUser(null);
                  }}
                  className="crypto-btn crypto-btn-secondary flex-1"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({ icon, title, value, color }) {
  const colorClasses = {
    blue: 'bg-[rgba(59,130,246,0.1)] text-blue-500',
    green: 'bg-[rgba(16,185,129,0.1)] text-[var(--success)]',
    red: 'bg-[rgba(239,68,68,0.1)] text-[var(--error)]',
    accent: 'bg-[rgba(0,212,170,0.1)] text-crypto-accent',
  };

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-crypto-muted mb-1">{title}</p>
          <p className="text-2xl font-bold text-crypto-primary">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl ${colorClasses[color]} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
