import React, { useState, useEffect, useCallback } from 'react';
import { 
  TrendingUp, ShoppingBag, Utensils, PhoneCall, 
  Search, Printer, FileText, RefreshCw, X, Users, FileSpreadsheet, Trash2, AlertTriangle, Download 
} from 'lucide-react';
export const AdminAnalytics = () => {
  const [metrics, setMetrics] = useState({
    revenueToday: 0,
    revenueWeek: 0,
    totalOrders: 0,
    dineInCount: 0,
    takeoutCount: 0
  });
  const [receipts, setReceipts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [activeTab, setActiveTab] = useState('RECEIPTS'); // 'RECEIPTS' | 'CUSTOMERS'
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetSuccessMsg, setResetSuccessMsg] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch Metrics
      const resMetrics = await fetch('/api/analytics');
      if (resMetrics.ok) {
        const data = await resMetrics.json();
        setMetrics(data);
      }

      // Fetch Receipts
      let receiptsUrl = '/api/receipts';
      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.append('search', searchQuery);
      if (selectedDate) queryParams.append('date', selectedDate);
      if (queryParams.toString()) receiptsUrl += '?' + queryParams.toString();

      const resReceipts = await fetch(receiptsUrl);
      if (resReceipts.ok) {
        const rData = await resReceipts.json();
        setReceipts(rData);
      }

      // Fetch Customers CRM
      const resCustomers = await fetch('/api/customers');
      if (resCustomers.ok) {
        const cData = await resCustomers.json();
        setCustomers(cData);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedDate]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleExportFullSalesBackup = () => {
    const link = document.createElement('a');
    link.href = '/api/export-all-data';
    link.download = `pizzoo_full_sales_backup_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCustomersExcel = () => {
    const link = document.createElement('a');
    link.href = '/api/customers/export';
    link.download = `pizzoo_customer_contacts_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmSystemReset = async () => {
    try {
      // Step 1: Download backup CSV via hidden link element without page navigation
      handleExportFullSalesBackup();

      // Small pause for browser download trigger to register
      await new Promise(r => setTimeout(r, 600));

      // Step 2: Call Reset API Endpoint to wipe orders, receipts, and order items
      const res = await fetch('/api/reset-all-data', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to reset system data');
      const data = await res.json();

      // Clear local browser cache
      try {
        localStorage.removeItem('pizzoo_orders_cache');
      } catch (e) {}

      setResetSuccessMsg(data.message || 'System data reset to 0 orders for a fresh start!');
      setIsResetModalOpen(false);
      
      if (refetchOrders) refetchOrders();
      await fetchAnalytics();

      setTimeout(() => setResetSuccessMsg(null), 5000);
    } catch (err) {
      console.error('Error resetting system data:', err);
      alert('Error resetting data: ' + err.message);
    }
  };

  const handlePrintReceipt = (receipt) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Digital Receipt - ${receipt.receiptNumber}</title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 20px; max-width: 400px; margin: 0 auto; color: #000; }
            .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 15px; }
            .title { font-size: 20px; font-weight: bold; }
            .sub { font-size: 12px; text-transform: uppercase; }
            .meta { margin-bottom: 15px; font-size: 12px; }
            .item { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 5px; }
            .item-sub { font-size: 10px; color: #555; margin-left: 10px; }
            .total { border-top: 2px dashed #000; margin-top: 15px; padding-top: 10px; font-size: 16px; font-weight: bold; display: flex; justify-content: space-between; }
            .footer { text-align: center; margin-top: 20px; font-size: 11px; font-style: italic; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">PIZZOO ITALIAN PIZZERIA</div>
            <div class="sub">Authentic Italian Pizzeria</div>
            <div class="sub">Receipt #${receipt.receiptNumber}</div>
          </div>

          <div class="meta">
            <div><strong>Table / Type:</strong> ${receipt.type === 'TAKEOUT' || receipt.type === 'TAKEAWAY' ? 'Takeaway' : 'Table ' + receipt.tableNo}</div>
            <div><strong>Customer:</strong> ${receipt.customerName || 'Dine-In Customer'}</div>
            <div><strong>Date:</strong> ${new Date(receipt.createdAt).toLocaleString()}</div>
            <div><strong>Payment Status:</strong> ${receipt.paymentStatus}</div>
          </div>

          <div style="border-bottom: 1px solid #ddd; margin-bottom: 10px;"></div>

          ${receipt.items.map(it => `
            <div>
              <div class="item">
                <span>${it.quantity}x ${it.name} (${it.size || 'Standard'})</span>
                <span>₹${it.subtotal || (it.price * it.quantity)}</span>
              </div>
              ${it.crust && it.crust !== '-' ? `<div class="item-sub">• Crust: ${it.crust}</div>` : ''}
              ${it.toppings && it.toppings.length > 0 ? `<div class="item-sub">• Toppings: ${it.toppings.join(', ')}</div>` : ''}
            </div>
          `).join('')}

          <div class="total">
            <span>TOTAL AMOUNT:</span>
            <span>₹${receipt.totalPrice}</span>
          </div>

          <div class="footer">
            <p>Grazie mille per aver mangiato con noi! 🍕</p>
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

  const handleTogglePaymentStatus = async (receiptId, orderId, currentStatus) => {
    const isNowPaid = currentStatus !== 'PAID';
    try {
      await fetch(`/api/orders/${orderId}/pay`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPaid: isNowPaid })
      });
    } catch (e) {}
    fetchAnalytics();
    if (selectedReceipt) {
      setSelectedReceipt(prev => prev ? { ...prev, paymentStatus: isNowPaid ? 'PAID' : 'UNPAID' } : null);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Metrics Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-emerald-950/10 border border-emerald-500/20 p-5 rounded-3xl">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
            <h2 className="font-serif text-2xl font-black text-stone-900">Sales & Receipts Analytics</h2>
          </div>
          <p className="text-xs text-stone-600 font-sans tracking-wide mt-1">
            Real-time Sales Dashboard, Customer CRM & System Data Reset
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportFullSalesBackup}
            className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md transition-all"
            title="Download Complete Sales Backup CSV for Excel"
          >
            <Download className="w-4 h-4 text-amber-300" />
            <span>Download Sales Backup (Excel/CSV)</span>
          </button>

          <button
            onClick={() => setIsResetModalOpen(true)}
            className="bg-trattoria-red hover:bg-trattoria-redHover text-white px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md transition-all"
            title="Export Backup & Reset All Orders to 0"
          >
            <Trash2 className="w-4 h-4" />
            <span>Reset Data to 0 🗑️</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {resetSuccessMsg && (
        <div className="bg-emerald-800 text-white p-4 rounded-2xl text-xs font-bold text-center animate-bounce shadow-lg">
          ✓ {resetSuccessMsg}
        </div>
      )}

      {/* Revenue Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today Revenue */}
        <div className="bg-white border border-stone-200 p-5 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Revenue Today</span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              ₹
            </div>
          </div>
          <div className="font-serif text-3xl font-black text-stone-900">
            ₹{metrics ? metrics.revenueToday.toLocaleString() : 0}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Live daily totals</p>
        </div>

        {/* This Week Revenue */}
        <div className="bg-white border border-stone-200 p-5 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Revenue This Week</span>
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-3xl font-black text-stone-900">
            ₹{metrics ? metrics.revenueWeek.toLocaleString() : 0}
          </div>
          <p className="text-[11px] text-amber-600 font-semibold mt-1">Last 7 days aggregate</p>
        </div>

        {/* Total Orders & Breakdown */}
        <div className="bg-white border border-stone-200 p-5 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Total Orders</span>
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-3xl font-black text-stone-900">
            {metrics ? metrics.totalOrders : 0}
          </div>
          <div className="flex items-center gap-3 text-[11px] text-stone-600 font-medium mt-1">
            <span className="flex items-center gap-1">
              <Utensils className="w-3 h-3 text-trattoria-red" /> {metrics ? metrics.dineInCount : 0} Dine-in
            </span>
            <span className="flex items-center gap-1">
              <PhoneCall className="w-3 h-3 text-blue-600" /> {metrics ? metrics.takeoutCount : 0} Takeout
            </span>
          </div>
        </div>

        {/* Total Customer Contacts */}
        <div className="bg-white border border-stone-200 p-5 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Customer Contacts</span>
            <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-3xl font-black text-stone-900">
            {customers.length}
          </div>
          <p className="text-[11px] text-purple-600 font-semibold mt-1">Captured for offer marketing</p>
        </div>
      </div>

      {/* Sub-View Mode Switcher */}
      <div className="flex items-center gap-3 bg-stone-100 p-1.5 rounded-2xl border border-stone-200 max-w-md">
        <button
          onClick={() => setActiveTab('RECEIPTS')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
            activeTab === 'RECEIPTS'
              ? 'bg-stone-900 text-white shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Digital Receipts Archive</span>
        </button>

        <button
          onClick={() => setActiveTab('CUSTOMERS')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
            activeTab === 'CUSTOMERS'
              ? 'bg-emerald-700 text-white shadow-sm font-black'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Customer CRM ({customers.length})</span>
        </button>
      </div>

      {/* TAB 1: Receipts Archive Table */}
      {activeTab === 'RECEIPTS' && (
        <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-serif text-xl font-bold text-stone-900">Digital Receipts Archive</h3>
              <p className="text-xs text-stone-500 font-sans mt-0.5">
                Permanent receipts archive stored in SQLite DB
              </p>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[200px]">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search Receipt # or Table..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-trattoria-red"
                />
              </div>

              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700 focus:outline-none focus:border-trattoria-red"
                />
              </div>

              {(searchQuery || selectedDate) && (
                <button
                  onClick={() => { setSearchQuery(''); setSelectedDate(''); }}
                  className="text-xs text-stone-500 hover:text-stone-800 underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-sans">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/80 text-stone-500 uppercase tracking-wider font-bold text-[10px]">
                  <th className="py-3 px-4">Receipt #</th>
                  <th className="py-3 px-4">Table / Type</th>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Total Price</th>
                  <th className="py-3 px-4 text-center">Payment Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-stone-400">
                      Loading receipts database...
                    </td>
                  </tr>
                ) : receipts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-stone-400">
                      No receipts recorded. Ready for new customer orders.
                    </td>
                  </tr>
                ) : (
                  receipts.map((rec) => (
                    <tr key={rec.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                        {rec.receiptNumber}
                      </td>
                      <td className="py-3.5 px-4 font-bold">
                        {rec.type === 'TAKEOUT' || rec.type === 'TAKEAWAY' ? (
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] uppercase font-bold">
                            📦 Takeaway
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] uppercase font-bold">
                            🍽️ Table {rec.tableNo}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-stone-700">
                        {rec.customerName || 'Dine-In Customer'}
                      </td>
                      <td className="py-3.5 px-4 text-stone-500 font-mono text-[11px]">
                        {new Date(rec.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-stone-900">
                        ₹{rec.totalPrice}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleTogglePaymentStatus(rec.id, rec.orderId, rec.paymentStatus)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                            rec.paymentStatus === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          }`}
                        >
                          {rec.paymentStatus === 'PAID' ? '✓ Paid' : '⏳ Unpaid'}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedReceipt(rec)}
                            className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors"
                            title="View Digital Receipt"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handlePrintReceipt(rec)}
                            className="p-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg transition-colors"
                            title="Print Receipt"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Customer Contact Marketing Directory & Excel Export */}
      {activeTab === 'CUSTOMERS' && (
        <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <h3 className="font-serif text-xl font-bold text-stone-900">Customer Contacts Directory (Marketing CRM)</h3>
              </div>
              <p className="text-xs text-stone-500 font-sans mt-0.5">
                Saved customer names & mobile phone numbers collected during Dine-In and Takeaway checkout.
              </p>
            </div>

            <button
              onClick={handleExportCustomersExcel}
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-amber-300" />
              <span>Download Customer Excel Sheet (.CSV)</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-sans">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/80 text-stone-500 uppercase tracking-wider font-bold text-[10px]">
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Mobile Phone Number</th>
                  <th className="py-3 px-4 text-center">Total Orders Placed</th>
                  <th className="py-3 px-4 text-right">Total Spent (₹ INR)</th>
                  <th className="py-3 px-4">Last Visit Date</th>
                  <th className="py-3 px-4 text-center">Order Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-stone-400">
                      No customer contacts recorded. Customers entering their Name & Phone will appear here.
                    </td>
                  </tr>
                ) : (
                  customers.map((c, idx) => (
                    <tr key={idx} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-stone-900">
                        {c.name}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                        {c.phone}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold">
                        {c.totalOrders} visits
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-stone-900">
                        ₹{c.totalSpent.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-stone-500">
                        {new Date(c.lastVisit).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          c.lastType === 'DINE_IN' ? 'bg-amber-50 text-amber-800' : 'bg-blue-50 text-blue-700'
                        }`}>
                          {c.lastType === 'DINE_IN' ? 'Dine-In' : 'Takeaway'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONFIRM SYSTEM RESET & EXPORT BACKUP MODAL */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-[5000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl max-w-md w-full p-6 text-stone-900 shadow-2xl relative">
            <button
              onClick={() => setIsResetModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-800 hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 bg-red-100 text-trattoria-red rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h3 className="font-serif text-2xl font-black text-center text-stone-900">
              Reset System & Start Fresh?
            </h3>
            <p className="text-xs text-stone-600 text-center mt-2 leading-relaxed font-sans">
              Before resetting all active orders and sales history to <strong>0</strong>, a complete Excel backup file (<strong className="font-mono text-emerald-700">pizzoo_full_sales_backup.csv</strong>) will be automatically downloaded to your device so no data is lost.
            </p>

            <div className="mt-6 space-y-3 font-sans">
              <button
                onClick={handleConfirmSystemReset}
                className="w-full bg-trattoria-red hover:bg-trattoria-redHover text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-red-glow transition-all"
              >
                <Download className="w-4 h-4 text-amber-300" />
                <span>Download Excel Backup & Reset Data to 0</span>
              </button>

              <button
                onClick={() => setIsResetModalOpen(false)}
                className="w-full bg-stone-100 hover:bg-stone-200 text-stone-700 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Digital Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-[4000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl max-w-md w-full p-6 text-stone-900 shadow-2xl relative">
            <button
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-800 hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center pb-4 border-b border-dashed border-stone-300">
              <span className="text-[10px] tracking-widest text-trattoria-red uppercase font-bold block mb-1">
                Pizzoo Italian Pizzeria Receipt
              </span>
              <h3 className="font-serif text-2xl font-black">Receipt #{selectedReceipt.receiptNumber}</h3>
              <p className="text-xs text-stone-500 mt-0.5">
                {new Date(selectedReceipt.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="py-4 space-y-3 font-sans text-xs">
              <div className="flex justify-between py-1 bg-stone-50 px-3 rounded-xl">
                <span className="text-stone-500 font-medium">Order Type / Table:</span>
                <span className="font-bold">
                  {selectedReceipt.type === 'TAKEOUT' || selectedReceipt.type === 'TAKEAWAY' ? 'Takeaway' : `Table ${selectedReceipt.tableNo}`}
                </span>
              </div>

              <div className="flex justify-between py-1 bg-stone-50 px-3 rounded-xl">
                <span className="text-stone-500 font-medium">Payment Status:</span>
                <button
                  onClick={() => handleTogglePaymentStatus(selectedReceipt.id, selectedReceipt.orderId, selectedReceipt.paymentStatus)}
                  className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                    selectedReceipt.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {selectedReceipt.paymentStatus} (Click to toggle)
                </button>
              </div>

              <div className="border-t border-stone-100 pt-3">
                <span className="font-bold text-stone-700 block mb-2">Order Items:</span>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedReceipt.items.map((it, idx) => (
                    <div key={idx} className="p-2 rounded-xl bg-stone-50 border border-stone-100">
                      <div className="flex justify-between font-bold text-stone-900">
                        <span>{it.quantity}x {it.name} ({it.size || 'Standard'})</span>
                        <span className="font-mono">₹{it.subtotal || (it.price * it.quantity)}</span>
                      </div>
                      {it.crust && it.crust !== '-' && (
                        <p className="text-[10px] text-stone-500 mt-0.5">• Crust: {it.crust}</p>
                      )}
                      {it.toppings && it.toppings.length > 0 && (
                        <p className="text-[10px] text-stone-500">• Toppings: {it.toppings.join(', ')}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-dashed border-stone-300 pt-3 flex justify-between items-center text-sm font-black font-serif">
                <span>Total Amount:</span>
                <span className="text-lg font-mono text-trattoria-red">₹{selectedReceipt.totalPrice}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
              <button
                onClick={() => handlePrintReceipt(selectedReceipt)}
                className="w-full bg-stone-900 hover:bg-stone-800 text-white py-3 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Digital Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
