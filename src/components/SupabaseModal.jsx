import React, { useState } from 'react';
import { Database, X, Copy, Check, ExternalLink, ShieldCheck } from 'lucide-react';
import { getSupabaseConfig, saveSupabaseConfig } from '../services/storage';

export function SupabaseModal({ isOpen, onClose, onConfigSaved }) {
  const currentCfg = getSupabaseConfig();
  const [url, setUrl] = useState(currentCfg.url || '');
  const [anonKey, setAnonKey] = useState(currentCfg.anonKey || '');
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const sqlCode = `create table if not exists expenses (
  id text primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  date date not null,
  title text not null,
  amount numeric not null,
  category text not null,
  payment_method text default 'UPI',
  notes text,
  is_fixed boolean default false
);`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleSave = (e) => {
    e.preventDefault();
    saveSupabaseConfig(url.trim(), anonKey.trim());
    onConfigSaved();
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '580px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.4rem', borderRadius: '10px' }}>
              <Database size={20} color="#34D399" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Supabase Database Setup</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cloud database synchronization</p>
            </div>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div className="input-group">
            <label className="input-label">Supabase Project URL</label>
            <input 
              type="text"
              className="input-field"
              placeholder="https://xyz.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Supabase Anon Key</label>
            <input 
              type="password"
              className="input-field"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
            />
          </div>

          {/* SQL Editor Helper Box */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                1-Click Table Schema (Paste in Supabase SQL Editor)
              </span>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={handleCopySql}
                style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
              >
                {copiedSql ? <Check size={13} color="#34D399" /> : <Copy size={13} />}
                <span>{copiedSql ? 'Copied!' : 'Copy SQL'}</span>
              </button>
            </div>
            <pre style={{ background: '#090D16', padding: '0.65rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: '#93C5FD', overflowX: 'auto', margin: 0 }}>
              {sqlCode}
            </pre>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-accent">
              <ShieldCheck size={16} />
              <span>Save & Connect</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
