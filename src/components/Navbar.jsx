import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Phone, Menu, X, QrCode, Lock, KeyRound, ShieldCheck } from 'lucide-react';

export const Navbar = () => {
  const navigate = useNavigate();
  const { cart, tableId, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Owner PIN Modal State
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const handleOpenPinModal = (e) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    setPinInput('');
    setPinError(false);
    setIsPinModalOpen(true);
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinInput.trim() === '0909') {
      sessionStorage.setItem('pizzoo_auth_pin_0909', '0909');
      setIsPinModalOpen(false);
      navigate('/admin/menu');
    } else {
      setPinError(true);
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-[70px] bg-[#0A0602]/95 backdrop-blur-md border-b border-trattoria-gold/20 px-4 md:px-8 flex items-center justify-between">
        {/* Brand Logo & Tagline */}
        <a href="/#home" className="flex items-center gap-3 group">
          <img 
            src="/logo.png" 
            alt="Pizzoo Logo" 
            className="h-11 object-contain filter drop-shadow-[0_0_12px_rgba(240,165,0,0.4)] group-hover:scale-105 transition-transform" 
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div>
            <span className="font-serif text-2xl font-black tracking-wide text-white group-hover:text-trattoria-gold transition-colors">
              PIZZOO
            </span>
            <span className="block text-[9px] font-sans tracking-[0.25em] text-trattoria-gold uppercase">
              Italian Pizzeria
            </span>
          </div>
        </a>

        {/* Dine-In Table Badge */}
        {tableId && (
          <div className="hidden sm:flex items-center gap-2 bg-trattoria-red/20 border border-trattoria-red/40 px-3 py-1 rounded-full text-xs font-sans tracking-widest text-trattoria-cream animate-pulse">
            <QrCode className="w-3.5 h-3.5 text-trattoria-gold" />
            <span>TAVOLO {tableId}</span>
          </div>
        )}

        {/* Nav Links */}
        <ul className="hidden md:flex items-center gap-8 font-sans text-xs tracking-widest uppercase text-white/70">
          <li>
            <a href="/#home" className="hover:text-trattoria-gold transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-trattoria-gold hover:after:w-full after:transition-all">
              Home
            </a>
          </li>
          <li>
            <a href="/#menu" className="hover:text-trattoria-gold transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-trattoria-gold hover:after:w-full after:transition-all">
              Menu
            </a>
          </li>
          <li>
            <a href="/#about" className="hover:text-trattoria-gold transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-trattoria-gold hover:after:w-full after:transition-all">
              Our Story
            </a>
          </li>
          <li>
            <a href="/#contact" className="hover:text-trattoria-gold transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-trattoria-gold hover:after:w-full after:transition-all">
              Contact
            </a>
          </li>
        </ul>

        {/* Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Prominent Manage / Add Menu Button (Opens PIN Modal) */}
          <button 
            type="button"
            onClick={handleOpenPinModal}
            className="flex items-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-trattoria-gold border border-trattoria-gold/40 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full font-sans text-xs tracking-wider uppercase font-bold transition-all shadow-sm hover:scale-105"
            title="Add / Manage Menu (Password: 0909)"
          >
            <span>👑</span>
            <span className="hidden sm:inline">Add / Manage Menu</span>
            <span className="sm:hidden">Add Menu</span>
          </button>

          {/* Call-to-Order Telephone Link */}
          <a 
            href="tel:7738009029" 
            className="hidden lg:flex items-center gap-2 bg-gradient-to-r from-trattoria-red to-trattoria-terracotta text-white px-4 py-2 rounded-full font-sans text-xs tracking-wider uppercase font-semibold hover:shadow-red-glow transition-all transform hover:-translate-y-0.5"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call: 7738009029</span>
          </a>

          {/* Cart Drawer Trigger */}
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 bg-trattoria-wood/80 border border-trattoria-gold/30 text-white rounded-full hover:border-trattoria-gold transition-all"
          >
            <ShoppingBag className="w-5 h-5 text-trattoria-gold" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-trattoria-red text-white text-[10px] font-black font-sans w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#0A0602] animate-bounce">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile Hamburger Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white hover:text-trattoria-gold"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed top-[70px] left-0 right-0 bg-[#0A0602]/98 border-b border-trattoria-gold/20 p-6 flex flex-col gap-4 font-sans text-sm tracking-widest uppercase z-40">
            {tableId && (
              <div className="flex items-center gap-2 text-trattoria-gold bg-trattoria-gold/10 p-3 rounded-lg border border-trattoria-gold/20">
                <QrCode className="w-4 h-4" />
                <span>Tavolo {tableId}</span>
              </div>
            )}

            <button 
              type="button"
              onClick={handleOpenPinModal}
              className="flex items-center gap-2 text-trattoria-gold font-bold p-3 bg-trattoria-gold/15 rounded-xl border border-trattoria-gold/30 text-left"
            >
              <span>👑</span>
              <span>Add / Manage Menu Items (PIN: 0909)</span>
            </button>

            <a href="/#home" onClick={() => setMobileMenuOpen(false)} className="text-white hover:text-trattoria-gold py-1">
              Home
            </a>
            <a href="/#menu" onClick={() => setMobileMenuOpen(false)} className="text-white hover:text-trattoria-gold py-1">
              Menu
            </a>
            <a href="/#about" onClick={() => setMobileMenuOpen(false)} className="text-white hover:text-trattoria-gold py-1">
              Our Story
            </a>
            <a href="/#contact" onClick={() => setMobileMenuOpen(false)} className="text-white hover:text-trattoria-gold py-1">
              Contact
            </a>

            <a 
              href="tel:7738009029" 
              className="flex items-center justify-center gap-2 bg-trattoria-red text-white py-3 rounded-xl font-bold mt-2"
            >
              <Phone className="w-4 h-4" />
              <span>Call: 7738009029</span>
            </a>
          </div>
        )}
      </nav>

      {/* Owner PIN Verification Modal */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#120B05] border border-trattoria-gold/30 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl relative text-white">
            <button 
              onClick={() => setIsPinModalOpen(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 bg-trattoria-red/20 border border-trattoria-red/40 rounded-2xl flex items-center justify-center mx-auto mb-4 text-trattoria-gold">
              <ShieldCheck className="w-7 h-7 text-amber-400" />
            </div>

            <span className="font-sans text-xs tracking-widest text-trattoria-gold font-bold uppercase block mb-1">
              👑 Owner Menu Access
            </span>
            <h3 className="font-serif text-2xl font-black text-white">Enter Owner PIN</h3>
            <p className="text-xs text-white/60 mt-1 mb-6 font-body">
              Enter 4-digit PIN to add & manage pizzas or view revenue (PIN: <strong>0909</strong>)
            </p>

            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type="password"
                  maxLength={4}
                  placeholder="••••"
                  value={pinInput}
                  onChange={(e) => { setPinInput(e.target.value); setPinError(false); }}
                  className="w-full text-center tracking-[0.8em] text-2xl py-3 px-4 rounded-xl bg-black/70 border border-white/20 text-white font-bold focus:border-trattoria-gold outline-none"
                  autoFocus
                />
                <KeyRound className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>

              {pinError && (
                <p className="text-xs text-red-400 font-sans font-bold animate-shake">
                  Incorrect PIN! Please enter <strong>0909</strong>.
                </p>
              )}

              <button 
                type="submit"
                className="w-full bg-trattoria-red hover:bg-trattoria-redHover text-white py-3.5 rounded-xl font-sans text-xs uppercase tracking-widest font-bold shadow-lg transition-all active:scale-98"
              >
                Unlock & Open Menu Manager
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
