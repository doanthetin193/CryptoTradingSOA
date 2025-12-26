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
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-crypto-secondary border-r border-crypto overflow-y-auto">
      {/* Navigation */}
      <nav className="p-4 space-y-1">
        <p className="text-xs font-semibold text-crypto-muted uppercase tracking-wider mb-3 px-3">
          Menu
        </p>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}

        {/* Admin Menu Item */}
        {isAdmin && (
          <>
            <div className="border-t border-crypto my-4"></div>
            <p className="text-xs font-semibold text-crypto-muted uppercase tracking-wider mb-3 px-3">
              Admin
            </p>
            <NavLink
              to={adminMenuItem.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active bg-[rgba(139,92,246,0.1)] !text-[#8b5cf6]' : ''}`
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
