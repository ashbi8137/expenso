import React, { useState } from 'react';
import { Banknote, ArrowRight } from 'lucide-react';

export function WelcomeSetupScreen({ onComplete }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter your name');
      return;
    }
    onComplete(trimmed);
  };

  return (
    <div className="app-shell" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100vh', padding: '1.5rem' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: '#ECFDF5', border: '1px solid #A7F3D0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
          <Banknote size={30} color="#10B981" />
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Expenso
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Enter your name to begin
        </p>
      </div>

      <form onSubmit={handleSubmit} className="clean-card" style={{ padding: '1.5rem 1.25rem', margin: 0 }}>
        
        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', padding: '0.6rem 0.85rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '1rem' }}>
            ⚠️ {error}
          </div>
        )}

        <div className="clean-input-group" style={{ marginBottom: '1.25rem' }}>
          <label className="clean-label">Your Name</label>
          <input 
            type="text"
            className="clean-input"
            placeholder="e.g. Ashbin"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            style={{ fontSize: '1.05rem', padding: '0.8rem 1rem' }}
            autoFocus
            required
          />
        </div>

        <button 
          type="submit" 
          style={{
            width: '100%',
            padding: '0.85rem 1rem',
            borderRadius: '14px',
            background: '#10B981',
            border: 'none',
            color: '#FFFFFF',
            fontSize: '0.95rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
          }}
        >
          <span>Get Started</span>
          <ArrowRight size={18} />
        </button>

      </form>

    </div>
  );
}
