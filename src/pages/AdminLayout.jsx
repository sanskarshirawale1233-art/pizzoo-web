import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Utensils, TrendingUp, ArrowLeft, KeyRound, ShieldCheck, X, Lock 
} from 'lucide-react';
import { AdminMenuManager } from '../components/AdminMenuManager';
import { AdminAnalytics } from '../components/AdminAnalytics';

export const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Authentication State with unique PIN 0909 key
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('pizzoo_auth_pin_0909') === '0909';
  });
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pin.trim() === '0909') {
      sessionStorage.setItem('pizzoo_auth_pin_0909', '0909');
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const currentPath = location.pathname;

  const handleTabChange = (path) => {
    navigate(path);
  };

  const handleExitAdmin = () => {
    sessionStorage.removeItem('pizzoo_auth_pin_0909');
    sessionStorage.removeItem('pizzoo_admin_auth');
    navigate('/');
  };

  // If not authenticated, render PIN prompt overlay
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex items-center justify-center p-4 selection:bg-trattoria-red font-sans">
        <div className="bg-white border border-stone-200 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl relative">
          <button 
            onClick={handleExitAdmin}
            className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-2 rounded-full hover:bg-stone-100 transition-colors"
            title="Return to Menu"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 bg-trattoria-red/10 border border-trattoria-red/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-trattoria-red">
            <ShieldCheck className="w-7 h-7" />
          </div>

          <span className="font-sans text-xs tracking-widest text-trattoria-red font-bold uppercase block mb-1">
            Owner Access Only
          </span>
          <h3 className="font-serif text-2xl font-black text-stone-900">Protected Menu Manager</h3>
          <p className="text-xs text-stone-500 mt-1 mb-6 font-body">
            Enter 4-digit Owner PIN to add & manage pizzas or view revenue
          </p>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="password"
                maxLength={4}
                placeholder="••••"
                value={pin}
                onChange={(e) => { setPin(e.target.value); setPinError(false); }}
                className="w-full text-center tracking-[0.8em] text-2xl py-3 px-4 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 font-bold focus:border-trattoria-red outline-none"
                autoFocus
              />
              <KeyRound className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>

            {pinError && (
              <p className="text-xs text-trattoria-red font-sans font-bold animate-shake">
                Incorrect PIN! Please try again.
              </p>
            )}

            <button 
              type="submit"
              className="w-full bg-trattoria-red hover:bg-trattoria-redHover text-white py-3.5 rounded-xl font-sans text-xs uppercase tracking-widest font-bold shadow-md transition-all active:scale-98"
            >
              Unlock Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  const isRevenueActive = currentPath.includes('/revenue') || currentPath.includes('/analytics');

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 font-sans selection:bg-trattoria-red pb-16">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          
          {/* Logo & Back button */}
          <div className="flex items-center gap-3">
            <button 
              onClick={handleExitAdmin}
              className="p-2 bg-stone-100 hover:bg-stone-200 rounded-xl text-stone-600 hover:text-stone-900 transition-colors"
              title="Return to Customer Storefront"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-trattoria-red/10 border border-trattoria-red/20 flex items-center justify-center text-trattoria-red font-bold text-lg">
                🍕
              </div>
              <div>
                <h1 className="font-serif text-lg font-black text-stone-900 leading-tight">Pizzoo Owner Portal</h1>
                <span className="text-[10px] text-stone-500 font-mono block">Bhandup West, Mumbai</span>
              </div>
            </div>
          </div>

          {/* Strictly 2 Options + Lock Button */}
          <div className="flex items-center gap-3">
            <nav className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-2xl border border-stone-200">
              {/* Tab 1: Menu Adding & Management */}
              <button
                onClick={() => handleTabChange('/admin/menu')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                  !isRevenueActive
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Utensils className="w-4 h-4 text-amber-400" />
                <span>1. Add & Manage Menu</span>
              </button>

              {/* Tab 2: Total Revenue & Sales */}
              <button
                onClick={() => handleTabChange('/admin/revenue')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                  isRevenueActive
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>2. Total Revenue & Sales</span>
              </button>
            </nav>

            {/* Lock & Exit Button */}
            <button
              onClick={handleExitAdmin}
              className="flex items-center gap-1.5 bg-stone-100 hover:bg-red-50 text-stone-700 hover:text-trattoria-red border border-stone-200 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all"
              title="Lock Admin and Exit"
            >
              <Lock className="w-3.5 h-3.5 text-trattoria-red" />
              <span className="hidden sm:inline">Lock & Exit</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Body (Only Menu Manager or Total Revenue) */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-6">
        {isRevenueActive ? (
          <AdminAnalytics />
        ) : (
          <AdminMenuManager />
        )}
      </main>
    </div>
  );
};
