import React from 'react';
import { X, Maximize2, Sparkles, Plus } from 'lucide-react';

export const FullImageLightboxModal = ({ pizza, onClose, onCustomize }) => {
  if (!pizza) return null;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[3000] bg-black/95 backdrop-blur-lg flex flex-col items-center justify-center p-4 md:p-8 animate-fadeIn select-none overflow-y-auto"
    >
      {/* Lightbox Container */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl w-full bg-[#140C06] border border-trattoria-gold/40 rounded-3xl overflow-hidden shadow-2xl my-auto text-white flex flex-col max-h-[90vh]"
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-white/10 bg-black/60">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded font-sans text-[10px] font-bold uppercase tracking-wider ${
              pizza.isVeg ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' : 'bg-red-950 text-red-300 border border-red-500/30'
            }`}>
              {pizza.isVeg ? '● VEG' : '● NON-VEG'}
            </span>
            <h3 className="font-serif text-lg font-bold text-white truncate max-w-xs sm:max-w-md">
              {pizza.name}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-trattoria-red text-white transition-all"
            title="Close Full Photo"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Full Image View - Uncropped Full View */}
        <div className="relative flex-1 bg-black/90 p-4 flex items-center justify-center min-h-[300px] md:min-h-[450px] overflow-hidden">
          <img 
            src={pizza.img} 
            alt={pizza.name} 
            className="max-w-full max-h-[60vh] object-contain rounded-2xl filter drop-shadow-[0_0_20px_rgba(240,165,0,0.3)] transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1548365328-8c6db3220e4c?w=900';
            }}
          />

          <span className="absolute bottom-4 right-4 bg-black/70 border border-white/20 text-white/80 text-[10px] font-sans px-3 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-md">
            <Maximize2 className="w-3.5 h-3.5 text-trattoria-gold" />
            <span>Full High-Res Photo View</span>
          </span>
        </div>

        {/* Bottom Details Footer */}
        <div className="p-6 bg-[#1A1008] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-serif text-2xl font-black text-trattoria-gold">
              {pizza.name}
            </h4>
            {pizza.italianTitle && (
              <span className="font-sans text-xs text-trattoria-gold/70 italic block mt-0.5">
                {pizza.italianTitle}
              </span>
            )}
            <p className="text-xs text-white/70 font-body max-w-xl mt-1 leading-relaxed">
              {pizza.desc}
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <span className="text-[10px] font-sans text-white/50 uppercase tracking-wider block">Starting From</span>
              <span className="font-serif text-3xl font-black text-trattoria-gold">
                ₹{pizza.reg || pizza.price}
              </span>
            </div>

            {onCustomize && (
              <button
                onClick={() => {
                  onClose();
                  onCustomize(pizza);
                }}
                className="bg-trattoria-red hover:bg-trattoria-redHover text-white px-6 py-3 rounded-xl font-sans text-xs uppercase tracking-widest font-bold shadow-red-glow flex items-center gap-2 transition-all transform hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                <span>Customize & Order</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
