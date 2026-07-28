import React, { useState } from 'react';
import { Search, Trash2, Download, Calendar, Tag, CreditCard, Layers } from 'lucide-react';
import { CATEGORY_DEFINITIONS } from '../utils/parser';

export function ExpenseList({ expenses, onDeleteExpense, categories }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Filter expenses
  const filtered = expenses.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Group filtered expenses by Date (sorted descending)
  const groupedByDate = {};
  filtered.forEach(item => {
    if (!groupedByDate[item.date]) {
      groupedByDate[item.date] = [];
    }
    groupedByDate[item.date].push(item);
  });

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => new Date(b) - new Date(a));

  // Category Color Map
  const colorMap = {};
  [...CATEGORY_DEFINITIONS, ...(categories || [])].forEach(c => {
    colorMap[c.name] = c.color || '#3B82F6';
  });

  // CSV Export functionality
  const handleExportCSV = () => {
    if (expenses.length === 0) return;
    const headers = ['Date', 'Title', 'Amount (INR)', 'Category', 'Payment Method', 'Is Fixed Bill'];
    const rows = expenses.map(e => [
      e.date,
      `"${e.title.replace(/"/g, '""')}"`,
      e.amount,
      `"${e.category}"`,
      e.payment_method || 'UPI',
      e.is_fixed ? 'Yes' : 'No'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Expenso_Expenses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDateLabel = (dateStr) => {
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="glass-card">
      
      {/* List Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={20} color="#60A5FA" />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Expense History</h2>
          <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
            {filtered.length} entries
          </span>
        </div>

        {/* Search & Export Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          
          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '180px' }}>
            <Search size={14} color="var(--text-dim)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text"
              className="input-field"
              placeholder="Search item..."
              style={{ paddingLeft: '2.2rem', fontSize: '0.825rem', padding: '0.45rem 0.75rem 0.45rem 2.2rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <select 
            className="input-field"
            style={{ width: 'auto', fontSize: '0.825rem', padding: '0.45rem 0.75rem' }}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="ALL" style={{ background: '#111827' }}>All Categories</option>
            {CATEGORY_DEFINITIONS.map(c => (
              <option key={c.name} value={c.name} style={{ background: '#111827' }}>{c.name}</option>
            ))}
          </select>

          {/* CSV Export Button */}
          <button className="btn btn-secondary btn-sm" onClick={handleExportCSV} title="Export to CSV">
            <Download size={14} />
            <span>CSV Export</span>
          </button>

        </div>

      </div>

      {/* Date-Grouped Expense Entries */}
      {sortedDates.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>No expenses found matching your filter.</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>Add a new entry using Quick Entry above or use Notepad Import!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {sortedDates.map(dateStr => {
            const dayItems = groupedByDate[dateStr];
            const dayTotal = dayItems.reduce((acc, curr) => acc + Number(curr.amount), 0);

            return (
              <div key={dateStr} style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem' }}>
                
                {/* Date Header & Subtotal */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.9rem', color: '#60A5FA' }}>
                    <Calendar size={15} />
                    <span>{formatDateLabel(dateStr)}</span>
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#34D399' }}>
                    Day Total: ₹{dayTotal.toLocaleString('en-IN')}
                  </div>
                </div>

                {/* Items in this Date */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {dayItems.map(item => (
                    <div 
                      key={item.id}
                      style={{
                        display: 'flex',
                        justify: 'space-between',
                        alignItems: 'center',
                        padding: '0.5rem 0.75rem',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: 'var(--radius-sm)',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      {/* Left: Title & Metadata */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span 
                          style={{ 
                            width: '8px', 
                            height: '8px', 
                            borderRadius: '50%', 
                            background: colorMap[item.category] || '#3B82F6' 
                          }} 
                        />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#F8FAFC' }}>
                            {item.title}
                            {item.is_fixed && (
                              <span className="badge" style={{ marginLeft: '0.5rem', background: 'rgba(244, 63, 94, 0.15)', color: '#FB7185', fontSize: '0.675rem' }}>
                                Major Bill
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                            <span>{item.category}</span>
                            <span>•</span>
                            <span>{item.payment_method || 'UPI'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Amount & Delete */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: '#F8FAFC' }}>
                          ₹{Number(item.amount).toLocaleString('en-IN')}
                        </div>
                        <button 
                          className="btn btn-secondary btn-icon btn-sm"
                          onClick={() => onDeleteExpense(item.id)}
                          title="Delete entry"
                          style={{ color: '#F43F5E', background: 'transparent', border: 'none' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
