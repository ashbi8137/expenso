import React, { useState } from 'react';
import { PieChart, Filter, Calendar, Layers, IndianRupee } from 'lucide-react';
import { CATEGORY_DEFINITIONS } from '../utils/parser';

export function CategoryAnalytics({ expenses, categories = CATEGORY_DEFINITIONS }) {
  const [filterRange, setFilterRange] = useState('ALL'); // ALL, TODAY, YESTERDAY, THIS_WEEK

  const todayStr = new Date().toISOString().split('T')[0];
  
  const yesterdayObj = new Date();
  yesterdayObj.setDate(yesterdayObj.getDate() - 1);
  const yesterdayStr = yesterdayObj.toISOString().split('T')[0];

  const sevenDaysAgoObj = new Date();
  sevenDaysAgoObj.setDate(sevenDaysAgoObj.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgoObj.toISOString().split('T')[0];

  // Filter expenses based on selected range
  const filteredExpenses = expenses.filter(item => {
    if (filterRange === 'TODAY') return item.date === todayStr;
    if (filterRange === 'YESTERDAY') return item.date === yesterdayStr;
    if (filterRange === 'THIS_WEEK') return item.date >= sevenDaysAgoStr;
    return true; // ALL
  });

  // Aggregate spending by category
  const categoryTotals = {};
  let filteredTotal = 0;

  filteredExpenses.forEach(item => {
    const amt = Number(item.amount) || 0;
    filteredTotal += amt;
    categoryTotals[item.category] = (categoryTotals[item.category] || 0) + amt;
  });

  // Prepare color lookup
  const colorMap = {};
  [...CATEGORY_DEFINITIONS, ...categories].forEach(c => {
    colorMap[c.name] = c.color || '#3B82F6';
  });

  // Sort categories by total spending descending
  const sortedCategories = Object.entries(categoryTotals)
    .map(([catName, total]) => ({
      name: catName,
      total,
      percentage: filteredTotal > 0 ? Math.round((total / filteredTotal) * 100) : 0,
      color: colorMap[catName] || '#3B82F6'
    }))
    .sort((a, b) => b.total - a.total);

  return (
    <div className="glass-card mb-4">
      
      {/* Header & Filter Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PieChart size={20} color="#60A5FA" />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Category Breakdown</h2>
          <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60A5FA' }}>
            ₹{filteredTotal.toLocaleString('en-IN')} Total
          </span>
        </div>

        {/* Filter Pill Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
          <Filter size={14} color="var(--text-muted)" style={{ marginRight: '0.25rem' }} />
          {[
            { id: 'ALL', label: 'All (Since Move)' },
            { id: 'TODAY', label: 'Today' },
            { id: 'YESTERDAY', label: 'Yesterday' },
            { id: 'THIS_WEEK', label: 'Last 7 Days' }
          ].map(tab => (
            <button
              key={tab.id}
              className={`chip-btn ${filterRange === tab.id ? 'active' : ''}`}
              onClick={() => setFilterRange(tab.id)}
              style={{ fontSize: '0.775rem', padding: '0.3rem 0.75rem' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

      </div>

      {/* Category Progress Bars Grid */}
      {sortedCategories.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          No expenses recorded for this filter range.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {sortedCategories.map((cat, idx) => (
            <div key={idx} style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              
              {/* Category Info Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: cat.color, display: 'inline-block' }} />
                  <span>{cat.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    {cat.percentage}% of total
                  </span>
                  <span style={{ fontWeight: 700, color: '#F8FAFC', fontSize: '0.95rem' }}>
                    ₹{cat.total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Visual Progress Bar */}
              <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    width: `${cat.percentage}%`, 
                    height: '100%', 
                    background: cat.color, 
                    borderRadius: '4px',
                    transition: 'width 0.4s ease-out'
                  }} 
                />
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
