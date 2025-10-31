import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { tradeAPI } from "../services/api";

const History = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await tradeAPI.getHistory();
      if (response.success) {
        setTransactions(response.data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Lịch sử giao dịch</h1>
        <button onClick={fetchHistory} className="px-4 py-2 bg-blue-500 text-white rounded-lg">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        {transactions.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Chưa có giao dịch nào</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Loại</th>
                <th className="text-left py-3 px-4">Coin</th>
                <th className="text-right py-3 px-4">Số lượng</th>
                <th className="text-right py-3 px-4">Giá</th>
                <th className="text-right py-3 px-4">Tổng</th>
                <th className="text-right py-3 px-4">Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx._id} className="border-b hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${tx.type === "buy" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {tx.type === "buy" ? "Mua" : "Bán"}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-semibold">{tx.symbol}</td>
                  <td className="text-right py-4 px-4">{tx.amount}</td>
                  <td className="text-right py-4 px-4">${tx.price.toLocaleString()}</td>
                  <td className="text-right py-4 px-4 font-semibold">${tx.totalCost.toFixed(2)}</td>
                  <td className="text-right py-4 px-4 text-sm text-gray-600">
                    {new Date(tx.executedAt).toLocaleString("vi-VN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default History;
