import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { StatsBanner } from '../components/StatsBanner';
import { WhyUs } from '../components/WhyUs';
import { MenuSection } from '../components/MenuSection';
import { PizzaCustomizerModal } from '../components/PizzaCustomizerModal';
import { CartSidebar } from '../components/CartSidebar';
import { FloatingCartBar } from '../components/FloatingCartBar';
import { AboutSection } from '../components/AboutSection';
import { GallerySection } from '../components/GallerySection';
import { ContactSection } from '../components/ContactSection';
import { Footer } from '../components/Footer';

export const CustomerApp = () => {
  const [customizingPizza, setCustomizingPizza] = useState(null);

  return (
    <div className="bg-[#0D0700] text-white font-body selection:bg-trattoria-red selection:text-white min-h-screen">
      {/* Navigation Bar */}
      <Navbar />

      {/* Hero Header */}
      <Hero />

      {/* Stats Banner */}
      <StatsBanner />

      {/* Why Choose Us */}
      <WhyUs />

      {/* Menu Section */}
      <MenuSection onCustomizePizza={(pizza) => setCustomizingPizza(pizza)} />

      {/* Brand Story */}
      <AboutSection />

      {/* Gallery */}
      <GallerySection />

      {/* Contact & Map */}
      <ContactSection />

      {/* Footer */}
      <Footer />

      {/* Interactive Customizer Modal */}
      <PizzaCustomizerModal 
        pizza={customizingPizza} 
        onClose={() => setCustomizingPizza(null)} 
      />

      {/* Floating Bottom View Basket Bar & Toast */}
      <FloatingCartBar />

      {/* Cart Sidebar Drawer (Direct WhatsApp & SMS Ordering Exclusively) */}
      <CartSidebar />
    </div>
  );
};
