import React, { useState } from 'react';
import { Plus, Zap, Tag, Calendar, CreditCard, Check, Sparkles } from 'lucide-react';
import { autoDetectCategory, isRoutineExpense } from '../utils/parser';

export function QuickEntryForm({ categories, onAddExpense, onOpenAddCategoryModal }) {
  const today = new Date().toISOString().split('T')[0];
  
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food & Dining');
  const [date, setDate] = useState(today);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [isFixed, setIsFixed] = useState(false);
  const [recentlyAdded, setRecentlyAdded] = useState(false);

  // Quick Preset Chips for instant 1-tap fill
  const PRESETS = [
    { title: 'Breakfast', amount: 50, category: 'Food & Dining' },
    { title: 'Lunch', amount: 100, category: 'Food & Dining' },
    { title: 'Dinner', amount: 100, category: 'Food & Dining' },
    { title: 'Tea / Coffee', amount: 20, category: 'Food & Dining' },
    { title: 'Uber / Auto', amount: 80, category: 'Transportation' },
    { title: 'Supermarket', amount: 200, category: 'Shopping & Supplies' }
  ];

  const handleTitleChange = (val) => {
    setTitle(val);
    if (val.trim()) {
      const guessed = autoDetectCategory(val, categories);
      setCategory(guessed);
      setIsFixed(!isRoutineExpense(guessed, categories));
    }
  };

  const handleApplyPreset = (preset) => {
    setTitle(preset.title);
    setAmount(String(preset.amount));
    setCategory(preset.category);
    setIsFixed(!isRoutineExpense(preset.category, categories));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !amount || Number(amount) <= 0) return;

    await onAddExpense({
      title: title.trim(),
      amount: Number(amount),
      category,
      date,
      payment_method: paymentMethod,
      is_fixed: isFixed
    });

    // Reset inputs
    setTitle('');
    setAmount('');
    setRecentlyAdded(true);
    setTimeout(() => setRecentlyAdded(false), 2000);
  };

  return (
    <div className="glass-card mb-4">
      
      {/* Header & Quick Chips */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap size={18} color="#F59E0B" />
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Quick Entry</h2>
          {recentlyAdded && (
            <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34D399', animation: 'fadeIn 0.2s ease' }}>
              <Check size={13} /> Saved!
            </span>
          )}
        </div>

        {/* Preset Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>1-Tap Presets:</span>
          {PRESETS.map((p, idx) => (
            <button 
              type="button" 
              key={idx} 
              className="chip-btn"
              onClick={() => handleApplyPreset(p)}
            >
              + {p.title} (₹{p.amount})
            </button>
          ))}
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="grid-4" style={{ alignItems: 'flex-end' }}>

          {/* Date Picker */}
          <div className="input-group">
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Calendar size={13} /> Date
            </label>
            <input 
              type="date"
              className="input-field"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Title / Item Name */}
          <div className="input-group">
            <label className="input-label">Expense Title</label>
            <input 
              type="text"
              className="input-field"
              placeholder="e.g. Lunch, Uber, Room Rent"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
            />
          </div>

          {/* Amount */}
          <div className="input-group">
            <label className="input-label">Amount (₹)</label>
            <input 
              type="number"
              step="any"
              className="input-field"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          {/* Category Dropdown + Add Custom Category Button */}
          <div className="input-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Tag size={13} /> Category
              </label>
              <button 
                type="button" 
                onClick={onOpenAddCategoryModal}
                style={{ background: 'none', border: 'none', color: '#60A5FA', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
              >
                + New Category
              </button>
            </div>
            <select 
              className="input-field"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setIsFixed(!isRoutineExpense(e.target.value, categories));
              }}
            >
              {categories.map(cat => (
                <option key={cat.name} value={cat.name} style={{ background: '#111827', color: '#F8FAFC' }}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Options Row: Payment Mode & Fixed Toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-color)' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            
            {/* Payment Method Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={15} color="var(--text-muted)" />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Payment:</span>
              {['UPI', 'Cash', 'Card'].map(m => (
                <button
                  type="button"
                  key={m}
                  className={`chip-btn ${paymentMethod === m ? 'active' : ''}`}
                  onClick={() => setPaymentMethod(m)}
                  style={{ padding: '0.25rem 0.65rem', fontSize: '0.775rem' }}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Is Fixed / One-Off Toggle */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <input 
                type="checkbox"
                checked={isFixed}
                onChange={(e) => setIsFixed(e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <span>Major / One-Off Bill (e.g. Rent, Gym, Equipment)</span>
            </label>

          </div>

          {/* Submit Button */}
          <button type="submit" className="btn btn-primary" style={{ width: '160px' }}>
            <Plus size={18} />
            <span>Add Entry</span>
          </button>

        </div>
      </form>
    </div>
  );
}
