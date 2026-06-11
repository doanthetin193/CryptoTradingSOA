import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
  Eye,
  GraduationCap,
  Play,
  RotateCw,
  ThumbsUp,
  X,
} from 'lucide-react';
import { academyAPI } from '../services/api';

const DIFFICULTY = {
  BEGINNER: { label: 'Cơ bản', className: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300' },
  INTERMEDIATE: { label: 'Trung cấp', className: 'border-amber-500/30 bg-amber-500/15 text-amber-300' },
  ADVANCED: { label: 'Nâng cao', className: 'border-rose-500/30 bg-rose-500/15 text-rose-300' },
};

function formatViews(value) {
  const count = Number(value);
  if (!count) return null;
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toLocaleString('vi-VN');
}

function thumbnailFor(course) {
  return course.thumbnailUrl || `https://i.ytimg.com/vi/${course.videoId}/hqdefault.jpg`;
}

function Stat({ icon, children }) {
  if (!children) return null;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-crypto-muted">
      {icon}
      {children}
    </span>
  );
}

function ProgressBar({ value }) {
  return (
    <div className="h-2 rounded-full bg-[#0b1020] overflow-hidden">
      <div
        className="h-full rounded-full bg-cyan-400 transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function PathButton({ path, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-lg border p-4 text-left transition-colors ${
        active
          ? 'border-cyan-400/70 bg-cyan-400/10'
          : 'border-crypto bg-crypto-secondary hover:border-cyan-400/40'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-white">{path.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-crypto-muted">{path.description}</p>
        </div>
        <span className="shrink-0 rounded-md border border-crypto px-2 py-1 text-xs text-cyan-300">
          {path.completedCourses}/{path.totalCourses}
        </span>
      </div>
      <div className="mt-3">
        <ProgressBar value={path.progressPercent || 0} />
      </div>
    </button>
  );
}

