import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Briefcase, 
  History,
  Bell, 
  Settings,
  Shield
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: TrendingUp, label: 'Trade', path: '/trade' },
  { icon: Briefcase, label: 'Portfolio', path: '/portfolio' },
  { icon: History, label: 'History', path: '/history' },
  { icon: Bell, label: 'Notifications', path: '/notifications' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

const adminMenuItem = { 
  icon: Shield, 
  label: 'Admin Panel', 
  path: '/admin' 
};

export default function Sidebar() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}

        {/* Admin Menu Item - Only show for admins */}
        {isAdmin && (
          <>
            <div className="border-t border-gray-200 my-2"></div>
            <NavLink
              to={adminMenuItem.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? 'bg-purple-50 text-purple-600 font-medium'
                    : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                }`
              }
            >
              <adminMenuItem.icon className="w-5 h-5" />
              <span>{adminMenuItem.label}</span>
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  );
}
