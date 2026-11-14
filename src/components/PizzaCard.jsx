import React, { useState } from 'react';
import { Plus, Sparkles, XCircle, Maximize2 } from 'lucide-react';
import { FullImageLightboxModal } from './FullImageLightboxModal';

export const PizzaCard = ({ pizza, onCustomize }) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const isAvailable = pizza.isAvailable !== false;

  return (
    <>
      <div 
        onClick={() => isAvailable && onCustomize(pizza)}
        className={`bg-white/[0.03] border rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between h-full group relative ${
          isAvailable 
            ? 'border-white/10 hover:-translate-y-2 hover:border-trattoria-gold/50 hover:shadow-trattoria cursor-pointer' 
            : 'border-amber-500/30 opacity-60 cursor-not-allowed'
        }`}
      >
        <div className="flex flex-col flex-1">
          {/* Image & Badges */}
          <div className="relative w-full aspect-[16/10] overflow-hidden bg-black/80">
            <img 
              src={pizza.img} 
              alt={pizza.name} 
              className={`w-full h-full object-cover transition-transform duration-500 ${isAvailable ? 'group-hover:scale-110' : 'grayscale'}`} 
              loading="lazy"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1548365328-8c6db3220e4c?w=600';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0602] via-transparent to-transparent opacity-80" />

            {/* Click Photo to Zoom Overlay Icon */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsLightboxOpen(true);
              }}
              className="absolute bottom-3 right-3 bg-black/70 hover:bg-trattoria-gold hover:text-trattoria-wood text-white p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all z-10 shadow-lg"
              title="View Full Uncropped Photo"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Veg / Non-Veg Badge */}
            <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-md font-sans text-[10px] tracking-wider uppercase font-bold text-white shadow-md ${
              pizza.isVeg ? 'bg-emerald-600' : 'bg-red-600'
            }`}>
              {pizza.isVeg ? '● VEG' : '● NON-VEG'}
            </span>

            {/* Special Tag Badges */}
            {pizza.tags && pizza.tags.length > 0 && isAvailable && (
              <span className="absolute top-3 right-3 bg-trattoria-gold/90 text-trattoria-wood px-2.5 py-1 rounded-md font-sans text-[9px] font-black tracking-wider uppercase flex items-center gap-1 shadow-md">
                <Sparkles className="w-3 h-3" />
                {pizza.tags[0]}
              </span>
            )}

            {/* Sold Out Banner Overlay */}
            {!isAvailable && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-2 text-center">
                <span className="bg-amber-500 text-stone-950 font-sans font-black text-xs px-3 py-1.5 rounded-xl uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                  <XCircle className="w-4 h-4" />
                  <span>ESAURITO (Sold Out)</span>
                </span>
              </div>
            )}
          </div>

          {/* Card Body */}
          <div className="p-5 flex-1 flex flex-col">
            <h3 className="font-serif text-xl font-bold text-white group-hover:text-trattoria-gold transition-colors">
              {pizza.name}
            </h3>
            <span className="block font-sans text-[11px] text-trattoria-gold/80 italic mb-2">
              {pizza.italianTitle}
            </span>
            <p className="text-xs text-white/55 font-body line-clamp-2 leading-relaxed mb-4">
              {pizza.desc}
            </p>

            {/* Key ingredients chips */}
            <div className="flex flex-wrap gap-1.5 mb-2 mt-auto">
              {pizza.ingredients?.slice(0, 3).map((ing, i) => (
                <span key={i} className="text-[10px] font-sans bg-white/5 text-white/70 px-2 py-0.5 rounded border border-white/10">
                  {ing}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="p-5 pt-3 border-t border-white/5 flex items-center justify-between mt-auto">
          <div>
            <span className="text-[10px] font-sans text-trattoria-gold uppercase tracking-wider block">From</span>
            <span className="font-serif text-2xl font-bold text-trattoria-gold">
              ₹{pizza.reg}
            </span>
          </div>

          <button 
            disabled={!isAvailable}
            onClick={(e) => {
              e.stopPropagation();
              if (isAvailable) onCustomize(pizza);
            }}
            className={`px-4 py-2.5 rounded-lg font-sans text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 transition-all shadow-red-glow ${
              isAvailable 
                ? 'bg-trattoria-red hover:bg-trattoria-redHover text-white hover:scale-105' 
                : 'bg-stone-800 text-stone-500 cursor-not-allowed shadow-none'
            }`}
          >
            {isAvailable ? (
              <>
                <Plus className="w-4 h-4" />
                <span>+ View & Order</span>
              </>
            ) : (
              <span>Sold Out</span>
            )}
          </button>
        </div>
      </div>

      {/* Full Image Lightbox Modal */}
      {isLightboxOpen && (
        <FullImageLightboxModal
          pizza={pizza}
          onClose={() => setIsLightboxOpen(false)}
          onCustomize={onCustomize}
        />
      )}
    </>
  );
};
