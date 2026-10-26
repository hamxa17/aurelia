import React, { useEffect, useState } from 'react';
import { fetchReviews, saveReview, deleteReview } from '../data/catalog';

export const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

// Reviews list + write/edit form for one product
export default function Reviews({ productId, user, isAdmin, onRequestSignIn, onLoaded }) {
  const [reviews, setReviews] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const load = () =>
    fetchReviews(productId)
      .then((r) => { setReviews(r); onLoaded?.(r); })
      .catch(() => setReviews([]))
      .finally(() => setLoaded(true));

  useEffect(() => {
    setLoaded(false);
    setIsEditing(false);
    load();
  }, [productId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (user && !authorName) setAuthorName((user.email || '').split('@')[0].slice(0, 40));
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const mine = user ? reviews.find((r) => r.user_id === user.id) : null;

  const startEdit = () => {
    setRating(mine.rating);
    setComment(mine.comment);
    setAuthorName(mine.author_name);
    setIsEditing(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    try {
      await saveReview(productId, { author_name: authorName, rating, comment }, isEditing ? mine.id : null);
      setComment('');
      setIsEditing(false);
      await load();
    } catch (err) {
      setError(err.message || 'Could not save your review.');
    } finally {
      setIsSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await deleteReview(id);
      await load();
    } catch (err) {
      setError(err.message || 'Could not delete the review.');
    }
  };

  const showForm = user && (!mine || isEditing);

  return (
    <div className="reviews">
      {!loaded ? (
        <p className="admin-sub">Loading…</p>
      ) : reviews.length === 0 ? (
        <p className="admin-sub">No reviews yet — be the first.</p>
      ) : (
        <div className="reviews__list">
          {reviews.map((r) => (
            <div className="qv-review-item" key={r.id}>
              <div className="qv-review-head">
                <span className="qv-review-user">{r.author_name}</span>
                <span className="qv-stars">{stars(r.rating)}</span>
              </div>
              <div className="qv-review-comment">{r.comment}</div>
              {(isAdmin || (user && r.user_id === user.id)) && (
                <div className="qv-review-actions">
                  {user && r.user_id === user.id && !isEditing && <button onClick={startEdit}>Edit</button>}
                  <button onClick={() => remove(r.id)}>Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!user ? (
        <p className="qv-review-cta">
          <button className="qv-link" onClick={onRequestSignIn}>Sign in</button> to write a review.
        </p>
      ) : showForm ? (
        <form className="qv-review-form" onSubmit={submit}>
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
          <textarea className="admin-input" rows="3" placeholder="What did you think?" maxLength={1000} required
            value={comment} onChange={(e) => setComment(e.target.value)} />
          {error && <div className="admin-error">{error}</div>}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" className="admin-btn" disabled={isSaving}>
              {isSaving ? 'Saving…' : isEditing ? 'Update review' : 'Post review'}
            </button>
            {isEditing && <button type="button" className="admin-btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>}
          </div>
        </form>
      ) : null}
    </div>
  );
}
