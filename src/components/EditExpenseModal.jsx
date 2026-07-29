import React, { useState, useEffect } from 'react';
import { Edit3, X, Check } from 'lucide-react';
import { autoDetectCategory } from '../utils/parser';

export function EditExpenseModal({ isOpen, onClose, expense, onSave, categories, todayStr }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(todayStr);
  const [error, setError] = useState('');

  useEffect(() => {
    if (expense) {
      setTitle(expense.title || '');
      setAmount(expense.amount || '');
      setCategory(expense.category || 'Food & Dining');
      setDate(expense.date || todayStr);
      setError('');
    }
  }, [expense, todayStr]);

  if (!isOpen || !expense) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Please enter a valid expense title.');
      return;
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }

    if (date > todayStr) {
      setError('Future dates are not allowed.');
      return;
    }

    onSave({
      ...expense,
      title: trimmedTitle,
      amount: numAmount,
      category,
      date
    });

    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-sheet" style={{ maxWidth: '420px', borderRadius: '24px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Edit3 size={18} color="#10B981" />
            </div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>Edit Expense</h2>
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
          
          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', padding: '0.6rem 0.85rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>
              ⚠️ {error}
            </div>
          )}

          <div className="clean-input-group" style={{ marginBottom: 0 }}>
            <label className="clean-label">Amount (₹)</label>
            <input 
              type="number"
              step="any"
              min="0.01"
              className="clean-input"
              style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10B981', background: '#ECFDF5' }}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="clean-input-group" style={{ marginBottom: 0 }}>
            <label className="clean-label">Expense Title</label>
            <input 
              type="text"
              className="clean-input"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (e.target.value.trim()) {
                  setCategory(autoDetectCategory(e.target.value, categories));
                }
              }}
              required
            />
          </div>

          <div className="clean-input-group" style={{ marginBottom: 0 }}>
            <label className="clean-label">Category</label>
            <select 
              className="clean-input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map(c => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="clean-input-group" style={{ marginBottom: 0 }}>
            <label className="clean-label">Date</label>
            <input 
              type="date"
              max={todayStr}
              className="clean-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
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
              <Check size={16} />
              <span>Save Changes</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
