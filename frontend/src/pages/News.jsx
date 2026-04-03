import { useState, useEffect, useCallback } from 'react';
import { newsAPI } from '../services/api';
import {
  Newspaper,
  TrendingUp,
  Search,
  ExternalLink,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter,
  Flame
} from 'lucide-react';
import Toast from '../components/Toast';

// Màu badge theo sentiment
const SENTIMENT_CONFIG = {
  positive: { label: 'Tích cực', className: 'bg-green-500/20 text-green-400 border border-green-500/30' },
  negative: { label: 'Tiêu cực', className: 'bg-red-500/20 text-red-400 border border-red-500/30' },
  neutral: { label: 'Trung lập', className: 'bg-gray-500/20 text-gray-400 border border-gray-500/30' },
};

const COINS = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'DOT'];

function formatTimeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  return `${Math.floor(hours / 24)} ngày trước`;
}

function NewsCard({ article, onClick }) {
  const sentiment = SENTIMENT_CONFIG[article.sentiment] || SENTIMENT_CONFIG.neutral;

  return (
    <div
      className="crypto-card p-4 hover:border-blue-500/50 transition-all cursor-pointer group"
      onClick={() => onClick(article)}
    >
      <div className="flex items-start gap-4">
        {/* Thumbnail placeholder */}
        {article.imageUrl ? (
          <img
            src={article.imageUrl}
            alt=""
            className="w-20 h-20 rounded-lg object-cover flex-shrink-0 bg-crypto-secondary"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="w-20 h-20 rounded-lg bg-crypto-secondary flex items-center justify-center flex-shrink-0">
            <Newspaper className="w-8 h-8 text-crypto-muted" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-2 mb-2">
            {article.title}
          </h3>

          {/* Summary */}
          {article.summary && article.summary !== article.title && (
            <p className="text-sm text-crypto-muted line-clamp-2 mb-2">
              {article.summary}
            </p>
          )}

          {/* Meta info */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Sentiment badge */}
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sentiment.className}`}>
              {sentiment.label}
            </span>

            {/* Coin tags */}
            {article.coins?.slice(0, 3).map(coin => (
              <span key={coin} className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full">
                {coin}
              </span>
            ))}

            {/* Source & time */}
            <span className="text-xs text-crypto-muted ml-auto">
              {article.source} • {formatTimeAgo(article.publishedAt)}
            </span>

            {/* Views */}
            {article.views > 0 && (
              <span className="text-xs text-crypto-muted">
                👁 {article.views.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function NewsDetailModal({ article, onClose }) {
  if (!article) return null;
  const sentiment = SENTIMENT_CONFIG[article.sentiment] || SENTIMENT_CONFIG.neutral;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-crypto-secondary border border-crypto rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${sentiment.className}`}>
                {sentiment.label}
              </span>
              {article.coins?.map(coin => (
                <span key={coin} className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-1 rounded-full">
                  {coin}
                </span>
              ))}
            </div>
            <button
              onClick={onClose}
              className="text-crypto-muted hover:text-white transition-colors text-xl font-bold ml-4"
            >
              ✕
            </button>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-white mb-3">{article.title}</h2>

          {/* Meta */}
          <p className="text-sm text-crypto-muted mb-4">
            {article.source} • {formatTimeAgo(article.publishedAt)}
            {article.views > 0 && ` • 👁 ${article.views.toLocaleString()} lượt xem`}
          </p>

          {/* Summary / Content */}
          <div className="text-gray-300 leading-relaxed mb-6">
            {article.content || article.summary || 'Không có nội dung chi tiết.'}
          </div>

          {/* Read more button */}
          {article.url && (
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="crypto-btn flex items-center gap-2 w-fit"
            >
              <ExternalLink className="w-4 h-4" />
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
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('latest'); // 'latest' | 'trending'

  // Filters
  const [filterCoin, setFilterCoin] = useState('');
  const [filterSentiment, setFilterSentiment] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchNews = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const res = await newsAPI.getNews(page, 10, {
        coin: filterCoin || undefined,
        sentiment: filterSentiment || undefined,
        search: searchQuery || undefined,
      });

      if (res.success) {
        setNews(res.data.news || []);
        setPagination(res.data.pagination || { page: 1, limit: 10, total: 0, pages: 1 });
      }
    } catch (error) {
      showToast('error', 'Không thể tải tin tức: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [filterCoin, filterSentiment, searchQuery]);

  const fetchTrending = useCallback(async () => {
    try {
      const res = await newsAPI.getTrending(8);
      if (res.success) {
        setTrending(res.data.trending || []);
      }
    } catch (error) {
      console.error('Trending fetch error:', error.message);
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    fetchNews(1);
  }, [filterCoin, filterSentiment, searchQuery, fetchNews]);

  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);

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
    showToast('success', 'Đã làm mới tin tức!');
  };

  const clearFilters = () => {
    setFilterCoin('');
    setFilterSentiment('');
    setSearchQuery('');
  };

  const hasFilters = filterCoin || filterSentiment || searchQuery;
  const displayedNews = activeTab === 'trending' ? trending : news;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Toast */}
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* News Detail Modal */}
      {selectedArticle && (
        <NewsDetailModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Newspaper className="w-7 h-7 text-blue-400" />
            Tin Tức Crypto
          </h1>
          <p className="text-crypto-muted text-sm mt-1">
            Cập nhật tin tức thị trường tiền điện tử
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="crypto-btn flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-crypto pb-0">
        <button
          onClick={() => setActiveTab('latest')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
            activeTab === 'latest'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-crypto-muted hover:text-white'
          }`}
        >
          <span className="flex items-center gap-1">
            <Newspaper className="w-4 h-4" />
            Mới nhất
            {pagination.total > 0 && (
              <span className="ml-1 bg-blue-500/20 text-blue-400 text-xs px-1.5 rounded-full">
                {pagination.total}
              </span>
            )}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('trending')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
            activeTab === 'trending'
              ? 'border-orange-500 text-orange-400'
              : 'border-transparent text-crypto-muted hover:text-white'
          }`}
        >
          <span className="flex items-center gap-1">
            <Flame className="w-4 h-4" />
            Trending
          </span>
        </button>
      </div>

      {/* Filters (chỉ hiện khi tab Latest) */}
      {activeTab === 'latest' && (
        <div className="crypto-card p-4">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-crypto-muted" />
              <input
                type="text"
                placeholder="Tìm kiếm tin tức..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-crypto-secondary border border-crypto rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-crypto-muted focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Filter by coin */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-crypto-muted" />
              <select
                value={filterCoin}
                onChange={(e) => setFilterCoin(e.target.value)}
                className="bg-crypto-secondary border border-crypto rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 appearance-none min-w-28"
              >
                <option value="">Tất cả Coin</option>
                {COINS.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Filter by sentiment */}
            <select
              value={filterSentiment}
              onChange={(e) => setFilterSentiment(e.target.value)}
              className="bg-crypto-secondary border border-crypto rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 min-w-32"
            >
              <option value="">Tất cả Sentiment</option>
              <option value="positive">Tích cực</option>
              <option value="neutral">Trung lập</option>
              <option value="negative">Tiêu cực</option>
            </select>

            {/* Clear filters */}
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-crypto-muted hover:text-white transition-colors px-3 py-2 border border-crypto rounded-lg"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        </div>
      )}

      {/* News List */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="crypto-card p-4 animate-pulse">
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-crypto-secondary rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-crypto-secondary rounded w-3/4" />
                  <div className="h-3 bg-crypto-secondary rounded w-full" />
                  <div className="h-3 bg-crypto-secondary rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : displayedNews.length === 0 ? (
        <div className="crypto-card p-12 text-center">
          <Newspaper className="w-16 h-16 text-crypto-muted mx-auto mb-4" />
          <p className="text-xl font-semibold text-white mb-2">
            {hasFilters ? 'Không có tin tức phù hợp' : 'Chưa có tin tức'}
          </p>
          <p className="text-crypto-muted text-sm">
            {hasFilters
              ? 'Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
              : 'Tin tức đang được tải về, vui lòng thử lại sau'}
          </p>
          {hasFilters && (
            <button onClick={clearFilters} className="crypto-btn mt-4">
              Xóa bộ lọc
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {displayedNews.map(article => (
            <NewsCard
              key={article.id}
              article={article}
              onClick={setSelectedArticle}
            />
          ))}
        </div>
      )}

      {/* Pagination (chỉ hiện khi tab Latest và có nhiều trang) */}
      {activeTab === 'latest' && pagination.pages > 1 && !loading && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!pagination.hasPrev}
            className="p-2 rounded-lg border border-crypto text-crypto-muted hover:text-white hover:border-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Page numbers */}
          {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => {
            const startPage = Math.max(1, currentPage - 3);
            const page = startPage + i;
            if (page > pagination.pages) return null;
            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                  page === currentPage
                    ? 'bg-blue-600 text-white border border-blue-500'
                    : 'border border-crypto text-crypto-muted hover:text-white hover:border-blue-500'
                }`}
              >
                {page}
              </button>
            );
          })}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!pagination.hasNext}
            className="p-2 rounded-lg border border-crypto text-crypto-muted hover:text-white hover:border-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Stats footer */}
      {!loading && activeTab === 'latest' && pagination.total > 0 && (
        <p className="text-center text-xs text-crypto-muted">
          Hiển thị {((currentPage - 1) * pagination.limit) + 1} –{' '}
          {Math.min(currentPage * pagination.limit, pagination.total)} trong tổng số{' '}
          {pagination.total} bài
        </p>
      )}
    </div>
  );
}
