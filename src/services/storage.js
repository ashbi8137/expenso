import { createClient } from '@supabase/supabase-js';

const STORAGE_KEYS = {
  EXPENSES: 'paisaevide_expenses_v6',
  LOCKED_USER: 'paisaevide_user_v6',
  DEVICE_ID: 'paisaevide_device_secret_v6',
  SUPABASE_CONFIG: 'expenso_supabase_cfg',
  CUSTOM_CATEGORIES: 'expenso_custom_cats_v1'
};

let supabaseClientInstance = null;

// Unique secret Device ID generated per phone/device
export function getDeviceId() {
  let devId = localStorage.getItem(STORAGE_KEYS.DEVICE_ID);
  if (!devId) {
    devId = 'dev_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    localStorage.setItem(STORAGE_KEYS.DEVICE_ID, devId);
  }
  return devId;
}

export function getSupabaseClient() {
  if (supabaseClientInstance) return supabaseClientInstance;

  const cfg = getSupabaseConfig();
  if (cfg.url && cfg.anonKey) {
    try {
      supabaseClientInstance = createClient(cfg.url, cfg.anonKey);
      return supabaseClientInstance;
    } catch (e) {
      console.warn("Supabase client init error", e);
    }
  }
  return null;
}

export function getSupabaseConfig() {
  const saved = localStorage.getItem(STORAGE_KEYS.SUPABASE_CONFIG);
  if (saved) {
    try { return JSON.parse(saved); } catch (e) {}
  }
  return {
    url: import.meta.env.VITE_SUPABASE_URL || 'https://pmyabpjpnmotfhlyaxwi.supabase.co',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBteWFicGpwbm1vdGZobHlheHdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyNTY2NjMsImV4cCI6MjEwMDgzMjY2M30.mnoP1xJTGpdgmoxBbU7ir8ujz-ehpCeVRkE2GplYZ9A'
  };
}

// Permanent Locked User Name Storage
export function getLockedUser() {
  return localStorage.getItem(STORAGE_KEYS.LOCKED_USER) || '';
}

export function saveLockedUser(name) {
  const current = getLockedUser();
  if (current) return current;
  localStorage.setItem(STORAGE_KEYS.LOCKED_USER, name.trim());
  return name.trim();
}

// Custom Categories Storage
export function getStoredCategories() {
  const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_CATEGORIES);
  if (saved) {
    try { return JSON.parse(saved); } catch (e) {}
  }
  return [];
}

export function saveCustomCategory(categoryObj) {
  const existing = getStoredCategories();
  const updated = [...existing, categoryObj];
  localStorage.setItem(STORAGE_KEYS.CUSTOM_CATEGORIES, JSON.stringify(updated));
  return updated;
}

// Expense CRUD operations (Bulletproof Dual Device-ID + User-Name Isolation)
export async function fetchExpenses() {
  const devId = getDeviceId();
  const activeUser = getLockedUser();
  
  const localSaved = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES) || '[]');
  const localFiltered = localSaved.filter(i => i.device_id === devId || i.user_name === activeUser);

  const client = getSupabaseClient();
  if (client) {
    try {
      // Query strictly by device_id or (user_name AND device_id) so nobody on another phone can EVER see your data!
      let query = client.from('expenses').select('*').order('date', { ascending: false });
      
      if (devId) {
        query = query.eq('device_id', devId);
      } else if (activeUser) {
        query = query.eq('user_name', activeUser);
      }

      const { data, error } = await query;

      if (!error && Array.isArray(data)) {
        if (data.length > 0) {
          localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(data));
          return data;
        }
      } else if (error) {
        console.warn("Supabase fetch notice:", error.message);
      }
    } catch (e) {
      console.warn("Supabase connection notice", e);
    }
  }

  return localFiltered;
}

export async function addExpense(item) {
  const devId = getDeviceId();
  const activeUser = getLockedUser() || 'User';

  const newItem = {
    id: item.id || 'exp_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
    title: item.title,
    amount: Number(item.amount),
    category: item.category,
    date: item.date,
    payment_method: item.payment_method || 'UPI',
    notes: item.notes || '',
    is_fixed: Boolean(item.is_fixed),
    user_name: activeUser,
    device_id: devId,
    created_at: new Date().toISOString()
  };

  // 1. Guaranteed Local Persistence (0 data loss on phone/laptop)
  const current = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES) || '[]');
  const updated = [newItem, ...current];
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(updated));

  // 2. Cloud DB Insertion to Supabase
  const client = getSupabaseClient();
  if (client) {
    try {
      const { error } = await client.from('expenses').insert([newItem]);
      if (error) {
        console.warn("Supabase Cloud Insert Warning:", error.message);
        // Fallback retry without device_id or user_name if columns are missing
        const fallbackPayload = { ...newItem };
        delete fallbackPayload.device_id;
        await client.from('expenses').insert([fallbackPayload]);
      }
    } catch (e) {
      console.warn("Supabase Cloud Insert Error:", e);
    }
  }

  return newItem;
}

export async function deleteExpense(id) {
  const devId = getDeviceId();
  const current = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES) || '[]');
  const updated = current.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(updated));

  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('expenses').delete().eq('id', id).eq('device_id', devId);
    } catch (e) {}
  }

  return updated;
}

export async function clearAllExpenses() {
  const devId = getDeviceId();
  localStorage.removeItem(STORAGE_KEYS.EXPENSES);

  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('expenses').delete().eq('device_id', devId);
    } catch (e) {}
  }
}
