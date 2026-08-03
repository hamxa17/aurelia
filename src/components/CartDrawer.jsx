import React from 'react';
import { ACCENTS } from '../data/products';
import BloomShape from './BloomShape';

export default function CartDrawer({ cart, onClose, onUpdateQty, onRemoveItem }) {
  const entries = Object.entries(cart);
  const subtotal = entries.reduce((sum, [, item]) => sum + item.product.price * item.qty, 0);

  return (
    <>
      <div className="cart-overlay" id="cartOverlay" onClick={onClose} />
      <div className="cart-drawer" id="cartDrawer">
        <div className="cart-drawer__head">
          <div className="display" style={{ fontSize: '20px' }}>your bag</div>
          <button className="cart-drawer__close" onClick={onClose}>&times;</button>
        </div>
        
        <div className="cart-drawer__items">
          {entries.length === 0 ? (
            <div className="cart-empty">Your bag is empty — go find something to love.</div>
          ) : (
            entries.map(([id, { product, qty }]) => {
              const [bg, fg] = ACCENTS[product.accent] || ACCENTS.rose;
              return (
                <div className="cart-item" key={id} data-id={id}>
                  <div className="cart-item__swatch" style={{ background: bg, overflow: 'hidden' }}>
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    ) : (
                      <span className="bloom" style={{ color: fg }}>
                        <BloomShape />
                      </span>
                    )}
                  </div>
                  <div className="cart-item__info">
                    <div className="cart-item__name">{product.name}</div>
                    <div className="cart-item__price-each">৳{product.price.toFixed(2)} each</div>
                    <div className="cart-item__meta">
                      <div className="stepper stepper--cart">
                        <button 
                          className="cart-step-minus" 
                          onClick={() => onUpdateQty(id, -1)} 
                          aria-label="decrease"
                        >
                          −
                        </button>
                        <span className="stepper__val">{qty}</span>
                        <button 
                          className="cart-step-plus" 
                          onClick={() => onUpdateQty(id, 1)} 
                          aria-label="increase"
                        >
                          +
                        </button>
                      </div>
                      <button className="cart-item__remove" onClick={() => onRemoveItem(id)}>
                        remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="cart-drawer__foot">
          <div className="cart-drawer__subtotal">
            <span>subtotal</span>
            <span>৳{subtotal.toFixed(2)}</span>
          </div>
          <button className="cart-checkout">checkout — connect payments later</button>
        </div>
      </div>
    </>
  );
}
