import React from 'react';
import { IndianRupee, TrendingUp, TrendingDown, Calendar, ShieldAlert, Sparkles, Coffee, Home } from 'lucide-react';

export function MetricCards({ expenses, moveInDate = '2026-07-19' }) {
  // Current local date format YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];
  
  // Yesterday local date format YYYY-MM-DD
  const yesterdayObj = new Date();
  yesterdayObj.setDate(yesterdayObj.getDate() - 1);
  const yesterdayStr = yesterdayObj.toISOString().split('T')[0];

  // Calculate totals
  let grandTotal = 0;
  let todayTotal = 0;
  let yesterdayTotal = 0;
  let routineTotal = 0;
  let fixedTotal = 0;

  const dateMap = {};

  expenses.forEach(item => {
    const amt = Number(item.amount) || 0;
    grandTotal += amt;

    if (item.date === todayStr) {
      todayTotal += amt;
    }
    if (item.date === yesterdayStr) {
      yesterdayTotal += amt;
    }

    if (item.is_fixed || ['Housing & Rent', 'Fitness & Health'].includes(item.category)) {
      fixedTotal += amt;
    } else {
      routineTotal += amt;
    }

    dateMap[item.date] = (dateMap[item.date] || 0) + amt;
  });

  // Calculate days active since move-in
  const activeDaysCount = Math.max(1, Object.keys(dateMap).length);
  const dailyRoutineAvg = Math.round(routineTotal / activeDaysCount);

  // Yesterday comparison calculation
  const diffYesterday = todayTotal - yesterdayTotal;
  const isHigherThanYesterday = diffYesterday > 0;
  const absDiff = Math.abs(diffYesterday);
  let percentDiff = 0;
  if (yesterdayTotal > 0) {
    percentDiff = Math.round((absDiff / yesterdayTotal) * 100);
  }

  return (
    <div className="grid-4 mb-4">

      {/* Card 1: Total Spent Since Move-In */}
      <div className="glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-15px', right: '-15px', width: '80px', height: '80px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Overall Total Spent
          </span>
          <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '0.4rem', borderRadius: '10px' }}>
            <IndianRupee size={18} color="#60A5FA" />
          </div>
        </div>
        <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#F8FAFC', letterSpacing: '-0.03em' }}>
          ₹{grandTotal.toLocaleString('en-IN')}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.35rem', fontSize: '0.775rem', color: 'var(--text-muted)' }}>
          <Calendar size={13} color="#94A3B8" />
          <span>Tracked across {activeDaysCount} days</span>
        </div>
      </div>

      {/* Card 2: Today's Expense vs Yesterday Comparison */}
      <div className="glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Today's Expense
          </span>
          <div style={{ background: isHigherThanYesterday ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)', padding: '0.4rem', borderRadius: '10px' }}>
            {isHigherThanYesterday ? <TrendingUp size={18} color="#F43F5E" /> : <TrendingDown size={18} color="#34D399" />}
          </div>
        </div>
        <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#F8FAFC', letterSpacing: '-0.03em' }}>
          ₹{todayTotal.toLocaleString('en-IN')}
        </div>
        
        {/* Yesterday Comparison Pill */}
        <div style={{ marginTop: '0.35rem' }}>
          {yesterdayTotal === 0 ? (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Yesterday: ₹0 recorded
            </span>
          ) : (
            <span className="badge" style={{
              background: isHigherThanYesterday ? 'rgba(244, 63, 94, 0.12)' : 'rgba(16, 185, 129, 0.12)',
              color: isHigherThanYesterday ? '#FB7185' : '#34D399',
              border: `1px solid ${isHigherThanYesterday ? 'rgba(244, 63, 94, 0.25)' : 'rgba(16, 185, 129, 0.25)'}`,
              fontSize: '0.75rem'
            }}>
              {isHigherThanYesterday ? `+₹${absDiff} (${percentDiff}%) vs yesterday` : `-₹${absDiff} (${percentDiff}%) lower than yesterday`}
            </span>
          )}
        </div>
      </div>

      {/* Card 3: Routine Daily Living Spend */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Daily Routine Spend
          </span>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.4rem', borderRadius: '10px' }}>
            <Coffee size={18} color="#34D399" />
          </div>
        </div>
        <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#34D399', letterSpacing: '-0.03em' }}>
          ₹{routineTotal.toLocaleString('en-IN')}
        </div>
        <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
          Avg: ~₹{dailyRoutineAvg}/day (Food, Tea, Commute)
        </div>
      </div>

      {/* Card 4: Major Fixed & One-off Expenses */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Fixed / One-Off Bills
          </span>
          <div style={{ background: 'rgba(139, 92, 246, 0.15)', padding: '0.4rem', borderRadius: '10px' }}>
            <Home size={18} color="#C084FC" />
          </div>
        </div>
        <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#C084FC', letterSpacing: '-0.03em' }}>
          ₹{fixedTotal.toLocaleString('en-IN')}
        </div>
        <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
          Room rent, Gym & Equipment
        </div>
      </div>

    </div>
  );
}
