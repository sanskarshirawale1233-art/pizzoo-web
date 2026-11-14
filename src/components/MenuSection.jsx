import React, { useState } from 'react';
import { useMenu } from '../context/MenuContext';
import { EXTRAS_DATA } from '../data/menuData';
import { PizzaCard } from './PizzaCard';
import { ExtrasCard } from './ExtrasCard';

export const MenuSection = ({ onCustomizePizza }) => {
  const { vegPizzas, nonVegPizzas, antipasti, dolciAndBevande } = useMenu();
  const [activeTab, setActiveTab] = useState('veg');

  const tabs = [
    { id: 'veg', label: '🍕 Veg Pizzas' },
    { id: 'nonveg', label: '🍗 Non-Veg Pizzas' },
    { id: 'burgers', label: '🍔 Burgers & Combos' },
    { id: 'fries', label: '🍟 Loaded Fries & Sides' },
    { id: 'momos', label: '🥟 Handcrafted Momos' },
    { id: 'more', label: '🥖 Garlic Bread & Desserts' }
  ];

  // Map real database items
  const displayVegPizzas = vegPizzas.map(i => ({
    id: i.id,
    name: i.name,
    italianTitle: i.italian_title || 'Classic Veg Pizza',
    reg: i.price_reg, med: i.price_med, lrg: i.price_lrg,
    img: i.image_url || 'https://images.unsplash.com/photo-1548365328-8c6db3220e4c?w=600',
    desc: i.description,
    ingredients: i.ingredients || [],
    tags: i.tags || [],
    isVeg: Boolean(i.is_veg),
    isAvailable: Boolean(i.is_available)
  }));

  const displayNonVegPizzas = nonVegPizzas.map(i => ({
    id: i.id,
    name: i.name,
    italianTitle: i.italian_title || 'Non-Veg Delizia',
    reg: i.price_reg, med: i.price_med, lrg: i.price_lrg,
    img: i.image_url || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600',
    desc: i.description,
    ingredients: i.ingredients || [],
    tags: i.tags || [],
    isVeg: Boolean(i.is_veg),
    isAvailable: Boolean(i.is_available)
  }));

  return (
    <section id="menu" className="py-24 px-4 bg-[#0A0602] relative">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="font-sans text-xs tracking-[0.35em] text-trattoria-gold uppercase block mb-2">
            OUR ARTISANAL MENU
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-black text-white">
            What We Serve
          </h2>
          <div className="w-16 h-1 bg-trattoria-gold mx-auto mt-4 rounded-full" />


        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 rounded-full font-sans text-xs uppercase tracking-wider font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-trattoria-red text-white shadow-red-glow scale-105' 
                  : 'bg-white/5 border border-white/10 text-white/70 hover:border-trattoria-gold/40 hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab 1: Veg Pizzas */}
        {activeTab === 'veg' && (
          <div>
            {displayVegPizzas.length === 0 ? (
              <div className="text-center py-16 bg-white/[0.02] border border-white/10 rounded-3xl p-8">
                <p className="text-trattoria-gold font-serif text-xl font-bold">No Veg Pizzas added yet</p>
                <p className="text-white/50 text-xs mt-1">Use the Admin Panel to add your custom Veg Pizzas.</p>
                <a href="/admin/menu" className="mt-4 inline-block bg-trattoria-red text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase">
                  + Add New Pizza Now
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {displayVegPizzas.map((pizza) => (
                  <PizzaCard key={pizza.id} pizza={pizza} onCustomize={onCustomizePizza} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Non-Veg Pizzas */}
        {activeTab === 'nonveg' && (
          <div>
            {displayNonVegPizzas.length === 0 ? (
              <div className="text-center py-16 bg-white/[0.02] border border-white/10 rounded-3xl p-8">
                <p className="text-trattoria-gold font-serif text-xl font-bold">No Non-Veg Pizzas added yet</p>
                <p className="text-white/50 text-xs mt-1">Use the Admin Panel to add your custom Non-Veg Pizzas.</p>
                <a href="/admin/menu" className="mt-4 inline-block bg-trattoria-red text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase">
                  + Add New Pizza Now
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {displayNonVegPizzas.map((pizza) => (
                  <PizzaCard key={pizza.id} pizza={pizza} onCustomize={onCustomizePizza} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Burgers & Combos */}
        {activeTab === 'burgers' && (
          <div className="max-w-5xl mx-auto space-y-10">
            <div>
              <h3 className="font-serif text-2xl text-trattoria-gold font-bold mb-4 border-b border-trattoria-gold/20 pb-2">
                🥬 Veg Burgers
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {EXTRAS_DATA.vegBurgers.map((b) => (
                  <ExtrasCard key={b.id} item={b} />
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-serif text-2xl text-trattoria-gold font-bold mb-4 border-b border-trattoria-gold/20 pb-2">
                🍗 Chicken Burgers
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {EXTRAS_DATA.nonVegBurgers.map((b) => (
                  <ExtrasCard key={b.id} item={b} />
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-serif text-2xl text-trattoria-gold font-bold mb-4 border-b border-trattoria-gold/20 pb-2">
                🎉 Meal Combos
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {EXTRAS_DATA.combos.map((c) => (
                  <ExtrasCard key={c.id} item={c} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Fries */}
        {activeTab === 'fries' && (
          <div className="max-w-4xl mx-auto">
            <h3 className="font-serif text-2xl text-trattoria-gold font-bold mb-6 border-b border-trattoria-gold/20 pb-2">
              🍟 Loaded French Fries & Side Dishes
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {EXTRAS_DATA.fries.map((f) => (
                <ExtrasCard key={f.id} item={f} />
              ))}
              {antipasti.map((item) => (
                <ExtrasCard 
                  key={item.id} 
                  item={{
                    id: item.id,
                    name: item.name,
                    price: item.price_reg,
                    sub: item.description,
                    isVeg: Boolean(item.is_veg),
                    isAvailable: Boolean(item.is_available)
                  }} 
                />
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Momos Table */}
        {activeTab === 'momos' && (
          <div className="max-w-3xl mx-auto bg-white/[0.03] border border-trattoria-gold/20 rounded-2xl overflow-hidden p-6">
            <h3 className="font-serif text-2xl text-trattoria-gold font-bold mb-4 border-b border-trattoria-gold/20 pb-2 text-center">
              🥟 Handcrafted Momos & Dumplings
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs">
                <thead>
                  <tr className="border-b border-trattoria-gold/30 text-trattoria-gold uppercase tracking-wider">
                    <th className="py-3 px-4">Variety</th>
                    <th className="py-3 px-4 text-center">Steamed</th>
                    <th className="py-3 px-4 text-center">Fried</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80">
                  {EXTRAS_DATA.momos.map((m) => (
                    <tr key={m.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4 font-bold text-sm text-white">{m.name}</td>
                      <td className="py-4 px-4 text-center">
                        <ExtrasCard item={{ id: `${m.id}-steam`, name: `${m.name} (Steamed)`, price: m.steam, isVeg: m.isVeg }} />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <ExtrasCard item={{ id: `${m.id}-fried`, name: `${m.name} (Fried)`, price: m.fried, isVeg: m.isVeg }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 6: Garlic Bread & Desserts */}
        {activeTab === 'more' && (
          <div className="max-w-5xl mx-auto space-y-10">
            <div>
              <h3 className="font-serif text-2xl text-trattoria-gold font-bold mb-4 border-b border-trattoria-gold/20 pb-2">
                🥖 Garlic Bread
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {EXTRAS_DATA.garlicBread.map((gb) => (
                  <ExtrasCard key={gb.id} item={gb} />
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-serif text-2xl text-trattoria-gold font-bold mb-4 border-b border-trattoria-gold/20 pb-2">
                🇮🇹 Desserts & Beverages
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {dolciAndBevande.length > 0 ? dolciAndBevande.map((d) => (
                  <ExtrasCard 
                    key={d.id} 
                    item={{
                      id: d.id,
                      name: d.name,
                      price: d.price_reg,
                      sub: d.description,
                      isVeg: Boolean(d.is_veg),
                      isAvailable: Boolean(d.is_available)
                    }} 
                  />
                )) : (
                  EXTRAS_DATA.nuggets.map((n) => (
                    <ExtrasCard key={n.id} item={n} />
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
