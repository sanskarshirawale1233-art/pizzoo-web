import React from 'react';
import { MapPin, Phone, Clock, MessageCircle } from 'lucide-react';

export const ContactSection = () => {
  return (
    <section id="contact" className="py-24 px-4 bg-[#1A0E00]">
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

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-trattoria-gold/10 border border-trattoria-gold/30 rounded-xl text-trattoria-gold">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-sans text-[10px] tracking-widest text-trattoria-gold uppercase block">ADDRESS</span>
                  <p className="text-sm text-white/80 font-body mt-0.5">
                    Chattrapati Shivaji Maharaj Talav, Anita Shopping Center, Jangal Mangal Rd, near monjinis Cake Shop, Gadhav Naka, Sarvodaya Nagar, Bhandup West, Mumbai, Maharashtra 400078
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-trattoria-gold/10 border border-trattoria-gold/30 rounded-xl text-trattoria-gold">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-sans text-[10px] tracking-widest text-trattoria-gold uppercase block">PHONE (CALL TO ORDER)</span>
                  <a href="tel:7738009029" className="text-sm text-white/90 font-bold hover:text-trattoria-gold transition-colors block">
                    7738009029
                  </a>
                  <a href="tel:9870031740" className="text-sm text-white/90 font-bold hover:text-trattoria-gold transition-colors block">
                    9870031740
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-trattoria-gold/10 border border-trattoria-gold/30 rounded-xl text-trattoria-gold">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-sans text-[10px] tracking-widest text-trattoria-gold uppercase block">OPENING HOURS</span>
                  <p className="text-sm text-white/80 font-body mt-0.5">
                    11:00 AM – 11:00 PM (Everyday)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-400">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-sans text-[10px] tracking-widest text-emerald-400 uppercase block">WHATSAPP DIRECT ORDER</span>
                  <a href="https://wa.me/917738009029" target="_blank" rel="noreferrer" className="text-sm text-emerald-300 font-bold hover:underline">
                    Chat on WhatsApp (917738009029)
                  </a>
                  <a href="https://search.google.com/local/writereview?placeid=PLACE_ID" target="_blank" rel="noreferrer" className="text-sm text-emerald-300 font-bold hover:underline">
                    Leave a Google Review
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Map Embed */}
          <div className="rounded-3xl overflow-hidden border border-trattoria-gold/20 shadow-2xl h-[360px]">
            <iframe 
              src="https://maps.app.goo.gl/QcoW7vDdGgy3Ko7b6?g_st=ic" 
              className="w-full h-full border-0 filter invert opacity-90"
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
