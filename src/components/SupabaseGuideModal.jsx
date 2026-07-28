import React, { useState } from 'react';
import { Database, X, Copy, Check, ExternalLink, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { getSupabaseConfig, saveSupabaseConfig } from '../services/storage';

export function SupabaseGuideModal({ isOpen, onClose, onConfigSaved }) {
  const currentCfg = getSupabaseConfig();
  const [url, setUrl] = useState(currentCfg.url || '');
  const [anonKey, setAnonKey] = useState(currentCfg.anonKey || '');
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

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
    if (!url || !anonKey) return;
    saveSupabaseConfig(url.trim(), anonKey.trim());
    onConfigSaved();
    onClose();
  };

  return (
    <div className="m-modal-overlay">
      <div className="m-modal-sheet" style={{ maxHeight: '90vh' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '0.4rem', borderRadius: '10px' }}>
              <Database size={20} color="#34D399" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Setup Supabase Database</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Step-by-step free setup guide</p>
            </div>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose} style={{ padding: '0.4rem' }}>
            <X size={18} />
          </button>
        </div>

        {/* Step-by-Step Tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem' }}>
          {[1, 2, 3].map(step => (
            <button
              key={step}
              onClick={() => setActiveStep(step)}
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: 'var(--radius-sm)',
                background: activeStep === step ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-input)',
                border: `1px solid ${activeStep === step ? '#3B82F6' : 'var(--border-subtle)'}`,
                color: activeStep === step ? '#93C5FD' : 'var(--text-muted)',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Step {step}
            </button>
          ))}
        </div>

        {/* Step 1: Create Supabase Project */}
        {activeStep === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#3B82F6', marginBottom: '0.35rem' }}>
                1. Create Free Supabase Account
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Supabase is a free cloud database. Click below to sign up or log in to your Supabase dashboard:
              </p>
              <a 
                href="https://supabase.com" 
                target="_blank" 
                rel="noreferrer"
                className="m-btn m-btn-secondary"
                style={{ marginTop: '0.75rem', fontSize: '0.825rem', padding: '0.5rem' }}
              >
                <span>Open Supabase.com</span>
                <ExternalLink size={14} />
              </a>
            </div>

            <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '0.35rem' }}>
                2. Create a New Project
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Click **"New Project"**, give it a name (e.g. `Expenso`), set a database password, and pick your nearest region.
              </p>
            </div>

            <button className="m-btn m-btn-primary" onClick={() => setActiveStep(2)}>
              <span>Next: Create Table</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Step 2: Create Table SQL */}
        {activeStep === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#10B981', marginBottom: '0.35rem' }}>
                Create Expenses Table
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                In your Supabase dashboard, click **SQL Editor** on the left menu, paste this SQL query, and click **RUN**:
              </p>

              <div style={{ position: 'relative' }}>
                <pre style={{ background: '#090D16', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.725rem', color: '#93C5FD', overflowX: 'auto', border: '1px solid var(--border-subtle)' }}>
                  {sqlCode}
                </pre>
                <button
                  onClick={handleCopySql}
                  style={{
                    position: 'absolute',
                    top: '0.4rem',
                    right: '0.4rem',
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    color: 'white',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    cursor: 'pointer'
                  }}
                >
                  {copiedSql ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <button className="m-btn m-btn-primary" onClick={() => setActiveStep(3)}>
              <span>Next: Enter Keys</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Step 3: Enter API Keys */}
        {activeStep === 3 && (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Go to **Project Settings → API** in Supabase, copy your Project URL and anon public key, and paste them here:
            </p>

            <div className="m-input-group">
              <label className="m-input-label">Project URL</label>
              <input 
                type="text"
                className="m-input-field"
                placeholder="https://xyz.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>

            <div className="m-input-group">
              <label className="m-input-label">Anon Key</label>
              <input 
                type="password"
                className="m-input-field"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="m-btn m-btn-accent" style={{ marginTop: '0.5rem' }}>
              <ShieldCheck size={18} />
              <span>Save & Connect Database</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
