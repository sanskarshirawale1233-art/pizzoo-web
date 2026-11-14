import { createClient } from '@supabase/supabase-js';

const DEFAULT_URL = 'https://xwjcwrytplyjygfgcrwa.supabase.co';
const DEFAULT_KEY = 'sb_publishable_w7soVC3BzCEAS-F01t7kHQ_37jsVHg0';

const getEnvOrStorage = (envKey, storageKey, fallback = '') => {
  const envVal = import.meta.env[envKey];
  if (envVal && envVal.trim() && !envVal.includes('placeholder')) {
    return envVal.trim();
  }
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored && stored.trim()) return stored.trim();
  } catch {}
  return fallback;
};

let currentUrl = getEnvOrStorage('VITE_SUPABASE_URL', 'pizzoo_supabase_url', DEFAULT_URL);
let currentKey = getEnvOrStorage('VITE_SUPABASE_ANON_KEY', 'pizzoo_supabase_key', DEFAULT_KEY);

let clientInstance = (currentUrl && currentKey) ? createClient(currentUrl, currentKey) : null;

export const getSupabase = () => clientInstance;

export const isSupabaseConfigured = () => Boolean(clientInstance);

export const getSupabaseConfig = () => ({
  url: currentUrl,
  key: currentKey,
  isConfigured: Boolean(clientInstance)
});

export const updateSupabaseConfig = (url, key) => {
  const cleanUrl = (url || '').trim();
  const cleanKey = (key || '').trim();

  currentUrl = cleanUrl;
  currentKey = cleanKey;

  try {
    if (cleanUrl) localStorage.setItem('pizzoo_supabase_url', cleanUrl);
    else localStorage.removeItem('pizzoo_supabase_url');

    if (cleanKey) localStorage.setItem('pizzoo_supabase_key', cleanKey);
    else localStorage.removeItem('pizzoo_supabase_key');
  } catch {}

  if (cleanUrl && cleanKey) {
    clientInstance = createClient(cleanUrl, cleanKey);
  } else {
    clientInstance = null;
  }

  return Boolean(clientInstance);
};

export const supabase = clientInstance;
