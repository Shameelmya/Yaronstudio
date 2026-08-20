import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import Home from '@/pages/Home';
import Works from '@/pages/Works';
import Bookings from '@/pages/Bookings';
import Finance from '@/pages/Finance';
import Settings from '@/pages/Settings';
import Invoices from '@/pages/Invoices';
import StaffPortal from '@/pages/StaffPortal';
import DeliveryPortal from '@/pages/DeliveryPortal';
import Login from '@/pages/Login';
import { useAuthStore } from '@/store/useAuthStore';
import { Music } from 'lucide-react';

// Auth Guard Component
const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuthStore();
  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="relative">
        <div className="absolute inset-0 bg-yaron-magenta blur-xl opacity-20 rounded-full animate-pulse"></div>
        <Music size={48} className="text-yaron-magenta animate-bounce relative z-10" />
      </div>
      <p className="mt-4 text-yaron-magenta font-semibold tracking-widest uppercase text-sm">Yaron Studio</p>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route path="/" element={<RequireAuth><MainLayout /></RequireAuth>}>
          <Route index element={<Home />} />
          <Route path="works" element={<Works />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="finance" element={<Finance />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="settings" element={<Settings />} />
          <Route path="staff" element={<StaffPortal />} />
        </Route>
        
        {/* Public Delivery Portal */}
        <Route path="/delivery/:id" element={<DeliveryPortal />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
