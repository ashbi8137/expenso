import React, { useState } from 'react';
import { User, X, Check } from 'lucide-react';

export function UserProfileModal({ isOpen, onClose, currentName, onSaveName }) {
  const [nameInput, setNameInput] = useState(currentName || '');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    onSaveName(trimmed);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-sheet" style={{ maxWidth: '420px', borderRadius: '24px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={18} color="#10B981" />
            </div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {currentName ? 'Edit Your Name' : 'Welcome to Expenso!'}
            </h2>
          </div>
          {currentName && (
            <button 
              type="button" 
              onClick={onClose}
              style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Enter your name to personalize your homepage header. Your data is 100% private to your device!
          </p>

          <div className="clean-input-group" style={{ marginBottom: 0 }}>
            <label className="clean-label">Your Name</label>
            <input 
              type="text"
              className="clean-input"
              placeholder="e.g. Ashbin, Rahul, Sarah"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
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
              marginTop: '0.5rem',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}
          >
            <Check size={18} />
            <span>Save Name</span>
          </button>

        </form>

      </div>
    </div>
  );
}
