import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { INITIAL_MENU_ITEMS } from '../data/initialMenuItems';

const MenuContext = createContext(null);

const normalizeMenuItem = (item) => {
  let ingredients = item.ingredients;
  if (typeof ingredients === 'string') {
    try {
      ingredients = JSON.parse(ingredients);
    } catch {
      ingredients = ingredients.split(',').map(s => s.trim()).filter(Boolean);
    }
  }

  let tags = item.tags;
  if (typeof tags === 'string') {
    try {
      tags = JSON.parse(tags);
    } catch {
      tags = tags.split(',').map(s => s.trim()).filter(Boolean);
    }
  }

  return {
    ...item,
    ingredients: Array.isArray(ingredients) ? ingredients : [],
    tags: Array.isArray(tags) ? tags : [],
    is_veg: item.is_veg === true || item.is_veg === 1 || item.is_veg === '1',
    is_available: item.is_available === true || item.is_available === 1 || item.is_available === '1' || item.is_available === undefined
  };
};

export const MenuProvider = ({ children }) => {
  const [menuItems, setMenuItems] = useState(INITIAL_MENU_ITEMS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Live Supabase Fetch
  const fetchMenu = useCallback(async () => {
    try {
      setLoading(true);

      if (supabase) {
        const { data, error: supaErr } = await supabase
          .from('menu_items')
          .select('*')
          .order('created_at', { ascending: false });

        if (!supaErr && Array.isArray(data)) {
          if (data.length > 0) {
            setMenuItems(data.map(normalizeMenuItem));
            setError(null);
            return;
          } else {
            // First time setup: auto-seed initial pizzas into Supabase
            try {
              await supabase.from('menu_items').upsert(INITIAL_MENU_ITEMS);
            } catch (seedErr) {
              console.warn('Auto-seed error:', seedErr);
            }
            setMenuItems(INITIAL_MENU_ITEMS);
            setError(null);
            return;
          }
        } else if (supaErr) {
          console.warn('Supabase fetch error, fallback to initial items:', supaErr);
        }
      }

      // Fallback to local API if running with express
      try {
        const res = await fetch('/api/menu');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setMenuItems(data.map(normalizeMenuItem));
            setError(null);
            return;
          }
        }
      } catch {
        // Express not running
      }

      setMenuItems(INITIAL_MENU_ITEMS);
    } catch (err) {
      console.warn('Menu fetch error:', err);
      setMenuItems(INITIAL_MENU_ITEMS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu();

    // Supabase Real-time Sync across all open browsers/devices
    if (supabase) {
      const channel = supabase
        .channel('menu_items_sync')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'menu_items' },
          () => {
            fetchMenu();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [fetchMenu]);

  // 1. Add Item
  const addMenuItem = async (itemData) => {
    const newItem = normalizeMenuItem({
      ...itemData,
      id: itemData.id || `item-${Date.now()}`,
      created_at: new Date().toISOString()
    });

    setMenuItems(prev => [newItem, ...prev]);

    if (supabase) {
      const { error: supaErr } = await supabase.from('menu_items').insert([newItem]);
      if (supaErr) {
        console.error('Supabase addMenuItem error:', supaErr);
        // Retry with upsert
        await supabase.from('menu_items').upsert([newItem]);
      }
    }

    try {
      await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });
    } catch {}

    return newItem;
  };

  // 2. Update Item
  const updateMenuItem = async (id, itemData) => {
    let updatedItem = null;

    setMenuItems(prev => {
      return prev.map(item => {
        if (item.id === id) {
          updatedItem = normalizeMenuItem({ ...item, ...itemData });
          return updatedItem;
        }
        return item;
      });
    });

    if (supabase) {
      const { error: supaErr } = await supabase
        .from('menu_items')
        .update(itemData)
        .eq('id', id);

      if (supaErr) {
        console.error('Supabase updateMenuItem error:', supaErr);
      }
    }

    try {
      await fetch(`/api/menu/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
      });
    } catch {}

    return updatedItem;
  };

  // 3. Toggle Availability (Sold Out state)
  const toggleAvailability = async (id, isAvailable) => {
    setMenuItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, is_available: Boolean(isAvailable) } : item
      )
    );

    if (supabase) {
      await supabase
        .from('menu_items')
        .update({ is_available: Boolean(isAvailable) })
        .eq('id', id);
    }

    try {
      await fetch(`/api/menu/${id}/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: Boolean(isAvailable) })
      });
    } catch {}
  };

  // 4. Delete Item
  const deleteMenuItem = async (id) => {
    setMenuItems(prev => prev.filter(item => item.id !== id));

    if (supabase) {
      const { error: supaErr } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (supaErr) {
        console.error('Supabase deleteMenuItem error:', supaErr);
      }
    }

    try {
      await fetch(`/api/menu/${id}`, { method: 'DELETE' });
    } catch {}
  };

  // 5. Reset to Default Uploaded Pizzas
  const resetToDefaultMenu = async () => {
    setMenuItems(INITIAL_MENU_ITEMS);

    if (supabase) {
      try {
        await supabase.from('menu_items').upsert(INITIAL_MENU_ITEMS);
      } catch (e) {
        console.warn('Supabase reset error:', e);
      }
    }
  };

  // 6. Clear All Custom Added Menu Items
  const clearAllMenuItems = async () => {
    setMenuItems([]);

    if (supabase) {
      try {
        await supabase.from('menu_items').delete().neq('id', '');
      } catch (e) {
        console.warn('Supabase clear error:', e);
      }
    }
  };

  // Category Helpers
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

  const antipasti = menuItems.filter(i => 
    i.category.toLowerCase().includes('antipasti') || 
    i.category.toLowerCase().includes('fries') || 
    i.category.toLowerCase().includes('side')
  );

  const dolciAndBevande = menuItems.filter(i => 
    i.category.toLowerCase().includes('dolci') || 
    i.category.toLowerCase().includes('bevande') || 
    i.category.toLowerCase().includes('drink') || 
    i.category.toLowerCase().includes('dessert')
  );

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
