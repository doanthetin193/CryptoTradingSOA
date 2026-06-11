import { useEffect, useState } from 'react';
import {
  BookOpen,
  DollarSign,
  Edit3,
  ExternalLink,
  Link,
  Plus,
  RefreshCw,
  Save,
  Search,
  Shield,
  Trash2,
  UserCheck,
  Users,
  UserX,
  X,
} from 'lucide-react';
import Toast from '../components/Toast';
import { useAuth } from '../hooks/useAuth';
import { adminAPI } from '../services/api';

const EMPTY_COURSE_FORM = {
  youtubeUrl: '',
  videoId: '',
  title: '',
  difficulty: 'BEGINNER',
  category: 'BLOCKCHAIN',
  learningPath: 'FOUNDATIONS',
  description: '',
  sortOrder: '',
};

const DIFFICULTIES = [
  { value: 'BEGINNER', label: 'Cơ bản' },
  { value: 'INTERMEDIATE', label: 'Trung cấp' },
  { value: 'ADVANCED', label: 'Nâng cao' },
];

const CATEGORIES = ['BLOCKCHAIN', 'SECURITY', 'DEFI', 'ALTCOINS', 'TRADING'];
const LEARNING_PATHS = ['FOUNDATIONS', 'SECURITY_BASICS', 'DEFI_ALTCOINS', 'TRADING_BASICS'];

