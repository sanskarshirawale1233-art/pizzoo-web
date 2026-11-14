import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MenuProvider } from './context/MenuContext';
import { KdsProvider } from './context/KdsContext';
import { CartProvider } from './context/CartContext';
import { CustomerApp } from './pages/CustomerApp';
import { AdminLayout } from './pages/AdminLayout';

export const App = () => {
  return (
    <BrowserRouter>
      <MenuProvider>
        <KdsProvider>
          <CartProvider>
            <Routes>
              {/* Customer Routes */}
              <Route path="/" element={<CustomerApp />} />
              <Route path="/table/:tableId" element={<CustomerApp />} />

              {/* Secret Admin Routes */}
              <Route path="/admin/*" element={<AdminLayout />} />
              <Route path="/.admin/*" element={<AdminLayout />} />
              <Route path="/cucina/*" element={<AdminLayout />} />

              {/* Fallback Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </CartProvider>
        </KdsProvider>
      </MenuProvider>
    </BrowserRouter>
  );
};

export default App;
