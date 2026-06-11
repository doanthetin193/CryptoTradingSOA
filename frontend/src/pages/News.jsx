import { useCallback, useEffect, useState } from 'react';
import { newsAPI } from '../services/api';
import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Eye,
  Flame,
  Newspaper,
  RefreshCw,
  Search,
  SlidersHorizontal,
  X
} from 'lucide-react';
import Toast from '../components/Toast';

const PAGE_SIZE = 12;
const COINS = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'DOT'];

const SENTIMENT_CONFIG = {
  positive: { label: 'Tích cực', className: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300' },
  negative: { label: 'Tiêu cực', className: 'border-rose-500/30 bg-rose-500/15 text-rose-300' },
  neutral: { label: 'Trung lập', className: 'border-slate-500/30 bg-slate-500/15 text-slate-300' },
};

function sentimentConfig(sentiment) {
  return SENTIMENT_CONFIG[sentiment] || SENTIMENT_CONFIG.neutral;
}

function formatTimeAgo(dateStr) {
  if (!dateStr) return 'Chưa rõ';

  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return 'Chưa rõ';

  const mins = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
  if (mins < 1) return 'Vừa xong';
  if (mins < 60) return `${mins} phút trước`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ngày trước`;

  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function SentimentBadge({ sentiment }) {
  const config = sentimentConfig(sentiment);
  return (
    <span className={`inline-flex h-7 items-center rounded-full border px-2.5 text-xs font-semibold ${config.className}`}>
      {config.label}
    </span>
  );
}

function CoinTags({ coins = [], limit = 3 }) {
  return coins.slice(0, limit).map((coin) => (
    <span
      key={coin}
      className="inline-flex h-7 items-center rounded-full border border-cyan-500/25 bg-cyan-500/10 px-2.5 text-xs font-semibold text-cyan-300"
    >
      {coin}
    </span>
  ));
}

function ArticleImage({ article, className = '' }) {
  const [failed, setFailed] = useState(false);

  if (!article?.imageUrl || failed) {
    return (
      <div className={`flex items-center justify-center rounded-lg border border-crypto bg-crypto-secondary ${className}`}>
        <Newspaper className="h-8 w-8 text-crypto-muted" />
      </div>
    );
  }

  return (
    <img
      src={article.imageUrl}
      alt={article.title || 'News thumbnail'}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`rounded-lg object-cover bg-crypto-secondary ${className}`}
    />
  );
}

function NewsCard({ article, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(article)}
      className="group grid min-h-[178px] w-full grid-cols-[164px_1fr] gap-4 rounded-xl border border-crypto bg-crypto-card p-4 text-left transition-colors hover:border-cyan-500/50 max-sm:grid-cols-1"
    >
      <ArticleImage article={article} className="h-[146px] w-full max-sm:h-44" />

      <div className="flex min-w-0 flex-col">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <SentimentBadge sentiment={article.sentiment} />
          <CoinTags coins={article.coins} />
        </div>

        <h3 className="line-clamp-2 text-lg font-bold leading-snug text-crypto-primary transition-colors group-hover:text-cyan-300">
          {article.title}
        </h3>

        <p className="mt-2 line-clamp-2 text-sm leading-6 text-crypto-secondary">
          {article.summary && article.summary !== article.title
            ? article.summary
            : 'Tin mới từ thị trường crypto.'}
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-3 text-xs text-crypto-muted">
          <span className="font-semibold text-crypto-secondary">{article.source || 'Nguồn tin'}</span>
          <span className="inline-flex items-center gap-1">
            <CalendarClock className="h-3.5 w-3.5" />
            {formatTimeAgo(article.publishedAt)}
          </span>
          {article.views > 0 && (
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {article.views.toLocaleString('vi-VN')}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function NewsDetailModal({ article, onClose }) {
  if (!article) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-crypto bg-crypto-card shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-crypto bg-crypto-card/95 px-5 py-4 backdrop-blur">
          <div className="flex flex-wrap items-center gap-2">
            <SentimentBadge sentiment={article.sentiment} />
            <CoinTags coins={article.coins} limit={5} />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-crypto-muted transition-colors hover:bg-crypto-hover hover:text-crypto-primary"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <ArticleImage article={article} className="h-72 w-full" />
          <div>
            <h2 className="text-2xl font-bold leading-tight text-crypto-primary">{article.title}</h2>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-crypto-muted">
              <span className="font-semibold text-crypto-secondary">{article.source || 'Nguồn tin'}</span>
              <span>{formatTimeAgo(article.publishedAt)}</span>
              {article.views > 0 && <span>{article.views.toLocaleString('vi-VN')} lượt xem</span>}
            </div>
          </div>

          <p className="whitespace-pre-line text-base leading-7 text-crypto-secondary">
            {article.content || article.summary || 'Bài viết chưa có nội dung chi tiết trong nguồn dữ liệu hiện tại.'}
          </p>

          {article.url && (
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="crypto-btn crypto-btn-primary w-fit"
            >
              <ExternalLink className="h-4 w-4" />
              Đọc bài gốc
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function News() {
  const [news, setNews] = useState([]);
  const [trending, setTrending] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('latest');
  const [filterCoin, setFilterCoin] = useState('');
  const [filterSentiment, setFilterSentiment] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const showToast = useCallback((type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const fetchNews = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const res = await newsAPI.getNews(page, PAGE_SIZE, {
        coin: filterCoin || undefined,
        sentiment: filterSentiment || undefined,
        search: searchQuery.trim() || undefined,
      });

      if (res.success) {
        setNews(res.data.news || []);
        setPagination(res.data.pagination || { page: 1, limit: PAGE_SIZE, total: 0, pages: 1 });
      }
    } catch (error) {
      showToast('error', `Không thể tải tin tức: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [filterCoin, filterSentiment, searchQuery, showToast]);

  const fetchTrending = useCallback(async () => {
    try {
      const res = await newsAPI.getTrending(12);
      if (res.success) setTrending(res.data.trending || []);
    } catch (error) {
      console.error('Trending fetch error:', error.message);
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    fetchNews(1);
  }, [fetchNews]);

  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);

  const hasFilters = Boolean(filterCoin || filterSentiment || searchQuery.trim());
  const displayedNews = activeTab === 'trending' ? trending : news;

  const clearFilters = () => {
    setFilterCoin('');
    setFilterSentiment('');
    setSearchQuery('');
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchNews(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNews(currentPage);
    await fetchTrending();
    setRefreshing(false);
    showToast('success', 'Đã làm mới tin tức.');
  };

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      {selectedArticle && <NewsDetailModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-cyan-300">
            <Newspaper className="h-4 w-4" />
            Tin tức thị trường
          </div>
          <h1 className="text-3xl font-bold text-crypto-primary">Tin tức Crypto</h1>
          <p className="mt-1 text-sm text-crypto-muted">
            Cập nhật tin mới, xu hướng nổi bật và tâm lý thị trường từ các nguồn crypto quốc tế.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-lg border border-crypto bg-crypto-card px-3 py-2 text-sm text-crypto-secondary">
            {activeTab === 'latest' ? `${pagination.total} bài` : `${trending.length} trending`}
          </span>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="crypto-btn crypto-btn-secondary h-10 px-4"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-crypto bg-crypto-card p-3">
        <div className="grid gap-3 xl:grid-cols-[auto_1fr_170px_190px_auto]">
          <div className="flex min-h-12 rounded-lg border border-crypto bg-crypto-secondary p-1">
            <button
              type="button"
              onClick={() => setActiveTab('latest')}
              className={`flex min-h-10 items-center gap-2 rounded-md px-4 text-sm font-semibold leading-none transition-colors ${
                activeTab === 'latest' ? 'bg-cyan-500 text-black' : 'text-crypto-muted hover:text-crypto-primary'
              }`}
            >
              <Newspaper className="h-4 w-4 shrink-0" />
              Mới nhất
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('trending')}
              className={`flex min-h-10 items-center gap-2 rounded-md px-4 text-sm font-semibold leading-none transition-colors ${
                activeTab === 'trending' ? 'bg-orange-400 text-black' : 'text-crypto-muted hover:text-crypto-primary'
              }`}
            >
              <Flame className="h-4 w-4 shrink-0" />
              Trending
            </button>
          </div>

          <label className="relative block">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center text-crypto-muted">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Tìm theo tiêu đề, nguồn tin hoặc nội dung..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              disabled={activeTab === 'trending'}
              className="crypto-input min-h-12 !py-0 !pl-11 leading-normal disabled:cursor-not-allowed disabled:opacity-50"
            />
          </label>

          <label className="relative block">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center text-crypto-muted">
              <SlidersHorizontal className="h-4 w-4" />
            </span>
            <select
              value={filterCoin}
              onChange={(event) => setFilterCoin(event.target.value)}
              disabled={activeTab === 'trending'}
              className="crypto-input min-h-12 !py-0 !pl-11 !pr-8 leading-normal disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Tất cả coin</option>
              {COINS.map((coin) => (
                <option key={coin} value={coin}>{coin}</option>
              ))}
            </select>
          </label>

          <select
            value={filterSentiment}
            onChange={(event) => setFilterSentiment(event.target.value)}
            disabled={activeTab === 'trending'}
            className="crypto-input min-h-12 !py-0 !px-4 leading-normal disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Tất cả tâm lý</option>
            <option value="positive">Tích cực</option>
            <option value="neutral">Trung lập</option>
            <option value="negative">Tiêu cực</option>
          </select>

          {hasFilters && activeTab === 'latest' && (
            <button
              type="button"
              onClick={clearFilters}
              className="crypto-btn crypto-btn-secondary h-11 whitespace-nowrap px-4"
            >
              <X className="h-4 w-4" />
              Xóa lọc
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-3 xl:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-[178px] rounded-xl border border-crypto bg-crypto-card p-4">
              <div className="flex h-full gap-4">
                <div className="h-full w-40 rounded-lg bg-crypto-secondary" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-32 rounded bg-crypto-secondary" />
                  <div className="h-5 w-3/4 rounded bg-crypto-secondary" />
                  <div className="h-4 w-full rounded bg-crypto-secondary" />
                  <div className="h-4 w-2/3 rounded bg-crypto-secondary" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : displayedNews.length === 0 ? (
        <div className="rounded-xl border border-crypto bg-crypto-card p-10 text-center">
          <Newspaper className="mx-auto mb-4 h-12 w-12 text-crypto-muted" />
          <h2 className="text-xl font-bold text-crypto-primary">
            {hasFilters ? 'Không có tin phù hợp' : 'Chưa có tin tức'}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-crypto-muted">
            {hasFilters
              ? 'Hãy thử đổi từ khóa, coin hoặc bộ lọc tâm lý.'
              : 'News Service chưa trả về dữ liệu. Bạn có thể làm mới lại sau vài giây.'}
          </p>
          {hasFilters && (
            <button type="button" onClick={clearFilters} className="crypto-btn crypto-btn-primary mt-5">
              Xóa bộ lọc
            </button>
          )}
        </div>
      ) : (
        <div className="grid items-start gap-3 xl:grid-cols-2">
          {displayedNews.map((article) => (
            <NewsCard key={article.id} article={article} onClick={setSelectedArticle} />
          ))}
        </div>
      )}

      {activeTab === 'latest' && pagination.pages > 1 && !loading && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!pagination.hasPrev}
            className="rounded-lg border border-crypto p-2 text-crypto-muted transition-colors hover:border-cyan-500 hover:text-crypto-primary disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Trang trước"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {Array.from({ length: Math.min(pagination.pages, 7) }, (_, index) => {
            const startPage = Math.max(1, currentPage - 3);
            const page = startPage + index;
            if (page > pagination.pages) return null;

            return (
              <button
                type="button"
                key={page}
                onClick={() => handlePageChange(page)}
                className={`h-9 min-w-9 rounded-lg border px-3 text-sm font-semibold transition-colors ${
                  page === currentPage
                    ? 'border-cyan-500 bg-cyan-500 text-black'
                    : 'border-crypto text-crypto-muted hover:border-cyan-500 hover:text-crypto-primary'
                }`}
              >
                {page}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!pagination.hasNext}
            className="rounded-lg border border-crypto p-2 text-crypto-muted transition-colors hover:border-cyan-500 hover:text-crypto-primary disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Trang sau"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}

      {!loading && activeTab === 'latest' && pagination.total > 0 && (
        <p className="text-center text-xs text-crypto-muted">
          Hiển thị {(currentPage - 1) * pagination.limit + 1} - {Math.min(currentPage * pagination.limit, pagination.total)}
          {' '}trong tổng số {pagination.total} bài
        </p>
      )}
    </div>
  );
}
