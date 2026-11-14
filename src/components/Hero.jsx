import React from 'react';
import { Phone, ChevronDown, Flame, Utensils, QrCode } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const Hero = () => {
  const { tableId } = useCart();

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background Image & Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center scale-105 transform transition-transform duration-10000" 
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1600')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0D0700] via-[#0D0700]/80 to-[#0D0700]/60" />

      {/* Dynamic Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center px-4 py-16">
        {/* Dine-In Table Banner */}
        {tableId ? (
          <div className="inline-flex items-center gap-2 bg-trattoria-red/30 border border-trattoria-red/60 text-trattoria-gold px-5 py-2 rounded-full font-sans text-xs tracking-widest uppercase mb-6 shadow-red-glow animate-pulse">
            <QrCode className="w-4 h-4" />
            <span>Welcome to Table {tableId} · Direct Kitchen Ordering</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 bg-trattoria-gold/15 border border-trattoria-gold/40 text-trattoria-gold px-5 py-2 rounded-full font-sans text-xs tracking-widest uppercase mb-6">
            <Flame className="w-4 h-4 text-trattoria-red animate-bounce" />
            <span>Handcrafted · 00 Wheat Flour · 100% Fresh Mozzarella</span>
          </div>
        )}

        {/* Brand Logo */}
        <div className="flex justify-center mb-6">
          <img 
            src="/logo.png" 
            alt="Pizzoo Trattoria" 
            className="h-32 md:h-44 object-contain filter drop-shadow-[0_0_40px_rgba(240,165,0,0.6)]"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>

        {/* Main Title */}
        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-black leading-tight mb-6">
          The Art of <span className="text-trattoria-gold">Italian Pizza</span> <br className="hidden sm:inline" />in Mumbai
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-white/75 font-body max-w-2xl mx-auto leading-relaxed mb-8">
          Authentic Neapolitan & Italian pizzas crafted with 00 high-protein wheat flour, San Marzano tomato base, and 100% pure mozzarella. Baked to perfection in stone ovens.
        </p>

        {/* Call to Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center items-center font-sans text-xs tracking-widest uppercase font-bold">
          <a 
            href="#menu" 
            className="bg-trattoria-red hover:bg-trattoria-redHover text-white px-8 py-4 rounded-md shadow-red-glow hover:-translate-y-1 transition-all flex items-center gap-2"
          >
            <Utensils className="w-4 h-4" />
            <span>Explore Menu</span>
          </a>

          <a 
            href="tel:7738009029" 
            className="border-2 border-white/40 hover:border-trattoria-gold text-white hover:text-trattoria-gold px-8 py-4 rounded-md hover:-translate-y-1 transition-all flex items-center gap-2"
          >
            <Phone className="w-4 h-4" />
            <span>Call to Order (7738009029)</span>
          </a>
        </div>
      </div>

      {/* Scroll hint */}
      <a href="#menu" className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-trattoria-gold/70 hover:text-trattoria-gold transition-colors animate-bounce">
        <span className="block font-sans text-[10px] tracking-widest uppercase mb-1">Scroll Down</span>
        <ChevronDown className="w-5 h-5 mx-auto" />
      </a>
    </section>
  );
};
