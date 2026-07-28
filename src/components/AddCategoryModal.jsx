import React, { useState } from 'react';
import { X, Tag, Plus } from 'lucide-react';

export function AddCategoryModal({ isOpen, onClose, onAddCategory }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#10B981');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddCategory({
      id: name.trim(),
      name: name.trim(),
      color,
      isRoutine: true,
      keywords: [name.trim().toLowerCase()]
    });

    setName('');
    onClose();
  };

  const PRESET_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#64748B'];

  return (
    <div className="modal-backdrop">
      <div className="modal-sheet" style={{ maxWidth: '420px', borderRadius: '24px' }}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Tag size={18} color="#10B981" />
            </div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>New Custom Category</h2>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div className="clean-input-group" style={{ marginBottom: 0 }}>
            <label className="clean-label">Category Name</label>
            <input 
              type="text"
              className="clean-input"
              placeholder="e.g., Entertainment, Laundry, Rent"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className="clean-input-group" style={{ marginBottom: 0 }}>
            <label className="clean-label">Select Color</label>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
              {PRESET_COLORS.map(c => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background: c,
                    border: color === c ? '3px solid #0F172A' : '2px solid transparent',
                    cursor: 'pointer',
                    transform: color === c ? 'scale(1.1)' : 'scale(1)',
                    transition: 'transform 0.15s ease'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button 
              type="button" 
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                borderRadius: '14px',
                background: '#F1F5F9',
                border: '1px solid #E2E8F0',
                color: '#475569',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              style={{
                flex: 1.5,
                padding: '0.75rem 1rem',
                borderRadius: '14px',
                background: '#10B981',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '0.9rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}
            >
              <Plus size={16} />
              <span>Create Category</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
