import React, { useState, useEffect } from 'react';
import { FileText, X, CheckCircle, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { parseNotepadText } from '../utils/parser';

export function NotepadModal({ isOpen, onClose, initialText, onImportBatch, categories }) {
  const [text, setText] = useState(initialText || '');
  const [parsedItems, setParsedItems] = useState([]);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (text) {
      const items = parseNotepadText(text);
      setParsedItems(items);
    } else {
      setParsedItems([]);
    }
  }, [text]);

  if (!isOpen) return null;

  const totalParsedAmount = parsedItems.reduce((acc, curr) => acc + curr.amount, 0);

  const handleImport = async () => {
    if (parsedItems.length === 0) return;
    setIsImporting(true);
    await onImportBatch(parsedItems);
    setIsImporting(false);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ background: 'rgba(139, 92, 246, 0.15)', padding: '0.4rem', borderRadius: '10px' }}>
              <FileText size={20} color="#C084FC" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Notepad Batch Importer</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Paste raw daily notes to parse & import all entries at once</p>
            </div>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Text Area Input */}
        <div className="input-group" style={{ marginBottom: '1.25rem' }}>
          <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Raw Notepad Text</span>
            <span style={{ color: '#C084FC', textTransform: 'none' }}>Pre-filled with your July 19–28 log!</span>
          </label>
          <textarea
            className="input-field"
            rows={8}
            style={{ fontFamily: 'monospace', fontSize: '0.875rem', lineHeight: '1.6' }}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`July 19 :\nTrain ticket - 220\nTea - 15\nUber - 90\nTotal : 325`}
          />
        </div>

        {/* Live Parse Preview Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', padding: '0.5rem 0.75rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', fontWeight: 600 }}>
            <Sparkles size={16} color="#F59E0B" />
            <span>Parsed {parsedItems.length} Entries</span>
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#34D399' }}>
            Total: ₹{totalParsedAmount.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Preview List Table */}
        <div style={{ maxHeight: '220px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.5rem', marginBottom: '1.25rem', background: 'var(--bg-input)' }}>
          {parsedItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)', fontSize: '0.875rem' }}>
              <AlertCircle size={24} style={{ marginBottom: '0.5rem', opacity: 0.6 }} />
              <p>No valid expense items found. Make sure entries use formats like "Breakfast - 34" or "Lunch : 70" under date headers like "July 20 :"</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'left' }}>
                  <th style={{ padding: '0.4rem' }}>Date</th>
                  <th style={{ padding: '0.4rem' }}>Title</th>
                  <th style={{ padding: '0.4rem' }}>Category</th>
                  <th style={{ padding: '0.4rem', textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {parsedItems.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '0.4rem', color: 'var(--text-muted)' }}>{item.date}</td>
                    <td style={{ padding: '0.4rem', fontWeight: 600, color: '#F8FAFC' }}>{item.title}</td>
                    <td style={{ padding: '0.4rem' }}>
                      <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#60A5FA', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                        {item.category}
                      </span>
                    </td>
                    <td style={{ padding: '0.4rem', textAlign: 'right', fontWeight: 700, color: '#34D399' }}>
                      ₹{item.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="btn btn-accent"
            onClick={handleImport}
            disabled={parsedItems.length === 0 || isImporting}
          >
            <CheckCircle size={16} />
            <span>{isImporting ? 'Importing...' : `Import ${parsedItems.length} Entries (₹${totalParsedAmount.toLocaleString('en-IN')})`}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
