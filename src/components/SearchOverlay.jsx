import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ACCENTS } from '../data/products';
import { formatTaka } from '../data/catalog';
import BloomShape from './BloomShape';
import StockBadge from './StockBadge';

const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export default function SearchOverlay({ isOpen, products, onClose, onOpenProduct }) {
  const [q, setQ] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 50);
    else setQ('');
  }, [isOpen]);

  const results = useMemo(() => {
    const terms = norm(q).split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return products
      .filter((p) => {
        const hay = norm([p.brand, p.name, p.note, p.subcategory, p.section].join(' '));
        return terms.every((t) => hay.includes(t));
      })
      .slice(0, 12);
  }, [q, products]);

  if (!isOpen) return null;

  return (
    <>
      <div className="search-overlay" onClick={onClose} />
      <div className="search-panel" role="dialog" aria-label="Search products">
        <div className="search-bar">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" strokeLinecap="round" /></svg>
          <input ref={inputRef} autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products, brands…" aria-label="Search" />
          <button onClick={onClose} aria-label="Close search">&times;</button>
        </div>
        {q && (
          <div className="search-results">
            {results.length === 0 ? (
              <div className="search-empty">Nothing found for “{q}”.</div>
            ) : (
              results.map((p) => {
                const [bg, fg] = ACCENTS[p.accent] || ACCENTS.rose;
                return (
                  <button key={p.id} className="search-item" onClick={() => onOpenProduct(p)}>
                    <span className="search-item__img" style={{ background: p.image ? '#fff' : bg }}>
                      {p.image ? <img src={p.image} alt="" /> : <span className="bloom" style={{ color: fg }}><BloomShape /></span>}
                    </span>
                    <span className="search-item__text">
                      {p.brand && <span className="card__brand">{p.brand}</span>}
                      <span className="search-item__name">{p.name}</span>
                      <StockBadge stock={p.stock} />
                    </span>
                    <span className="search-item__price">{formatTaka(p.price)}</span>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>
    </>
  );
}
