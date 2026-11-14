import React from 'react';
import { ChefHat, Volume2, VolumeX, PlusCircle, ArrowLeft, Filter, AlertCircle, ShieldCheck } from 'lucide-react';
import { useKds } from '../context/KdsContext';
import { KdsCard } from '../components/KdsCard';

export const KdsApp = ({ onExitKds, isEmbedded = false }) => {
  const { 
    orders, 
    rawOrdersCount, 
    filter, 
    setFilter, 
    soundEnabled, 
    setSoundEnabled, 
    addOrder,
    confirmCounterPayment,
    loading
  } = useKds();

  const pendingPaymentOrders = orders.filter(o => !o.isPaid);

  const handleSimulateTestOrder = () => {
    addOrder({
      tableNo: 'COUNTER',
      type: 'COUNTER',
      customerName: 'Test Customer',
      phone: '+91 9876543210',
      notes: 'Extra crispy base, well done cheese',
      totalAmount: 494,
      items: [
        { name: 'Classic Margherita', size: 'Small (8" Regular)', crust: 'Neapolitan Thin (00 Flour)', sauceLevel: 'Normal Sauce', toppings: ['Extra Mozzarella Cheese'], quantity: 1, price: 175 },
        { name: 'Caramelized Onion Pizza', size: 'Medium (10" Medium)', crust: 'Neapolitan Thin (00 Flour)', sauceLevel: 'Normal Sauce', toppings: [], quantity: 1, price: 319 }
      ]
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header (if standalone) */}
      {!isEmbedded && (
        <header className="border-b border-stone-200 pb-6 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={onExitKds}
              className="p-2.5 bg-stone-100 hover:bg-stone-200 rounded-xl text-stone-700 transition-colors"
              title="Return to Customer Menu"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <ChefHat className="w-7 h-7 text-trattoria-red" />
                <h1 className="font-serif text-3xl font-black text-stone-900">Pizzoo Kitchen KDS</h1>
              </div>
              <p className="text-xs text-stone-500 tracking-wider uppercase font-semibold">
                Kitchen Display System · Real-Time Order & Payment Confirmation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                soundEnabled 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                  : 'bg-stone-100 border-stone-200 text-stone-500'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4" />}
              <span>{soundEnabled ? 'Sound On' : 'Muted'}</span>
            </button>

            <button
              onClick={handleSimulateTestOrder}
              className="bg-trattoria-red hover:bg-trattoria-redHover text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Simulate Order 🍕</span>
            </button>
          </div>
        </header>
      )}

      {/* REAL-TIME COUNTER PAYMENT NOTIFICATION ALERT BANNER */}
      {pendingPaymentOrders.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 border border-amber-400 text-white p-4 rounded-3xl shadow-lg animate-pulse flex flex-wrap items-center justify-between gap-3 font-sans">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-black/20 flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6 text-amber-100" />
            </div>
            <div>
              <span className="font-black text-sm uppercase tracking-wider block">
                🔔 {pendingPaymentOrders.length} New Order(s) Awaiting Counter Payment Confirmation!
              </span>
              <p className="text-xs text-amber-100/90 font-medium">
                Customer(s) submitted order & are paying at counter. Click below to verify payment & start baking!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {pendingPaymentOrders.slice(0, 2).map((po) => (
              <button
                key={po.id}
                onClick={() => confirmCounterPayment(po.id)}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all border border-emerald-400"
              >
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                <span>Confirm #{po.id} (₹{po.totalAmount})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs & Timer Legend */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto">
          <Filter className="w-4 h-4 text-trattoria-red ml-1" />
          <span className="text-xs text-stone-500 uppercase tracking-wider font-bold mr-1">Filter:</span>
          
          <button
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2 rounded-xl text-xs uppercase font-bold tracking-wider transition-all ${
              filter === 'ALL' 
                ? 'bg-stone-900 text-white font-black shadow-sm' 
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            All Orders ({rawOrdersCount})
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] text-stone-600 font-sans pr-2">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> &lt; 10m (New)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> &gt; 10m (In Oven)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" /> &gt; 20m (Overdue)
          </span>
          {isEmbedded && (
            <button
              onClick={handleSimulateTestOrder}
              className="ml-2 px-3 py-1 bg-trattoria-red/10 text-trattoria-red hover:bg-trattoria-red/20 font-bold rounded-lg transition-colors text-[10px] uppercase"
            >
              + Test Order
            </button>
          )}
        </div>
      </div>

      {/* Orders Grid */}
      {loading ? (
        <div className="py-20 text-center text-stone-400 font-sans text-xs">
          Loading live kitchen orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-24 bg-white border border-stone-200 rounded-3xl p-8 shadow-sm">
          <ChefHat className="w-16 h-16 text-stone-300 mx-auto mb-3" />
          <h3 className="font-serif text-2xl text-stone-700 font-bold">No active kitchen orders</h3>
          <p className="text-xs text-stone-400 font-sans uppercase tracking-widest mt-1">
            Customer orders will appear here automatically in real-time.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <KdsCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};
