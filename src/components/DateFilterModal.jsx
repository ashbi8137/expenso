import React, { useState } from 'react';
import { Filter, X, Check } from 'lucide-react';

export function DateFilterModal({ isOpen, onClose, activeFilter, onApplyFilter, todayStr }) {
  const [mode, setMode] = useState(activeFilter.mode === 'MONTH_RANGE' ? 'MONTH_RANGE' : 'DATE_RANGE');
  
  // Custom Date Range (Day wise)
  const [fromDate, setFromDate] = useState(activeFilter.fromDate || todayStr);
  const [toDate, setToDate] = useState(activeFilter.toDate || todayStr);

  // Month Range
  const currentMonthStr = todayStr.substring(0, 7); // YYYY-MM
  const [fromMonth, setFromMonth] = useState(activeFilter.fromMonth || currentMonthStr);
  const [toMonth, setToMonth] = useState(activeFilter.toMonth || currentMonthStr);

  if (!isOpen) return null;

  const handleApply = () => {
    let label = '';

    if (mode === 'DATE_RANGE') {
      if (!fromDate || !toDate) return;
      label = fromDate === toDate ? `${fromDate}` : `${fromDate} to ${toDate}`;
      onApplyFilter({ mode: 'DATE_RANGE', fromDate, toDate, label });
    }
    else if (mode === 'MONTH_RANGE') {
      if (!fromMonth || !toMonth) return;
      label = fromMonth === toMonth ? `${fromMonth}` : `${fromMonth} to ${toMonth}`;
      onApplyFilter({ mode: 'MONTH_RANGE', fromMonth, toMonth, label });
    }

    onClose();
  };

  const handleReset = () => {
    onApplyFilter({ mode: 'PRESET', preset: 'TODAY', label: 'Today' });
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-sheet" style={{ maxWidth: '420px', borderRadius: '24px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Filter size={18} color="#10B981" />
            </div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>Custom Date Filter</h2>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Mode Selector Tabs (Only 2 Tabs: Day Range & Month Range) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem', background: '#F1F5F9', padding: '0.25rem', borderRadius: '14px', marginBottom: '1.25rem' }}>
          {[
            { id: 'DATE_RANGE', label: 'Day Range' },
            { id: 'MONTH_RANGE', label: 'Month Range' }
          ].map(m => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              style={{
                padding: '0.6rem 0.25rem',
                borderRadius: '10px',
                border: 'none',
                background: mode === m.id ? '#FFFFFF' : 'transparent',
                color: mode === m.id ? '#10B981' : '#64748B',
                fontWeight: mode === m.id ? 800 : 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: mode === m.id ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Mode 1: Day Range (From Date -> To Date) */}
        {mode === 'DATE_RANGE' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="clean-input-group" style={{ marginBottom: 0 }}>
              <label className="clean-label">From Date</label>
              <input 
                type="date"
                max={todayStr}
                className="clean-input"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="clean-input-group" style={{ marginBottom: 0 }}>
              <label className="clean-label">To Date</label>
              <input 
                type="date"
                max={todayStr}
                className="clean-input"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Mode 2: Month Range (From Month -> To Month) */}
        {mode === 'MONTH_RANGE' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="clean-input-group" style={{ marginBottom: 0 }}>
              <label className="clean-label">From Month</label>
              <input 
                type="month"
                max={currentMonthStr}
                className="clean-input"
                value={fromMonth}
                onChange={(e) => setFromMonth(e.target.value)}
              />
            </div>
            <div className="clean-input-group" style={{ marginBottom: 0 }}>
              <label className="clean-label">To Month</label>
              <input 
                type="month"
                max={currentMonthStr}
                className="clean-input"
                value={toMonth}
                onChange={(e) => setToMonth(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            type="button" 
            onClick={handleReset}
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
            Reset
          </button>
          <button 
            type="button" 
            onClick={handleApply}
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
            <span>Apply Filter</span>
          </button>
        </div>

      </div>
    </div>
  );
}
