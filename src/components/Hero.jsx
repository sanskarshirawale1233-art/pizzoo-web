import React, { useEffect, useRef, useState } from 'react';
import { Phone, ChevronDown, Flame, Utensils, QrCode, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

const TOTAL_FRAMES = 250;

const getFrameSrc = (index) => {
  const pad = String(index + 1).padStart(3, '0');
  return `/frames/ezgif-frame-${pad}.jpg`;
};

export const Hero = () => {
  const { tableId } = useCart();
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  // Cached Image Objects in memory
  const imagesRef = useRef([]);
  const targetFrameRef = useRef(0);
  const currentFrameRef = useRef(0);
  const rafIdRef = useRef(null);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [firstFrameLoaded, setFirstFrameLoaded] = useState(false);

  // 1. Preload first frame immediately, then progressively load remaining frames in background
  useEffect(() => {
    const images = new Array(TOTAL_FRAMES);
    imagesRef.current = images;

    // Load first frame with top priority
    const firstImg = new Image();
    firstImg.src = getFrameSrc(0);
    firstImg.onload = () => {
      images[0] = firstImg;
      setFirstFrameLoaded(true);
      renderFrame(0);
    };

    // Preload rest of the frames in chunks
    let currentPreloadIndex = 1;
    const preloadBatchSize = 10;

    const preloadNextBatch = () => {
      if (currentPreloadIndex >= TOTAL_FRAMES) return;

      const endIndex = Math.min(currentPreloadIndex + preloadBatchSize, TOTAL_FRAMES);
      for (let i = currentPreloadIndex; i < endIndex; i++) {
        if (!images[i]) {
          const img = new Image();
          img.src = getFrameSrc(i);
          img.onload = () => {
            images[i] = img;
          };
        }
      }
      currentPreloadIndex = endIndex;

      if (currentPreloadIndex < TOTAL_FRAMES) {
        if ('requestIdleCallback' in window) {
          window.requestIdleCallback(preloadNextBatch, { timeout: 200 });
        } else {
          setTimeout(preloadNextBatch, 50);
        }
      }
    };

    const timer = setTimeout(preloadNextBatch, 100);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  // 2. Render Frame onto Canvas with Cover aspect ratio
  const renderFrame = (frameIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Pick closest loaded frame if target frame isn't loaded yet
    let img = imagesRef.current[frameIndex];
    if (!img) {
      for (let i = frameIndex - 1; i >= 0; i--) {
        if (imagesRef.current[i]) {
          img = imagesRef.current[i];
          break;
        }
      }
    }
    if (!img) img = imagesRef.current[0];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const canvasWidth = canvas.clientWidth;
    const canvasHeight = canvas.clientHeight;

    if (canvas.width !== canvasWidth * dpr || canvas.height !== canvasHeight * dpr) {
      canvas.width = canvasWidth * dpr;
      canvas.height = canvasHeight * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // Calculate 'object-fit: cover' dimensions
    const imgWidth = img.naturalWidth || 1280;
    const imgHeight = img.naturalHeight || 720;
    const imgRatio = imgWidth / imgHeight;
    const canvasRatio = canvasWidth / canvasHeight;

    let drawWidth, drawHeight, offsetX, offsetY;

    if (canvasRatio > imgRatio) {
      drawWidth = canvasWidth;
      drawHeight = canvasWidth / imgRatio;
      offsetX = 0;
      offsetY = (canvasHeight - drawHeight) / 2;
    } else {
      drawWidth = canvasHeight * imgRatio;
      drawHeight = canvasHeight;
      offsetX = (canvasWidth - drawWidth) / 2;
      offsetY = 0;
    }

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    ctx.restore();
  };

  // 3. Smooth Lerp Animation Loop
  useEffect(() => {
    const animate = () => {
      const diff = targetFrameRef.current - currentFrameRef.current;
      if (Math.abs(diff) > 0.1) {
        currentFrameRef.current += diff * 0.28;
        renderFrame(Math.round(currentFrameRef.current));
      }
      rafIdRef.current = requestAnimationFrame(animate);
    };

    rafIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  // 4. Scroll Tracking
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const scrollableDistance = containerRef.current.offsetHeight - window.innerHeight;

      if (scrollableDistance <= 0) return;

      const progress = Math.min(1, Math.max(0, -rect.top / scrollableDistance));
      setScrollProgress(progress);

      const targetFrame = Math.min(TOTAL_FRAMES - 1, Math.floor(progress * (TOTAL_FRAMES - 1)));
      targetFrameRef.current = targetFrame;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  // Scroll to menu helper
  const scrollToMenu = (e) => {
    e.preventDefault();
    const menuEl = document.getElementById('menu');
    if (menuEl) {
      menuEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div id="home" className="w-full bg-[#0A0602]">
      {/* 1. Interactive Scroll-Driven Frame Animation Section */}
      <section 
        ref={containerRef} 
        className="relative h-[220vh] sm:h-[250vh] w-full"
      >
        {/* Sticky Canvas Viewport */}
        <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
          
          {/* HTML5 Frame Scrubbing Canvas */}
          <canvas 
            ref={canvasRef} 
            className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-700"
            style={{ opacity: firstFrameLoaded ? 1 : 0 }}
          />

          {/* Fallback Poster Background while initial frame loads */}
          {!firstFrameLoaded && (
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('/frames/ezgif-frame-001.jpg')` }}
            />
          )}

          {/* Cinematic Vignette Overlays (Soft, so the pizza stays crystal clear) */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(10,6,2,0.05) 0%, rgba(10,6,2,0.45) 70%, rgba(10,6,2,0.85) 100%)'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0602] via-transparent to-transparent pointer-events-none h-40 bottom-0" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0602]/70 via-transparent to-transparent pointer-events-none h-28 top-0" />

          {/* Entrance Title & Scroll Hint (Fades out gently so the pizza bake animation is completely clear) */}
          <div 
            className="relative z-10 max-w-4xl mx-auto text-center px-4 transition-all duration-300 transform pointer-events-none"
            style={{
              opacity: scrollProgress < 0.18 ? Math.max(0, 1 - (scrollProgress / 0.15)) : 0,
              transform: `translateY(${-scrollProgress * 60}px)`
            }}
          >
            {tableId ? (
              <div className="inline-flex items-center gap-2 bg-trattoria-red/30 border border-trattoria-red/60 text-trattoria-gold px-5 py-2 rounded-full font-sans text-xs tracking-widest uppercase mb-5 shadow-red-glow animate-pulse">
                <QrCode className="w-4 h-4 text-trattoria-gold" />
                <span>Tavolo {tableId} · Direct Kitchen Ordering</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 bg-trattoria-gold/15 border border-trattoria-gold/40 text-trattoria-gold px-4 py-1.5 rounded-full font-sans text-[11px] sm:text-xs tracking-widest uppercase mb-4 shadow-sm backdrop-blur-sm">
                <Flame className="w-3.5 h-3.5 text-trattoria-red animate-bounce" />
                <span>Artisanal Neapolitan Pizzeria · Mumbai</span>
              </div>
            )}

            <div className="flex justify-center mb-4">
              <img 
                src="/logo.png" 
                alt="Pizzoo Logo" 
                className="h-24 sm:h-32 md:h-36 object-contain filter drop-shadow-[0_0_35px_rgba(240,165,0,0.5)]"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-black leading-tight mb-3 text-white drop-shadow-md">
              The Art of <span className="text-trattoria-gold drop-shadow-[0_0_20px_rgba(240,165,0,0.35)]">Italian Pizza</span>
            </h1>

            <p className="text-sm sm:text-base text-white/80 font-body max-w-lg mx-auto leading-relaxed mb-6 drop-shadow">
              Handcrafted with 00 wheat flour, San Marzano tomatoes, and 100% pure mozzarella. Baked in stone ovens.
            </p>

            <div className="inline-flex items-center gap-2 text-trattoria-gold/90 font-sans text-[10px] tracking-[0.3em] uppercase bg-black/40 border border-trattoria-gold/20 px-4 py-1.5 rounded-full backdrop-blur-sm">
              <span>Scroll down to watch the bake</span>
              <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
            </div>
          </div>

          {/* Progress Bar at Bottom of Viewport */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-20">
            <div 
              className="h-full bg-gradient-to-r from-trattoria-red to-trattoria-gold transition-all duration-150"
              style={{ width: `${Math.round(scrollProgress * 100)}%` }}
            />
          </div>
        </div>
      </section>

      {/* 2. "Freshly Baked. Ready for You." Section Comes Directly BELOW the Animation */}
      <section className="relative z-20 py-20 px-4 bg-[#0A0602] border-t border-trattoria-gold/15">
        <div className="max-w-4xl mx-auto text-center">
          
          <div className="inline-flex items-center gap-2 bg-trattoria-red/25 border border-trattoria-red/60 text-trattoria-gold px-4 py-1.5 rounded-full font-sans text-xs tracking-widest uppercase mb-5 shadow-red-glow">
            <Flame className="w-4 h-4 text-trattoria-red animate-pulse" />
            <span>BAKED AT 450°C IN AUTHENTIC STONE OVEN</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-black text-white leading-tight mb-4 drop-shadow-xl">
            Freshly Baked. <span className="text-trattoria-gold">Ready for You.</span>
          </h2>

          <p className="text-sm sm:text-base md:text-lg text-white/85 font-body max-w-xl mx-auto leading-relaxed mb-8">
            Explore our handcrafted Veg & Non-Veg Neapolitan pizzas, loaded fries, burgers, and Italian desserts.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap gap-3.5 justify-center items-center font-sans text-xs tracking-widest uppercase font-bold">
            <a 
              href="#menu" 
              onClick={scrollToMenu}
              className="bg-trattoria-red hover:bg-trattoria-redHover text-white px-8 py-4 rounded-xl shadow-red-glow hover:-translate-y-1 transition-all flex items-center gap-2"
            >
              <Utensils className="w-4 h-4" />
              <span>Explore Menu</span>
            </a>

            <a 
              href="https://wa.me/917738009029" 
              target="_blank" 
              rel="noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-7 py-4 rounded-xl hover:-translate-y-1 transition-all flex items-center gap-2 shadow-lg"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Direct</span>
            </a>

            <a 
              href="tel:7738009029" 
              className="border border-trattoria-gold/40 hover:border-trattoria-gold text-white hover:text-trattoria-gold px-7 py-4 rounded-xl hover:-translate-y-1 transition-all flex items-center gap-2 backdrop-blur-sm bg-black/40"
            >
              <Phone className="w-4 h-4" />
              <span>Call: 7738009029</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
