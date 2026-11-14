import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSupabase } from '../lib/supabase';
import { INITIAL_MENU_ITEMS } from '../data/initialMenuItems';

const MenuContext = createContext(null);
const LOCAL_STORAGE_KEY = 'pizzoo_menu_items';

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
    id: String(item.id),
    ingredients: Array.isArray(ingredients) ? ingredients : [],
    tags: Array.isArray(tags) ? tags : [],
    is_veg: item.is_veg === true || item.is_veg === 1 || item.is_veg === '1',
    is_available: item.is_available === true || item.is_available === 1 || item.is_available === '1' || item.is_available === undefined
  };
};

const prepareForSupabase = (item) => ({
  id: String(item.id),
  name: String(item.name || ''),
  italian_title: item.italian_title || '',
  category: String(item.category || 'Veg Pizzas / Classic Veg'),
  price_reg: Number(item.price_reg) || 0,
  price_med: Number(item.price_med) || 0,
  price_lrg: Number(item.price_lrg) || 0,
  description: item.description || '',
  image_url: item.image_url || '',
  ingredients: Array.isArray(item.ingredients) ? item.ingredients : [],
  tags: Array.isArray(item.tags) ? item.tags : [],
  is_veg: item.is_veg ? 1 : 0,
  is_available: item.is_available ? 1 : 0,
  created_at: item.created_at || new Date().toISOString()
});

const saveToLocal = (items) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
};

export const MenuProvider = ({ children }) => {
  // 1. Initial State: Always load from localStorage immediately to prevent wipeouts on refresh
  const [menuItems, setMenuItems] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(normalizeMenuItem);
        }
      }
    } catch (e) {
      console.warn('Failed to parse localStorage menu:', e);
    }
    return INITIAL_MENU_ITEMS;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 2. Live Supabase Fetch & Sync
  const fetchMenu = useCallback(async () => {
    try {
      setLoading(true);
      const sb = getSupabase();

      if (sb) {
        const { data, error: supaErr } = await sb
          .from('menu_items')
          .select('*')
          .order('created_at', { ascending: false });

        if (!supaErr && Array.isArray(data)) {
          if (data.length > 0) {
            const normalized = data.map(normalizeMenuItem);
            setMenuItems(normalized);
            saveToLocal(normalized);
            setError(null);
            return;
          } else {
            // First time setup on empty Supabase table: seed current items
            try {
              const current = (menuItems && menuItems.length > 0) ? menuItems : INITIAL_MENU_ITEMS;
              await sb.from('menu_items').upsert(current.map(prepareForSupabase));
            } catch (seedErr) {
              console.warn('Auto-seed error:', seedErr);
            }
          }
        } else if (supaErr) {
          console.warn('Supabase fetch error:', supaErr.message || supaErr);
        }
      }

      // Check localStorage fallback so user changes are never deleted on refresh
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMenuItems(parsed.map(normalizeMenuItem));
            return;
          }
        }
      } catch {}

      // Final default fallback
      setMenuItems(INITIAL_MENU_ITEMS);
      saveToLocal(INITIAL_MENU_ITEMS);
    } catch (err) {
      console.warn('Menu fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [menuItems]);

  useEffect(() => {
    fetchMenu();

    // Supabase Real-time Sync across all open browsers/devices
    const sb = getSupabase();
    if (sb) {
      try {
        const channel = sb
          .channel('menu_items_live_sync')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'menu_items' },
            () => {
              fetchMenu();
            }
          )
          .subscribe();

        return () => {
          sb.removeChannel(channel);
        };
      } catch {}
    }
  }, [fetchMenu]);

  // Push all local items to Supabase (manual trigger / bulk sync)
  const syncAllToSupabase = async () => {
    const sb = getSupabase();
    if (!sb) {
      return { success: false, error: 'Supabase client not configured' };
    }

    try {
      const itemsToSync = (menuItems && menuItems.length > 0) ? menuItems : INITIAL_MENU_ITEMS;
      const { error: supaErr } = await sb
        .from('menu_items')
        .upsert(itemsToSync.map(prepareForSupabase));

      if (supaErr) {
        return { success: false, error: supaErr.message || JSON.stringify(supaErr) };
      }

      return { success: true, count: itemsToSync.length };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // 1. Add Item
  const addMenuItem = async (itemData) => {
    const newItem = normalizeMenuItem({
      ...itemData,
      id: itemData.id || `item-${Date.now()}`,
      created_at: new Date().toISOString()
    });

    setMenuItems(prev => {
      const updated = [newItem, ...prev.filter(i => i.id !== newItem.id)];
      saveToLocal(updated);
      return updated;
    });

    const sb = getSupabase();
    if (sb) {
      try {
        const payload = prepareForSupabase(newItem);
        const { error: supaErr } = await sb.from('menu_items').upsert([payload]);
        if (supaErr) {
          console.warn('Supabase add error:', supaErr);
        }
      } catch (err) {
        console.warn('Supabase add network error:', err);
      }
    }

    return newItem;
  };

  // 2. Update Item
  const updateMenuItem = async (id, itemData) => {
    let updatedItem = null;

    setMenuItems(prev => {
      const updated = prev.map(item => {
        if (item.id === id) {
          updatedItem = normalizeMenuItem({ ...item, ...itemData });
          return updatedItem;
        }
        return item;
      });
      saveToLocal(updated);
      return updated;
    });

    const sb = getSupabase();
    if (sb && updatedItem) {
      try {
        const payload = prepareForSupabase(updatedItem);
        await sb.from('menu_items').upsert([payload]);
      } catch (err) {
        console.warn('Supabase update error:', err);
      }
    }

    return updatedItem;
  };

  // 3. Toggle Availability (Sold Out state)
  const toggleAvailability = async (id, isAvailable) => {
    setMenuItems(prev => {
      const updated = prev.map(item =>
        item.id === id ? { ...item, is_available: Boolean(isAvailable) } : item
      );
      saveToLocal(updated);
      return updated;
    });

    const sb = getSupabase();
    if (sb) {
      try {
        await sb
          .from('menu_items')
          .update({ is_available: isAvailable ? 1 : 0 })
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase toggle error:', err);
      }
    }
  };

  // 4. Delete Item
  const deleteMenuItem = async (id) => {
    setMenuItems(prev => {
      const updated = prev.filter(item => item.id !== id);
      saveToLocal(updated);
      return updated;
    });

    const sb = getSupabase();
    if (sb) {
      try {
        await sb.from('menu_items').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete error:', err);
      }
    }
  };

  // 5. Reset to Default Uploaded Pizzas
  const resetToDefaultMenu = async () => {
    setMenuItems(INITIAL_MENU_ITEMS);
    saveToLocal(INITIAL_MENU_ITEMS);

    const sb = getSupabase();
    if (sb) {
      try {
        await sb.from('menu_items').upsert(INITIAL_MENU_ITEMS.map(prepareForSupabase));
      } catch (e) {
        console.warn('Supabase reset error:', e);
      }
    }
  };

  // 6. Clear All Custom Added Menu Items
  const clearAllMenuItems = async () => {
    setMenuItems([]);
    saveToLocal([]);

    const sb = getSupabase();
    if (sb) {
      try {
        await sb.from('menu_items').delete().neq('id', '');
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
    clearAllMenuItems,
    syncAllToSupabase
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
