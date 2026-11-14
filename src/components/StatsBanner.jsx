import React from 'react';

export const StatsBanner = () => {
  const stats = [
    { num: '32+', label: 'Pizzas & Specialties' },
    { num: '100%', label: 'Italian 00 Flour' },
    { num: '3', label: 'Sizes (Small, Medium, Large)' },
    { num: '⭐ 4.9', label: 'Customer Rating' }
  ];

  return (
    <div className="bg-gradient-to-r from-trattoria-red via-red-900 to-trattoria-red py-6 px-4 border-y border-trattoria-gold/30">
      <div className="max-w-6xl mx-auto flex flex-wrap justify-around items-center gap-6 text-center">
        {stats.map((s, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <span className="font-serif text-3xl md:text-4xl font-black text-white">{s.num}</span>
            <span className="font-sans text-[10px] tracking-[0.25em] text-trattoria-gold uppercase mt-1">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
