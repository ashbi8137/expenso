import { createClient } from '@supabase/supabase-js';

const STORAGE_KEYS = {
  EXPENSES: 'expenso_items_v2',
  USER_PROFILE: 'expenso_active_user_v2',
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

// User Profile Storage
export function getUserProfile() {
  return localStorage.getItem(STORAGE_KEYS.USER_PROFILE) || '';
}

export function saveUserProfile(name) {
  localStorage.setItem(STORAGE_KEYS.USER_PROFILE, name);
  return name;
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

// Expense CRUD operations (Multi-User Filtered Storage)
export async function fetchExpenses(userName = '') {
  const allLocal = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES) || '[]');
  const activeUser = userName || getUserProfile();

  const client = getSupabaseClient();
  if (client) {
    try {
      let query = client.from('expenses').select('*').order('date', { ascending: false });
      
      if (activeUser) {
        query = query.eq('user_name', activeUser);
      }

      const { data, error } = await query;

      if (!error && Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch (e) {
      console.warn("Supabase fetch warning", e);
    }
  }

  // Filter local storage items by active user name
  if (activeUser) {
    return allLocal.filter(item => !item.user_name || item.user_name === activeUser);
  }

  return allLocal;
}

export async function addExpense(item, userName = '') {
  const activeUser = userName || getUserProfile() || 'Default';
  
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

export async function addMultipleExpenses(items, userName = '') {
  const activeUser = userName || getUserProfile() || 'Default';

  const preparedItems = items.map(item => ({
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

export async function clearAllExpenses(userName = '') {
  const activeUser = userName || getUserProfile();
  const current = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES) || '[]');
  
  const filtered = activeUser ? current.filter(i => i.user_name && i.user_name !== activeUser) : [];
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(filtered));

  const client = getSupabaseClient();
  if (client) {
    try {
      if (activeUser) {
        await client.from('expenses').delete().eq('user_name', activeUser);
      } else {
        await client.from('expenses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      }
    } catch (e) {}
  }
}
