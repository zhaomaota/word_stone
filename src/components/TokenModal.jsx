import React, { useEffect } from 'react';

export default function TokenModal({ open, word = '', rarity = '', trans = '', onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div id="token-modal-overlay" onClick={onClose}>
      <div id="token-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tm-header">
          <h3>{word}</h3>
          <button className="tm-close" onClick={onClose}>×</button>
        </div>

        <div className="tm-body">
          <div className={`tm-rarity tm-${rarity}`}>{rarity || 'unknown'}</div>
          <div className="tm-trans">{trans || 'No translation available.'}</div>
        </div>
      </div>
    </div>
  );
}
