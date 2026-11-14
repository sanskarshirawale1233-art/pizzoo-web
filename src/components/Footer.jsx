import React from 'react';

export const Footer = () => {
  return (
    <footer className="bg-[#0A0500] border-t border-trattoria-gold/20 pt-16 pb-8 px-4 font-sans">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
        <div>
          <img src="/logo.png" alt="Pizzoo" className="h-14 mb-4 filter drop-shadow-[0_0_12px_rgba(240,165,0,0.4)]" onError={(e) => { e.target.style.display = 'none'; }} />
          <h4 className="font-serif text-xl font-bold text-white mb-2">Pizzoo Italian Pizzeria</h4>
          <p className="text-xs text-white/50 leading-relaxed font-body">
            "We use exclusively 00 high-protein flour and premium Fior di Latte mozzarella. Zero compromises on quality."
          </p>
        </div>

        <div>
          <h5 className="text-xs font-bold tracking-widest text-trattoria-gold uppercase mb-4">NAVIGATION</h5>
          <ul className="space-y-2 text-xs text-white/60">
            <li><a href="#home" className="hover:text-trattoria-gold transition-colors">Home</a></li>
            <li><a href="#menu" className="hover:text-trattoria-gold transition-colors">Our Menu</a></li>
            <li><a href="#about" className="hover:text-trattoria-gold transition-colors">Our Story</a></li>
            <li><a href="#contact" className="hover:text-trattoria-gold transition-colors">Contact & Location</a></li>
          </ul>
        </div>

        <div>
          <h5 className="text-xs font-bold tracking-widest text-trattoria-gold uppercase mb-4">ORDERS & SUPPORT</h5>
          <ul className="space-y-2 text-xs text-white/60">
            <li><a href="tel:7738009029" className="hover:text-trattoria-gold transition-colors">Call to Order: 7738009029</a></li>
            <li><a href="https://wa.me/917738009029" target="_blank" rel="noreferrer" className="hover:text-trattoria-gold transition-colors">Order via WhatsApp</a></li>
            <li><span className="text-white/40">Home Delivery: Bhandup West, Mumbai</span></li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto border-t border-white/10 pt-6 flex flex-wrap justify-between items-center text-[11px] text-white/40">
        <div>© 2026 Pizzoo Italian Pizzeria · All Rights Reserved</div>
        <div>Made with ❤️ for Authentic Italian Pizza Lovers</div>
      </div>
    </footer>
  );
};
