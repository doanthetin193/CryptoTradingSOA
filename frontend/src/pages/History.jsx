import { useState, useEffect, useCallback } from 'react';
import { tradeAPI } from '../services/api';
import { RefreshCw, ArrowUpCircle, ArrowDownCircle, ChevronLeft, ChevronRight } from 'lucide-react';

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
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to page 1 when filter changes
  };

  if (loading) {
    return <div className="flex justify-center py-20"><RefreshCw className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Lịch sử giao dịch</h1>
        <button onClick={fetchHistory} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <RefreshCw className="w-4 h-4" />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          {['all', 'buy', 'sell'].map((type) => (
            <button
              key={type}
              onClick={() => handleFilterChange(type)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type === 'all' ? 'Tất cả' : type === 'buy' ? 'Mua' : 'Bán'}
            </button>
          ))}
        </div>
        <div className="text-sm text-gray-600">
          Tổng: <span className="font-semibold">{pagination.total}</span> giao dịch
        </div>
      </div>

      {/* Trades List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {trades.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Loại</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Coin</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Số lượng</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Giá</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Tổng</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade) => (
                <tr key={trade._id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${
                      trade.type === 'buy'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {trade.type === 'buy' ? (
                        <ArrowUpCircle className="w-4 h-4" />
                      ) : (
                        <ArrowDownCircle className="w-4 h-4" />
                      )}
                      <span className="font-medium">{trade.type === 'buy' ? 'Mua' : 'Bán'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-semibold">{trade.symbol}</td>
                  <td className="text-right py-4 px-6">{trade.amount}</td>
                  <td className="text-right py-4 px-6">${trade.price.toLocaleString()}</td>
                  <td className="text-right py-4 px-6 font-semibold">${trade.totalCost.toFixed(2)}</td>
                  <td className="text-right py-4 px-6 text-sm text-gray-600">
                    {new Date(trade.executedAt).toLocaleString('vi-VN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-gray-500 py-20">Chưa có giao dịch nào</p>
        )}
      </div>

      {/* Pagination - Always show when there are trades */}
      {trades.length > 0 && (
        <div className="flex items-center justify-between bg-white rounded-xl shadow-sm p-4">
          <div className="text-sm text-gray-600">
            Hiển thị {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} / {pagination.total} giao dịch
          </div>
          
          {pagination.pages > 1 ? (
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="flex items-center space-x-1 px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Trước</span>
              </button>
              
              {/* Page Numbers */}
              <div className="flex space-x-1">
                {[...Array(pagination.pages)].map((_, idx) => {
                  const pageNum = idx + 1;
                  // Show first page, last page, current page, and pages around current
                  if (
                    pageNum === 1 ||
                    pageNum === pagination.pages ||
                    (pageNum >= pagination.page - 1 && pageNum <= pagination.page + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 rounded-lg font-medium ${
                          pagination.page === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'border hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    pageNum === pagination.page - 2 ||
                    pageNum === pagination.page + 2
                  ) {
                    return <span key={pageNum} className="px-2 py-2">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="flex items-center space-x-1 px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Sau</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              Trang 1 / 1
            </div>
          )}
        </div>
      )}
    </div>
  );
}
