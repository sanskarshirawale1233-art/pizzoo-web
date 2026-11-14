import React from 'react';

export const GallerySection = () => {
  const images = [
    { url: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=700', label: 'Artisan Crafting' },
    { url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=700', label: 'Fresh San Marzano Base' },
    { url: 'https://images.unsplash.com/photo-1604908177453-7462950a6a3b?w=700', label: 'Molten Cheese Pull' },
    { url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=700', label: 'Neapolitan Crust' },
    { url: 'https://images.unsplash.com/photo-1548369937-47519962c11a?w=700', label: 'Veg Supreme' }
  ];

  return (
    <section id="gallery" className="py-24 px-4 bg-[#0D0700]">
      <div className="max-w-6xl mx-auto text-center mb-12">
        <span className="font-sans text-xs tracking-[0.35em] text-trattoria-gold uppercase block mb-2">
          OUR KITCHEN
        </span>
        <h2 className="font-serif text-4xl font-black text-white">
          Fresh From The Stone Oven
        </h2>
        <div className="w-16 h-1 bg-trattoria-gold mx-auto mt-4 rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((img, idx) => (
          <div key={idx} className="relative h-64 rounded-2xl overflow-hidden group">
            <img 
              src={img.url} 
              alt={img.label} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-5">
              <span className="font-sans text-xs font-bold text-trattoria-gold uppercase tracking-wider">
                {img.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
