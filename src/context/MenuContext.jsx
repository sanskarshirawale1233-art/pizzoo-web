import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const MenuContext = createContext(null);

export const MenuProvider = ({ children }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch initial menu items from API
  const fetchMenu = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/menu');
      if (!res.ok) throw new Error('Failed to fetch menu');
      const data = await res.json();
      setMenuItems(data);
      setError(null);
    } catch (err) {
      console.error('Error loading menu from DB:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu();

    // Subscribe to Real-Time SSE Events
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

      eventSource.onerror = (err) => {
        console.warn('SSE connection error in MenuContext, fallback polling active.');
      };
    } catch (e) {
      console.warn('SSE not supported or error:', e);
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [fetchMenu]);

  // 1. Add Item
  const addMenuItem = async (itemData) => {
    try {
      const res = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
      });
      if (!res.ok) throw new Error('Failed to create menu item');
      const newItem = await res.json();
      await fetchMenu();
      return newItem;
    } catch (err) {
      console.error('Error adding menu item:', err);
      throw err;
    }
  };

  // 2. Update Item
  const updateMenuItem = async (id, itemData) => {
    try {
      const res = await fetch(`/api/menu/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
      });
      if (!res.ok) throw new Error('Failed to update menu item');
      const updated = await res.json();
      await fetchMenu();
      return updated;
    } catch (err) {
      console.error('Error updating menu item:', err);
      throw err;
    }
  };

  // 3. Toggle Availability (Sold Out state)
  const toggleAvailability = async (id, isAvailable) => {
    try {
      const res = await fetch(`/api/menu/${id}/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: isAvailable })
      });
      if (!res.ok) throw new Error('Failed to update availability');
      await fetchMenu();
    } catch (err) {
      console.error('Error toggling availability:', err);
      throw err;
    }
  };

  // 4. Delete Item
  const deleteMenuItem = async (id) => {
    try {
      const res = await fetch(`/api/menu/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete item');
      await fetchMenu();
    } catch (err) {
      console.error('Error deleting menu item:', err);
      throw err;
    }
  };

  // 5. Clear All Custom Added Menu Items
  const clearAllMenuItems = async () => {
    try {
      const res = await fetch('/api/menu/clear-all', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to clear menu items');
      await fetchMenu();
    } catch (err) {
      console.error('Error clearing all menu items:', err);
      throw err;
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
    deleteMenuItem
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
