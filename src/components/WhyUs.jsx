import React from 'react';
import { Wheat, Flame, ShieldCheck, Truck } from 'lucide-react';

export const WhyUs = () => {
  const pillars = [
    {
      icon: Wheat,
      title: '00 Flour Dough Base',
      desc: 'Our pizza dough is naturally fermented daily and hand-stretched using certified 00 high-protein wheat flour for a light, crispy, and chewy crust.'
    },
    {
      icon: Flame,
      title: 'High-Heat Baking',
      desc: 'Baked at high temperatures for that authentic leopard-spotted cornicione (crust edge) and rich stone-baked flavor.'
    },
    {
      icon: ShieldCheck,
      title: '100% Fresh Ingredients',
      desc: 'San Marzano-style tomatoes, 100% pure Fior di Latte mozzarella, and fresh basil sourced daily. Zero artificial shortcuts.'
    },
    {
      icon: Truck,
      title: 'Table & Takeout Service',
      desc: 'Scan your QR code at the table for instant direct kitchen ordering, or use Call-to-Order for quick takeaway.'
    }
  ];

  return (
    <section id="why" className="py-24 px-4 bg-[#1A0E00] relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="font-sans text-xs tracking-[0.35em] text-trattoria-gold uppercase block mb-2">
            Why Choose Pizzoo
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-black text-white">
            The Artisanal Difference
          </h2>
          <div className="w-16 h-1 bg-trattoria-gold mx-auto mt-4 rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map((p, idx) => {
            const IconComp = p.icon;
            return (
              <div 
                key={idx} 
                className="bg-white/[0.03] border border-trattoria-gold/15 p-8 rounded-2xl text-center hover:-translate-y-2 hover:border-trattoria-gold/50 hover:shadow-trattoria transition-all duration-300 group"
              >
                <div className="w-16 h-16 rounded-2xl bg-trattoria-gold/10 border border-trattoria-gold/30 flex items-center justify-center mx-auto mb-6 text-trattoria-gold group-hover:bg-trattoria-red group-hover:text-white group-hover:border-trattoria-red transition-all">
                  <IconComp className="w-8 h-8" />
                </div>
                <h3 className="font-sans text-lg tracking-wider text-trattoria-gold uppercase mb-3 font-semibold">
                  {p.title}
                </h3>
                <p className="text-sm text-white/60 leading-relaxed font-body">
                  {p.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
