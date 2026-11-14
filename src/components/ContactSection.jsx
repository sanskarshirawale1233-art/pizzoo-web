import React from 'react';
import { MapPin, Phone, Clock, MessageCircle, Navigation, Star } from 'lucide-react';

export const ContactSection = () => {
  return (
    <section id="contact" className="py-24 px-4 bg-[#0A0602]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="font-sans text-xs tracking-[0.35em] text-trattoria-gold uppercase block mb-2">
            WHERE TO FIND US
          </span>
          <h2 className="font-serif text-4xl font-black text-white">
            Visit Our Pizzeria
          </h2>
          <div className="w-16 h-1 bg-trattoria-gold mx-auto mt-4 rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Info Details */}
          <div className="space-y-6">
            <h3 className="font-serif text-3xl font-black text-white">
              Pizzoo Italian Pizzeria & Kitchen
            </h3>

            <div className="space-y-5">
              {/* Address */}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-trattoria-gold/10 border border-trattoria-gold/30 rounded-xl text-trattoria-gold shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-sans text-[10px] tracking-widest text-trattoria-gold uppercase block">ADDRESS</span>
                  <p className="text-sm text-white/85 font-body mt-0.5 leading-relaxed">
                    Chhatrapati Shivaji Maharaj Talav, Anita Shopping Center, Jangal Mangal Rd, near Monginis Cake Shop, Gadhav Naka, Sarvodaya Nagar, Bhandup West, Mumbai, Maharashtra 400078
                  </p>
                  <a 
                    href="https://maps.app.goo.gl/QcoW7vDdGgy3Ko7b6?g_st=ic" 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 mt-2.5 px-3.5 py-1.5 rounded-lg bg-trattoria-gold/15 hover:bg-trattoria-gold/25 border border-trattoria-gold/40 text-trattoria-gold text-xs font-bold transition-all"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Get Directions</span>
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-trattoria-gold/10 border border-trattoria-gold/30 rounded-xl text-trattoria-gold shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-sans text-[10px] tracking-widest text-trattoria-gold uppercase block">PHONE (CALL TO ORDER)</span>
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    <a href="tel:7738009029" className="text-sm text-white font-bold hover:text-trattoria-gold transition-colors">
                      7738009029 <span className="text-[10px] text-trattoria-gold font-normal">(Primary)</span>
                    </a>
                    <span className="text-white/30">•</span>
                    <a href="tel:9870031740" className="text-sm text-white/80 hover:text-trattoria-gold transition-colors">
                      9870031740 <span className="text-[10px] text-white/50">(Secondary)</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-trattoria-gold/10 border border-trattoria-gold/30 rounded-xl text-trattoria-gold shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-sans text-[10px] tracking-widest text-trattoria-gold uppercase block">OPENING HOURS</span>
                  <p className="text-sm text-white/85 font-body mt-0.5">
                    11:00 AM – 11:00 PM (Everyday)
                  </p>
                </div>
              </div>

              {/* WhatsApp & Google Reviews */}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-400 shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="font-sans text-[10px] tracking-widest text-emerald-400 uppercase block">DIRECT CONNECT</span>
                  <a 
                    href="https://wa.me/917738009029" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-sm text-emerald-300 font-bold hover:underline flex items-center gap-1.5"
                  >
                    <span>Chat on WhatsApp (917738009029)</span>
                  </a>
                  <a 
                    href="https://maps.app.goo.gl/QcoW7vDdGgy3Ko7b6?g_st=ic" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-sm text-amber-300 font-semibold hover:underline flex items-center gap-1.5"
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                    <span>Leave a Google Review</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Map Embed */}
          <div className="rounded-2xl overflow-hidden border border-trattoria-gold/30 shadow-2xl bg-black">
            <iframe 
              src="https://www.google.com/maps?q=Anita+Shopping+Center,+Jangal+Mangal+Rd,+Gadhav+Naka,+Bhandup+West,+Mumbai+400078&output=embed" 
              className="w-full h-[350px] rounded-2xl border-0"
              allowFullScreen="" 
              loading="lazy" 
              title="Pizzoo Pizzeria Location Map"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
