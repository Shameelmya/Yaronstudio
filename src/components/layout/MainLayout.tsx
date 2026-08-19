import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, FolderOpen, Calendar, IndianRupee, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: FolderOpen, label: 'Works', path: '/works' },
    { icon: Calendar, label: 'Bookings', path: '/bookings' },
    { icon: IndianRupee, label: 'Finance', path: '/finance' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe sm:hidden z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
                           (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                isActive ? "text-yaron-magenta" : "text-yaron-gray hover:text-yaron-charcoal"
              )}
            >
              <div className="relative">
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                {isActive && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-yaron-orange rounded-full" />
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: FolderOpen, label: 'Works', path: '/works' },
    { icon: Calendar, label: 'Bookings', path: '/bookings' },
    { icon: IndianRupee, label: 'Finance', path: '/finance' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <aside className="hidden sm:flex flex-col w-64 h-screen bg-white border-r border-gray-100 fixed left-0 top-0">
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <img src="/yaron logo.png" alt="Yaron Studio" className="h-8 object-contain" />
      </div>
      <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
                           (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all",
                isActive 
                  ? "bg-yaron-magenta/10 text-yaron-magenta font-semibold" 
                  : "text-yaron-gray hover:bg-gray-50 hover:text-yaron-charcoal"
              )}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export const Header = () => {
  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center px-4 sm:px-8 justify-between sticky top-0 z-40 sm:hidden">
      <img src="/yaron logo.png" alt="Yaron Studio" className="h-8 object-contain" />
      {/* Optional: Add user avatar or notifications here */}
    </header>
  );
};

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-yaron-light flex">
      <Sidebar />
      <div className="flex-1 flex flex-col sm:ml-64 w-full max-w-full pb-16 sm:pb-0 relative min-h-screen">
        <Header />
        <main className="flex-1 overflow-x-hidden p-4 sm:p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
