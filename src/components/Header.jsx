import React from 'react';
import { Wallet, Database, FileText, PlusCircle, CheckCircle2, Sparkles } from 'lucide-react';

export function Header({ isSupabaseConnected, onOpenNotepad, onOpenSupabaseModal, totalCount }) {
  return (
    <header className="glass-card mb-4 style-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)',
            padding: '0.65rem',
            borderRadius: '14px',
            display: 'flex',
            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)'
          }}>
            <Wallet size={26} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #F8FAFC 0%, #94A3B8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Expenso
              </h1>
              <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34D399', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                Since July 19
              </span>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Effortless daily expense logging & automatic categorization
            </p>
          </div>
        </div>

        {/* Quick Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          
          {/* Notepad Importer Trigger */}
          <button 
            className="btn btn-secondary btn-sm"
            onClick={onOpenNotepad}
            title="Import raw notes from your phone or notepad"
            style={{ background: 'rgba(139, 92, 246, 0.12)', borderColor: 'rgba(139, 92, 246, 0.3)', color: '#C084FC' }}
          >
            <FileText size={16} />
            <span>Notepad Import</span>
            <Sparkles size={14} style={{ opacity: 0.8 }} />
          </button>

          {/* Database Connection Button */}
          <button 
            className="btn btn-secondary btn-sm"
            onClick={onOpenSupabaseModal}
            style={{
              background: isSupabaseConnected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.05)',
              borderColor: isSupabaseConnected ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-color)',
              color: isSupabaseConnected ? '#34D399' : 'var(--text-muted)'
            }}
          >
            <Database size={16} />
            <span>{isSupabaseConnected ? 'Supabase Connected' : 'Connect Supabase'}</span>
            {isSupabaseConnected && <CheckCircle2 size={14} color="#34D399" />}
          </button>

        </div>

      </div>
    </header>
  );
}
