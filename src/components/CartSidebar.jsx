import React, { useState, useEffect } from 'react';
import { X, Trash2, ShoppingBag, ArrowLeft, User, Phone, MapPin, Bike, Utensils, MessageSquare, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartSidebar = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    setToastNotification
  } = useCart();

  const [step, setStep] = useState('BASKET'); // 'BASKET' | 'DETAILS'
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [orderType, setOrderType] = useState('HOME_DELIVERY'); // 'HOME_DELIVERY' | 'TAKEOUT' | 'DINE_IN'
  const [address, setAddress] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [validationError, setValidationError] = useState('');

  // WhatsApp & SMS Order Number
  const ORDER_PHONE = '917738009029';
  const FORMATTED_PHONE = '+91 7738009029';

  // Reset step to BASKET whenever cart opens
  useEffect(() => {
    if (isCartOpen) {
      setStep('BASKET');
      setValidationError('');
    }
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const validateDetails = () => {
    if (!customerName.trim()) {
      setValidationError('Please enter your Name.');
      return false;
    }
    if (!phone.trim() || phone.trim().length < 8) {
      setValidationError('Please enter a valid Mobile Phone Number.');
      return false;
    }
    if (orderType === 'HOME_DELIVERY' && !address.trim()) {
      setValidationError('Please enter your Delivery Address in Bhandup West.');
      return false;
    }
    setValidationError('');
    return true;
  };

  // Build formatted order text string for WhatsApp and SMS
  const compileOrderMessage = () => {
    const readableType = 
      orderType === 'HOME_DELIVERY' ? 'Home Delivery' :
      orderType === 'TAKEOUT' ? 'Takeaway' : 'Dine-in';

    const finalAddress = address.trim() || (
      orderType === 'TAKEOUT'
        ? 'Store Pickup (Anita Shopping Center, Bhandup West)'
        : 'Dine-in at Store'
    );

    const orderItemsText = cart.map((item, index) => {
      const itemTotal = (item.price || 0) * (item.quantity || 1);
      const sizeText = item.size ? ` (${item.size})` : '';
      const crustText = item.crust ? ` [${item.crust}]` : '';
      
      const addOnsList = [];
      if (item.toppings && item.toppings.length > 0) addOnsList.push(...item.toppings);
      if (item.addOns && item.addOns.length > 0) addOnsList.push(...item.addOns);
      const addOnsFormatted = addOnsList.length > 0 ? addOnsList.join(', ') : 'None';

      return `${index + 1}. ${item.name}${sizeText}${crustText} x${item.quantity || 1} - ₹${itemTotal}\n   _Add-ons: ${addOnsFormatted}_`;
    }).join('\n');

    const notesLine = customerNotes.trim() ? `\n*Special Instructions:* ${customerNotes.trim()}` : '';

    return `🍕 *NEW ORDER - PIZZOO* 🍕
--------------------------------
*Customer:* ${customerName.trim()}
*Phone:* ${phone.trim()}
*Type:* ${readableType}
*Address:* ${finalAddress}${notesLine}
--------------------------------
*ORDER DETAILS:*
${orderItemsText}
--------------------------------
*GRAND TOTAL: ₹${subtotal}*
*Payment Mode:* Cash on Delivery / UPI on Delivery
--------------------------------
Please confirm my order!`;
  };

  // WhatsApp Checkout Handler
  const handleWhatsAppCheckout = () => {
    if (!validateDetails()) return;

    const message = compileOrderMessage();
    const whatsappUrl = `https://wa.me/${ORDER_PHONE}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');

    clearCart();
    setIsCartOpen(false);

    if (setToastNotification) {
      setToastNotification(`Order sent to WhatsApp (${FORMATTED_PHONE})! We will confirm shortly 🍕`);
      setTimeout(() => setToastNotification(null), 4000);
    }
  };

  // Text Message (SMS) Checkout Handler
  const handleSmsCheckout = () => {
    if (!validateDetails()) return;

    const message = compileOrderMessage();
    const smsUrl = `sms:+${ORDER_PHONE}?body=${encodeURIComponent(message)}`;

    window.open(smsUrl, '_blank');

    clearCart();
    setIsCartOpen(false);

    if (setToastNotification) {
      setToastNotification(`Order sent via SMS (${FORMATTED_PHONE})! We will confirm shortly 🍕`);
      setTimeout(() => setToastNotification(null), 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-[1500] bg-black/75 backdrop-blur-sm flex justify-end animate-fadeIn">
      <div className="w-full max-w-md bg-[#0F0A05] border-l border-trattoria-gold/20 h-full flex flex-col justify-between shadow-2xl text-white">
        
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {step === 'DETAILS' && (
              <button
                onClick={() => setStep('BASKET')}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 transition-colors"
                title="Back to Basket"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h3 className="font-serif text-2xl font-bold text-white">
                {step === 'BASKET' ? 'Your Basket' : 'WhatsApp Checkout'}
              </h3>
              <span className="font-sans text-[10px] tracking-widest uppercase text-trattoria-gold block">
                {step === 'BASKET' ? 'Review Selected Pizzas' : `Direct Order to ${FORMATTED_PHONE}`}
              </span>
            </div>
          </div>

          <button 
            onClick={() => setIsCartOpen(false)}
            className="text-white/60 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* STEP 1: BASKET ITEMS LIST */}
        {step === 'BASKET' && (
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-20 text-white/40 font-sans uppercase tracking-widest text-xs space-y-2">
                  <span className="block text-5xl mb-3">🍕</span>
                  <span>Your basket is empty</span>
                  <p className="text-[10px] text-white/30 lowercase">Select pizzas from the menu to start your order</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div 
                    key={item.cartItemId} 
                    className="bg-white/[0.04] border border-white/10 rounded-xl p-3.5 flex items-center justify-between gap-3 hover:border-trattoria-gold/30 transition-all"
                  >
                    <div className="flex-1">
                      <div className="font-sans text-sm font-bold text-white">{item.name}</div>
                      <div className="text-[10px] text-trattoria-gold font-sans mt-0.5">
                        {item.size} {item.crust && `| ${item.crust}`}
                      </div>
                      {item.toppings && item.toppings.length > 0 && (
                        <div className="text-[10px] text-white/50 italic mt-0.5">
                          + {item.toppings.join(', ')}
                        </div>
                      )}
                      <div className="font-serif text-sm font-bold text-trattoria-gold mt-1">
                        ₹{item.price * item.quantity}
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded-lg border border-white/10">
                      <button 
                        onClick={() => updateQuantity(item.cartItemId, -1)}
                        className="w-6 h-6 rounded flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10"
                      >
                        -
                      </button>
                      <span className="font-sans text-xs font-bold w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.cartItemId, 1)}
                        className="w-6 h-6 rounded flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10"
                      >
                        +
                      </button>
                    </div>

                    <button 
                      onClick={() => removeFromCart(item.cartItemId)}
                      className="text-white/30 hover:text-trattoria-red p-1 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer Step 1 Actions */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-white/10 bg-[#0A0500] space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-sans text-xs uppercase tracking-widest text-white/60">Total Amount</span>
                  <span className="font-serif text-3xl font-black text-trattoria-gold">₹{subtotal}</span>
                </div>

                <button
                  onClick={() => setStep('DETAILS')}
                  className="w-full bg-[#25D366] hover:bg-[#20ba59] text-slate-950 font-black py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all text-sm uppercase tracking-wider active:scale-98"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>Order via WhatsApp (₹{subtotal}) ➔</span>
                </button>
              </div>
            )}
          </>
        )}

        {/* STEP 2: CHECKOUT DETAILS FORM */}
        {step === 'DETAILS' && (
          <div className="flex-1 flex flex-col justify-between p-5 space-y-5 overflow-y-auto">
            <div className="space-y-4">
              
              {/* Order Type Toggle (Delivery / Takeaway / Dine-In) */}
              <div className="space-y-1.5">
                <label className="text-xs text-trattoria-gold font-bold uppercase tracking-wider block">
                  1. Select Order Type *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => { setOrderType('HOME_DELIVERY'); setValidationError(''); }}
                    className={`py-2.5 px-2 rounded-xl border text-xs font-bold uppercase flex flex-col items-center justify-center gap-1 transition-all ${
                      orderType === 'HOME_DELIVERY'
                        ? 'border-emerald-500 bg-emerald-950/60 text-emerald-300 shadow-md font-black'
                        : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'
                    }`}
                  >
                    <Bike className="w-4 h-4" />
                    <span className="text-[10px]">Delivery</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setOrderType('TAKEOUT'); setValidationError(''); }}
                    className={`py-2.5 px-2 rounded-xl border text-xs font-bold uppercase flex flex-col items-center justify-center gap-1 transition-all ${
                      orderType === 'TAKEOUT'
                        ? 'border-trattoria-gold bg-trattoria-gold/20 text-trattoria-gold shadow-md font-black'
                        : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span className="text-[10px]">Takeaway</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setOrderType('DINE_IN'); setValidationError(''); }}
                    className={`py-2.5 px-2 rounded-xl border text-xs font-bold uppercase flex flex-col items-center justify-center gap-1 transition-all ${
                      orderType === 'DINE_IN'
                        ? 'border-amber-500 bg-amber-950/60 text-amber-300 shadow-md font-black'
                        : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'
                    }`}
                  >
                    <Utensils className="w-4 h-4" />
                    <span className="text-[10px]">Dine-In</span>
                  </button>
                </div>
              </div>

              {/* Customer Inputs */}
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-3">
                <label className="text-xs text-trattoria-gold font-bold uppercase tracking-wider block">
                  2. Customer Details *
                </label>

                {/* Name */}
                <div>
                  <label className="text-[10px] text-white/70 font-bold block mb-1">Your Full Name *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={customerName}
                      onChange={(e) => { setCustomerName(e.target.value); setValidationError(''); }}
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-black/60 border border-white/20 text-xs text-white placeholder-white/40 focus:border-trattoria-gold outline-none"
                    />
                    <User className="w-4 h-4 text-white/40 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="text-[10px] text-white/70 font-bold block mb-1">Your WhatsApp / Mobile Number *</label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value); setValidationError(''); }}
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-black/60 border border-white/20 text-xs text-white font-mono placeholder-white/40 focus:border-trattoria-gold outline-none"
                    />
                    <Phone className="w-4 h-4 text-white/40 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Delivery Address / Notes */}
                <div>
                  <label className="text-[10px] text-white/70 font-bold block mb-1">
                    {orderType === 'HOME_DELIVERY' 
                      ? 'Delivery Address & Landmark in Bhandup West *' 
                      : orderType === 'TAKEOUT' 
                        ? 'Pickup Notes / Time' 
                        : 'Table Number / Dine-in Notes'}
                  </label>
                  <div className="relative">
                    <textarea
                      rows={2}
                      placeholder={
                        orderType === 'HOME_DELIVERY'
                          ? 'Flat/Room No, Building, Landmark, Bhandup (W)...'
                          : orderType === 'TAKEOUT'
                            ? 'e.g. Will pick up in 20 minutes from store'
                            : 'e.g. Table 4 or Counter'
                      }
                      value={address}
                      onChange={(e) => { setAddress(e.target.value); setValidationError(''); }}
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-black/60 border border-white/20 text-xs text-white placeholder-white/40 focus:border-trattoria-gold outline-none resize-none"
                    />
                    <MapPin className="w-4 h-4 text-white/40 absolute left-2.5 top-3" />
                  </div>
                </div>

                {/* Special Instructions */}
                <div>
                  <label className="text-[10px] text-white/70 font-bold block mb-1">Special Cooking Instructions (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Extra spicy, well-done crust..."
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-white/40 focus:border-trattoria-gold outline-none"
                  />
                </div>
              </div>

              {/* Payment Mode Note */}
              <div className="bg-amber-950/40 border border-amber-600/30 rounded-xl p-3 text-[11px] text-amber-200/90 flex items-start gap-2">
                <span className="text-sm">💵</span>
                <span><strong>Payment Mode:</strong> Cash on Delivery / UPI (GPay / PhonePe / Paytm) on Delivery or Pickup.</span>
              </div>

              {/* Validation Warning */}
              {validationError && (
                <div className="bg-red-950/80 border border-red-500/50 p-3 rounded-xl text-xs text-red-200 font-bold flex items-center gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}
            </div>

            {/* Step 2 Footer Action: DUAL WHATSAPP & SMS CHECKOUT */}
            <div className="pt-4 border-t border-white/10 bg-[#0A0500] space-y-2.5">
              <div className="flex justify-between items-center mb-1">
                <span className="font-sans text-xs uppercase tracking-widest text-white/60">Grand Total</span>
                <span className="font-serif text-3xl font-black text-trattoria-gold">₹{subtotal}</span>
              </div>

              {/* 1. Primary WhatsApp Checkout Button */}
              <button
                type="button"
                onClick={handleWhatsAppCheckout}
                className="w-full bg-[#25D366] hover:bg-[#20ba59] text-slate-950 py-3.5 rounded-xl flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-950/50 transition-all text-sm font-black uppercase tracking-wider active:scale-98"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
                <span>Send Bill on WhatsApp (₹{subtotal})</span>
              </button>

              {/* 2. Secondary SMS Text Message Button */}
              <button
                type="button"
                onClick={handleSmsCheckout}
                className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl flex items-center justify-center gap-2 border border-white/20 transition-all text-xs font-bold uppercase tracking-wider"
              >
                <MessageSquare className="w-4 h-4 text-amber-300" />
                <span>Send Bill via SMS Text</span>
              </button>

              <button
                type="button"
                onClick={() => setStep('BASKET')}
                className="w-full py-1 text-center text-xs text-white/50 hover:text-white underline"
              >
                Back to Review Basket
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
