import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, FolderOpen, Calendar, IndianRupee, Settings, ChevronDown, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';

const getGreeting = (adminName: string) => {
  const hour = new Date().getHours();
  if (hour < 12) return `Good morning, ${adminName} ☀️`;
  if (hour < 18) return `Good afternoon, ${adminName} 🌤️`;
  return `Good evening, ${adminName} 🌙`;
};

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
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 pb-safe sm:hidden z-50 transition-colors">
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
                isActive ? "text-yaron-magenta" : "text-yaron-gray hover:text-yaron-charcoal dark:text-gray-400 dark:hover:text-white"
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
  const { studios, activeStudioId, setActiveStudio } = useAppStore();
  const activeStudio = studios.find(s => s.id === activeStudioId);

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: FolderOpen, label: 'Works', path: '/works' },
    { icon: Calendar, label: 'Bookings', path: '/bookings' },
    { icon: IndianRupee, label: 'Finance', path: '/finance' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <aside className="hidden sm:flex flex-col w-64 h-screen bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 fixed left-0 top-0 transition-colors">
      <div className="h-20 flex items-center px-6 border-b border-gray-100 dark:border-gray-800">
        <img src="/yaron logo.png" alt="Yaron Studio" className="h-10 w-10 object-contain mr-3" />
        <h1 className="font-bold text-xl text-yaron-charcoal dark:text-white tracking-tight">Yaron <span className="text-yaron-magenta">Studio</span></h1>
      </div>
      
      <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-800">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Current Studio</label>
        <div className="relative">
          <select 
            value={activeStudioId || ''} 
            onChange={(e) => setActiveStudio(e.target.value)}
            className="w-full appearance-none bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-yaron-charcoal dark:text-white rounded-xl px-4 py-2.5 pr-10 font-medium focus:outline-none focus:ring-2 focus:ring-yaron-magenta/20 transition-all cursor-pointer"
          >
            {studios.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        {activeStudio && (
          <p className="text-xs text-gray-500 mt-2 font-medium">{getGreeting(activeStudio.adminName)}</p>
        )}
      </div>

      <div className="flex-1 py-4 px-4 space-y-2 overflow-y-auto">
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
                  ? "bg-yaron-magenta/10 dark:bg-yaron-magenta/20 text-yaron-magenta font-semibold" 
                  : "text-yaron-gray hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white hover:text-yaron-charcoal"
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
  const { studios, activeStudioId, setActiveStudio } = useAppStore();
  const activeStudio = studios.find(s => s.id === activeStudioId);

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center px-4 justify-between sticky top-0 z-40 sm:hidden transition-colors">
      <div className="flex items-center space-x-2">
        <img src="/yaron logo.png" alt="Yaron Studio" className="h-8 w-8 object-contain" />
        <div className="flex flex-col">
          <select 
            value={activeStudioId || ''} 
            onChange={(e) => setActiveStudio(e.target.value)}
            className="appearance-none bg-transparent text-sm font-bold text-yaron-charcoal dark:text-white focus:outline-none cursor-pointer"
          >
            {studios.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          {activeStudio && (
            <span className="text-[10px] text-gray-500 font-medium -mt-1">{getGreeting(activeStudio.adminName)}</span>
          )}
        </div>
      </div>
      <ChevronDown size={14} className="text-gray-400" />
    </header>
  );
};

export default function MainLayout() {
  const { theme } = useAppStore();

  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className={cn("min-h-screen flex transition-colors", "bg-yaron-light dark:bg-gray-950 dark:text-white")}>
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
