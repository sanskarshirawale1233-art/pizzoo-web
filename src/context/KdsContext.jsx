import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { playKdsOrderChime } from '../utils/soundEffects';

const KdsContext = createContext(null);

export const KdsProvider = ({ children }) => {
  // Load cached orders from localStorage for instant React rendering
  const [orders, setOrders] = useState(() => {
    try {
      const cached = localStorage.getItem('pizzoo_orders_cache');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });

  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'DINE_IN' | 'TAKEOUT'
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync state to localStorage cache
  useEffect(() => {
    try {
      localStorage.setItem('pizzoo_orders_cache', JSON.stringify(orders));
    } catch (e) {}
  }, [orders]);

  // Audio Chime Player
  const triggerAudioChime = useCallback(() => {
    if (soundEnabled) {
      try {
        playKdsOrderChime();
      } catch (e) {
        console.warn('Audio play error:', e);
      }
    }
  }, [soundEnabled]);

  // Fetch orders from backend API
  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error('Failed to fetch orders from backend');
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching orders from server API:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Subscribe to Real-Time SSE Stream & Polling fallback
  useEffect(() => {
    fetchOrders();

    let eventSource;
    try {
      eventSource = new EventSource('/api/events');

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'NEW_ORDER') {
            if (data.payload && data.payload.id) {
              setOrders(prev => {
                if (prev.some(o => o.id === data.payload.id)) return prev;
                return [data.payload, ...prev];
              });
            }
            fetchOrders();
            triggerAudioChime();
          } else if (data.type === 'UPDATE_ORDER' || data.type === 'CONFIRM_PAYMENT') {
            if (data.payload && data.payload.orders) {
              setOrders(data.payload.orders);
            } else {
              fetchOrders();
            }
          }
        } catch (e) {
          console.warn('SSE message error:', e);
        }
      };

      eventSource.onerror = () => {
        // SSE connection interrupted
      };
    } catch (e) {
      console.warn('EventSource error:', e);
    }

    // Interval polling backup every 3 seconds for resilience
    const intervalId = setInterval(() => {
      fetchOrders();
    }, 3000);

    return () => {
      if (eventSource) eventSource.close();
      clearInterval(intervalId);
    };
  }, [fetchOrders, triggerAudioChime]);

  // 1. Submit Order (Called from Table QR, Takeout, or Customer Checkout)
  const addOrder = useCallback(async (orderData) => {
    const tempId = orderData.id || `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const tempOrder = {
      id: tempId,
      tableNo: orderData.tableNo || 'COUNTER',
      type: orderData.type || 'DINE_IN',
      customerName: orderData.customerName || 'Customer',
      phone: orderData.phone || '',
      email: orderData.email || '',
      notes: orderData.notes || '',
      totalAmount: orderData.totalAmount || 0,
      isPaid: true,
      status: 'RECEIVED',
      createdAt: new Date().toISOString(),
      items: orderData.items || []
    };

    // Optimistic local React state update
    setOrders(prev => [tempOrder, ...prev.filter(o => o.id !== tempId)]);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (!res.ok) throw new Error('Failed to submit order');
      const createdOrder = await res.json();

      // Replace temp order with actual DB created order
      setOrders(prev => [createdOrder, ...prev.filter(o => o.id !== tempId && o.id !== createdOrder.id)]);
      
      triggerAudioChime();
      return createdOrder;
    } catch (err) {
      console.warn('Backend API connection warning, retained order in local state:', err);
      triggerAudioChime();
      return tempOrder;
    }
  }, [triggerAudioChime]);

  // 2. Advance Status: RECEIVED -> IN_OVEN -> READY -> SERVED
  const advanceOrderStatus = useCallback(async (orderId) => {
    const statusFlow = ['RECEIVED', 'IN_OVEN', 'READY', 'SERVED'];
    const currentOrder = orders.find(o => o.id === orderId);
    if (!currentOrder) return;

    const currentIndex = statusFlow.indexOf(currentOrder.status);
    const nextStatus = statusFlow[currentIndex + 1] || currentOrder.status;

    // Optimistic React update
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));

    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (!res.ok) throw new Error('Failed to update status');
      await fetchOrders();
    } catch (err) {
      console.error('Error advancing status:', err);
    }
  }, [orders, fetchOrders]);

  // 3. Revert Status
  const revertOrderStatus = useCallback(async (orderId) => {
    const statusFlow = ['RECEIVED', 'IN_OVEN', 'READY', 'SERVED'];
    const currentOrder = orders.find(o => o.id === orderId);
    if (!currentOrder) return;

    const currentIndex = statusFlow.indexOf(currentOrder.status);
    const prevStatus = currentIndex > 0 ? statusFlow[currentIndex - 1] : currentOrder.status;

    // Optimistic React update
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: prevStatus } : o));

    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: prevStatus })
      });
      if (!res.ok) throw new Error('Failed to revert status');
      await fetchOrders();
    } catch (err) {
      console.error('Error reverting status:', err);
    }
  }, [orders, fetchOrders]);

  // 4. Confirm Counter Payment & Start Baking
  const confirmCounterPayment = useCallback(async (orderId) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, isPaid: true, status: 'IN_OVEN' } : o));

    try {
      const res = await fetch(`/api/orders/${orderId}/confirm-payment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error('Failed to confirm counter payment');
      await fetchOrders();
    } catch (err) {
      console.error('Error confirming counter payment:', err);
    }
  }, [fetchOrders]);

  // 5. Mark Paid / Unpaid
  const markOrderPaid = useCallback(async (orderId, isPaid = true) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, isPaid } : o));

    try {
      const res = await fetch(`/api/orders/${orderId}/pay`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPaid })
      });
      if (!res.ok) throw new Error('Failed to update payment status');
      await fetchOrders();
    } catch (err) {
      console.error('Error marking paid:', err);
    }
  }, [fetchOrders]);

  // 6. Archive / Delete Order
  const archiveOrder = useCallback(async (orderId) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));

    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete order');
      await fetchOrders();
    } catch (err) {
      console.error('Error deleting order:', err);
    }
  }, [fetchOrders]);

  // Filtered orders list
  const filteredOrders = orders.filter((order) => {
    if (!order) return false;
    if (filter === 'DINE_IN') return order.type === 'DINE_IN';
    if (filter === 'TAKEOUT') return order.type === 'TAKEOUT' || order.type === 'TAKEAWAY' || order.type === 'COUNTER';
    return true;
  });

  const value = {
    orders: filteredOrders,
    rawOrdersCount: orders.length,
    allOrders: orders,
    filter,
    setFilter,
    soundEnabled,
    setSoundEnabled,
    loading,
    error,
    addOrder,
    advanceOrderStatus,
    revertOrderStatus,
    confirmCounterPayment,
    markOrderPaid,
    archiveOrder,
    refetchOrders: fetchOrders
  };

  return <KdsContext.Provider value={value}>{children}</KdsContext.Provider>;
};

export const useKds = () => {
  const context = useContext(KdsContext);
  if (!context) {
    throw new Error('useKds must be used within a KdsProvider');
  }
  return context;
};
