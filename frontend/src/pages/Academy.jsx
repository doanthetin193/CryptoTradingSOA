import { useState, useEffect, useCallback } from 'react';
import { academyAPI } from '../services/api';
import {
  GraduationCap,
  Play,
  Clock,
  Eye,
  ThumbsUp,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  BookOpen,
} from 'lucide-react';

// ─── Config ──────────────────────────────────────────────────────────────────

const DIFFICULTY_CONFIG = {
  BEGINNER: {
    label: 'Cơ bản',
    className: 'bg-green-500/20 text-green-400 border border-green-500/30',
  },
  INTERMEDIATE: {
    label: 'Trung cấp',
    className: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  },
  ADVANCED: {
    label: 'Nâng cao',
    className: 'bg-red-500/20 text-red-400 border border-red-500/30',
  },
};

const CATEGORIES = ['Tất cả', 'TRADING', 'BLOCKCHAIN', 'DEFI', 'ALTCOINS', 'SECURITY'];
const DIFFICULTIES = ['Tất cả', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatViews(count) {
  if (!count) return '—';
  const n = parseInt(count, 10);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ─── Video Modal ─────────────────────────────────────────────────────────────

function VideoModal({ course, onClose }) {
  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!course) return null;

  const difficulty = DIFFICULTY_CONFIG[course.difficulty] || DIFFICULTY_CONFIG.BEGINNER;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-crypto-secondary rounded-2xl w-full max-w-4xl overflow-hidden border border-crypto shadow-2xl">
        {/* Video Player */}
        <div className="relative bg-black" style={{ paddingTop: '56.25%' }}>
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`${course.embedUrl}?autoplay=1&rel=0`}
            title={course.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Info */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-white leading-snug mb-2">
                {course.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-sm text-crypto-muted">
                {course.channelTitle && (
                  <span className="font-medium text-blue-400">{course.channelTitle}</span>
                )}
                {course.publishedAt && (
                  <span>· {formatDate(course.publishedAt)}</span>
                )}
                {course.viewCount && (
                  <span className="flex items-center gap-1">
                    · <Eye className="w-3.5 h-3.5" /> {formatViews(course.viewCount)} lượt xem
                  </span>
                )}
                {course.likeCount && (
                  <span className="flex items-center gap-1">
                    · <ThumbsUp className="w-3.5 h-3.5" /> {formatViews(course.likeCount)}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-2 rounded-lg hover:bg-crypto-accent text-crypto-muted hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${difficulty.className}`}>
              {difficulty.label}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
              {course.category}
            </span>
            {course.durationFormatted && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-crypto-accent text-crypto-muted">
                <Clock className="w-3 h-3" /> {course.durationFormatted}
              </span>
            )}
          </div>

          {course.description && (
            <p className="mt-3 text-sm text-crypto-muted line-clamp-3 leading-relaxed">
              {course.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Course Card ─────────────────────────────────────────────────────────────

function CourseCard({ course, onClick }) {
  const difficulty = DIFFICULTY_CONFIG[course.difficulty] || DIFFICULTY_CONFIG.BEGINNER;
  const thumbnail =
    course.thumbnailUrl ||
    `https://i.ytimg.com/vi/${course.videoId}/hqdefault.jpg`;

  return (
    <div
      className="group bg-crypto-secondary rounded-xl border border-crypto overflow-hidden hover:border-blue-500/50 transition-all duration-200 cursor-pointer"
      onClick={() => onClick(course)}
    >
      {/* Thumbnail */}
      <div className="relative overflow-hidden bg-black">
        <img
          src={thumbnail}
          alt={course.title}
          className="w-full object-cover aspect-video group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            e.target.src = `https://i.ytimg.com/vi/${course.videoId}/hqdefault.jpg`;
          }}
        />
        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-xl">
            <Play className="w-6 h-6 text-white fill-white ml-1" />
          </div>
        </div>
        {/* Duration badge */}
        {course.durationFormatted && (
          <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-medium px-1.5 py-0.5 rounded">
            {course.durationFormatted}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2 mb-2 group-hover:text-blue-400 transition-colors">
          {course.title}
        </h3>

        {course.channelTitle && (
          <p className="text-xs text-crypto-muted mb-2">{course.channelTitle}</p>
        )}

        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${difficulty.className}`}>
            {difficulty.label}
          </span>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
            {course.category}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-crypto-muted">
          {course.viewCount && (
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" /> {formatViews(course.viewCount)}
            </span>
          )}
          {course.likeCount && (
            <span className="flex items-center gap-1">
              <ThumbsUp className="w-3 h-3" /> {formatViews(course.likeCount)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        className="p-2 rounded-lg bg-crypto-secondary border border-crypto text-crypto-muted hover:text-white hover:border-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <span className="text-sm text-crypto-muted px-3">
        Trang {page + 1} / {totalPages}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages - 1}
        className="p-2 rounded-lg bg-crypto-secondary border border-crypto text-crypto-muted hover:text-white hover:border-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Academy() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Filters
  const [category, setCategory] = useState('Tất cả');
  const [difficulty, setDifficulty] = useState('Tất cả');
  const [page, setPage] = useState(0);

  // Pagination info
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        size: 12,
        ...(category !== 'Tất cả' && { category }),
        ...(difficulty !== 'Tất cả' && { difficulty }),
      };
      const res = await academyAPI.getCourses(params);
      const data = res.data;
      setCourses(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError('Không thể tải danh sách khóa học. Academy Service chưa khởi động?');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [page, category, difficulty]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [category, difficulty]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Crypto Academy</h1>
            <p className="text-sm text-crypto-muted">
              {totalElements > 0
                ? `${totalElements} video học tập về crypto`
                : 'Học crypto từ cơ bản đến nâng cao'}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-crypto-secondary rounded-xl border border-crypto p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 text-crypto-muted">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Lọc:</span>
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  category === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-crypto-accent text-crypto-muted hover:text-white hover:bg-crypto-accent/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="w-px h-6 bg-crypto-border hidden sm:block" />

          {/* Difficulty filter */}
          <div className="flex flex-wrap gap-2">
            {DIFFICULTIES.map((diff) => {
              const cfg = DIFFICULTY_CONFIG[diff];
              return (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    difficulty === diff
                      ? cfg
                        ? cfg.className + ' !border-opacity-100'
                        : 'bg-white/10 text-white'
                      : 'bg-crypto-accent text-crypto-muted hover:text-white'
                  }`}
                >
                  {cfg ? cfg.label : diff}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-crypto-secondary rounded-xl border border-crypto overflow-hidden animate-pulse">
              <div className="aspect-video bg-crypto-accent" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-crypto-accent rounded w-full" />
                <div className="h-4 bg-crypto-accent rounded w-3/4" />
                <div className="h-3 bg-crypto-accent rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <BookOpen className="w-12 h-12 text-crypto-muted mx-auto mb-4" />
          <p className="text-red-400 mb-2">{error}</p>
          <button
            onClick={fetchCourses}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Thử lại
          </button>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20">
          <GraduationCap className="w-12 h-12 text-crypto-muted mx-auto mb-4" />
          <p className="text-crypto-muted">Không tìm thấy khóa học phù hợp.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {courses.map((course) => (
              <CourseCard
                key={course.videoId}
                course={course}
                onClick={setSelectedCourse}
              />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      {/* Video Modal */}
      {selectedCourse && (
        <VideoModal course={selectedCourse} onClose={() => setSelectedCourse(null)} />
      )}
    </div>
  );
}
