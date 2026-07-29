import { createClient } from '@supabase/supabase-js';

const STORAGE_KEYS = {
  EXPENSES: 'expenso_items_v4',
  LOCKED_USER: 'expenso_locked_user_v4',
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
      console.warn("Supabase init failed", e);
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
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBteWFicGpwnmotfhlyaxwiLCJpYXQiOjE3ODUyNTY2NjMsImV4cCI6MjEwMDgzMjY2M30.mnoP1xJTGpdgmoxBbU7ir8ujz-ehpCeVRkE2GplYZ9A'
  };
}

// Permanent Locked User Name Storage
export function getLockedUser() {
  return localStorage.getItem(STORAGE_KEYS.LOCKED_USER) || '';
}

export function saveLockedUser(name) {
  const current = getLockedUser();
  if (current) return current; // Cannot be changed once locked
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

// Expense CRUD operations (Strict User Portal Isolation)
export async function fetchExpenses() {
  const activeUser = getLockedUser();
  if (!activeUser) return [];

  const localSaved = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES) || '[]');
  const localFiltered = localSaved.filter(i => i.user_name === activeUser);

  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('expenses')
        .select('*')
        .eq('user_name', activeUser)
        .order('date', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(data));
        return data;
      }
    } catch (e) {
      console.warn("Supabase fetch warning", e);
    }
  }

  return localFiltered;
}

export async function addExpense(item) {
  const activeUser = getLockedUser();
  if (!activeUser) return null;

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

  const current = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES) || '[]');
  const updated = [newItem, ...current];
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(updated));

  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('expenses').insert([newItem]);
    } catch (e) {
      console.warn("Supabase insert warning", e);
    }
  }

  return newItem;
}

export async function deleteExpense(id) {
  const activeUser = getLockedUser();
  const current = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES) || '[]');
  const updated = current.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(updated));

  const client = getSupabaseClient();
  if (client && activeUser) {
    try {
      await client.from('expenses').delete().eq('id', id).eq('user_name', activeUser);
    } catch (e) {}
  }

  return updated;
}

export async function clearAllExpenses() {
  const activeUser = getLockedUser();
  const current = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES) || '[]');
  const filtered = activeUser ? current.filter(i => i.user_name !== activeUser) : [];
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(filtered));

  const client = getSupabaseClient();
  if (client && activeUser) {
    try {
      await client.from('expenses').delete().eq('user_name', activeUser);
    } catch (e) {}
  }
}
