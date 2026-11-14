import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { INITIAL_MENU_ITEMS } from '../data/initialMenuItems';

const MenuContext = createContext(null);
const LOCAL_STORAGE_KEY = 'pizzoo_menu_items';

export const MenuProvider = ({ children }) => {
  // Initialize from localStorage or fallback to seeded INITIAL_MENU_ITEMS
  const [menuItems, setMenuItems] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse localStorage menu:', e);
    }
    return INITIAL_MENU_ITEMS;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper to persist to localStorage
  const saveToLocal = (items) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save menu to localStorage:', e);
    }
  };

  // Fetch menu items from API (if backend is available, e.g. localhost)
  const fetchMenu = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/menu');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setMenuItems(data);
          saveToLocal(data);
          setError(null);
          return;
        }
      }
    } catch (err) {
      // Backend not running (Vercel static deploy or offline) - safe fallback
      console.log('Running in client/static mode. Using local/cached menu items.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu();

    // Subscribe to Real-Time SSE Events if server exists
    let eventSource;
    try {
      eventSource = new EventSource('/api/events');

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'UPDATE_MENU') {
            fetchMenu();
          }
        } catch (e) {
          console.warn('SSE parse error:', e);
        }
      };

      eventSource.onerror = () => {
        // SSE disconnected / static mode - close gracefully
        if (eventSource) eventSource.close();
      };
    } catch (e) {
      // SSE not available
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [fetchMenu]);

  // 1. Add Item
  const addMenuItem = async (itemData) => {
    const newItem = {
      ...itemData,
      id: itemData.id || `item-${Date.now()}`,
      created_at: new Date().toISOString()
    };

    setMenuItems(prev => {
      const updated = [newItem, ...prev];
      saveToLocal(updated);
      return updated;
    });

    // Try API if available
    try {
      await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });
    } catch (err) {
      console.log('Item saved locally in browser storage.');
    }

    return newItem;
  };

  // 2. Update Item
  const updateMenuItem = async (id, itemData) => {
    let updatedItem = null;
    setMenuItems(prev => {
      const updated = prev.map(item => {
        if (item.id === id) {
          updatedItem = { ...item, ...itemData };
          return updatedItem;
        }
        return item;
      });
      saveToLocal(updated);
      return updated;
    });

    try {
      await fetch(`/api/menu/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
      });
    } catch (err) {
      console.log('Item updated locally in browser storage.');
    }

    return updatedItem;
  };

  // 3. Toggle Availability (Sold Out state)
  const toggleAvailability = async (id, isAvailable) => {
    setMenuItems(prev => {
      const updated = prev.map(item => 
        item.id === id ? { ...item, is_available: isAvailable ? 1 : 0 } : item
      );
      saveToLocal(updated);
      return updated;
    });

    try {
      await fetch(`/api/menu/${id}/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: isAvailable })
      });
    } catch (err) {
      console.log('Availability toggled locally.');
    }
  };

  // 4. Delete Item
  const deleteMenuItem = async (id) => {
    setMenuItems(prev => {
      const updated = prev.filter(item => item.id !== id);
      saveToLocal(updated);
      return updated;
    });

    try {
      await fetch(`/api/menu/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.log('Item deleted locally.');
    }
  };

  // 5. Reset to Default Uploaded Pizzas
  const resetToDefaultMenu = () => {
    setMenuItems(INITIAL_MENU_ITEMS);
    saveToLocal(INITIAL_MENU_ITEMS);
  };

  // 6. Clear All Custom Added Menu Items
  const clearAllMenuItems = async () => {
    setMenuItems([]);
    saveToLocal([]);

    try {
      await fetch('/api/menu/clear-all', { method: 'POST' });
    } catch (err) {
      console.log('Cleared locally.');
    }
  };

  // Filtered helpers for pizza and side categories
  const isNonPizzaCategory = (cat = '') => {
    const c = cat.toLowerCase();
    return c.includes('fries') || c.includes('momo') || c.includes('drink') || c.includes('bevande') || c.includes('dolci') || c.includes('dessert') || c.includes('burger');
  };

  const vegPizzas = menuItems.filter(i => 
    Boolean(i.is_veg) && 
    !i.category.toLowerCase().includes('non-veg') && 
    !isNonPizzaCategory(i.category)
  );

  const nonVegPizzas = menuItems.filter(i => 
    (!i.is_veg || i.category.toLowerCase().includes('non-veg')) && 
    !isNonPizzaCategory(i.category)
  );

  const antipasti = menuItems.filter(i => i.category.toLowerCase().includes('antipasti') || i.category.toLowerCase().includes('fries') || i.category.toLowerCase().includes('side'));
  const dolciAndBevande = menuItems.filter(i => i.category.toLowerCase().includes('dolci') || i.category.toLowerCase().includes('bevande') || i.category.toLowerCase().includes('drink') || i.category.toLowerCase().includes('dessert'));

  const value = {
    menuItems,
    vegPizzas,
    nonVegPizzas,
    antipasti,
    dolciAndBevande,
    loading,
    error,
    refetchMenu: fetchMenu,
    addMenuItem,
    updateMenuItem,
    toggleAvailability,
    deleteMenuItem,
    resetToDefaultMenu,
    clearAllMenuItems
  };

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
};

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
};