export default function Admin() {
  const { user: currentUser, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
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
    fetchUsers();
  }, [currentPage, searchTerm]);

  const showToast = (type, message) => {
    setToast({ type, message, id: Date.now() });
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        adminAPI.getSystemStats(),
        adminAPI.getAllUsers({ page: currentPage, limit: 10, search: searchTerm }),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (usersRes.success) {
        setUsers(usersRes.data.users);
        setPagination(usersRes.data.pagination);
      }
    } catch (error) {
      showToast('error', error.message || 'Không thể tải dữ liệu admin');
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
        fetchUsers();
      }
    } catch (error) {
      showToast('error', error.message || 'Không thể đổi trạng thái user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Bạn có chắc muốn xóa người dùng này? Hành động này không thể hoàn tác.')) return;

    try {
      const res = await adminAPI.deleteUser(userId);
      if (res.success) {
        showToast('success', 'Xóa người dùng thành công');
        fetchUsers();
      }
    } catch (error) {
      showToast('error', error.message || 'Không thể xóa user');
    }
  };

  const handleUpdateBalance = async () => {
    if (!balanceAmount || Number.isNaN(Number(balanceAmount))) {
      showToast('error', 'Vui lòng nhập số tiền hợp lệ');
      return;
    }

    try {
      const res = await adminAPI.updateUserBalance(
        selectedUser._id,
        Number(balanceAmount),
        balanceDescription
      );

      if (res.success) {
        showToast('success', 'Cập nhật số dư thành công');
        closeBalanceModal();
        fetchUsers();

        if (currentUser && selectedUser._id === currentUser.id) {
          await refreshUser();
        }
      }
    } catch (error) {
      showToast('error', error.message || 'Không thể cập nhật số dư');
    }
  };

  const openBalanceModal = (user) => {
    setSelectedUser(user);
    setShowBalanceModal(true);
  };

  const closeBalanceModal = () => {
    setShowBalanceModal(false);
    setBalanceAmount('');
    setBalanceDescription('');
    setSelectedUser(null);
  };

  if (loading && !stats) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto mb-4 h-16 w-16">
            <div className="absolute inset-0 rounded-full border-4 border-[var(--border)]" />
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-[var(--accent-primary)]" />
          </div>
          <p className="text-crypto-secondary">Đang tải Admin Panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed right-6 top-20 z-50 min-w-[300px]">
          <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-crypto-primary">Admin Panel</h1>
            <p className="text-crypto-muted">Quản lý người dùng và khóa học Academy</p>
          </div>
        </div>
        {activeTab === 'users' && (
          <button onClick={fetchUsers} className="crypto-btn crypto-btn-secondary">
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        )}
      </div>

      <div className="inline-flex rounded-xl border border-crypto bg-crypto-secondary p-1">
        <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')}>
          <Users className="h-4 w-4" />
          Người dùng
        </TabButton>
        <TabButton active={activeTab === 'courses'} onClick={() => setActiveTab('courses')}>
          <BookOpen className="h-4 w-4" />
          Khóa học
        </TabButton>
      </div>

      {activeTab === 'users' ? (
        <UserManagement
          stats={stats}
          users={users}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          pagination={pagination}
          onToggleStatus={handleToggleStatus}
          onDeleteUser={handleDeleteUser}
          onOpenBalanceModal={openBalanceModal}
        />
      ) : (
        <CourseManagement showToast={showToast} />
      )}

      {showBalanceModal && selectedUser && (
        <div className="crypto-modal-overlay">
          <div className="crypto-modal">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-crypto-primary">Cập nhật số dư</h2>
              <button onClick={closeBalanceModal} className="rounded-lg p-2 transition hover:bg-crypto-hover">
                <X className="h-5 w-5 text-crypto-muted" />
              </button>
            </div>

            <div className="mb-6 rounded-xl border border-crypto bg-crypto-secondary p-4">
              <p className="text-sm text-crypto-muted">User</p>
              <p className="font-bold text-crypto-primary">{selectedUser.fullName}</p>
              <p className="mt-2 text-sm text-crypto-muted">Số dư hiện tại</p>
              <p className="text-xl font-bold text-crypto-accent">${selectedUser.balance?.toLocaleString()}</p>
            </div>

            <div className="space-y-4">
              <Field label="Số tiền (+ hoặc -)">
                <input
                  type="number"
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                  placeholder="vd: +500 hoặc -200"
                  className="crypto-input"
                />
              </Field>

              <Field label="Lý do">
                <input
                  type="text"
                  value={balanceDescription}
                  onChange={(e) => setBalanceDescription(e.target.value)}
                  placeholder="Lý do điều chỉnh"
                  className="crypto-input"
                />
              </Field>

              <div className="flex gap-3 pt-2">
                <button onClick={handleUpdateBalance} className="crypto-btn crypto-btn-primary flex-1">
                  <DollarSign className="h-4 w-4" />
                  <span>Cập nhật</span>
                </button>
                <button onClick={closeBalanceModal} className="crypto-btn crypto-btn-secondary flex-1">
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

function UserManagement({
  stats,
  users,
  searchTerm,
  setSearchTerm,
  currentPage,
  setCurrentPage,
  pagination,
  onToggleStatus,
  onDeleteUser,
  onOpenBalanceModal,
}) {
  return (
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatCard icon={<Users className="h-6 w-6" />} title="Tổng Users" value={stats.totalUsers} color="blue" />
          <StatCard icon={<UserCheck className="h-6 w-6" />} title="Users Active" value={stats.activeUsers} color="green" />
          <StatCard icon={<UserX className="h-6 w-6" />} title="Users Blocked" value={stats.inactiveUsers} color="red" />
          <StatCard icon={<DollarSign className="h-6 w-6" />} title="Tổng Balance" value={`$${stats.totalBalance?.toLocaleString() || 0}`} color="accent" />
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-crypto-muted" />
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
                  <td colSpan="6" className="py-12 text-center">
                    <Users className="mx-auto mb-2 h-12 w-12 text-crypto-muted opacity-30" />
                    <p className="text-crypto-muted">Không tìm thấy user</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="transition hover:bg-crypto-hover">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className={`coin-icon text-sm text-white ${user.role === 'admin'
                          ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                          : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                        }`}>
                          {user.fullName?.substring(0, 1) || 'U'}
                        </div>
                        <span className="font-medium text-crypto-primary">{user.fullName}</span>
                      </div>
                    </td>
                    <td className="text-crypto-secondary">{user.email}</td>
                    <td className="text-right font-bold text-crypto-accent">${user.balance?.toLocaleString()}</td>
                    <td>
                      <span className={`crypto-badge ${user.isActive ? 'crypto-badge-success' : 'crypto-badge-error'}`}>
                        {user.isActive ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                    <td>
                      <span className={`crypto-badge ${user.role === 'admin'
                        ? 'bg-[rgba(139,92,246,0.1)] text-[#8b5cf6]'
                        : 'bg-crypto-hover text-crypto-secondary'
                      }`}>
                        {user.role === 'admin' ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <IconButton
                          onClick={() => onToggleStatus(user._id)}
                          title={user.isActive ? 'Block User' : 'Unblock User'}
                          className={user.isActive ? 'text-[var(--error)]' : 'text-[var(--success)]'}
                        >
                          {user.isActive ? <UserX className="h-5 w-5" /> : <UserCheck className="h-5 w-5" />}
                        </IconButton>
                        <IconButton
                          onClick={() => onOpenBalanceModal(user)}
                          title="Update Balance"
                          className="text-crypto-accent"
                        >
                          <DollarSign className="h-5 w-5" />
                        </IconButton>
                        {user.role !== 'admin' ? (
                          <IconButton
                            onClick={() => onDeleteUser(user._id)}
                            title="Delete User"
                            className="text-[var(--error)]"
                          >
                            <Trash2 className="h-5 w-5" />
                          </IconButton>
                        ) : (
                          <div className="h-9 w-9" />
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t border-crypto p-4">
            <p className="text-sm text-crypto-muted">
              Hiển thị {(currentPage - 1) * 10 + 1} - {Math.min(currentPage * 10, pagination.total)} / {pagination.total} users
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-lg bg-crypto-hover px-3 py-2 font-medium text-crypto-secondary transition hover:text-crypto-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                Trước
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === pagination.pages}
                className="rounded-lg bg-crypto-hover px-3 py-2 font-medium text-crypto-secondary transition hover:text-crypto-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CourseManagement({ showToast }) {
  const [courses, setCourses] = useState([]);
  const [page, setPage] = useState(0);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({ category: '', difficulty: '' });
  const [form, setForm] = useState(EMPTY_COURSE_FORM);
  const [editingCourse, setEditingCourse] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, [page, filters.category, filters.difficulty]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getAcademyCourses({
        page,
        size: 10,
        category: filters.category || undefined,
        difficulty: filters.difficulty || undefined,
      });
      if (res.success) {
        setCourses(res.data.content || []);
        setPagination(res.data);
      }
    } catch (error) {
      showToast('error', error.message || 'Không thể tải khóa học');
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const resetForm = () => {
    setForm(EMPTY_COURSE_FORM);
    setEditingCourse(null);
    setPreview(null);
  };

  const startEdit = (course) => {
    setEditingCourse(course);
    setPreview(course);
    setForm({
      youtubeUrl: course.watchUrl || `https://www.youtube.com/watch?v=${course.videoId}`,
      videoId: course.videoId || '',
      title: course.title || '',
      difficulty: course.difficulty || 'BEGINNER',
      category: course.category || 'BLOCKCHAIN',
      learningPath: course.learningPath || 'FOUNDATIONS',
      description: course.description || '',
      sortOrder: course.sortOrder ?? '',
    });
  };

  const handlePreview = async () => {
    if (!form.youtubeUrl && !form.videoId) {
      showToast('error', 'Hãy nhập link YouTube hoặc videoId trước');
      return;
    }

    try {
      const res = await adminAPI.previewAcademyCourse(normalizeCoursePayload(form));
      if (res.success) {
        const data = res.data;
        setPreview(data);
        setForm((current) => ({
          ...current,
          videoId: data.videoId || current.videoId,
          title: current.title || data.title || '',
          description: current.description || data.description || '',
        }));
        showToast('success', 'Đã lấy preview video');
      }
    } catch (error) {
      showToast('error', error.message || 'Không thể preview video');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) {
      showToast('error', 'Tên khóa học là bắt buộc');
      return;
    }

    try {
      setSaving(true);
      const payload = normalizeCoursePayload(form);
      const res = editingCourse
        ? await adminAPI.updateAcademyCourse(editingCourse.id, payload)
        : await adminAPI.createAcademyCourse(payload);

      if (res.success) {
        showToast('success', editingCourse ? 'Cập nhật khóa học thành công' : 'Tạo khóa học thành công');
        resetForm();
        fetchCourses();
      }
    } catch (error) {
      showToast('error', error.message || 'Không thể lưu khóa học');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (course) => {
    if (!confirm(`Xóa khóa học "${course.title}"? Tiến độ học liên quan cũng sẽ bị xóa.`)) return;

    try {
      const res = await adminAPI.deleteAcademyCourse(course.id);
      if (res.success) {
        showToast('success', 'Đã xóa khóa học');
        if (editingCourse?.id === course.id) resetForm();
        fetchCourses();
      }
    } catch (error) {
      showToast('error', error.message || 'Không thể xóa khóa học');
    }
  };

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[420px_1fr]">
      <form onSubmit={handleSubmit} className="crypto-card self-start space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-crypto-primary">
              {editingCourse ? 'Sửa khóa học' : 'Thêm khóa học'}
            </h2>
            <p className="text-sm text-crypto-muted">Dán link YouTube hoặc nhập videoId trực tiếp.</p>
          </div>
          {editingCourse && (
            <button type="button" onClick={resetForm} className="rounded-lg p-2 text-crypto-muted hover:bg-crypto-hover">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <Field label="Link YouTube hoặc videoId">
          <div className="flex gap-2">
            <input
              value={form.youtubeUrl}
              onChange={(e) => updateForm('youtubeUrl', e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="crypto-input"
            />
            <button
              type="button"
              onClick={handlePreview}
              className="crypto-btn crypto-btn-secondary shrink-0 px-4"
              title="Preview video"
            >
              <Link className="h-4 w-4" />
              <span>Preview</span>
            </button>
          </div>
        </Field>

        <Field label="Tên khóa học">
          <input
            value={form.title}
            onChange={(e) => updateForm('title', e.target.value)}
            placeholder="Bitcoin Mining Explained"
            className="crypto-input"
          />
        </Field>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Cấp độ">
            <select
              value={form.difficulty}
              onChange={(e) => updateForm('difficulty', e.target.value)}
              className="crypto-input"
            >
              {DIFFICULTIES.map((difficulty) => (
                <option key={difficulty.value} value={difficulty.value}>{difficulty.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Thứ tự">
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) => updateForm('sortOrder', e.target.value)}
              placeholder="1"
              className="crypto-input"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Category">
            <select
              value={form.category}
              onChange={(e) => updateForm('category', e.target.value)}
              className="crypto-input"
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </Field>
          <Field label="Learning path">
            <select
              value={form.learningPath}
              onChange={(e) => updateForm('learningPath', e.target.value)}
              className="crypto-input"
            >
              {LEARNING_PATHS.map((path) => (
                <option key={path} value={path}>{path}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Mô tả">
          <textarea
            value={form.description}
            onChange={(e) => updateForm('description', e.target.value)}
            placeholder="Mô tả ngắn nội dung bài học"
            className="crypto-input min-h-28 resize-y"
          />
        </Field>

        {preview && (
          <div className="rounded-xl border border-crypto bg-crypto-secondary p-3">
            <div className="flex gap-3">
              <img
                src={preview.thumbnailUrl || `https://i.ytimg.com/vi/${preview.videoId}/hqdefault.jpg`}
                alt={preview.title}
                className="h-20 w-32 rounded-lg object-cover"
              />
              <div className="min-w-0">
                <p className="line-clamp-2 font-semibold text-crypto-primary">{preview.title || form.title}</p>
                <p className="mt-1 text-xs text-crypto-muted">{preview.videoId}</p>
                {preview.durationFormatted && (
                  <p className="mt-1 text-xs text-cyan-300">Thời lượng: {preview.durationFormatted}</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="crypto-btn crypto-btn-primary flex-1">
            {editingCourse ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            <span>{saving ? 'Đang lưu...' : editingCourse ? 'Cập nhật' : 'Thêm khóa học'}</span>
          </button>
          <button type="button" onClick={resetForm} className="crypto-btn crypto-btn-secondary">
            Reset
          </button>
        </div>
      </form>

      <div className="space-y-4">
        <div className="crypto-card">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-xl font-bold text-crypto-primary">Danh sách khóa học</h2>
              <p className="text-sm text-crypto-muted">Dữ liệu chính nằm trong MySQL bảng courses.</p>
            </div>
            <button onClick={fetchCourses} className="crypto-btn crypto-btn-secondary">
              <RefreshCw className="h-4 w-4" />
              Tải lại
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <select
              value={filters.category}
              onChange={(e) => {
                setPage(0);
                setFilters((current) => ({ ...current, category: e.target.value }));
              }}
              className="crypto-input"
            >
              <option value="">Tất cả category</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              value={filters.difficulty}
              onChange={(e) => {
                setPage(0);
                setFilters((current) => ({ ...current, difficulty: e.target.value }));
              }}
              className="crypto-input"
            >
              <option value="">Tất cả cấp độ</option>
              {DIFFICULTIES.map((difficulty) => (
                <option key={difficulty.value} value={difficulty.value}>{difficulty.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-32 animate-pulse rounded-xl border border-crypto bg-crypto-secondary" />
            ))
          ) : courses.length === 0 ? (
            <div className="crypto-card py-12 text-center">
              <BookOpen className="mx-auto mb-3 h-10 w-10 text-crypto-muted" />
              <p className="text-crypto-muted">Chưa có khóa học phù hợp.</p>
            </div>
          ) : (
            courses.map((course) => (
              <CourseRow
                key={course.id}
                course={course}
                onEdit={() => startEdit(course)}
                onDelete={() => handleDelete(course)}
              />
            ))
          )}
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between rounded-xl border border-crypto bg-crypto-secondary p-3">
            <p className="text-sm text-crypto-muted">
              Trang {pagination.page + 1}/{pagination.totalPages} - {pagination.totalElements} khóa học
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((current) => Math.max(0, current - 1))}
                disabled={page === 0}
                className="crypto-btn crypto-btn-secondary disabled:opacity-50"
              >
                Trước
              </button>
              <button
                onClick={() => setPage((current) => current + 1)}
                disabled={pagination.last}
                className="crypto-btn crypto-btn-secondary disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CourseRow({ course, onEdit, onDelete }) {
  const thumbnail = course.thumbnailUrl || `https://i.ytimg.com/vi/${course.videoId}/hqdefault.jpg`;

  return (
    <div className="grid gap-4 rounded-xl border border-crypto bg-crypto-card p-4 sm:grid-cols-[150px_1fr_auto]">
      <img src={thumbnail} alt={course.title} className="aspect-video w-full rounded-lg object-cover sm:w-[150px]" />
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap gap-2">
          <span className="crypto-badge bg-cyan-500/10 text-cyan-300">{course.category}</span>
          <span className="crypto-badge bg-crypto-hover text-crypto-secondary">{course.difficulty}</span>
          <span className="crypto-badge bg-crypto-hover text-crypto-secondary">{course.learningPath}</span>
        </div>
        <h3 className="line-clamp-2 font-bold text-crypto-primary">{course.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-crypto-muted">{course.description}</p>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-crypto-muted">
          <span>videoId: {course.videoId}</span>
          {course.durationFormatted && <span>{course.durationFormatted}</span>}
          {course.sortOrder != null && <span>sort: {course.sortOrder}</span>}
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 sm:flex-col">
        {course.watchUrl && (
          <a
            href={course.watchUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg p-2 text-crypto-muted transition hover:bg-crypto-hover hover:text-crypto-primary"
            title="Mở YouTube"
          >
            <ExternalLink className="h-5 w-5" />
          </a>
        )}
        <IconButton onClick={onEdit} title="Sửa khóa học" className="text-cyan-300">
          <Edit3 className="h-5 w-5" />
        </IconButton>
        <IconButton onClick={onDelete} title="Xóa khóa học" className="text-[var(--error)]">
          <Trash2 className="h-5 w-5" />
        </IconButton>
      </div>
    </div>
  );
}

function normalizeCoursePayload(form) {
  return {
    youtubeUrl: form.youtubeUrl.trim(),
    videoId: form.videoId.trim(),
    title: form.title.trim(),
    difficulty: form.difficulty,
    category: form.category,
    learningPath: form.learningPath,
    description: form.description.trim(),
    sortOrder: form.sortOrder === '' ? null : Number(form.sortOrder),
  };
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition ${
        active ? 'bg-cyan-400 text-[#07111f]' : 'text-crypto-muted hover:bg-crypto-hover hover:text-crypto-primary'
      }`}
    >
      {children}
    </button>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-crypto-secondary">{label}</span>
      {children}
    </label>
  );
}

function IconButton({ onClick, title, className = '', children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg p-2 transition hover:bg-crypto-hover ${className}`}
      title={title}
    >
      {children}
    </button>
  );
}

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
          <p className="mb-1 text-sm text-crypto-muted">{title}</p>
          <p className="text-2xl font-bold text-crypto-primary">{value}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
