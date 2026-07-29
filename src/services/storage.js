import { createClient } from '@supabase/supabase-js';

const STORAGE_KEYS = {
  EXPENSES: 'expenso_items_v1',
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
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBteWFicGpwbm1vdGZobHlheHdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyNTY2NjMsImV4cCI6MjEwMDgzMjY2M30.mnoP1xJTGpdgmoxBbU7ir8ujz-ehpCeVRkE2GplYZ9A'
  };
}

export function saveSupabaseConfig(url, anonKey) {
  localStorage.setItem(STORAGE_KEYS.SUPABASE_CONFIG, JSON.stringify({ url, anonKey }));
  supabaseClientInstance = null;
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

// Expense CRUD operations (Robust LocalStorage + Supabase Sync)
export async function fetchExpenses() {
  const localSaved = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES) || '[]');
  const client = getSupabaseClient();

  if (client) {
    try {
      const { data, error } = await client
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(data));
        return data;
      } else if (error) {
        console.warn("Supabase fetch error (RLS check needed):", error.message);
      }
    } catch (e) {
      console.warn("Supabase connection failed, using local storage", e);
    }
  }

  return localSaved;
}

export async function addExpense(item) {
  const newItem = {
    id: item.id || 'exp_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
    title: item.title,
    amount: Number(item.amount),
    category: item.category,
    date: item.date,
    payment_method: item.payment_method || 'UPI',
    notes: item.notes || '',
    is_fixed: Boolean(item.is_fixed),
    created_at: new Date().toISOString()
  };

  // Always save to localStorage immediately to guarantee 0 data loss
  const current = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES) || '[]');
  const updated = [newItem, ...current];
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(updated));

  // Sync to Supabase cloud DB
  const client = getSupabaseClient();
  if (client) {
    try {
      const { error } = await client.from('expenses').insert([newItem]);
      if (error) {
        console.warn("Supabase insert warning (Disable RLS on table):", error.message);
      }
    } catch (e) {
      console.warn("Supabase insert failed", e);
    }
  }

  return newItem;
}

export async function addMultipleExpenses(items) {
  const preparedItems = items.map(item => ({
    id: item.id || 'exp_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
    title: item.title,
    amount: Number(item.amount),
    category: item.category,
    date: item.date,
    payment_method: item.payment_method || 'UPI',
    notes: item.notes || '',
    is_fixed: Boolean(item.is_fixed),
    created_at: new Date().toISOString()
  }));

  const current = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES) || '[]');
  const updated = [...preparedItems, ...current];
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(updated));

  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('expenses').insert(preparedItems);
    } catch (e) {}
  }

  return updated;
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
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('expenses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    } catch (e) {}
  }
}
