import React from 'react';
import { ACCENTS } from '../data/products';
import BloomShape from './BloomShape';

// One look for every product: the photo sits on its soft tint with a small shadow underneath.
// Products without a photo show their name, set in the serif, instead of clip-art.
export default function ProductVisual({ product, className = '', showBadge = true, compact = false }) {
  const [bg, fg] = ACCENTS[product.accent] || ACCENTS.rose;
  return (
    <div className={`pv ${className}`} style={{ '--pv-bg': bg, '--pv-fg': fg }}>
      {showBadge && product.badge && <span className="card__badge">{product.badge}</span>}
      {product.image ? (
        <>
          <img className="pv__img" src={product.image} alt={[product.brand, product.name].filter(Boolean).join(' ')} loading="lazy" />
          <span className="pv__shadow" aria-hidden="true" />
        </>
      ) : (
        compact ? (
          <span className="pv__bloom pv__bloom--small" aria-hidden="true"><BloomShape /></span>
        ) : (
          <span className="pv__type" aria-hidden="true">
            <span className="pv__bloom"><BloomShape /></span>
            {(product.subcategory || product.brand) && <span className="pv__brand">{product.subcategory || product.brand}</span>}
          </span>
        )
      )}
    </div>
  );
}
