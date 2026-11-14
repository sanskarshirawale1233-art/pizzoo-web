import React, { createContext, useContext, useState, useEffect } from 'react';
import { useKds } from './KdsContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [tableId, setTableId] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeOrderTracker, setActiveOrderTracker] = useState(null);
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);
  const [toastNotification, setToastNotification] = useState(null);

  const { addOrder, allOrders } = useKds();

  // Dynamically extract tableId from URL path or query parameters
  useEffect(() => {
    const handleUrlDetection = () => {
      const pathname = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);

      const tableMatch = pathname.match(/\/table\/([^\/]+)/i);
      if (tableMatch && tableMatch[1]) {
        setTableId(tableMatch[1]);
      } else if (searchParams.get('table')) {
        setTableId(searchParams.get('table'));
      }
    };

    handleUrlDetection();
    window.addEventListener('popstate', handleUrlDetection);
    return () => window.removeEventListener('popstate', handleUrlDetection);
  }, []);

  // Update active order tracker state from KDS context updates
  useEffect(() => {
    if (activeOrderTracker?.id) {
      const updatedOrder = allOrders.find(o => o.id === activeOrderTracker.id);
      if (updatedOrder) {
        setActiveOrderTracker(updatedOrder);
      }
    }
  }, [allOrders, activeOrderTracker?.id]);

  const addToCart = (item) => {
    setCart((prevCart) => {
      const cartItemId = item.cartItemId || `${item.id}-${item.size || 'default'}-${item.crust || ''}-${Date.now()}`;
      return [...prevCart, { ...item, cartItemId, quantity: item.quantity || 1 }];
    });

    setToastNotification(`Added "${item.name}" to basket!`);
    setTimeout(() => setToastNotification(null), 3000);
  };

  const removeFromCart = (cartItemId) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const clearCart = () => setCart([]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Submit complete checkout order (Name, Mobile, Email, Dine-In / Takeaway)
  const submitCheckoutOrder = async ({ customerName, phone, email = '', orderType = 'DINE_IN', customerNotes = '' }) => {
    if (cart.length === 0) return null;

    const currentCart = [...cart];
    const currentSubtotal = subtotal;

    const orderPayload = {
      tableNo: orderType === 'DINE_IN' ? 'DINE-IN' : 'TAKEAWAY',
      type: orderType,
      customerName: customerName.trim() || 'Customer',
      phone: phone.trim() || '',
      email: email.trim() || '',
      notes: customerNotes,
      totalAmount: currentSubtotal,
      items: currentCart.map(i => ({
        name: i.name,
        size: i.size || 'Standard',
        crust: i.crust || 'Neapolitan Thin',
        sauceLevel: i.sauceLevel || 'Normal',
        toppings: i.toppings || [],
        quantity: i.quantity,
        price: i.price
      }))
    };

    try {
      const createdOrder = await addOrder(orderPayload);
      setActiveOrderTracker(createdOrder);
      clearCart();
      setIsCartOpen(false);
      return createdOrder;
    } catch (err) {
      console.error('API submit failed, creating local tracker fallback:', err);
      const fallbackOrder = {
        id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: orderPayload.customerName,
        phone: orderPayload.phone,
        email: orderPayload.email,
        type: orderPayload.type,
        totalAmount: currentSubtotal,
        items: orderPayload.items,
        status: 'RECEIVED',
        isPaid: false,
        createdAt: new Date().toISOString()
      };
      setActiveOrderTracker(fallbackOrder);
      clearCart();
      setIsCartOpen(false);
      return fallbackOrder;
    }
  };

  // Submit Call-to-Order (Takeout)
  const submitCallOrder = async (customerNotes = '', customerName = '', phone = '') => {
    if (cart.length === 0) return;

    const currentCart = [...cart];
    const currentSubtotal = subtotal;

    const orderPayload = {
      tableNo: 'TAKEOUT',
      type: 'TAKEOUT',
      customerName: customerName.trim() || 'Asporto (Phone Order)',
      phone: phone.trim() || '',
      notes: customerNotes || 'Call-to-Order via Telephone',
      totalAmount: currentSubtotal,
      items: currentCart.map(i => ({
        name: i.name,
        size: i.size || 'Standard',
        crust: i.crust || 'Thin',
        quantity: i.quantity,
        price: i.price
      }))
    };

    try {
      const createdOrder = await addOrder(orderPayload);
      setActiveOrderTracker(createdOrder);
    } catch (e) {}

    clearCart();
    setIsCartOpen(false);

    window.location.href = 'tel:7738009029';
  };

  const value = {
    cart,
    tableId,
    setTableId,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    submitCheckoutOrder,
    submitCallOrder,
    activeOrderTracker,
    setActiveOrderTracker,
    isUpiModalOpen,
    setIsUpiModalOpen,
    toastNotification,
    setToastNotification
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
