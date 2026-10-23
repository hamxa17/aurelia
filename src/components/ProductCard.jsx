import React, { useState } from 'react';
import { ACCENTS } from '../data/products';
import BloomShape from './BloomShape';

export default function ProductCard({ id, product, onAddToCart, onOpenQuickView }) {
  const [qty, setQty] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const [bg, fg] = ACCENTS[product.accent] || ACCENTS.rose;

  const handleMinus = (e) => {
    e.stopPropagation();
    if (qty > 1) setQty(qty - 1);
  };

  const handlePlus = (e) => {
    e.stopPropagation();
    setQty(qty + 1);
  };

  const handleAdd = (e) => {
    e.stopPropagation();
    onAddToCart(id, product, qty);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 1200);
  };

  const handleCardClick = () => {
    onOpenQuickView(id);
  };

  return (
    <div className="card" data-id={id} onClick={handleCardClick}>
      <div className="card__swatch" style={{ background: bg }}>
        <span className="card__sample">sample</span>
        {product.badge && <span className="card__badge">{product.badge}</span>}
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name} 
            style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#fff', position: 'relative', zIndex: 2, borderRadius: 'inherit' }} 
          />
        ) : (
          <span className="bloom" style={{ color: fg }}>
            <BloomShape />
          </span>
        )}
      </div>
      <div>
        <div className="card__name">{product.name}</div>
        <div className="card__note">{product.note}</div>
      </div>
      <div className="card__meta">
        <div className="card__price">৳{product.price.toFixed(2)}</div>
      </div>
      <div className="card__actions" onClick={(e) => e.stopPropagation()}>
        <div className="stepper">
          <button className="step-minus" onClick={handleMinus} aria-label="decrease">−</button>
          <span className="stepper__val">{qty}</span>
          <button className="step-plus" onClick={handlePlus} aria-label="increase">+</button>
        </div>
        <button className={`btn-add ${isAdded ? 'added' : ''}`} onClick={handleAdd}>
          {isAdded ? 'added ' : 'add '}
          <BloomShape width="11" height="11" style={{ opacity: 0.8 }} />
        </button>
      </div>
    </div>
  );
}
