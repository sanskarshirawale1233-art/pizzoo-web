import React, { useState } from 'react';
import { X, Flame, CheckCircle, Clock, UtensilsCrossed, Receipt, Check, Download, Send, Printer, Store, Mail, Phone } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const LiveOrderStatusModal = () => {
  const { activeOrderTracker, setActiveOrderTracker } = useCart();
  const [sendSuccess, setSendSuccess] = useState(false);

  if (!activeOrderTracker) return null;

  const steps = [
    { key: 'RECEIVED', label: 'RICEVUTO', sub: 'Order Placed & Confirmed 🍕', icon: Clock },
    { key: 'IN_OVEN', label: 'IN FORNO', sub: 'Baking in Stone Oven 🔥', icon: Flame },
    { key: 'READY', label: 'PRONTO', sub: 'Hot & Ready for Pickup / Table Service 🔔', icon: CheckCircle },
    { key: 'SERVED', label: 'SERVITO', sub: 'Order Completed & Served 🍽️', icon: UtensilsCrossed }
  ];

  const statusOrder = ['RECEIVED', 'IN_OVEN', 'READY', 'SERVED'];
  const currentStepIndex = statusOrder.indexOf(activeOrderTracker.status);

  const totalBillAmount = activeOrderTracker.totalAmount ?? activeOrderTracker.total_amount ?? activeOrderTracker.totalPrice ?? activeOrderTracker.total_price ?? 0;

  // 1. Download Digital Receipt Text File
  const handleDownloadReceipt = () => {
    const itemsText = activeOrderTracker.items?.map(it => 
      `  • ${it.quantity || 1}x ${it.name} (${it.size || 'Standard'}) - ₹${(it.price || it.unit_price || 0) * (it.quantity || 1)}`
    ).join('\n') || '';

    const content = `====================================
      PIZZOO ITALIAN PIZZERIA
   Authentic Italian Trattoria & Cucina
====================================
Invoice ID Code : #${activeOrderTracker.id}
Customer Name   : ${activeOrderTracker.customerName || 'Customer'}
Mobile Phone    : ${activeOrderTracker.phone || 'N/A'}
Email           : ${activeOrderTracker.email || 'N/A'}
Order Type      : ${activeOrderTracker.type === 'TAKEOUT' || activeOrderTracker.type === 'TAKEAWAY' ? 'Takeaway' : 'Dine-In'}
Date & Time     : ${new Date(activeOrderTracker.createdAt || Date.now()).toLocaleString()}
Status          : ORDER CONFIRMED & IN KITCHEN

------------------------------------
PURCHASED ITEMS BREAKDOWN:
${itemsText}
------------------------------------
TOTAL BILL AMOUNT : ₹${totalBillAmount}
====================================
Grazie mille per il tuo ordine! 🍕
Pizzoo Authentic Italian Pizzeria
====================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Pizzoo_Receipt_${activeOrderTracker.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 2. Send Digital Receipt via SMS / Email Link
  const handleSendReceipt = () => {
    setSendSuccess(true);
    setTimeout(() => setSendSuccess(false), 4000);

    if (activeOrderTracker.phone) {
      const smsBody = encodeURIComponent(`PIZZOO PIZZERIA RECEIPT #${activeOrderTracker.id}\nTotal Bill: ₹${totalBillAmount}\nThank you for your order! 🍕`);
      window.open(`sms:${activeOrderTracker.phone}?body=${smsBody}`, '_blank');
    }
  };

  // 3. Print Thermal Paper Bill
  const handlePrintDigitalBill = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Digital Bill - ${activeOrderTracker.id}</title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 20px; max-width: 400px; margin: 0 auto; color: #000; }
            .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 15px; }
            .title { font-size: 22px; font-weight: font-black; text-transform: uppercase; }
            .sub { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
            .invoice { font-size: 14px; font-weight: bold; margin-top: 5px; }
            .meta { margin-bottom: 15px; font-size: 12px; line-height: 1.6; }
            .item { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 5px; font-weight: bold; }
            .item-sub { font-size: 10px; color: #555; margin-left: 10px; }
            .total { border-top: 2px dashed #000; margin-top: 15px; padding-top: 10px; font-size: 18px; font-weight: bold; display: flex; justify-content: space-between; }
            .footer { text-align: center; margin-top: 20px; font-size: 11px; font-style: italic; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">PIZZOO ITALIAN PIZZERIA</div>
            <div class="sub">Authentic Italian Trattoria</div>
            <div class="invoice">Invoice ID: #${activeOrderTracker.id}</div>
          </div>

          <div class="meta">
            <div><strong>Customer Name:</strong> ${activeOrderTracker.customerName || 'Customer'}</div>
            <div><strong>Mobile Phone:</strong> ${activeOrderTracker.phone || 'N/A'}</div>
            ${activeOrderTracker.email ? `<div><strong>Email:</strong> ${activeOrderTracker.email}</div>` : ''}
            <div><strong>Order Type:</strong> ${activeOrderTracker.type === 'TAKEOUT' || activeOrderTracker.type === 'TAKEAWAY' ? 'Takeaway' : 'Dine-In'}</div>
            <div><strong>Date & Time:</strong> ${new Date(activeOrderTracker.createdAt || Date.now()).toLocaleString()}</div>
            <div><strong>Order Status:</strong> CONFIRMED</div>
          </div>

          <div style="border-bottom: 1px solid #000; margin-bottom: 10px;"></div>

          ${activeOrderTracker.items?.map(it => `
            <div>
              <div class="item">
                <span>${it.quantity}x ${it.name} (${it.size || 'Standard'})</span>
                <span>₹${(it.price || it.unit_price || 0) * (it.quantity || 1)}</span>
              </div>
              ${it.crust && it.crust !== '-' ? `<div class="item-sub">• Crust: ${it.crust}</div>` : ''}
              ${it.toppings && it.toppings.length > 0 ? `<div class="item-sub">• Toppings: ${it.toppings.join(', ')}</div>` : ''}
            </div>
          `).join('')}

          <div class="total">
            <span>TOTAL BILL:</span>
            <span>₹${totalBillAmount}</span>
          </div>

          <div class="footer">
            <p>Grazie mille per il tuo ordine! 🍕</p>
            <p>Pizzoo Authentic Italian Pizzeria</p>
          </div>

          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-[2200] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-[#1A1008] border border-trattoria-gold/40 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl text-white relative my-8">
        
        {/* Close Button */}
        <button 
          onClick={() => setActiveOrderTracker(null)}
          className="absolute top-4 right-4 text-white/50 hover:text-white p-2 rounded-full hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* OFFICIAL PIZZOO CAFE BILL HEADER */}
        <div className="text-center mb-5 pb-4 border-b border-white/10">
          <div className="flex items-center justify-center gap-2 text-trattoria-gold mb-1">
            <Store className="w-6 h-6" />
            <h2 className="font-serif text-2xl font-black tracking-wide text-white uppercase">
              PIZZOO ITALIAN PIZZERIA
            </h2>
          </div>
          <span className="font-sans text-[10px] tracking-widest text-trattoria-gold uppercase block">
            Official Cafe Bill & Digital Invoice
          </span>
          
          <div className="bg-black/40 border border-white/10 p-3.5 rounded-2xl mt-3 space-y-1.5 text-left font-sans text-xs">
            <div className="flex justify-between items-center">
              <span className="text-white/60">Invoice ID Code:</span>
              <span className="font-mono font-bold text-trattoria-gold">#{activeOrderTracker.id}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-white/60">Customer Name:</span>
              <span className="font-bold text-white">{activeOrderTracker.customerName || 'Customer'}</span>
            </div>

            {activeOrderTracker.phone && (
              <div className="flex justify-between items-center">
                <span className="text-white/60">Mobile Phone No.:</span>
                <span className="font-mono font-bold text-emerald-400">{activeOrderTracker.phone}</span>
              </div>
            )}

            {activeOrderTracker.email && (
              <div className="flex justify-between items-center">
                <span className="text-white/60">Email:</span>
                <span className="font-mono text-white/80">{activeOrderTracker.email}</span>
              </div>
            )}

            <div className="flex justify-between items-center pt-1 border-t border-white/5">
              <span className="text-white/60">Order Type:</span>
              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                activeOrderTracker.type === 'TAKEOUT' || activeOrderTracker.type === 'TAKEAWAY'
                  ? 'bg-blue-950 text-blue-300 border border-blue-500/30'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
              }`}>
                {activeOrderTracker.type === 'TAKEOUT' || activeOrderTracker.type === 'TAKEAWAY' ? '📦 Takeaway' : '🍽️ Dine-In'}
              </span>
            </div>
          </div>
        </div>

        {/* ORDER CONFIRMED SUCCESS BANNER */}
        <div className="bg-emerald-950/80 border border-emerald-500/50 p-4 rounded-2xl text-xs space-y-1 mb-5">
          <div className="flex items-center justify-between font-bold">
            <div className="flex items-center gap-2 text-emerald-300">
              <Check className="w-5 h-5 text-emerald-400 bg-emerald-800/80 p-0.5 rounded-full" />
              <span className="text-sm font-black uppercase tracking-wider">✓ Order Placed & Confirmed!</span>
            </div>
            <span className="font-mono text-base font-black text-amber-300">₹{totalBillAmount}</span>
          </div>
          <p className="text-[11px] text-emerald-200/90 leading-relaxed pt-1">
            Thank you for your order! Your sourdough pizza is now being prepared in our stone oven.
          </p>
        </div>

        {/* Notification Feedback Toast */}
        {sendSuccess && (
          <div className="bg-emerald-800 text-white p-2.5 rounded-xl text-xs font-bold text-center mb-4 animate-bounce">
            ✓ Digital receipt sent to {activeOrderTracker.phone || 'customer'}!
          </div>
        )}

        {/* Live Track Order Stepper */}
        <div className="space-y-4 my-5 relative before:content-[''] before:absolute before:left-5 before:top-3 before:bottom-3 before:w-0.5 before:bg-white/10">
          {steps.map((s, index) => {
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const IconComp = s.icon;

            return (
              <div key={s.key} className="relative flex items-start gap-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs border z-10 transition-all ${
                  isCurrent 
                    ? 'bg-trattoria-red border-trattoria-gold text-white shadow-red-glow animate-pulse' 
                    : isCompleted 
                    ? 'bg-emerald-600 border-emerald-500 text-white' 
                    : 'bg-black/60 border-white/20 text-white/30'
                }`}>
                  <IconComp className="w-5 h-5" />
                </div>

                <div>
                  <h4 className={`font-sans text-xs font-bold uppercase tracking-wider ${
                    isCompleted ? 'text-white' : 'text-white/40'
                  }`}>
                    {s.label}
                  </h4>
                  <p className="text-[11px] font-body text-trattoria-gold/80 mt-0.5">{s.sub}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Itemized Purchased Pizzas Breakdown */}
        <div className="bg-black/50 border border-white/10 rounded-2xl p-4 text-xs font-sans space-y-2.5 mb-5">
          <span className="text-trattoria-gold uppercase tracking-wider font-bold block mb-1">
            Purchased Items Breakdown:
          </span>

          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {activeOrderTracker.items?.map((item, idx) => (
              <div key={idx} className="p-2 rounded-xl bg-white/5 border border-white/5">
                <div className="flex justify-between font-bold text-white">
                  <span>{item.quantity || 1}x {item.name} ({item.size || 'Standard'})</span>
                  <span className="text-trattoria-gold font-mono">₹{(item.price || item.unit_price || 0) * (item.quantity || 1)}</span>
                </div>
                {item.crust && item.crust !== '-' && (
                  <p className="text-[10px] text-amber-300 mt-0.5">• Crust: {item.crust}</p>
                )}
                {item.toppings && item.toppings.length > 0 && (
                  <p className="text-[10px] text-white/60">• Toppings: {item.toppings.join(', ')}</p>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-2.5 flex justify-between items-center text-sm font-bold">
            <span className="text-white/70 uppercase">Total Bill Amount:</span>
            <span className="font-serif text-2xl font-black text-trattoria-gold">
              ₹{totalBillAmount}
            </span>
          </div>
        </div>

        {/* RECEIPT ACTIONS: Download, Send SMS/Email, Print */}
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2 text-xs font-bold uppercase tracking-wider">
            <button
              onClick={handleDownloadReceipt}
              className="bg-emerald-700 hover:bg-emerald-800 text-white py-3 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <Download className="w-4 h-4 text-amber-300" />
              <span>Download Receipt</span>
            </button>

            <button
              onClick={handleSendReceipt}
              className="bg-trattoria-gold hover:bg-amber-400 text-trattoria-wood py-3 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all font-black"
            >
              <Send className="w-4 h-4" />
              <span>Send Receipt</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-bold uppercase tracking-wider">
            <button
              onClick={handlePrintDigitalBill}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>Print Bill 🖨️</span>
            </button>

            <button 
              onClick={() => setActiveOrderTracker(null)}
              className="bg-trattoria-red hover:bg-trattoria-redHover text-white py-3 rounded-xl font-sans text-xs uppercase tracking-widest font-bold shadow-red-glow transition-all"
            >
              Done / Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
