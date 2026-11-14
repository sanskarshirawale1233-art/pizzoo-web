import React from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const UpiPaymentModal = () => {
  const { isUpiModalOpen, setIsUpiModalOpen, subtotal } = useCart();

  if (!isUpiModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[2300] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#1A1008] border border-trattoria-gold/40 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl text-white relative">
        <button 
          onClick={() => setIsUpiModalOpen(false)}
          className="absolute top-4 right-4 text-white/50 hover:text-white p-2 rounded-full hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        <span className="font-sans text-xs tracking-widest text-trattoria-gold uppercase block mb-1">
          Offline Digital Payment
        </span>
        <h3 className="font-serif text-2xl font-black text-white">Scan UPI QR Code</h3>
        <p className="text-xs text-white/60 font-body mt-1 mb-4">
          No online gateway processing fee. Show or pay at table/counter.
        </p>

        {/* Generated Static QR Code graphic */}
        <div className="bg-white p-4 rounded-2xl inline-block shadow-gold-glow my-2 border-4 border-trattoria-gold">
          <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=7738009029@upi%26pn=PIZZOO%20PIZZERIA%26am=${subtotal || 0}`}
            alt="UPI QR Code" 
            className="w-44 h-44 object-contain"
          />
        </div>

        <div className="font-sans text-xs font-bold text-trattoria-gold mt-3">
          UPI ID: <span className="text-white select-all">7738009029@upi</span>
        </div>

        <div className="flex justify-center gap-3 my-4 text-[10px] font-sans text-white/60 uppercase">
          <span className="px-2 py-1 bg-white/5 rounded border border-white/10">Google Pay</span>
          <span className="px-2 py-1 bg-white/5 rounded border border-white/10">PhonePe</span>
          <span className="px-2 py-1 bg-white/5 rounded border border-white/10">Paytm</span>
        </div>

        <div className="bg-emerald-950/40 border border-emerald-500/30 p-3 rounded-xl text-[11px] text-emerald-300 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Cash payments are also accepted at the table</span>
        </div>

        <button 
          onClick={() => setIsUpiModalOpen(false)}
          className="w-full mt-5 bg-trattoria-gold text-trattoria-wood py-3 rounded-xl font-sans text-xs uppercase tracking-widest font-bold hover:bg-white transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
};
