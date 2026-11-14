import React from 'react';
import { ShoppingBag, ArrowRight, CheckCircle2, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const FloatingCartBar = () => {
  const {
    cart,
    subtotal,
    isCartOpen,
    setIsCartOpen,
    toastNotification,
    setToastNotification
  } = useCart();

  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      {/* Toast Alert Notification Popup when an item is added */}
      {toastNotification && (
        <div className="fixed top-20 right-4 z-[3000] bg-[#1F1206] border border-trattoria-gold/50 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center justify-between gap-3 animate-slideInDown max-w-sm">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-sans text-xs font-bold text-trattoria-gold block">Item Added to Basket</span>
              <span className="font-sans text-[11px] text-white/80">{toastNotification}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setToastNotification(null);
                setIsCartOpen(true);
              }}
              className="bg-trattoria-gold text-trattoria-wood px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-amber-300 transition-colors"
            >
              Basket
            </button>
            <button
              onClick={() => setToastNotification(null)}
              className="text-white/40 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Bottom Cart Bar when items exist and cart drawer is closed */}
      {cart.length > 0 && !isCartOpen && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0 z-[1200] animate-bounce-short">
          <button
            onClick={() => setIsCartOpen(true)}
            className="bg-trattoria-red hover:bg-trattoria-redHover text-white px-6 py-4 rounded-full shadow-red-glow flex items-center gap-4 transition-all hover:scale-105 border border-trattoria-gold/40"
          >
            <div className="relative">
              <ShoppingBag className="w-6 h-6 text-amber-300" />
              <span className="absolute -top-2 -right-2 bg-trattoria-gold text-trattoria-wood font-mono text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border border-black shadow">
                {totalItemsCount}
              </span>
            </div>

            <div className="text-left font-sans">
              <span className="block text-xs font-bold uppercase tracking-wider text-amber-200">
                View Basket ({totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'})
              </span>
              <span className="block font-serif text-sm font-black text-white">
                Total: ₹{subtotal}
              </span>
            </div>

            <ArrowRight className="w-5 h-5 text-amber-300 animate-pulse ml-2" />
          </button>
        </div>
      )}
    </>
  );
};
