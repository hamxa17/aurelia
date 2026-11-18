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
  const [wait, setWait] = useState(0); // seconds until another code can be sent

  // Count down the resend timer
  useEffect(() => {
    if (wait <= 0) return undefined;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

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
    e?.preventDefault();
    if (isBusy || wait > 0) return;
    setIsBusy(true);
    setError('');
    try {
      await sendLoginCode(email);
      setStep('code');
      setCode('');
      setWait(60);
    } catch (err) {
      if (/wait a minute/i.test(err.message)) {
        // A code was sent moments ago: let them type it, and resend once the timer runs out
        setStep('code');
        setWait(60);
        setError('A code was already sent a moment ago. Check your inbox (and spam), or resend when the timer ends.');
      } else {
        setError(err.message);
      }
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
            <h2 className="admin-title" style={{ marginTop: '12px', marginBottom: '20px' }}>Sign in</h2>

            {step === 'email' ? (
              <>
                <form className="admin-form" onSubmit={handleSendCode}>
                  <input type="email" className="admin-input" placeholder="Enter your email" autoComplete="email"
                    required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
                  {error && <div className="admin-error" role="alert">{error}</div>}
                  <button type="submit" className="admin-btn" disabled={isBusy}>
                    {isBusy ? 'Sending…' : 'Email me a sign-in code'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <p className="admin-sub">
                  We emailed a 6-digit code to <strong>{email}</strong>. Type it below, or tap the link in the
                  email. It can take a minute to arrive, so check spam too.
                </p>
                <form className="admin-form" onSubmit={handleVerify}>
                  <input className="admin-input account-code" inputMode="numeric" autoComplete="one-time-code"
                    placeholder="123456" maxLength={10} required autoFocus
                    value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} />
                  {error && <div className="admin-error" role="alert">{error}</div>}
                  <button type="submit" className="admin-btn" disabled={isBusy}>
                    {isBusy ? 'Checking…' : 'Sign in with code'}
                  </button>
                  <div className="account-resend">
                    <button type="button" className="qv-link" onClick={handleSendCode} disabled={isBusy || wait > 0}>
                      {wait > 0 ? `Resend code in ${wait}s` : 'Resend code'}
                    </button>
                    <span aria-hidden="true">·</span>
                    <button type="button" className="qv-link" onClick={() => { setStep('email'); setError(''); setCode(''); }}>
                      Use a different email
                    </button>
                  </div>
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
                        <span key={i}>{it.brand ? `${it.brand} ` : ''}{it.name}{it.variant ? ` · ${it.variant}` : ''} × {it.qty}</span>
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
