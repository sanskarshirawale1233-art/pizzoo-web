import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MenuProvider } from './context/MenuContext';
import { CartProvider } from './context/CartContext';
import { CustomerApp } from './pages/CustomerApp';
import { AdminLayout } from './pages/AdminLayout';

export const App = () => {
  return (
    <BrowserRouter>
      <MenuProvider>
        <CartProvider>
          <Routes>
            {/* Customer Routes */}
            <Route path="/" element={<CustomerApp />} />
            <Route path="/table/:tableId" element={<CustomerApp />} />

            {/* Protected Owner Routes (PIN: 0909) */}
            <Route path="/admin/*" element={<AdminLayout />} />
            <Route path="/.admin/*" element={<AdminLayout />} />

            {/* Fallback Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </MenuProvider>
    </BrowserRouter>
  );
};

export default App;
