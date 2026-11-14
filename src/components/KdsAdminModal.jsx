import React, { useState } from 'react';
import { X, KeyRound, ChefHat } from 'lucide-react';

export const KdsAdminModal = ({ isOpen, onClose, onAuthenticated }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin === '1234' || pin === '1717' || pin === '1924') {
      setError(false);
      onAuthenticated();
      onClose();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[3000] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#1A1008] border border-trattoria-gold/40 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl text-white relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white p-2 rounded-full hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 bg-trattoria-gold/15 border border-trattoria-gold/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-trattoria-gold">
          <ChefHat className="w-7 h-7" />
        </div>

        <span className="font-sans text-xs tracking-widest text-trattoria-gold uppercase block mb-1">
          Staff Kitchen Access
        </span>
        <h3 className="font-serif text-2xl font-black text-white">Kitchen Display PIN</h3>
        <p className="text-xs text-white/60 font-body mt-1 mb-6">
          Enter passcode to access KDS (Passcode: <strong>1234</strong>)
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="password"
              maxLength={4}
              placeholder="••••"
              value={pin}
              onChange={(e) => { setPin(e.target.value); setError(false); }}
              className="w-full text-center tracking-[1em] text-2xl py-3 px-4 rounded-xl bg-black/60 border border-white/20 text-trattoria-gold font-bold focus:border-trattoria-gold outline-none"
              autoFocus
            />
            <KeyRound className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>

          {error && (
            <p className="text-xs text-trattoria-red font-sans font-bold animate-shake">
              Incorrect passcode! Please try again (Passcode: 1234).
            </p>
          )}

          <button 
            type="submit"
            className="w-full bg-trattoria-red hover:bg-trattoria-redHover text-white py-3.5 rounded-xl font-sans text-xs uppercase tracking-widest font-bold shadow-red-glow transition-all"
          >
            Enter Kitchen (KDS)
          </button>
        </form>
      </div>
    </div>
  );
};
