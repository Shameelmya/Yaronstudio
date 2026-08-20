import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, FolderOpen, Calendar, IndianRupee, Settings, ChevronDown, Moon, Sun, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { listenToStaff, listenToStudios } from '@/lib/api';

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
    { icon: FileText, label: 'Invoices', path: '/invoices' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <nav className="fixed bottom-3 left-4 right-4 bg-yaron-gradient h-[85px] rounded-[24px] z-50 flex justify-around items-center px-1 shadow-[0_8px_32px_rgba(199,45,92,0.3)] border border-white/10 sm:hidden">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path || 
                         (item.path !== '/' && location.pathname.startsWith(item.path));
        const Icon = item.icon;
        
        const handleNav = (targetPath: string) => {
          if (location.pathname === targetPath) return;
          if (targetPath === '/') {
            navigate(-1); // Go back if clicking home
          } else if (location.pathname === '/') {
            navigate(targetPath); // Push if going from home
          } else {
            navigate(targetPath, { replace: true }); // Replace if switching between tabs
          }
        };
        
        return (
          <button
            key={item.path}
            onClick={() => handleNav(item.path)}
            className="flex flex-col items-center justify-center w-[58px] gap-1 transition-all"
          >
            <div className={cn(
              "flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300",
              isActive ? "bg-white shadow-[0_4px_12px_rgba(0,0,0,0.15)]" : "bg-white/15"
            )}>
              <Icon size={24} className={cn(
                "transition-all duration-300",
                isActive ? "text-yaron-magenta" : "text-white/80"
              )} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className={cn(
              "text-[10px] font-semibold transition-colors duration-300",
              isActive ? "text-white" : "text-white/60"
            )}>{item.label}</span>
          </button>
        );
      })}
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
    { icon: FileText, label: 'Invoices', path: '/invoices' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <aside className="hidden sm:flex flex-col w-64 h-screen bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 fixed left-0 top-0 transition-colors">
      <div className="h-24 flex items-center px-6 border-b border-gray-100 dark:border-gray-800">
        <img src="/yaron logo.png" alt="Yaron Studio" className="h-16 w-16 object-contain mr-3" />
        <h1 className="font-bold text-xl text-yaron-charcoal dark:text-white tracking-tight whitespace-nowrap">Yaron <span className="text-yaron-magenta">Studio</span></h1>
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
              onClick={() => {
                if (location.pathname === item.path) return;
                if (item.path === '/') navigate(-1);
                else if (location.pathname === '/') navigate(item.path);
                else navigate(item.path, { replace: true });
              }}
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
        <img src="/yaron logo.png" alt="Yaron Studio" className="h-12 w-12 object-contain" />
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
  const { theme, activeStudioId, setStaff, setStudios } = useAppStore();

  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  React.useEffect(() => {
    const unsubStudios = listenToStudios((studiosData) => {
      setStudios(studiosData);
    });
    return () => unsubStudios();
  }, [setStudios]);

  React.useEffect(() => {
    if (!activeStudioId) return;
    const unsubStaff = listenToStaff(activeStudioId, (staffData) => {
      setStaff(staffData);
    });
    return () => unsubStaff();
  }, [activeStudioId, setStaff]);

  return (
    <div className={cn("min-h-screen flex transition-colors", "bg-yaron-light dark:bg-gray-950 dark:text-white")}>
      <Sidebar />
      <div className="flex-1 flex flex-col sm:ml-64 w-full max-w-full pb-[110px] sm:pb-0 relative min-h-screen">
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
