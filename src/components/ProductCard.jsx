import React, { useState } from 'react';
import { formatTaka, noteDetail } from '../data/catalog';
import BloomShape from './BloomShape';
import StockBadge from './StockBadge';
import ProductVisual from './ProductVisual';

export default function ProductCard({ id, product, onAddToCart, onOpenQuickView }) {
  const [isAdded, setIsAdded] = useState(false);
  const soldOut = product.stock === 0;
  const detail = noteDetail(product);

  const handleAdd = (e) => {
    e.stopPropagation();
    onAddToCart(id, product, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  };

  return (
    <div className={`card ${soldOut ? 'card--soldout' : ''}`} data-id={id} onClick={() => onOpenQuickView(id)}>
      <ProductVisual product={product} className="card__swatch" />
      <div className="card__text">
        <div className="card__brand">{product.brand || ' '}</div>
        <div className="card__name">{product.name}</div>
        {detail && <div className="card__note">{detail}</div>}
      </div>
      <div className="card__buy" onClick={(e) => e.stopPropagation()}>
        <div className="card__price">{formatTaka(product.price)}</div>
        <StockBadge stock={product.stock} />
        <button className={`btn-add btn-add--slim ${isAdded ? 'added' : ''}`} onClick={handleAdd} disabled={soldOut} aria-label={`Add ${product.name} to bag`}>
          {soldOut ? 'Sold out' : isAdded ? 'Added' : 'Add'}
          <BloomShape width="11" height="11" />
        </button>
      </div>
    </div>
  );
}
