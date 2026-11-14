import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('pizzoo_cart');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [tableId, setTableId] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastNotification, setToastNotification] = useState(null);

  // Persist cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pizzoo_cart', JSON.stringify(cart));
    } catch (e) {}
  }, [cart]);

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

  const clearCart = () => {
    setCart([]);
    try {
      localStorage.removeItem('pizzoo_cart');
    } catch (e) {}
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
