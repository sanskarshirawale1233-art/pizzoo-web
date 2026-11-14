import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ChefHat, Utensils, TrendingUp, Volume2, VolumeX, 
  ArrowLeft, Lock, KeyRound, ShieldCheck, X 
} from 'lucide-react';
import { useKds } from '../context/KdsContext';
import { KdsApp } from './KdsApp';
import { AdminMenuManager } from '../components/AdminMenuManager';
import { AdminAnalytics } from '../components/AdminAnalytics';

export const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { soundEnabled, setSoundEnabled } = useKds();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('pizzoo_admin_auth') === 'true';
  });
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pin === '1234' || pin === '1717' || pin === '1924') {
      sessionStorage.setItem('pizzoo_admin_auth', 'true');
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
            Area Riservata Staff
          </span>
          <h3 className="font-serif text-2xl font-black text-stone-900">Admin Ecosystem Passcode</h3>
          <p className="text-xs text-stone-500 mt-1 mb-6 font-body">
            Enter PIN to access KDS, Menu Manager & Sales Analytics (Passcode: <strong>1234</strong>)
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
              <p className="text-xs text-trattoria-red font-sans font-bold">
                Incorrect passcode! Enter <strong>1234</strong> to unlock.
              </p>
            )}

            <button 
              type="submit"
              className="w-full bg-trattoria-red hover:bg-trattoria-redHover text-white py-3.5 rounded-xl font-sans text-xs uppercase tracking-widest font-bold shadow-md transition-all"
            >
              Unlock Admin Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 font-sans selection:bg-trattoria-red pb-16">
      {/* Admin Ecosystem Top Header Bar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          
          {/* Logo & Back button */}
          <div className="flex items-center gap-3">
            <button 
              onClick={handleExitAdmin}
              className="p-2 bg-stone-100 hover:bg-stone-200 rounded-xl text-stone-600 hover:text-stone-900 transition-colors"
              title="Return to Customer App"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-trattoria-red/10 border border-trattoria-red/20 flex items-center justify-center text-trattoria-red font-bold">
                🍕
              </div>
              <div>
                <h1 className="font-serif text-lg font-black text-stone-900 leading-tight">Pizzoo Admin Suite</h1>
                <span className="text-[10px] text-stone-500 font-mono block">Authentic Trattoria Management</span>
              </div>
            </div>
          </div>

          {/* Sub-View Navigation Tabs */}
          <nav className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-2xl border border-stone-200/80">
            <button
              onClick={() => handleTabChange('/admin/kds')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                currentPath.includes('/kds') || currentPath === '/admin' || currentPath === '/.admin'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <ChefHat className="w-4 h-4" />
              <span>1. KDS (Cucina)</span>
            </button>

            <button
              onClick={() => handleTabChange('/admin/menu')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                currentPath.includes('/menu')
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Utensils className="w-4 h-4" />
              <span>2. Gestione Menu</span>
            </button>

            <button
              onClick={() => handleTabChange('/admin/analytics')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                currentPath.includes('/analytics')
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>3. Vendite & Ricevute</span>
            </button>
          </nav>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border transition-all ${
                soundEnabled 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                  : 'bg-stone-100 border-stone-200 text-stone-500'
              }`}
              title="Toggle Order Sound Chime"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">{soundEnabled ? 'Chime Active' : 'Muted'}</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Active Sub-View Body */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-6">
        {currentPath.includes('/menu') ? (
          <AdminMenuManager />
        ) : currentPath.includes('/analytics') ? (
          <AdminAnalytics />
        ) : (
          <KdsApp onExitKds={handleExitAdmin} isEmbedded={true} />
        )}
      </main>
    </div>
  );
};
