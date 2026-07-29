import { createClient } from '@supabase/supabase-js';

const STORAGE_KEYS = {
  EXPENSES: 'paisaevide_expenses_v5',
  LOCKED_USER: 'paisaevide_user_v5',
  SUPABASE_CONFIG: 'expenso_supabase_cfg',
  CUSTOM_CATEGORIES: 'expenso_custom_cats_v1'
};

let supabaseClientInstance = null;

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

// Expense CRUD operations (Fresh Clean Slate)
export async function fetchExpenses() {
  const activeUser = getLockedUser();
  const localSaved = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES) || '[]');
  const localFiltered = activeUser ? localSaved.filter(i => !i.user_name || i.user_name === activeUser) : localSaved;

  const client = getSupabaseClient();
  if (client) {
    try {
      let query = client.from('expenses').select('*').order('date', { ascending: false });
      if (activeUser) {
        query = query.eq('user_name', activeUser);
      }

      const { data, error } = await query;

      if (!error && Array.isArray(data)) {
        localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(data));
        return data;
      }
    } catch (e) {
      console.warn("Supabase fetch notice", e);
    }
  }

  return localFiltered;
}

export async function addExpense(item) {
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
        if (error.message.includes('user_name')) {
          const fallbackPayload = { ...newItem };
          delete fallbackPayload.user_name;
          await client.from('expenses').insert([fallbackPayload]);
        }
      }
    } catch (e) {
      console.warn("Supabase Cloud Insert Error:", e);
    }
  }

  return newItem;
}

export async function deleteExpense(id) {
  const current = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES) || '[]');
  const updated = current.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(updated));

  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('expenses').delete().eq('id', id);
    } catch (e) {}
  }

  return updated;
}

export async function clearAllExpenses() {
  localStorage.removeItem(STORAGE_KEYS.EXPENSES);
  localStorage.removeItem('expenso_items_v1');
  localStorage.removeItem('expenso_items_v2');
  localStorage.removeItem('expenso_items_v3');
  localStorage.removeItem('expenso_items_v4');

  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('expenses').delete().gte('amount', 0);
    } catch (e) {
      try {
        await client.from('expenses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      } catch (e2) {}
    }
  }
}
