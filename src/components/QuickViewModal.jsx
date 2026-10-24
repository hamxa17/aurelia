import React, { useEffect, useState } from 'react';
import { ACCENTS } from '../data/products';
import { fetchReviews, saveReview, deleteReview, formatTaka } from '../data/catalog';
import BloomShape from './BloomShape';

const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

export default function QuickViewModal({ product, user, isAdmin, onClose, onAddToCart, onRequestSignIn }) {
  const [activeTab, setActiveTab] = useState('details');
  const [stepperVal, setStepperVal] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [reviewsLoaded, setReviewsLoaded] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const productId = product?.id;
  const loadReviews = () =>
    fetchReviews(productId)
      .then((r) => setReviews(r))
      .catch(() => setReviews([]))
      .finally(() => setReviewsLoaded(true));

  useEffect(() => {
    if (productId) loadReviews();
  }, [productId]); // eslint-disable-line react-hooks/exhaustive-deps

  const myReview = user ? reviews.find((r) => r.user_id === user.id) : null;

  // Pre-fill the form when editing your own review
  useEffect(() => {
    if (isEditing && myReview) {
      setRating(myReview.rating);
      setComment(myReview.comment);
      setAuthorName(myReview.author_name);
    }
  }, [isEditing]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (user && !authorName) setAuthorName((user.email || '').split('@')[0].slice(0, 40));
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!product) return null;

  const [bg, fg] = ACCENTS[product.accent] || ACCENTS.rose;
  const count = reviews.length;
  const avg = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;

  const handleAdd = () => {
    onAddToCart(product.id, product, stepperVal);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 800);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setReviewError('');
    try {
      await saveReview(product.id, { author_name: authorName, rating, comment }, isEditing ? myReview.id : null);
      setComment('');
      setIsEditing(false);
      await loadReviews();
    } catch (err) {
      setReviewError(err.message || 'Could not save your review.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await deleteReview(id);
      await loadReviews();
    } catch (err) {
      setReviewError(err.message || 'Could not delete the review.');
    }
  };

  const showForm = user && (!myReview || isEditing);

  return (
    <>
      <div className="qv-overlay" id="qvOverlay" onClick={onClose} />
      <div className="qv-modal" id="qvModal" role="dialog" aria-label={product.name}>
        <button className="qv-close" onClick={onClose} aria-label="Close">&times;</button>
        <div className="qv-body">
          <div className="qv-visual" style={{ backgroundColor: product.image ? '#fff' : bg }}>
            {product.image ? (
              <img src={product.image} alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#fff', position: 'relative', zIndex: 1 }} />
            ) : (
              <span className="bloom" style={{ color: fg }}><BloomShape /></span>
            )}
          </div>

          <div className="qv-content">
            {product.badge && <div className="qv-badge label">{product.badge}</div>}
            {product.brand && <div className="card__brand">{product.brand}</div>}
            <h2 className="qv-title">{product.name}</h2>
            <div className="qv-price">{formatTaka(product.price)}</div>
            <p className="qv-tagline">{product.note}</p>
            {count > 0 && (
              <button className="qv-rating-link" onClick={() => setActiveTab('reviews')}>
                <span className="qv-stars">{stars(Math.round(avg))}</span> {avg.toFixed(1)} · {count} review{count > 1 ? 's' : ''}
              </button>
            )}

            <div className="qv-tabs">
              <button className={`qv-tab ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>
                Details
              </button>
              <button className={`qv-tab ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>
                Reviews{count ? ` (${count})` : ''}
              </button>
            </div>

            <div className={`qv-panel ${activeTab === 'details' ? 'active' : ''}`}>
              {product.description ? (
                <p style={{ whiteSpace: 'pre-line' }}>{product.description}</p>
              ) : (
                <p>{product.note || 'Authentic product, delivered to your door. Cash on delivery available.'}</p>
              )}
            </div>

            <div className={`qv-panel ${activeTab === 'reviews' ? 'active' : ''}`}>
              <div className="qv-reviews-list">
                {!reviewsLoaded ? (
                  <div className="cart-empty" style={{ padding: '12px 0' }}>Loading…</div>
                ) : count === 0 ? (
                  <div className="cart-empty" style={{ padding: '12px 0' }}>No reviews yet — be the first.</div>
                ) : (
                  reviews.map((r) => (
                    <div className="qv-review-item" key={r.id}>
                      <div className="qv-review-head">
                        <span className="qv-review-user">{r.author_name}</span>
                        <span className="qv-stars">{stars(r.rating)}</span>
                      </div>
                      <div className="qv-review-comment">{r.comment}</div>
                      {(isAdmin || (user && r.user_id === user.id)) && (
                        <div className="qv-review-actions">
                          {user && r.user_id === user.id && !isEditing && (
                            <button onClick={() => setIsEditing(true)}>Edit</button>
                          )}
                          <button onClick={() => handleDelete(r.id)}>Delete</button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {!user ? (
                <p className="qv-review-cta">
                  <button className="qv-link" onClick={onRequestSignIn}>Sign in</button> to write a review.
                </p>
              ) : showForm ? (
                <form className="qv-review-form" onSubmit={handleSubmitReview}>
                  <div className="qv-star-picker" role="radiogroup" aria-label="Your rating">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button type="button" key={n} role="radio" aria-checked={rating === n}
                        className={n <= rating ? 'on' : ''} onClick={() => setRating(n)} aria-label={`${n} star${n > 1 ? 's' : ''}`}>
                        ★
                      </button>
                    ))}
                  </div>
                  <input className="admin-input" placeholder="Your name" maxLength={40} required
                    value={authorName} onChange={(e) => setAuthorName(e.target.value)} />
                  <textarea className="admin-input" rows="2" placeholder="What did you think?" maxLength={1000} required
                    value={comment} onChange={(e) => setComment(e.target.value)} />
                  {reviewError && <div className="admin-error">{reviewError}</div>}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="submit" className="admin-btn" disabled={isSaving}>
                      {isSaving ? 'Saving…' : isEditing ? 'Update review' : 'Post review'}
                    </button>
                    {isEditing && (
                      <button type="button" className="admin-btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                    )}
                  </div>
                </form>
              ) : null}
            </div>

            <div className="qv-actions">
              <div className="stepper stepper--qv">
                <button onClick={() => stepperVal > 1 && setStepperVal(stepperVal - 1)} aria-label="decrease">−</button>
                <span className="stepper__val">{stepperVal}</span>
                <button onClick={() => setStepperVal(stepperVal + 1)} aria-label="increase">+</button>
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
