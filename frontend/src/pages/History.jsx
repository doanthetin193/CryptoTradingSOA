import { useState, useEffect, useCallback } from 'react';
import { tradeAPI } from '../services/api';
import { RefreshCw, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

export default function History() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { type: filter } : {};
      const res = await tradeAPI.getHistory(params);
      if (res.success) {
        setTrades(res.data.trades || res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

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
      <div className="flex space-x-2">
        {['all', 'buy', 'sell'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
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
    </div>
  );
}
