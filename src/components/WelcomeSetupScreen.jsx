import React, { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export function WelcomeSetupScreen({ onComplete }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter your name to continue.');
      return;
    }
    onComplete(trimmed);
  };

  return (
    <div className="app-shell" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100vh', padding: '1.5rem' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: '#ECFDF5', border: '1px solid #A7F3D0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
          <Sparkles size={32} color="#10B981" />
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Welcome to Expenso
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.4rem', lineHeight: '1.5' }}>
          Simple daily expense tracker. Enter your name once to create your private portal.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="clean-card" style={{ padding: '1.75rem 1.25rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
        
        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', padding: '0.65rem 0.85rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '1rem' }}>
            ⚠️ {error}
          </div>
        )}

        <div className="clean-input-group" style={{ marginBottom: '1.25rem' }}>
          <label className="clean-label" style={{ fontSize: '0.85rem', fontWeight: 800 }}>Enter Your Name</label>
          <input 
            type="text"
            className="clean-input"
            placeholder="e.g. Ashbin"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            style={{ fontSize: '1.1rem', padding: '0.85rem 1rem' }}
            autoFocus
            required
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#64748B', marginBottom: '1.5rem' }}>
          <ShieldCheck size={16} color="#10B981" />
          <span>Your name locks your private portal permanently on this device.</span>
        </div>

        <button 
          type="submit" 
          style={{
            width: '100%',
            padding: '0.9rem 1rem',
            borderRadius: '16px',
            background: '#10B981',
            border: 'none',
            color: '#FFFFFF',
            fontSize: '1rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxShadow: '0 6px 16px rgba(16, 185, 129, 0.35)'
          }}
        >
          <span>Start Tracking</span>
          <ArrowRight size={18} />
        </button>

      </form>

    </div>
  );
}
