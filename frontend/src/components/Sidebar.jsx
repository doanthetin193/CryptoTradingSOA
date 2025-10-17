import { Home, Briefcase, TrendingUp, History, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/portfolio", icon: Briefcase, label: "Portfolio" },
    { path: "/trade", icon: TrendingUp, label: "Trade" },
    { path: "/history", icon: History, label: "History" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <aside className="w-64 bg-white shadow-lg border-r border-gray-200 min-h-screen">
      <nav className="mt-8 px-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? "text-white" : "text-gray-500"
                    }`}
                  />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Quick Stats */}
      <div className="mt-8 mx-4 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Quick Stats
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Total Value</span>
            <span className="text-sm font-bold text-gray-800">$1,234.56</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">24h Change</span>
            <span className="text-sm font-bold text-green-600">+5.32%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Assets</span>
            <span className="text-sm font-bold text-gray-800">5</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
