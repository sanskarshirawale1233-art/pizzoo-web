import React from 'react';
import { Wheat, Flame, Leaf } from 'lucide-react';

export const AboutSection = () => {
  return (
    <section id="about" className="py-24 px-4 bg-[#1A0E00] relative">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Image with Floating Badge */}
        <div className="relative">
          <img 
            src="https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=800" 
            alt="Handcrafting Italian Pizza" 
            className="w-full h-[460px] object-cover rounded-3xl shadow-2xl border border-trattoria-gold/20"
          />
          <div className="absolute -bottom-6 -right-6 bg-trattoria-red text-white p-6 rounded-2xl shadow-red-glow text-center border border-trattoria-gold/40">
            <span className="font-serif text-3xl font-black block">100%</span>
            <span className="font-sans text-[10px] tracking-widest uppercase opacity-90 block mt-1">
              Fresh Handmade <br />Sourdough Dough
            </span>
          </div>
        </div>

        {/* Right Content */}
        <div className="space-y-6">
          <span className="font-sans text-xs tracking-[0.35em] text-trattoria-gold uppercase block">
            OUR STORY
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl font-black text-white leading-tight">
            The Art of Authentic Italian Pizza
          </h2>
          <p className="text-sm text-white/70 font-body leading-relaxed">
            At Pizzoo Pizzeria, we believe great pizza begins with great dough. We exclusively use certified 00 high-protein wheat flour — the benchmark of traditional Neapolitan pizza craftsmanship — creating a crust that is crispy on the exterior, airy and pillowy inside, and full of natural flavor.
          </p>
          <p className="text-sm text-white/70 font-body leading-relaxed">
            Located in Bhandup West, Mumbai, we blend Italian baking techniques with fresh local ingredients to deliver an uncompromised pizzeria dining experience.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-trattoria-gold/10 border border-trattoria-gold/30 text-trattoria-gold">
                <Wheat className="w-5 h-5" />
              </div>
              <span className="text-xs text-white/80 font-body leading-relaxed">
                <strong>Italian Tipo 00 Flour:</strong> High-protein flour from certified mills for perfect gluten development and chewy texture.
              </span>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-trattoria-gold/10 border border-trattoria-gold/30 text-trattoria-gold">
                <Flame className="w-5 h-5" />
              </div>
              <span className="text-xs text-white/80 font-body leading-relaxed">
                <strong>High-Temperature Baking:</strong> Hand-stretched dough baked in stone ovens for authentic leopard-spotted cornicione.
              </span>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-trattoria-gold/10 border border-trattoria-gold/30 text-trattoria-gold">
                <Leaf className="w-5 h-5" />
              </div>
              <span className="text-xs text-white/80 font-body leading-relaxed">
                <strong>Guaranteed Freshness:</strong> Zero frozen dough, zero preservatives. Prepared fresh every morning.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
