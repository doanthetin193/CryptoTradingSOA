import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, DollarSign, Wallet, Activity, RefreshCw } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { marketAPI, portfolioAPI } from "../services/api";

const Dashboard = () => {
  const { user } = useAuth();
  const [prices, setPrices] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pricesRes, portfolioRes] = await Promise.all([
        marketAPI.getPrices(),
        portfolioAPI.getPortfolio(),
      ]);
      if (pricesRes.success) setPrices(pricesRes.data);
      if (portfolioRes.success) setPortfolio(portfolioRes.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-500 text-white p-6 rounded-xl">
          <p>Số dư</p>
          <h3 className="text-2xl font-bold">${user?.balance?.toLocaleString() || 0}</h3>
        </div>
        <div className="bg-purple-500 text-white p-6 rounded-xl">
          <p>Danh mục</p>
          <h3 className="text-2xl font-bold">${portfolio?.summary?.totalValue?.toFixed(2) || 0}</h3>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4">Top Coins</h2>
        {prices.slice(0, 5).map(coin => (
          <div key={coin.symbol} className="flex justify-between py-2 border-b">
            <span>{coin.symbol}</span>
            <span>${coin.price?.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
