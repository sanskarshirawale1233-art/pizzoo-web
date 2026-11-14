import React, { useState, useEffect } from 'react';
import { X, Plus, Check, Maximize2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { FullImageLightboxModal } from './FullImageLightboxModal';

export const PizzaCustomizerModal = ({ pizza, onClose }) => {
  const { addToCart } = useCart();

  const [selectedSize, setSelectedSize] = useState('reg');
  const [selectedCrust, setSelectedCrust] = useState('Neapolitan Thin (00 Flour)');
  const [sauceLevel, setSauceLevel] = useState('Normal Sauce');
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [specialNotes, setSpecialNotes] = useState('');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    if (pizza) {
      setSelectedSize('reg');
      setSelectedCrust('Neapolitan Thin (00 Flour)');
      setSauceLevel('Normal Sauce');
      setSelectedToppings([]);
      setSpecialNotes('');
      setIsLightboxOpen(false);
    }
  }, [pizza]);

  if (!pizza) return null;

  const sizeOptions = [
    { key: 'reg', label: 'Small (8" Regular)', price: pizza.reg },
    { key: 'med', label: 'Medium (10" Medium)', price: pizza.med },
    { key: 'lrg', label: 'Large (12" Large)', price: pizza.lrg }
  ];

  const crustOptions = [
    { label: 'Neapolitan Thin (00 Flour)', price: 0 },
    { label: 'Stuffed Cheese Crust', price: 60 },
    { label: 'Gluten-Free Crust', price: 80 }
  ];

  const sauceOptions = ['Normal Sauce', 'Extra Sauce (+₹20)', 'Light Sauce'];

  const toppingOptions = pizza.isVeg ? [
    { name: 'Extra Mozzarella Cheese', price: 40 },
    { name: 'Sliced Jalapeños', price: 30 },
    { name: 'Wild Roasted Mushrooms', price: 35 },
    { name: 'Black Olives', price: 30 },
    { name: 'Tender Paneer Chunks', price: 45 },
    { name: 'Sweet Golden Corn', price: 25 }
  ] : [
    { name: 'Extra Mozzarella Cheese', price: 40 },
    { name: 'Grilled Chicken Chunks', price: 50 },
    { name: 'Chicken Salami Rounds', price: 45 },
    { name: 'Sliced Jalapeños', price: 30 },
    { name: 'Wild Roasted Mushrooms', price: 35 },
    { name: 'Black Olives', price: 30 }
  ];

  const toggleTopping = (topping) => {
    if (selectedToppings.some(t => t.name === topping.name)) {
      setSelectedToppings(selectedToppings.filter(t => t.name !== topping.name));
    } else {
      setSelectedToppings([...selectedToppings, topping]);
    }
  };

  const basePrice = sizeOptions.find(s => s.key === selectedSize)?.price || pizza.reg;
  const crustPrice = crustOptions.find(c => c.label === selectedCrust)?.price || 0;
  const saucePrice = sauceLevel.includes('+₹20') ? 20 : 0;
  const toppingsPrice = selectedToppings.reduce((sum, t) => sum + t.price, 0);

  const totalPrice = basePrice + crustPrice + saucePrice + toppingsPrice;

  const handleAddToCart = () => {
    const sizeObj = sizeOptions.find(s => s.key === selectedSize);
    addToCart({
      id: pizza.id,
      name: pizza.name,
      price: totalPrice,
      size: sizeObj?.label || 'Small (8" Regular)',
      crust: selectedCrust,
      sauceLevel,
      toppings: selectedToppings.map(t => t.name),
      notes: specialNotes,
      quantity: 1,
      isVeg: pizza.isVeg
    });
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-[2000] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
        <div className="bg-[#1A1008] border border-trattoria-gold/30 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl text-white my-auto">
          
          {/* Header Image with Full Photo View Trigger */}
          <div 
            onClick={() => setIsLightboxOpen(true)}
            className="relative h-72 md:h-80 overflow-hidden rounded-t-3xl bg-black/90 cursor-pointer group"
          >
            <img 
              src={pizza.img} 
              alt={pizza.name} 
              className="w-full h-full object-contain md:object-cover group-hover:scale-105 transition-transform duration-500" 
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1548365328-8c6db3220e4c?w=800';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1008] via-transparent to-transparent opacity-80" />

            {/* Click to View Full Photo Badge */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsLightboxOpen(true);
              }}
              className="absolute bottom-4 right-4 bg-trattoria-gold text-trattoria-wood px-4 py-2 rounded-xl text-xs font-black font-sans uppercase tracking-wider flex items-center gap-1.5 shadow-lg group-hover:scale-110 transition-all z-10"
            >
              <Maximize2 className="w-4 h-4" />
              <span>🔍 View Full Photo</span>
            </button>

            <button 
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="absolute top-4 right-4 bg-black/70 hover:bg-trattoria-red text-white p-2.5 rounded-full backdrop-blur-sm transition-all z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="absolute bottom-4 left-6 z-10">
              <span className={`px-2.5 py-0.5 rounded font-sans text-[10px] font-bold uppercase tracking-wider ${
                pizza.isVeg ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' : 'bg-red-950 text-red-300 border border-red-500/30'
              }`}>
                {pizza.isVeg ? '● PURE VEG' : '● NON-VEG'}
              </span>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-6">
            <div>
              <h2 className="font-serif text-3xl font-black text-white">{pizza.name}</h2>
              <span className="font-sans text-xs text-trattoria-gold/80 italic block mt-0.5">{pizza.italianTitle}</span>
              <p className="text-xs text-white/60 font-body mt-2 leading-relaxed">{pizza.desc}</p>
            </div>

            {/* 1. Choose Size */}
            <div>
              <label className="font-sans text-xs font-bold text-trattoria-gold uppercase tracking-wider block mb-3">
                1. Choose Size
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {sizeOptions.map((option) => {
                  const isSelected = selectedSize === option.key;
                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setSelectedSize(option.key)}
                      className={`p-3 rounded-2xl border text-left font-sans transition-all ${
                        isSelected
                          ? 'bg-trattoria-gold/15 border-trattoria-gold text-white shadow-md'
                          : 'bg-white/5 border-white/10 text-white/70 hover:border-white/30'
                      }`}
                    >
                      <span className="text-xs font-bold block">{option.label}</span>
                      <span className="text-sm font-black font-serif text-trattoria-gold mt-1 block">
                        ₹{option.price}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Crust Type */}
            <div>
              <label className="font-sans text-xs font-bold text-trattoria-gold uppercase tracking-wider block mb-3">
                2. Crust Type
              </label>
              <div className="space-y-2">
                {crustOptions.map((option) => {
                  const isSelected = selectedCrust === option.label;
                  return (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => setSelectedCrust(option.label)}
                      className={`w-full p-3 rounded-xl border flex items-center justify-between font-sans text-xs transition-all ${
                        isSelected
                          ? 'bg-trattoria-gold/15 border-trattoria-gold text-white font-bold'
                          : 'bg-white/5 border-white/10 text-white/70 hover:border-white/30'
                      }`}
                    >
                      <span>{option.label}</span>
                      <span className="text-trattoria-gold font-mono font-bold">
                        {option.price > 0 ? `+₹${option.price}` : 'Included'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Sauce Intensity */}
            <div>
              <label className="font-sans text-xs font-bold text-trattoria-gold uppercase tracking-wider block mb-3">
                3. Sauce Level
              </label>
              <div className="flex flex-wrap gap-2">
                {sauceOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSauceLevel(option)}
                    className={`px-4 py-2 rounded-full font-sans text-xs transition-all ${
                      sauceLevel === option
                        ? 'bg-trattoria-red text-white font-bold shadow-red-glow'
                        : 'bg-white/5 border border-white/10 text-white/70 hover:border-white/30'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Extra Toppings */}
            <div>
              <label className="font-sans text-xs font-bold text-trattoria-gold uppercase tracking-wider block mb-3">
                4. Extra Toppings (Optional)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {toppingOptions.map((topping) => {
                  const isSelected = selectedToppings.some(t => t.name === topping.name);
                  return (
                    <button
                      key={topping.name}
                      type="button"
                      onClick={() => toggleTopping(topping)}
                      className={`p-3 rounded-xl border flex items-center justify-between font-sans text-xs transition-all ${
                        isSelected
                          ? 'bg-emerald-950/60 border-emerald-500 text-white font-bold'
                          : 'bg-white/5 border-white/10 text-white/70 hover:border-white/30'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                          isSelected ? 'bg-emerald-500 border-emerald-400 text-white' : 'border-white/30'
                        }`}>
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                        <span>{topping.name}</span>
                      </div>
                      <span className="text-trattoria-gold font-mono font-bold">+₹{topping.price}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Special Kitchen Notes */}
            <div>
              <label className="font-sans text-xs font-bold text-trattoria-gold uppercase tracking-wider block mb-2">
                5. Special Instructions for Kitchen
              </label>
              <input
                type="text"
                placeholder="e.g., Well done crust, less cheese, cut into 8 slices..."
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/40 focus:border-trattoria-gold outline-none"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="sticky bottom-0 bg-[#140C06] border-t border-white/10 p-6 flex items-center justify-between gap-4 rounded-b-3xl">
            <div>
              <span className="text-[10px] font-sans text-white/50 uppercase tracking-wider block">Total Price</span>
              <span className="font-serif text-3xl font-black text-trattoria-gold">
                ₹{totalPrice}
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              className="bg-trattoria-red hover:bg-trattoria-redHover text-white px-8 py-3.5 rounded-xl font-sans text-xs uppercase tracking-widest font-bold shadow-red-glow flex items-center gap-2 transition-all transform hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Add To Basket (₹{totalPrice})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Full Image Lightbox Modal */}
      {isLightboxOpen && (
        <FullImageLightboxModal 
          pizza={pizza} 
          onClose={() => setIsLightboxOpen(false)} 
          onCustomize={() => setIsLightboxOpen(false)}
        />
      )}
    </>
  );
};
