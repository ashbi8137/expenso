import React, { useState, useEffect } from 'react';
import { 
  Home, 
  PlusCircle, 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  Trash2, 
  Plus, 
  Download,
  Utensils,
  Car,
  ShoppingBag,
  Home as HomeIcon,
  Activity,
  Zap,
  Users,
  Tag,
  BarChart3,
  Calendar,
  Sparkles,
  User,
  Receipt
} from 'lucide-react';

import { CATEGORY_DEFINITIONS, autoDetectCategory } from './utils/parser';
import { 
  fetchExpenses, 
  addExpense, 
  deleteExpense,
  clearAllExpenses,
  getStoredCategories,
  saveCustomCategory,
  getLockedUser,
  saveLockedUser
} from './services/storage';

import { AddCategoryModal } from './components/AddCategoryModal';
import { WelcomeSetupScreen } from './components/WelcomeSetupScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState('home'); // home, add, stats
  const [userName, setUserName] = useState('');
  const [isSetupDone, setIsSetupDone] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState(CATEGORY_DEFINITIONS);

  // Modals
  const [isAddCatModalOpen, setIsAddCatModalOpen] = useState(false);

  // Form State
  const todayStr = new Date().toISOString().split('T')[0];
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food & Dining');
  const [date, setDate] = useState(todayStr);
  const [formError, setFormError] = useState('');

  // Stats Filter State
  const [statsFilter, setStatsFilter] = useState('ALL');

  useEffect(() => {
    const customCats = getStoredCategories();
    if (customCats.length > 0) {
      setCategories([...CATEGORY_DEFINITIONS, ...customCats]);
    }

    const savedName = getLockedUser();
    if (savedName) {
      setUserName(savedName);
      setIsSetupDone(true);
      loadData();
    }
  }, []);

  const loadData = async () => {
    const loaded = await fetchExpenses();
    setExpenses(loaded || []);
  };

  const handleSetupComplete = (name) => {
    const saved = saveLockedUser(name);
    setUserName(saved);
    setIsSetupDone(true);
    loadData();
  };

  // Clean Quick Presets
  const PRESETS = [
    { title: 'Breakfast', category: 'Food & Dining' },
    { title: 'Lunch', category: 'Food & Dining' },
    { title: 'Dinner', category: 'Food & Dining' },
    { title: 'Tea', category: 'Food & Dining' },
    { title: 'Uber', category: 'Transportation' },
    { title: 'Grocery', category: 'Shopping & Supplies' }
  ];

  const handleQuickAdd = (p) => {
    setTitle(p.title);
    setCategory(p.category);
    setAmount('');
    setDate(todayStr);
    setFormError('');
    setActiveTab('add');
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setFormError('Please enter a valid expense title.');
      return;
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError('Please enter a valid positive amount.');
      return;
    }

    if (date > todayStr) {
      setFormError('Future dates are not allowed. Please select today or a past date.');
      return;
    }

    const created = await addExpense({
      title: trimmedTitle,
      amount: numAmount,
      category,
      date,
      payment_method: 'UPI',
      is_fixed: false
    });

    if (created) {
      setExpenses(prev => [created, ...prev]);
    }
    setTitle('');
    setAmount('');
    setFormError('');
    setActiveTab('home');
  };

  const handleAddCategory = (newCat) => {
    const updatedCustoms = saveCustomCategory(newCat);
    setCategories([...CATEGORY_DEFINITIONS, ...updatedCustoms]);
  };

  const handleClearHistory = async () => {
    if (window.confirm(`Clear all expense history for ${userName}?`)) {
      await clearAllExpenses();
      setExpenses([]);
    }
  };

  // Icon & Background Helper
  const getCategoryIcon = (catName) => {
    switch (catName) {
      case 'Food & Dining': return <Utensils size={18} color="#059669" />;
      case 'Transportation': return <Car size={18} color="#2563EB" />;
      case 'Shopping & Supplies': return <ShoppingBag size={18} color="#D97706" />;
      case 'Housing & Rent': return <HomeIcon size={18} color="#DC2626" />;
      case 'Fitness & Health': return <Activity size={18} color="#7C3AED" />;
      case 'Utilities & Bills': return <Zap size={18} color="#0284C7" />;
      case 'Transfers & Friends': return <Users size={18} color="#DB2777" />;
      default: return <Tag size={18} color="#64748B" />;
    }
  };

  const getCategoryBg = (catName) => {
    switch (catName) {
      case 'Food & Dining': return '#ECFDF5';
      case 'Transportation': return '#EFF6FF';
      case 'Shopping & Supplies': return '#FFFBEB';
      case 'Housing & Rent': return '#FEF2F2';
      case 'Fitness & Health': return '#F5F3FF';
      case 'Utilities & Bills': return '#F0F9FF';
      case 'Transfers & Friends': return '#FDF2F8';
      default: return '#F1F5F9';
    }
  };

  // If user profile is not set, render 1-time full screen setup page
  if (!isSetupDone) {
    return <WelcomeSetupScreen onComplete={handleSetupComplete} />;
  }

  // Calculations
  const yesterdayObj = new Date();
  yesterdayObj.setDate(yesterdayObj.getDate() - 1);
  const yesterdayStr = yesterdayObj.toISOString().split('T')[0];

  let grandTotal = 0;
  let todayTotal = 0;
  let yesterdayTotal = 0;
  let routineTotal = 0;
  let fixedTotal = 0;

  const dateTotalsMap = {};

  expenses.forEach(item => {
    const amt = Number(item.amount) || 0;
    grandTotal += amt;
    if (item.date === todayStr) todayTotal += amt;
    if (item.date === yesterdayStr) yesterdayTotal += amt;

    if (item.is_fixed || ['Housing & Rent', 'Fitness & Health'].includes(item.category)) {
      fixedTotal += amt;
    } else {
      routineTotal += amt;
    }

    dateTotalsMap[item.date] = (dateTotalsMap[item.date] || 0) + amt;
  });

  const activeDaysCount = Math.max(1, Object.keys(dateTotalsMap).length);
  const dailyRoutineAvg = Math.round(routineTotal / activeDaysCount);

  const diffYesterday = todayTotal - yesterdayTotal;
  const isHigher = diffYesterday > 0;
  const absDiff = Math.abs(diffYesterday);

  // CSV Export
  const handleExportCSV = () => {
    if (expenses.length === 0) return;
    const headers = ['Date', 'Title', 'Amount', 'Category'];
    const rows = expenses.map(e => [e.date, `"${e.title}"`, e.amount, `"${e.category}"`]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Expenso_${userName}_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="app-shell">
      
      {/* Top Header */}
      <header className="top-header">
        <h1 className="app-title">Expenso</h1>
        
        {/* Permanent Locked User Badge (Non-clickable) */}
        <div 
          className="date-pill"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid #10B981', background: '#ECFDF5', color: '#047857' }}
        >
          <User size={14} />
          <span>{userName}</span>
        </div>
      </header>

      {/* TAB 1: HOME */}
      {activeTab === 'home' && (
        <div>
          
          {/* Today Total Card */}
          <div className="today-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="today-label">
                Hello, {userName} 👋
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>

            <div className="today-amount">₹{todayTotal.toLocaleString('en-IN')}</div>

            {/* Yesterday Comparison Pill */}
            <div>
              {yesterdayTotal === 0 ? (
                <span className="compare-badge" style={{ background: 'rgba(255,255,255,0.15)', color: '#E2E8F0' }}>
                  Yesterday: ₹0 recorded
                </span>
              ) : (
                <span className={`compare-badge ${isHigher ? 'compare-up' : 'compare-down'}`}>
                  {isHigher ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  <span>{isHigher ? `+₹${absDiff} vs yesterday` : `-₹${absDiff} lower than yesterday`}</span>
                </span>
              )}
            </div>
          </div>

          {/* Summary Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', margin: '0 1.25rem 1rem' }}>
            <div style={{ background: '#FFFFFF', padding: '0.85rem 1rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Overall Total</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#3B82F6', marginTop: '0.2rem' }}>
                ₹{grandTotal.toLocaleString('en-IN')}
              </div>
            </div>
            <div style={{ background: '#FFFFFF', padding: '0.85rem 1rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Daily Routine Avg</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10B981', marginTop: '0.2rem' }}>
                ~₹{dailyRoutineAvg}/day
              </div>
            </div>
          </div>

          {/* Static Non-Scrolling 1-Tap Quick Log Grid */}
          <div style={{ margin: '0 1.25rem 1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.775rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                1-Tap Quick Log
              </span>
            </div>

            <div className="preset-grid">
              {PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  className="preset-button"
                  onClick={() => handleQuickAdd(p)}
                >
                  + {p.title}
                </button>
              ))}
            </div>
          </div>

          {/* Daily Transactions */}
          <div style={{ margin: '0 1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <span style={{ fontSize: '0.775rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Recent Transactions
              </span>
              {expenses.length > 0 && (
                <button 
                  onClick={handleClearHistory}
                  style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '0.725rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Clear History
                </button>
              )}
            </div>

            {expenses.length === 0 ? (
              <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '20px', padding: '1.75rem 1rem', textAlign: 'center' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                  <Receipt size={22} color="#10B981" />
                </div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  No transactions yet
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Tap <span style={{ color: '#10B981', fontWeight: 700 }}>+ Add Expense</span> below to log an entry
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {expenses.map(item => (
                  <div key={item.id} className="item-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="item-icon" style={{ background: getCategoryBg(item.category) }}>
                        {getCategoryIcon(item.category)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{item.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                          {item.date} • {item.category}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                        ₹{item.amount}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: ADD ENTRY */}
      {activeTab === 'add' && (
        <div style={{ padding: '0 1.25rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '1rem 0 1.25rem' }}>Add New Expense</h2>

          <form onSubmit={handleAddSubmit} className="clean-card" style={{ margin: 0 }}>
            
            {formError && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', padding: '0.65rem 0.85rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '1rem' }}>
                ⚠️ {formError}
              </div>
            )}

            <div className="clean-input-group">
              <label className="clean-label">Amount (₹)</label>
              <input 
                type="number"
                step="any"
                min="0.01"
                className="clean-input"
                placeholder="0.00"
                style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10B981', background: '#ECFDF5' }}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="clean-input-group">
              <label className="clean-label">Expense Title</label>
              <input 
                type="text"
                className="clean-input"
                placeholder="e.g. Lunch, Tea, Auto, Uber"
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

            <div className="clean-input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="clean-label">Category</label>
                <button
                  type="button"
                  onClick={() => setIsAddCatModalOpen(true)}
                  style={{ background: 'none', border: 'none', color: '#10B981', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                >
                  + Custom Category
                </button>
              </div>
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

            <div className="clean-input-group">
              <label className="clean-label">Date (Past or Today only)</label>
              <input 
                type="date"
                max={todayStr}
                className="clean-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="action-btn" style={{ marginTop: '0.5rem' }}>
              <Plus size={20} />
              <span>Save Entry</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: STATS & REPORTS */}
      {activeTab === 'stats' && (
        <div style={{ padding: '0 1.25rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1rem 0 1.25rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Reports & Analytics
            </h2>
            
            {/* CSV Backup */}
            {expenses.length > 0 && (
              <button 
                onClick={handleExportCSV}
                style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#2563EB', padding: '0.4rem 0.75rem', borderRadius: '12px', fontSize: '0.775rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Download size={15} />
                <span>Export CSV</span>
              </button>
            )}
          </div>

          {/* Analytical Overview Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            
            <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Daily Routine Living</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669', marginTop: '0.2rem' }}>
                ₹{routineTotal.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Avg ~₹{dailyRoutineAvg}/day
              </div>
            </div>

            <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fixed Bills & Rent</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#DC2626', marginTop: '0.2rem' }}>
                ₹{fixedTotal.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Rent, Gym & Equipment
              </div>
            </div>

          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            {[
              { id: 'ALL', label: 'All Time' },
              { id: 'TODAY', label: 'Today' },
              { id: 'YESTERDAY', label: 'Yesterday' }
            ].map(t => (
              <button
                key={t.id}
                className="preset-button"
                style={{
                  background: statsFilter === t.id ? '#10B981' : '#FFFFFF',
                  color: statsFilter === t.id ? '#FFFFFF' : 'var(--text-primary)',
                  borderColor: statsFilter === t.id ? '#10B981' : 'var(--border)',
                  borderRadius: '9999px',
                  padding: '0.35rem 0.85rem'
                }}
                onClick={() => setStatsFilter(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Category Distribution Breakdown */}
          {(() => {
            const filtered = expenses.filter(i => {
              if (statsFilter === 'TODAY') return i.date === todayStr;
              if (statsFilter === 'YESTERDAY') return i.date === yesterdayStr;
              return true;
            });

            const catTotals = {};
            let sum = 0;
            filtered.forEach(i => {
              const a = Number(i.amount) || 0;
              sum += a;
              catTotals[i.category] = (catTotals[i.category] || 0) + a;
            });

            const sorted = Object.entries(catTotals)
              .map(([name, tot]) => ({ name, tot, pct: sum > 0 ? Math.round((tot/sum)*100) : 0 }))
              .sort((a,b) => b.tot - a.tot);

            if (sorted.length === 0) {
              return (
                <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '20px', padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No entries for this period.
                </div>
              );
            }

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {sorted.map((c, i) => (
                  <div key={i} className="clean-card" style={{ margin: 0, padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.925rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{c.name}</span>
                      <span style={{ fontWeight: 800, color: '#10B981' }}>₹{c.tot} ({c.pct}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${c.pct}%`, height: '100%', background: '#10B981', borderRadius: '4px' }} />
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

        </div>
      )}

      {/* 3-TAB BOTTOM NAVIGATION BAR */}
      <nav className="bottom-bar-3tab">
        <button 
          className={`tab-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          <Home size={22} />
          <span>Home</span>
        </button>

        {/* Center Distinct Action Button */}
        <button 
          className="center-add-button"
          onClick={() => setActiveTab('add')}
        >
          <Plus size={18} />
          <span>Add Expense</span>
        </button>

        <button 
          className={`tab-item ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          <BarChart3 size={22} />
          <span>Stats</span>
        </button>
      </nav>

      {/* Custom Category Modal */}
      <AddCategoryModal 
        isOpen={isAddCatModalOpen}
        onClose={() => setIsAddCatModalOpen(false)}
        onAddCategory={handleAddCategory}
      />

    </div>
  );
}
