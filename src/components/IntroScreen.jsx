import React, { useState, useEffect } from 'react';

export const IntroScreen = () => {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHidden(true);
    }, 4800);
    return () => clearTimeout(timer);
  }, []);

  if (hidden) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-[#0A0500] flex flex-col items-center justify-center transition-all duration-1000 ${
        hidden ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Ambient background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[radial-gradient(ellipse_at_bottom,rgba(255,80,0,0.22)_0%,transparent_70%)] animate-pulse" />

      {/* Skip Intro Button */}
      <button 
        onClick={() => setHidden(true)}
        className="absolute top-6 right-6 text-xs uppercase tracking-widest bg-trattoria-wood/60 border border-trattoria-gold/30 text-trattoria-gold px-4 py-2 rounded-full hover:bg-trattoria-red hover:text-white transition-all duration-300 font-sans"
      >
        Enter Pizzeria ➔
      </button>

      {/* Oven Scene */}
      <div className="relative w-[360px] h-[320px] flex items-end justify-center flex-shrink-0">
        {/* Heat Shimmer Steam Lines */}
        <div className="steam-line left-[130px] bottom-[240px] h-[50px] animate-[steamRise_1.2s_ease-in-out_infinite_0.1s]" />
        <div className="steam-line left-[160px] bottom-[240px] h-[70px] animate-[steamRise_1.2s_ease-in-out_infinite_0.4s]" />
        <div className="steam-line left-[190px] bottom-[240px] h-[45px] animate-[steamRise_1.2s_ease-in-out_infinite_0.2s]" />
        <div className="steam-line left-[220px] bottom-[240px] h-[60px] animate-[steamRise_1.2s_ease-in-out_infinite_0.6s]" />

        {/* PIZZA SVG */}
        <svg 
          id="pizza-svg" 
          viewBox="0 0 200 200" 
          className="absolute bottom-[82px] left-1/2 w-[160px] h-[160px] -translate-x-1/2 filter drop-shadow-[0_12px_40px_rgba(255,120,0,0.85)] z-20 animate-[pizzaSlideOut_1.4s_cubic-bezier(0.16,1,0.3,1)_1.8s_forwards]"
          style={{ transform: 'translateX(-50%) translateX(-200px) scale(0.4)', opacity: 0 }}
        >
          <rect x="60" y="155" width="80" height="14" rx="4" fill="#8B5E2A" opacity="0.9" />
          <rect x="88" y="168" width="24" height="50" rx="5" fill="#7A4E1C" />
          <circle cx="100" cy="108" r="82" fill="#D4884A" />
          <circle cx="100" cy="108" r="72" fill="#E8A44E" />
          <circle cx="100" cy="108" r="65" fill="#C0392B" />
          <ellipse cx="100" cy="108" rx="58" ry="55" fill="#F5D76E" opacity="0.9" />
          <circle cx="90" cy="90" r="10" fill="#E74C3C" />
          <circle cx="116" cy="95" r="9" fill="#E74C3C" />
          <circle cx="100" cy="118" r="10" fill="#E74C3C" />
          <circle cx="107" cy="93" r="7" fill="#8B1A1A" />
          <circle cx="91" cy="110" r="7" fill="#8B1A1A" />
          <ellipse cx="83" cy="100" rx="5" ry="6" fill="#2C2C2C" />
          <ellipse cx="115" cy="108" rx="4" ry="5" fill="#2C2C2C" />
          <ellipse cx="97" cy="100" rx="6" ry="4" fill="#27AE60" transform="rotate(-20 97 100)" />
          <ellipse cx="110" cy="123" rx="5" ry="3" fill="#2ECC71" transform="rotate(15 110 123)" />
          <circle cx="100" cy="108" r="82" fill="none" stroke="#C47A3A" strokeWidth="4" opacity="0.6" />
        </svg>

        {/* OVEN SVG */}
        <svg id="oven-svg" viewBox="0 0 360 260" className="absolute bottom-0 w-[360px] h-[260px]">
          <defs>
            <radialGradient id="ovenGlowGrad" cx="50%" cy="100%" r="70%">
              <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#FF3300" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#000" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="ovenBodyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3D2200" />
              <stop offset="100%" stopColor="#1A0E00" />
            </linearGradient>
            <linearGradient id="metalGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#4a2800" />
              <stop offset="40%" stopColor="#7a4a1a" />
              <stop offset="100%" stopColor="#3a1e00" />
            </linearGradient>
          </defs>

          <rect x="20" y="40" width="320" height="200" rx="18" fill="url(#ovenBodyGrad)" stroke="#5a3000" strokeWidth="3" />
          <rect x="20" y="40" width="320" height="28" rx="18" fill="url(#metalGrad)" opacity="0.8" />
          <circle cx="60" cy="54" r="8" fill="#1a0e00" stroke="#8B5E2A" strokeWidth="2" />
          <circle cx="60" cy="54" r="4" fill="#FF6B00" opacity="0.9" />
          <circle cx="300" cy="54" r="8" fill="#1a0e00" stroke="#8B5E2A" strokeWidth="2" />
          <circle cx="300" cy="54" r="4" fill="#FF6B00" opacity="0.9" />
          <rect x="140" y="48" width="80" height="12" rx="4" fill="#1a0e00" stroke="#5a3000" strokeWidth="1.5" />
          <rect x="55" y="75" width="250" height="150" rx="12" fill="#0D0700" stroke="#6B3F0A" strokeWidth="3" />
          <ellipse cx="180" cy="200" rx="130" ry="40" fill="url(#ovenGlowGrad)" id="oven-glow" />
          <ellipse cx="180" cy="215" rx="80" ry="18" fill="#FF4500" className="animate-fire" opacity="0.35" />
          <ellipse cx="180" cy="215" rx="50" ry="10" fill="#FF8C00" className="animate-fire" opacity="0.3" />
          <rect x="55" y="75" width="250" height="150" rx="12" fill="none" stroke="#8B5E2A" strokeWidth="2.5" opacity="0.7" />
          <rect x="100" y="232" width="160" height="10" rx="5" fill="url(#metalGrad)" stroke="#8B5E2A" strokeWidth="1.5" />
          <rect x="40" y="238" width="280" height="18" rx="6" fill="#2a1600" stroke="#5a3000" strokeWidth="2" />
        </svg>
      </div>

      {/* Animated Brand Reveal */}
      <div className="mt-4 text-center z-30 opacity-0 animate-[logoReveal_0.9s_cubic-bezier(0.22,1,0.36,1)_3.2s_both]">
        <h1 className="font-serif text-4xl md:text-5xl font-black text-trattoria-gold tracking-wide">
          PIZZOO
        </h1>
        <p className="font-sans text-xs tracking-[0.45em] text-trattoria-cream uppercase mt-2">
          Authentic Italian Pizzeria · Est. 2024
        </p>
      </div>
    </div>
  );
};
