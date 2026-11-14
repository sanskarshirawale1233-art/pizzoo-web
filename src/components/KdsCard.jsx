import React, { useState, useEffect } from 'react';
import { Clock, RotateCcw, Check, Flame, AlertTriangle, Archive, Utensils, CreditCard, ShieldCheck } from 'lucide-react';
import { useKds } from '../context/KdsContext';

export const KdsCard = ({ order }) => {
  const { advanceOrderStatus, revertOrderStatus, archiveOrder, confirmCounterPayment } = useKds();
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  // Real-time timer logic
  useEffect(() => {
    const updateTimer = () => {
      const created = new Date(order.createdAt).getTime();
      const now = new Date().getTime();
      setElapsedMinutes(Math.floor((now - created) / 60000));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [order.createdAt]);

  // Status Badge Definitions
  const statusStyles = {
    RECEIVED: { label: 'RICEVUTO (New Order)', color: 'bg-emerald-600 text-white font-bold' },
    IN_OVEN: { label: 'IN FORNO (Baking 🍕)', color: 'bg-amber-500 text-white font-bold animate-pulse' },
    READY: { label: 'PRONTO (Service Ready 🔔)', color: 'bg-blue-600 text-white font-bold' },
    SERVED: { label: 'SERVITO (Served 🍽️)', color: 'bg-slate-600 text-white font-bold' }
  };

  // Urgency Timer Indicator: Green = New (<10m), Yellow = In Oven (>10m), Red = Overdue (>20m)
  const getTimerStyle = () => {
    if (elapsedMinutes >= 20) return 'text-red-700 font-black animate-bounce flex items-center gap-1 bg-red-100 px-2.5 py-1 rounded-xl border border-red-300';
    if (elapsedMinutes >= 10) return 'text-amber-800 font-bold flex items-center gap-1 bg-amber-100 px-2 py-0.5 rounded-xl border border-amber-300';
    return 'text-emerald-800 font-semibold flex items-center gap-1 bg-emerald-100 px-2 py-0.5 rounded-xl border border-emerald-300';
  };

  // Card Border Highlight
  const getCardBorder = () => {
    if (!order.isPaid) return 'border-amber-400 bg-amber-50/60 shadow-md ring-2 ring-amber-400/50';
    if (order.status === 'SERVED') return 'border-stone-300 bg-stone-50/90';
    if (elapsedMinutes >= 20) return 'border-red-500 bg-red-50/50 shadow-md';
    if (elapsedMinutes >= 10) return 'border-amber-400 bg-amber-50/40';
    return 'border-emerald-500/50 bg-white shadow-sm';
  };

  return (
    <div className={`border-2 rounded-3xl p-5 flex flex-col justify-between shadow-sm transition-all ${getCardBorder()}`}>
      {/* Card Header */}
      <div>
        <div className="flex justify-between items-start border-b border-stone-200 pb-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black font-serif text-stone-900">{order.id}</span>
              <span className="text-[10px] font-sans font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-trattoria-red text-white">
                {order.type === 'TAKEOUT' ? 'Phone Takeout' : `Customer Order`}
              </span>
            </div>
            <div className="mt-1 space-y-0.5">
              <span className="text-xs text-stone-900 font-bold block">
                👤 {order.customerName || 'Counter Customer'}
              </span>
              {order.phone && (
                <span className="text-[11px] font-mono text-emerald-800 block">
                  📞 {order.phone}
                </span>
              )}
            </div>
          </div>

          {/* Urgency Timer */}
          <div className={`text-xs font-sans ${getTimerStyle()}`}>
            {elapsedMinutes >= 20 && <AlertTriangle className="w-3.5 h-3.5 text-red-600" />}
            <Clock className="w-3.5 h-3.5" />
            <span>⏱️ {elapsedMinutes}m min</span>
          </div>
        </div>

        {/* Counter Payment Status Banner */}
        <div className={`p-2.5 rounded-xl text-xs font-bold font-sans flex items-center justify-between mb-3 border ${
          order.isPaid
            ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
            : 'bg-amber-100 border-amber-300 text-amber-900 animate-pulse'
        }`}>
          <div className="flex items-center gap-1.5">
            <CreditCard className="w-4 h-4" />
            <span>{order.isPaid ? '✓ Counter Payment Verified' : '⏳ Awaiting Counter Payment'}</span>
          </div>
          <span className="font-mono text-sm font-black">₹{order.totalAmount || order.total_amount || 0}</span>
        </div>

        {/* Current Status Badge */}
        <div className={`text-center py-1.5 rounded-xl font-sans font-bold text-xs tracking-wider uppercase mb-4 shadow-sm ${statusStyles[order.status]?.color || 'bg-stone-600 text-white'}`}>
          {statusStyles[order.status]?.label || order.status}
        </div>

        {/* Ordered Items List */}
        <ul className="space-y-2 mb-4 max-h-60 overflow-y-auto pr-1">
          {order.items?.map((item, idx) => (
            <li key={idx} className="bg-stone-50 p-3 rounded-2xl border border-stone-200 text-xs">
              <div className="flex justify-between items-start">
                <span className="font-bold text-stone-900 font-sans text-sm">
                  {item.quantity}x {item.name}
                </span>
                <span className="text-[10px] text-trattoria-red font-sans uppercase font-bold">
                  {item.size}
                </span>
              </div>
              
              {item.crust && item.crust !== '-' && (
                <div className="text-[11px] text-amber-800 font-sans mt-0.5">
                  • Crust: {item.crust}
                </div>
              )}

              {item.toppings && item.toppings.length > 0 && (
                <div className="text-[10px] text-stone-600 italic mt-0.5">
                  • Toppings: {item.toppings.join(', ')}
                </div>
              )}

              {item.notes && (
                <div className="text-[10px] text-emerald-800 italic mt-1 bg-emerald-50 p-1.5 rounded-lg border border-emerald-200">
                  Notes: "{item.notes}"
                </div>
              )}
            </li>
          ))}
        </ul>

        {/* Special Instructions */}
        {order.notes && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-2.5 rounded-r-xl text-xs text-amber-900 font-body mb-4">
            <strong className="font-sans uppercase text-[10px] tracking-wider block text-amber-700">Special Instructions:</strong>
            {order.notes}
          </div>
        )}
      </div>

      {/* Control Action Toggles */}
      <div className="space-y-2 pt-3 border-t border-stone-200 mt-auto font-sans text-xs">
        
        {/* Prominent Admin Confirm Payment Button if unpaid */}
        {!order.isPaid && (
          <button
            onClick={() => confirmCounterPayment(order.id)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all text-xs"
          >
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            <span>Confirm Counter Payment & Bake (₹{order.totalAmount})</span>
          </button>
        )}

        <div className="flex gap-2">
          {order.status !== 'RECEIVED' && (
            <button 
              onClick={() => revertOrderStatus(order.id)}
              className="px-3 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold flex items-center gap-1 transition-colors"
              title="Revert to previous status"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Indietro</span>
            </button>
          )}

          {order.status !== 'SERVED' ? (
            <button 
              onClick={() => advanceOrderStatus(order.id)}
              className="flex-1 py-2.5 bg-trattoria-red hover:bg-trattoria-redHover text-white rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition-all"
            >
              {order.status === 'RECEIVED' && (
                <>
                  <Flame className="w-4 h-4 text-amber-200" />
                  <span>Invia in Forno 🍕</span>
                </>
              )}
              {order.status === 'IN_OVEN' && (
                <>
                  <Check className="w-4 h-4" />
                  <span>Segna Pronto 🔔</span>
                </>
              )}
              {order.status === 'READY' && (
                <>
                  <Utensils className="w-4 h-4" />
                  <span>Servito 🍽️</span>
                </>
              )}
            </button>
          ) : (
            <button 
              onClick={() => archiveOrder(order.id)}
              className="flex-1 py-2.5 bg-stone-800 hover:bg-stone-900 text-white rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
            >
              <Archive className="w-4 h-4" />
              <span>Archivia Ordine 📁</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
