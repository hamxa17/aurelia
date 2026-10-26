import React from 'react';

// stock: null = not tracked, 0 = sold out, 1–5 = running low
export default function StockBadge({ stock, large = false }) {
  if (stock == null || stock > 5) {
    return large && stock != null ? <div className="stock stock--ok">In stock</div> : null;
  }
  if (stock === 0) return <div className={`stock stock--out ${large ? 'stock--lg' : ''}`}>Out of stock</div>;
  return <div className={`stock stock--low ${large ? 'stock--lg' : ''}`}>Only {stock} left</div>;
}
