import React, { Component, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught app error:", error, errorInfo);
  }

  handleClearCache = () => {
    try {
      localStorage.clear();
      window.location.reload();
    } catch (e) {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', textAlign: 'center', fontFamily: 'Outfit, sans-serif' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⚠️</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>App Needs a Quick Refresh</h2>
          
          <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', padding: '0.75rem', borderRadius: '12px', margin: '0.75rem 0 1.25rem', width: '100%', maxWidth: '340px' }}>
            <div style={{ fontSize: '0.725rem', fontWeight: 800, color: '#991B1B', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Error Details</div>
            <div style={{ fontSize: '0.8rem', color: '#DC2626', fontFamily: 'monospace', wordBreak: 'break-all' }}>
              {this.state.error?.toString() || 'Uncaught rendering exception'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', width: '100%', maxWidth: '340px' }}>
            <button 
              onClick={() => window.location.reload()}
              style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '14px', background: '#10B981', color: '#FFF', border: 'none', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}
            >
              Reload
            </button>
            <button 
              onClick={this.handleClearCache}
              style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '14px', background: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', fontWeight: 700, cursor: 'pointer' }}
            >
              Reset Cache
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
