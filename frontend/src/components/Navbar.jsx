import { Bell, User, Wallet, LogOut } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  // Mock data - sẽ thay bằng data thực từ backend sau
  const user = {
    email: "user@example.com",
    balance: 1000,
  };

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">₿</span>
            </div>
            <span className="text-xl font-bold text-gray-800">
              CryptoTrading SOA
            </span>
          </Link>

          {/* Right side */}
          <div className="flex items-center space-x-6">
            {/* Balance */}
            <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-lg">
              <Wallet className="w-5 h-5 text-green-600" />
              <div className="flex flex-col">
                <span className="text-xs text-gray-600">Số dư</span>
                <span className="text-sm font-semibold text-gray-800">
                  ${user.balance.toLocaleString()} USDT
                </span>
              </div>
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-800">
                  {user.email}
                </p>
                <p className="text-xs text-gray-500">Trader</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
