import { useState, useEffect, useCallback } from 'react';
import { tradeAPI } from '../services/api';
import { RefreshCw, ArrowUpCircle, ArrowDownCircle, ChevronLeft, ChevronRight, History as HistoryIcon, Filter } from 'lucide-react';

export default function History() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (filter !== 'all') {
        params.type = filter;
      }

      const res = await tradeAPI.getHistory(params);
      if (res.success) {
        setTrades(res.data.trades || res.data);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [filter, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 rounded-full border-4 border-[var(--border)]"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[var(--accent-primary)] animate-spin"></div>
          </div>
          <p className="text-crypto-secondary">Đang tải lịch sử...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-crypto flex items-center justify-center">
            <HistoryIcon className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-crypto-primary">Lịch sử giao dịch</h1>
            <p className="text-crypto-muted">Theo dõi tất cả hoạt động của bạn</p>
          </div>
        </div>
        <button
          onClick={fetchHistory}
          className="crypto-btn crypto-btn-secondary"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 p-1 bg-crypto-card border border-crypto rounded-xl">
          {['all', 'buy', 'sell'].map((type) => (
            <button
              key={type}
              onClick={() => handleFilterChange(type)}
              className={`px-4 py-2 rounded-lg font-medium transition ${filter === type
                  ? type === 'buy'
                    ? 'bg-[var(--success)] text-white'
                    : type === 'sell'
                      ? 'bg-[var(--error)] text-white'
                      : 'bg-gradient-crypto text-black'
                  : 'text-crypto-muted hover:text-crypto-primary hover:bg-crypto-hover'
                }`}
            >
              {type === 'all' ? 'Tất cả' : type === 'buy' ? '🚀 Mua' : '💸 Bán'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm text-crypto-muted">
          <Filter className="w-4 h-4" />
          Tổng: <span className="font-semibold text-crypto-primary">{pagination.total}</span> giao dịch
        </div>
      </div>

      {/* Trades List */}
      <div className="crypto-card !p-0 overflow-hidden">
        {trades.length > 0 ? (
          <table className="crypto-table">
            <thead>
              <tr>
                <th>Loại</th>
                <th>Coin</th>
                <th className="text-right">Số lượng</th>
                <th className="text-right">Giá</th>
                <th className="text-right">Tổng</th>
                <th className="text-right">Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade) => (
                <tr key={trade._id} className="hover:bg-crypto-hover transition">
                  <td>
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${trade.type === 'buy'
                        ? 'bg-[rgba(16,185,129,0.1)] text-[var(--success)]'
                        : 'bg-[rgba(239,68,68,0.1)] text-[var(--error)]'
                      }`}>
                      {trade.type === 'buy' ? (
                        <ArrowUpCircle className="w-4 h-4" />
                      ) : (
                        <ArrowDownCircle className="w-4 h-4" />
                      )}
                      <span className="font-medium">{trade.type === 'buy' ? 'Mua' : 'Bán'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className={`coin-icon text-white text-xs ${trade.type === 'buy'
                          ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                          : 'bg-gradient-to-br from-red-400 to-rose-500'
                        }`}>
                        {trade.symbol?.substring(0, 2) || '??'}
                      </div>
                      <span className="font-semibold text-crypto-primary">{trade.symbol}</span>
                    </div>
                  </td>
                  <td className="text-right text-crypto-primary">{trade.amount?.toFixed(6)}</td>
                  <td className="text-right text-crypto-secondary">${trade.price?.toLocaleString()}</td>
                  <td className="text-right font-bold text-crypto-primary">${trade.totalCost?.toFixed(2)}</td>
                  <td className="text-right text-crypto-muted text-sm">
                    {new Date(trade.executedAt).toLocaleString('vi-VN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-20">
            <HistoryIcon className="w-16 h-16 text-crypto-muted opacity-30 mx-auto mb-4" />
            <p className="text-crypto-muted">Chưa có giao dịch nào</p>
            <p className="text-sm text-crypto-muted mt-1">Bắt đầu mua bán để có lịch sử!</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {trades.length > 0 && (
        <div className="flex items-center justify-between crypto-card !py-3">
          <div className="text-sm text-crypto-muted">
            Hiển thị {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} / {pagination.total} giao dịch
          </div>

          {pagination.pages > 1 ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="crypto-btn crypto-btn-secondary !py-2 !px-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Trước</span>
              </button>

              {/* Page Numbers */}
              <div className="flex gap-1">
                {[...Array(pagination.pages)].map((_, idx) => {
                  const pageNum = idx + 1;
                  if (
                    pageNum === 1 ||
                    pageNum === pagination.pages ||
                    (pageNum >= pagination.page - 1 && pageNum <= pagination.page + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium transition ${pagination.page === pageNum
                            ? 'bg-gradient-crypto text-black'
                            : 'bg-crypto-hover text-crypto-secondary hover:text-crypto-primary'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    pageNum === pagination.page - 2 ||
                    pageNum === pagination.page + 2
                  ) {
                    return <span key={pageNum} className="px-2 py-2 text-crypto-muted">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="crypto-btn crypto-btn-secondary !py-2 !px-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Sau</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="text-sm text-crypto-muted">
              Trang 1 / 1
            </div>
          )}
        </div>
      )}
    </div>
  );
}
