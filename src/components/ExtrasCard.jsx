import React from 'react';
import { Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const ExtrasCard = ({ item }) => {
  const { addToCart } = useCart();

  const handleAdd = () => {
    addToCart({
      id: item.id || item.name,
      name: item.name,
      price: item.price,
      quantity: 1,
      isVeg: item.isVeg
    });
  };

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 flex items-center justify-between hover:border-trattoria-gold/40 hover:bg-white/[0.06] transition-all group">
      <div>
        <div className="flex items-center gap-2">
          <span className="font-sans text-sm font-semibold text-white group-hover:text-trattoria-gold transition-colors">
            {item.name}
          </span>
          {item.isVeg !== undefined && (
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-sans font-bold text-white ${item.isVeg ? 'bg-emerald-600' : 'bg-red-600'}`}>
              {item.isVeg ? 'VEG' : 'NON-VEG'}
            </span>
          )}
        </div>
        {item.sub && (
          <span className="block text-xs font-body text-white/50 mt-0.5">{item.sub}</span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className="font-serif text-lg font-bold text-trattoria-gold">
          ₹{item.price}
        </span>
        <button 
          onClick={handleAdd}
          className="bg-trattoria-red hover:bg-trattoria-redHover text-white p-2 rounded-lg font-sans text-xs uppercase tracking-wider font-bold transition-all hover:scale-105 shadow-sm"
          title="Aggiungi al Carrello"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
