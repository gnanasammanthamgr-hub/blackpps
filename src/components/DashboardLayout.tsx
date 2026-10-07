import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, MessageSquare, Bell, Calendar, BarChart3,
  CheckSquare, Settings, User, LogOut, Menu, X, Search,
  Plus, Star,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn, initials } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/messages', label: 'Messages', icon: MessageSquare },
  { to: '/reminders', label: 'Reminders', icon: CheckSquare },
  { to: '/calendar', label: 'Calendar', icon: Calendar },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-gray-200 bg-white">
        <SidebarContent location={location} onSignOut={handleSignOut} displayName={displayName} />
      </aside>

      {/* Sidebar — mobile */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed left-0 top-0 z-50 h-full w-64 bg-white border-r border-gray-200 lg:hidden animate-in slide-in-from-left duration-200">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute right-3 top-3 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
            >
              <X size={20} />
            </button>
            <SidebarContent
              location={location}
              onSignOut={handleSignOut}
              displayName={displayName}
              onNavigate={() => setSidebarOpen(false)}
            />
          </aside>
        </>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200">
          <div className="flex items-center justify-between px-4 lg:px-6 h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
              >
                <Menu size={20} />
              </button>
              <div className="relative hidden md:block">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      navigate(`/search?q=${encodeURIComponent(e.currentTarget.value)}`);
                    }
                  }}
                  className="w-64 pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/messages/new"
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors active:scale-[0.98]"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Add Message</span>
              </Link>
              <Link
                to="/notifications"
                className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </Link>
              <Link
                to="/profile"
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold flex items-center justify-center hover:opacity-90 transition-opacity"
              >
                {initials(displayName)}
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 max-w-7xl mx-auto w-full">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({
  location,
  onSignOut,
  displayName,
  onNavigate,
}: {
  location: { pathname: string };
  onSignOut: () => void;
  displayName: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <Link to="/dashboard" className="flex items-center gap-2.5" onClick={onNavigate}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <MessageSquare size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900 leading-tight">Message Tracker</h1>
            <p className="text-xs text-gray-400">Unified Inbox</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon size={18} className={active ? 'text-blue-600' : 'text-gray-400'} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-3 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold flex items-center justify-center shrink-0">
            {initials(displayName)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
            <p className="text-xs text-gray-400 truncate">Free Plan</p>
          </div>
        </div>
        <button
          onClick={onSignOut}
          className="mt-1 w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut size={18} className="text-gray-400" />
          Logout
        </button>
      </div>
    </div>
  );
}
