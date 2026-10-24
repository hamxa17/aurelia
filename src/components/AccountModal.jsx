import React, { useEffect, useState } from 'react';
import { sendLoginCode, verifyLoginCode, signOutCustomer, fetchOrders, formatTaka } from '../data/catalog';
import BloomShape from './BloomShape';

const STATUS_LABELS = {
  pending: 'Received',
  confirmed: 'Confirmed',
  shipped: 'On the way',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function AccountModal({ isOpen, user, onClose }) {
  const [step, setStep] = useState('email'); // email | code
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setError('');
      setCode('');
      if (!user) setStep('email');
    }
  }, [isOpen, user]);

  // Load this customer's orders when the panel opens
  useEffect(() => {
    if (isOpen && user) {
      setOrders(null);
      fetchOrders({ limit: 20, userId: user.id }).then(setOrders).catch(() => setOrders([]));
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSendCode = async (e) => {
    e.preventDefault();
    setIsBusy(true);
    setError('');
    try {
      await sendLoginCode(email);
      setStep('code');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsBusy(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsBusy(true);
    setError('');
    try {
      await verifyLoginCode(email, code);
      setStep('email');
      setCode('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <>
      <div className="admin-overlay" onClick={onClose} />
      <div className="admin-modal admin-modal--narrow" role="dialog" aria-label="Your account">
        <button className="admin-close" onClick={onClose} aria-label="Close">&times;</button>

        {!user ? (
          <div className="admin-auth-view" style={{ padding: '48px 28px' }}>
            <BloomShape width="34" height="34" style={{ color: 'var(--gold)' }} />
            <h2 className="admin-title" style={{ marginTop: '12px' }}>Sign in</h2>

            {step === 'email' ? (
              <>
                <p className="admin-sub">
                  We'll email you a 6-digit code — no password needed. Your bag is saved to your account, so it's
                  still there next time.
                </p>
                <form className="admin-form" onSubmit={handleSendCode}>
                  <input type="email" className="admin-input" placeholder="you@email.com" autoComplete="email"
                    required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
                  {error && <div className="admin-error" role="alert">{error}</div>}
                  <button type="submit" className="admin-btn" disabled={isBusy}>
                    {isBusy ? 'Sending…' : 'Email me a code'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <p className="admin-sub">
                  Enter the code we sent to <strong>{email}</strong>. Check spam if you don't see it.
                </p>
                <form className="admin-form" onSubmit={handleVerify}>
                  <input className="admin-input account-code" inputMode="numeric" autoComplete="one-time-code"
                    placeholder="123456" maxLength={10} required autoFocus
                    value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} />
                  {error && <div className="admin-error" role="alert">{error}</div>}
                  <button type="submit" className="admin-btn" disabled={isBusy}>
                    {isBusy ? 'Checking…' : 'Sign in'}
                  </button>
                  <button type="button" className="admin-btn-secondary" onClick={() => { setStep('email'); setError(''); }}>
                    Use a different email
                  </button>
                </form>
              </>
            )}
          </div>
        ) : (
          <div className="account-view">
            <div className="account-head">
              <div>
                <div className="label">signed in as</div>
                <div className="account-email">{user.email}</div>
              </div>
              <button className="admin-btn-secondary" onClick={async () => { await signOutCustomer(); onClose(); }}>
                Sign out
              </button>
            </div>

            <h3 style={{ margin: '22px 0 12px' }}>Your orders</h3>
            {orders === null ? (
              <p className="admin-sub">Loading…</p>
            ) : orders.length === 0 ? (
              <p className="admin-sub">No orders yet. Orders you place while signed in show up here.</p>
            ) : (
              <div className="account-orders">
                {orders.map((o) => (
                  <div key={o.id} className="account-order">
                    <div className="account-order__top">
                      <strong>#{o.order_number}</strong>
                      <span className={`order-status order-status--${o.status}`}>{STATUS_LABELS[o.status]}</span>
                    </div>
                    <div className="account-order__meta">
                      {new Date(o.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {' · '}{formatTaka(o.total)}
                    </div>
                    <div className="account-order__items">
                      {o.order_items.map((it, i) => (
                        <span key={i}>{it.brand ? `${it.brand} ` : ''}{it.name} × {it.qty}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
