import React, { useState } from 'react';
import { useMenu } from '../context/MenuContext';
import { isSupabaseConfigured, getSupabaseConfig, updateSupabaseConfig } from '../lib/supabase';
import { 
  Plus, Edit3, Trash2, CheckCircle2, XCircle, Upload, 
  Search, UtensilsCrossed, Image as ImageIcon, Sparkles, AlertCircle, Save, X, Laptop, Cloud, Database, RefreshCw,
  Copy, Check, Code
} from 'lucide-react';

const SUPABASE_SETUP_SQL = `-- Run this in Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS public.menu_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  italian_title TEXT,
  category TEXT,
  price_reg NUMERIC DEFAULT 0,
  price_med NUMERIC DEFAULT 0,
  price_lrg NUMERIC DEFAULT 0,
  description TEXT,
  image_url TEXT,
  ingredients JSONB DEFAULT '[]'::jsonb,
  tags JSONB DEFAULT '[]'::jsonb,
  is_veg BOOLEAN DEFAULT true,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.menu_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.menu_items FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.menu_items FOR DELETE USING (true);`;

export const AdminMenuManager = () => {
  const { menuItems, addMenuItem, updateMenuItem, toggleAvailability, deleteMenuItem, resetToDefaultMenu, syncAllToSupabase, loading } = useMenu();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Supabase Sync State
  const [isSupaModalOpen, setIsSupaModalOpen] = useState(false);
  const [supaConfig, setSupaConfig] = useState(getSupabaseConfig());
  const [supaUrlInput, setSupaUrlInput] = useState(supaConfig.url || '');
  const [supaKeyInput, setSupaKeyInput] = useState(supaConfig.key || '');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    italian_title: '',
    category: 'Le Nostre Pizze (Veg)',
    price_reg: 190,
    price_med: 390,
    price_lrg: 580,
    description: '',
    image_url: '',
    ingredients_str: '',
    tags_str: '',
    is_veg: true,
    is_available: true
  });

  const resetForm = () => {
    setFormData({
      name: '',
      italian_title: '',
      category: 'Le Nostre Pizze (Veg)',
      price_reg: 190,
      price_med: 390,
      price_lrg: 580,
      description: '',
      image_url: '',
      ingredients_str: '',
      tags_str: '',
      is_veg: true,
      is_available: true
    });
    setEditingItem(null);
    setShowUrlInput(false);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      italian_title: item.italian_title || '',
      category: item.category || 'Le Nostre Pizze (Veg)',
      price_reg: item.price_reg || 0,
      price_med: item.price_med || 0,
      price_lrg: item.price_lrg || 0,
      description: item.description || '',
      image_url: item.image_url || '',
      ingredients_str: Array.isArray(item.ingredients) ? item.ingredients.join(', ') : '',
      tags_str: Array.isArray(item.tags) ? item.tags.join(', ') : '',
      is_veg: Boolean(item.is_veg),
      is_available: Boolean(item.is_available)
    });
    setShowUrlInput(Boolean(item.image_url && item.image_url.startsWith('http')));
    setIsModalOpen(true);
  };

  const handleImageFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const fileData = new FormData();
      fileData.append('image', file);

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: fileData
        });

        if (res.ok) {
          const data = await res.json();
          if (data.imageUrl) {
            setFormData(prev => ({ ...prev, image_url: data.imageUrl }));
            return;
          }
        }
      } catch (netErr) {
        // Backend upload not available (static host / Vercel), fall through to canvas compression
      }

      // Client-side HTML5 Canvas Image Compression Fallback (Max 600px width, 75% JPEG quality)
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 600;
          let width = img.width;
          let height = img.height;
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);
          setFormData(prev => ({ ...prev, image_url: compressedDataUrl }));
        };
        img.src = readerEvent.target.result;
      };
      reader.readAsDataURL(file);

    } catch (err) {
      console.error('Error uploading photo:', err);
      alert('Error processing photo: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter a menu item name');
      return;
    }

    const ingredients = formData.ingredients_str
      ? formData.ingredients_str.split(',').map(s => s.trim()).filter(Boolean)
      : [];
    
    const tags = formData.tags_str
      ? formData.tags_str.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const payload = {
      name: formData.name,
      italian_title: formData.italian_title,
      category: formData.category,
      price_reg: Number(formData.price_reg) || 0,
      price_med: Number(formData.price_med) || 0,
      price_lrg: Number(formData.price_lrg) || 0,
      description: formData.description,
      image_url: formData.image_url || 'https://images.unsplash.com/photo-1548365328-8c6db3220e4c?w=600',
      ingredients,
      tags,
      is_veg: formData.is_veg,
      is_available: formData.is_available
    };

    try {
      if (editingItem) {
        await updateMenuItem(editingItem.id, payload);
      } else {
        await addMenuItem(payload);
      }
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      alert('Failed to save menu item: ' + err.message);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from the database?`)) {
      try {
        await deleteMenuItem(id);
      } catch (err) {
        alert('Failed to delete item: ' + err.message);
      }
    }
  };

  const [copiedSql, setCopiedSql] = useState(false);
  const handleCopySql = () => {
    try {
      navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 3000);
    } catch {
      alert('Could not auto-copy. Please manually copy the SQL shown below.');
    }
  };

  const handleSaveSupabase = async (e) => {
    e.preventDefault();
    setIsSyncing(true);
    setSyncStatusMsg('');
    try {
      const configured = updateSupabaseConfig(supaUrlInput, supaKeyInput);
      setSupaConfig(getSupabaseConfig());

      if (configured) {
        const res = await syncAllToSupabase();
        if (res.success) {
          setSyncStatusMsg(`✅ Success! Synced ${res.count} menu items to Supabase.`);
        } else {
          setSyncStatusMsg(`⚠️ ${res.error}. Make sure "menu_items" table is created in Supabase SQL editor.`);
        }
      } else {
        setSyncStatusMsg('Supabase credentials cleared. Operating in local storage mode.');
      }
    } catch (err) {
      setSyncStatusMsg(`⚠️ Error: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleQuickSync = async () => {
    setIsSyncing(true);
    try {
      const res = await syncAllToSupabase();
      if (res.success) {
        setSyncStatusMsg(`✅ Synced ${res.count} items with Supabase!`);
      } else {
        setSyncStatusMsg(`⚠️ Sync issue: ${res.error}\n\nMake sure your Supabase table "menu_items" exists.`);
      }
    } catch (err) {
      setSyncStatusMsg(`⚠️ Error: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.italian_title && item.italian_title.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          item.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCat = selectedCategory === 'ALL' || item.category.includes(selectedCategory);
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-amber-500/10 border border-amber-500/20 p-5 rounded-3xl">
        <div>
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-6 h-6 text-trattoria-red" />
            <h2 className="font-serif text-2xl font-black text-stone-900">Gestione Menu & Prodotti</h2>
          </div>
          <p className="text-xs text-stone-600 font-sans tracking-wide mt-1">
            Real-time Menu Manager · Upload JPG/PNG photos directly from your laptop to save into database.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsSupaModalOpen(true)}
            className={`px-4 py-3 rounded-2xl text-xs font-bold border shadow-sm flex items-center gap-1.5 transition-all ${
              supaConfig.isConfigured
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
            }`}
            title="Configure Supabase Cloud Sync"
          >
            <Cloud className="w-4 h-4 text-emerald-600" />
            <span>{supaConfig.isConfigured ? '🟢 Supabase Synced' : '⚡ Connect Supabase'}</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm("Reload the original pizzas with their uploaded photos and sizes?")) {
                resetToDefaultMenu();
                alert("Menu reset to all 9 uploaded pizzas!");
              }
            }}
            className="bg-white hover:bg-stone-100 text-stone-800 px-4 py-3 rounded-2xl text-xs font-bold border border-stone-300 shadow-sm flex items-center gap-1.5 transition-all"
            title="Reload uploaded pizzas"
          >
            <span>🔄 Reload Uploaded Pizzas</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="bg-trattoria-red hover:bg-trattoria-redHover text-white px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Menu Item</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search pizza, pasta, drinks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-trattoria-red"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'All Items' },
            { id: 'Veg', label: 'Veg Pizze' },
            { id: 'Non-Veg', label: 'Non-Veg Pizze' },
            { id: 'Antipasti', label: 'Sides & Starters' },
            { id: 'Dolci', label: 'Drinks & Desserts' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold tracking-wider transition-all whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Cards Grid */}
      {loading && filteredItems.length === 0 ? (
        <div className="py-20 text-center text-stone-400 font-sans text-xs">
          Loading database menu items...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-16 text-center bg-white border border-stone-200 rounded-3xl p-8">
          <UtensilsCrossed className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <p className="font-serif text-lg text-stone-700 font-bold">No menu items found</p>
          <p className="text-xs text-stone-400 mt-1">Try resetting search filters or click "Add New Menu Item".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => (
            <div 
              key={item.id}
              className={`bg-white border rounded-2xl p-4 shadow-sm transition-all relative overflow-hidden flex flex-col justify-between ${
                !item.is_available ? 'opacity-65 border-amber-300 bg-amber-50/20' : 'border-stone-200 hover:border-trattoria-red/40'
              }`}
            >
              <div>
                {/* Header Image & Status Badge */}
                <div className="relative h-44 rounded-xl overflow-hidden mb-3 bg-stone-100 border border-stone-100">
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1548365328-8c6db3220e4c?w=600'}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1548365328-8c6db3220e4c?w=600';
                    }}
                  />
                  <div className="absolute top-2 right-2 flex gap-1.5">
                    {/* Availability Badge */}
                    <button
                      onClick={() => toggleAvailability(item.id, !item.is_available)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md backdrop-blur-md flex items-center gap-1 transition-all ${
                        item.is_available
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-600 text-white font-black'
                      }`}
                      title="Click to toggle Sold Out status"
                    >
                      {item.is_available ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> Available
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" /> Sold Out
                        </>
                      )}
                    </button>
                  </div>

                  <div className="absolute bottom-2 left-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide text-white shadow-sm ${
                      item.is_veg ? 'bg-emerald-700' : 'bg-red-700'
                    }`}>
                      {item.is_veg ? '🟢 Veg' : '🔴 Non-Veg'}
                    </span>
                  </div>
                </div>

                {/* Info Titles */}
                <div>
                  {item.italian_title && (
                    <span className="text-[11px] font-serif italic text-trattoria-red font-semibold block">
                      {item.italian_title}
                    </span>
                  )}
                  <h3 className="font-serif text-lg font-bold text-stone-900 leading-snug">{item.name}</h3>
                  <p className="text-xs text-stone-500 line-clamp-2 mt-1 font-body">{item.description}</p>
                </div>

                {/* Prices List */}
                <div className="mt-3 py-2 border-y border-stone-100 flex items-center justify-between text-xs font-mono font-bold text-stone-800">
                  <span>
                    Reg: <strong className="text-stone-900">₹{item.price_reg}</strong>
                  </span>
                  {item.price_med > 0 && (
                    <span>
                      Med: <strong className="text-stone-900">₹{item.price_med}</strong>
                    </span>
                  )}
                  {item.price_lrg > 0 && (
                    <span>
                      Lrg: <strong className="text-stone-900">₹{item.price_lrg}</strong>
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-2 flex items-center justify-between gap-2">
                <button
                  onClick={() => toggleAvailability(item.id, !item.is_available)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold tracking-wider transition-all flex-1 text-center border ${
                    item.is_available 
                      ? 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  {item.is_available ? 'Mark Sold Out' : 'Mark Available'}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors"
                    title="Edit Item Details"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(item.id, item.name)}
                    className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
                    title="Delete Menu Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Menu Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[4000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-stone-200 rounded-3xl max-w-xl w-full p-6 text-stone-900 shadow-2xl relative my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-800 hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-stone-100">
              <Sparkles className="w-5 h-5 text-trattoria-red" />
              <h3 className="font-serif text-xl font-bold">
                {editingItem ? 'Edit Menu Item' : 'Add New Italian Menu Item'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
              {/* English & Italian Titles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Item Name (English) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Classic Margherita"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-trattoria-red font-body text-stone-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Italian Title (Subheading)</label>
                  <input
                    type="text"
                    placeholder="e.g. Margherita Originale"
                    value={formData.italian_title}
                    onChange={(e) => setFormData({ ...formData, italian_title: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-trattoria-red italic font-serif text-stone-900"
                  />
                </div>
              </div>

              {/* Category & Veg Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-trattoria-red font-body text-stone-900"
                  >
                    <option value="Veg Pizzas / Classic Veg">Veg Pizzas / Classic Veg</option>
                    <option value="Non-Veg Pizzas">Non-Veg Pizzas</option>
                    <option value="Loaded Fries & Sides">Loaded Fries & Sides</option>
                    <option value="Drinks & Desserts">Drinks & Desserts</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Dietary Type</label>
                  <div className="flex items-center gap-4 mt-2">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="is_veg"
                        checked={formData.is_veg}
                        onChange={() => setFormData({ ...formData, is_veg: true })}
                      />
                      <span>🟢 Vegetarian</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="is_veg"
                        checked={!formData.is_veg}
                        onChange={() => setFormData({ ...formData, is_veg: false })}
                      />
                      <span>🔴 Non-Veg</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Prices */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">Prices (₹ INR)</label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <span className="text-[10px] text-stone-500 block mb-0.5">Regular / Single Price</span>
                    <input
                      type="number"
                      required
                      value={formData.price_reg}
                      onChange={(e) => setFormData({ ...formData, price_reg: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono text-stone-900"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 block mb-0.5">Medium Size (10")</span>
                    <input
                      type="number"
                      value={formData.price_med}
                      onChange={(e) => setFormData({ ...formData, price_med: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono text-stone-900"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 block mb-0.5">Large Size (12")</span>
                    <input
                      type="number"
                      value={formData.price_lrg}
                      onChange={(e) => setFormData({ ...formData, price_lrg: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono text-stone-900"
                    />
                  </div>
                </div>
              </div>

              {/* DIRECT LAPTOP PHOTO UPLOAD ZONE */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-stone-800 flex items-center gap-1.5">
                    <Laptop className="w-4 h-4 text-trattoria-red" />
                    <span>Item Photo (Upload directly from Laptop)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="text-[11px] text-stone-500 hover:text-trattoria-red underline"
                  >
                    {showUrlInput ? 'Hide URL input' : 'Or paste image URL'}
                  </button>
                </div>

                {/* Main Direct Laptop File Upload Dropzone */}
                <div className="border-2 border-dashed border-stone-300 hover:border-trattoria-red bg-stone-50/80 rounded-2xl p-4 text-center transition-all relative">
                  {formData.image_url ? (
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-16 w-24 rounded-xl overflow-hidden border border-stone-200 shadow-sm shrink-0 bg-stone-100">
                          <img 
                            src={formData.image_url} 
                            alt="Uploaded Preview" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1548365328-8c6db3220e4c?w=600';
                            }}
                          />
                        </div>
                        <div className="text-left">
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full uppercase inline-block mb-1">
                            ✓ Photo Uploaded
                          </span>
                          <p className="text-[11px] text-stone-600 font-mono line-clamp-1 max-w-[200px]">
                            {formData.image_url}
                          </p>
                        </div>
                      </div>

                      <label className="bg-stone-900 hover:bg-black text-white px-3 py-2 rounded-xl text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors whitespace-nowrap">
                        <Upload className="w-3.5 h-3.5 text-amber-300" />
                        <span>{uploadingImage ? 'Uploading...' : 'Change Laptop Photo'}</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/jpg,image/webp"
                          onChange={handleImageFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center cursor-pointer py-4">
                      <div className="w-12 h-12 rounded-2xl bg-trattoria-red/10 text-trattoria-red flex items-center justify-center mb-2">
                        <Upload className="w-6 h-6" />
                      </div>
                      <span className="font-bold text-stone-800 text-xs mb-0.5">
                        {uploadingImage ? 'Uploading photo...' : 'Click to select JPG / PNG photo from Laptop'}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        Supports .jpg, .jpeg, .png, .webp (Saves to server & SQLite DB)
                      </span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/jpg,image/webp"
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Optional Web URL Input fallback */}
                {showUrlInput && (
                  <div className="mt-2">
                    <input
                      type="text"
                      placeholder="Paste Image URL (https://...)"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-xs"
                    />
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Authentic ingredients description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-body text-stone-900"
                />
              </div>

              {/* Ingredients & Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Ingredients (comma separated)</label>
                  <input
                    type="text"
                    placeholder="San Marzano Sauce, Mozzarella, Basil"
                    value={formData.ingredients_str}
                    onChange={(e) => setFormData({ ...formData, ingredients_str: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Badges / Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="Chef's Special, Authentic Neapolitan"
                    value={formData.tags_str}
                    onChange={(e) => setFormData({ ...formData, tags_str: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 font-bold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="bg-trattoria-red hover:bg-trattoria-redHover text-white px-5 py-2.5 rounded-xl font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Menu Item</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Supabase Cloud Sync Modal */}
      {isSupaModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl relative text-stone-900 my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsSupaModalOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-2 rounded-full hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2 text-emerald-600">
              <Database className="w-6 h-6" />
              <h3 className="font-serif text-xl font-bold">Supabase Cloud Sync</h3>
            </div>
            <p className="text-xs text-stone-500 mb-4 leading-relaxed">
              Connect your Supabase project so menu changes sync across both mobile and laptop instantly and never get deleted on refresh.
            </p>

            {/* Step 1: SQL Setup Helper */}
            <div className="bg-stone-900 text-stone-200 p-4 rounded-2xl mb-4 border border-stone-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Code className="w-4 h-4" />
                  <span>Step 1: Run SQL in Supabase (Required once)</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Copied SQL!' : 'Copy SQL Query'}</span>
                </button>
              </div>
              <p className="text-[11px] text-stone-400 mb-2">
                In your Supabase dashboard, click <b>SQL Editor</b> on the left, paste this SQL, and click <b>RUN</b>:
              </p>
              <pre className="text-[10px] bg-black/60 p-2.5 rounded-xl font-mono overflow-x-auto text-emerald-300 border border-stone-800 max-h-28">
{SUPABASE_SETUP_SQL}
              </pre>
            </div>

            {/* Step 2: Credentials and Sync */}
            <form onSubmit={handleSaveSupabase} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  placeholder="https://xyzcompany.supabase.co"
                  value={supaUrlInput}
                  onChange={(e) => setSupaUrlInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Supabase Anon Public Key (API Key)
                </label>
                <textarea
                  rows={2}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supaKeyInput}
                  onChange={(e) => setSupaKeyInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-emerald-600 font-mono"
                />
              </div>

              {syncStatusMsg && (
                <div className={`p-3 rounded-xl text-xs leading-relaxed ${
                  syncStatusMsg.startsWith('✅') 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}>
                  {syncStatusMsg}
                </div>
              )}

              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={handleQuickSync}
                  disabled={isSyncing}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync All Current Pizzas Now'}</span>
                </button>

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setIsSupaModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-bold"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={isSyncing}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    {isSyncing ? 'Saving & Syncing...' : 'Save & Sync Cloud'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
