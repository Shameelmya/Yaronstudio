import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';

import Home from '@/pages/Home';
import Works from '@/pages/Works';
import Bookings from '@/pages/Bookings';
import Finance from '@/pages/Finance';
import Settings from '@/pages/Settings';
import DeliveryPortal from '@/pages/DeliveryPortal';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/delivery/:id" element={<DeliveryPortal />} />
        
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="works" element={<Works />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="finance" element={<Finance />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