function ProgressButton({ course, signedIn, savingId, onToggle }) {
  const Icon = course.completed ? CheckCircle2 : Circle;
  const label = course.completed ? 'Đã học' : signedIn ? 'Hoàn thành' : 'Đăng nhập để lưu';

  return (
    <button
      type="button"
      disabled={savingId === course.videoId || !signedIn}
      onClick={(event) => {
        event.stopPropagation();
        onToggle(course);
      }}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
        course.completed
          ? 'border-emerald-400/30 bg-emerald-500/15 text-emerald-300'
          : 'border-crypto bg-[#12162a] text-cyan-200 hover:border-cyan-400/50'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function CourseCard({ course, signedIn, savingId, onOpen, onToggle }) {
  const difficulty = DIFFICULTY[course.difficulty] || DIFFICULTY.BEGINNER;

  return (
    <article
      onClick={() => onOpen(course)}
      className="group cursor-pointer overflow-hidden rounded-lg border border-crypto bg-crypto-secondary transition-colors hover:border-cyan-400/50"
    >
      <div className="relative aspect-video bg-black">
        <img
          src={thumbnailFor(course)}
          alt={course.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.src = `https://i.ytimg.com/vi/${course.videoId}/hqdefault.jpg`;
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-400 text-[#07111f]">
            <Play className="ml-0.5 h-5 w-5 fill-current" />
          </span>
        </div>
        {course.durationFormatted && (
          <span className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-xs font-semibold text-white">
            {course.durationFormatted}
          </span>
        )}
      </div>

      <div className="space-y-3 p-4">
        <div className="flex flex-wrap gap-2">
          <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${difficulty.className}`}>
            {difficulty.label}
          </span>
          <span className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-2.5 py-1 text-xs font-semibold text-cyan-300">
            {course.category}
          </span>
        </div>

        <h3 className="line-clamp-2 min-h-12 text-base font-bold leading-snug text-white group-hover:text-cyan-300">
          {course.title}
        </h3>

        <p className="line-clamp-2 min-h-10 text-sm leading-relaxed text-crypto-muted">
          {course.description}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Stat icon={<Eye className="h-3.5 w-3.5" />}>{formatViews(course.viewCount)}</Stat>
          <Stat icon={<ThumbsUp className="h-3.5 w-3.5" />}>{formatViews(course.likeCount)}</Stat>
          <Stat icon={<Clock className="h-3.5 w-3.5" />}>{course.durationFormatted}</Stat>
        </div>

        <ProgressButton
          course={course}
          signedIn={signedIn}
          savingId={savingId}
          onToggle={onToggle}
        />
      </div>
    </article>
  );
}

function VideoModal({ course, signedIn, savingId, onClose, onToggle }) {
  useEffect(() => {
    const closeOnEscape = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  if (!course) return null;

  const difficulty = DIFFICULTY[course.difficulty] || DIFFICULTY.BEGINNER;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="relative flex max-h-[calc(100vh-2rem)] w-full max-w-4xl flex-col overflow-hidden rounded-lg border border-crypto bg-crypto-secondary shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-lg bg-black/60 text-white backdrop-blur transition-colors hover:bg-black/80"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative aspect-video max-h-[58vh] shrink-0 bg-black">
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`${course.embedUrl}?autoplay=1&rel=0`}
            title={course.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <div className="min-h-0 space-y-4 overflow-y-auto p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-xl font-bold leading-snug text-white">{course.title}</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${difficulty.className}`}>
                  {difficulty.label}
                </span>
                <span className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-2.5 py-1 text-xs font-semibold text-cyan-300">
                  {course.category}
                </span>
              </div>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-crypto-muted">{course.description}</p>
          <div className="flex flex-wrap gap-3">
            <ProgressButton course={course} signedIn={signedIn} savingId={savingId} onToggle={onToggle} />
            <a
              href={course.watchUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-crypto bg-[#12162a] px-3 text-sm font-semibold text-crypto-muted transition-colors hover:border-cyan-400/50 hover:text-white"
            >
              <ExternalLink className="h-4 w-4" />
              Mở YouTube
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Academy() {
  const [paths, setPaths] = useState([]);
  const [activePathId, setActivePathId] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState('');

  const signedIn = Boolean(localStorage.getItem('token'));

  const loadPaths = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError('');
    try {
      const response = await academyAPI.getPaths();
      const nextPaths = response.data || [];
      setPaths(nextPaths);
      setActivePathId((current) => current || nextPaths[0]?.id || null);
    } catch (err) {
      setError(err.message || 'Không thể tải Academy Service.');
      setPaths([]);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPaths();
  }, [loadPaths]);

  const activePath = useMemo(
    () => paths.find((path) => path.id === activePathId) || paths[0],
    [paths, activePathId]
  );

  const totals = useMemo(() => {
    const total = paths.reduce((sum, path) => sum + path.totalCourses, 0);
    const completed = paths.reduce((sum, path) => sum + path.completedCourses, 0);
    return {
      total,
      completed,
      percent: total === 0 ? 0 : Math.round((completed * 100) / total),
    };
  }, [paths]);

  const toggleProgress = async (course) => {
    if (!signedIn) return;

    setSavingId(course.videoId);
    setError('');
    try {
      const response = await academyAPI.updateProgress(course.videoId, !course.completed);
      const updatedCourse = response.data;
      await loadPaths(false);
      setSelectedCourse((current) =>
        current?.videoId === updatedCourse.videoId ? updatedCourse : current
      );
    } catch (err) {
      setError(err.message || 'Không thể lưu tiến độ học.');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl p-6">
      <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-cyan-300">
            <GraduationCap className="h-5 w-5" />
            <span className="text-sm font-semibold">Crypto Academy</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Lộ trình học crypto</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-crypto-muted">
            Học theo từng nhóm kiến thức, xem video YouTube đã seed sẵn và lưu tiến độ của tài khoản.
          </p>
        </div>

        <div className="flex min-w-64 items-center gap-3 rounded-lg border border-crypto bg-crypto-secondary p-4">
          <BookOpen className="h-5 w-5 text-cyan-300" />
          <div className="min-w-0 flex-1">
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-white">{totals.completed}/{totals.total} bài</span>
              <span className="text-cyan-300">{totals.percent}%</span>
            </div>
            <div className="mt-2">
              <ProgressBar value={totals.percent} />
            </div>
          </div>
          <button
            type="button"
            onClick={() => loadPaths()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-crypto text-crypto-muted transition-colors hover:border-cyan-400/50 hover:text-white"
          >
            <RotateCw className="h-4 w-4" />
          </button>
        </div>
      </header>

      {error && (
        <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-28 animate-pulse rounded-lg border border-crypto bg-crypto-secondary" />
            ))}
          </div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-80 animate-pulse rounded-lg border border-crypto bg-crypto-secondary" />
            ))}
          </div>
        </div>
      ) : paths.length === 0 ? (
        <div className="rounded-lg border border-crypto bg-crypto-secondary p-10 text-center">
          <GraduationCap className="mx-auto mb-3 h-10 w-10 text-crypto-muted" />
          <p className="text-crypto-muted">Chưa có khóa học trong database.</p>
        </div>
      ) : (
        <main className="grid gap-5 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-3">
            {paths.map((path) => (
              <PathButton
                key={path.id}
                path={path}
                active={path.id === activePath?.id}
                onClick={() => setActivePathId(path.id)}
              />
            ))}
          </aside>

          <section className="rounded-lg border border-crypto bg-[#0b0d16] p-4">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">{activePath?.title}</h2>
                <p className="mt-1 text-sm text-crypto-muted">{activePath?.description}</p>
              </div>
              <span className="w-fit rounded-lg border border-crypto px-3 py-2 text-sm font-semibold text-cyan-300">
                {activePath?.completedCourses}/{activePath?.totalCourses} hoàn thành
              </span>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {activePath?.courses?.map((course) => (
                <CourseCard
                  key={course.videoId}
                  course={course}
                  signedIn={signedIn}
                  savingId={savingId}
                  onOpen={setSelectedCourse}
                  onToggle={toggleProgress}
                />
              ))}
            </div>
          </section>
        </main>
      )}

      {selectedCourse && (
        <VideoModal
          course={selectedCourse}
          signedIn={signedIn}
          savingId={savingId}
          onClose={() => setSelectedCourse(null)}
          onToggle={toggleProgress}
        />
      )}
    </div>
  );
}
