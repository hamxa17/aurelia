import React, { useState } from 'react';
import { ACCENTS, getProductDetails } from '../data/products';
import BloomShape from './BloomShape';

export default function QuickViewModal({ product, onClose, onAddToCart }) {
  const [activeTab, setActiveTab] = useState('details');
  const [stepperVal, setStepperVal] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  if (!product) return null;

  const details = getProductDetails(product.name, product.note);
  const [bg, fg] = ACCENTS[product.accent] || ACCENTS.rose;

  const handleMinus = () => {
    if (stepperVal > 1) setStepperVal(stepperVal - 1);
  };

  const handlePlus = () => {
    setStepperVal(stepperVal + 1);
  };

  const handleAdd = () => {
    onAddToCart(product.id, product, stepperVal);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 800);
  };

  // Review statistics
  const reviews = details.reviews || [];
  const hasReviews = reviews.length > 0;
  const avgRating = hasReviews
    ? Math.round(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length)
    : 5;
  const starsString = '★'.repeat(avgRating) + '☆'.repeat(5 - avgRating);

  return (
    <>
      <div className="qv-overlay" id="qvOverlay" onClick={onClose} />
      <div className="qv-modal" id="qvModal">
        <button className="qv-close" onClick={onClose} aria-label="Close modal">&times;</button>
        <div className="qv-body">
          <div className="qv-visual" style={{ backgroundColor: bg }}>
            {product.image ? (
              <img 
                src={product.image} 
                alt={product.name} 
                style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#fff', position: 'relative', zIndex: 1 }} 
              />
            ) : (
              <span className="bloom" style={{ color: fg }}>
                <BloomShape />
              </span>
            )}
          </div>

          <div className="qv-content">
            {product.badge && <div className="qv-badge label">{product.badge}</div>}
            <h2 className="qv-title">{product.name}</h2>
            <div className="qv-price">৳{product.price.toFixed(2)}</div>
            <p className="qv-tagline">{product.note}</p>

            <div className="qv-tabs">
              <button 
                className={`qv-tab ${activeTab === 'details' ? 'active' : ''}`}
                onClick={() => setActiveTab('details')}
              >
                Details
              </button>
              <button 
                className={`qv-tab ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                Reviews
              </button>
            </div>

            <div className={`qv-panel ${activeTab === 'details' ? 'active' : ''}`}>
              <p>{product.description || details.description}</p>
            </div>

            <div className={`qv-panel ${activeTab === 'reviews' ? 'active' : ''}`}>
              <div className="qv-rating-summary">
                <span className="qv-stars">{starsString}</span>
                <span id="qvRatingCount">
                  {hasReviews ? `${reviews.length} review${reviews.length > 1 ? 's' : ''}` : '0 reviews'}
                </span>
              </div>
              <div className="qv-reviews-list">
                {hasReviews ? (
                  reviews.map((r, idx) => (
                    <div className="qv-review-item" key={idx}>
                      <div className="qv-review-head">
                        <span className="qv-review-user">{r.user}</span>
                        <span className="qv-stars">{'★'.repeat(r.rating) + '☆'.repeat(5 - r.rating)}</span>
                      </div>
                      <div className="qv-review-comment">{r.comment}</div>
                    </div>
                  ))
                ) : (
                  <div className="cart-empty" style={{ padding: '20px 0' }}>
                    No reviews yet. Be the first to review!
                  </div>
                )}
              </div>
            </div>

            <div className="qv-actions">
              <div className="stepper stepper--qv">
                <button onClick={handleMinus} aria-label="decrease">−</button>
                <span className="stepper__val">{stepperVal}</span>
                <button onClick={handlePlus} aria-label="increase">+</button>
              </div>
              <button className={`btn-add btn-add--qv ${isAdded ? 'added' : ''}`} onClick={handleAdd}>
                {isAdded ? 'added ' : 'add to bag'}
                {isAdded && <BloomShape width="11" height="11" style={{ opacity: 0.8 }} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
