import React, { useEffect, useState } from 'react';
import { placeOrder, formatTaka, whatsappLink, AREA_LABELS } from '../data/catalog';
import BloomShape from './BloomShape';

const PROFILE_KEY = 'aurelia_checkout_profile';

function readProfile() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY)) || {};
  } catch {
    return {};
  }
}

export default function CheckoutModal({ isOpen, items, settings, user, onClose, onOrderPlaced }) {
  const [form, setForm] = useState({ name: '', phone: '', address: '', area: 'inside_dhaka', note: '' });
  const [error, setError] = useState('');
  const [isPlacing, setIsPlacing] = useState(false);
  const [placed, setPlaced] = useState(null); // { orderNumber, total, lines, form }

  // Pre-fill from the last order on this device
  useEffect(() => {
    if (isOpen && !placed) {
      const saved = readProfile();
      setForm((f) => ({ ...f, ...saved, note: '' }));
      setError('');
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, { product, qty }) => sum + product.price * qty, 0);
  const fee = form.area === 'inside_dhaka' ? settings.delivery_inside_dhaka : settings.delivery_outside_dhaka;
  const total = subtotal + fee;
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleClose = () => {
    setPlaced(null);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isPlacing) return;
    const phone = form.phone.replace(/\D/g, '').replace(/^880/, '0');
    if (!/^01[3-9]\d{8}$/.test(phone)) {
      setError('Please enter a valid Bangladeshi mobile number, like 01712345678.');
      return;
    }
    setIsPlacing(true);
    setError('');
    try {
      const result = await placeOrder({ ...form, phone }, items);
      try {
        localStorage.setItem(PROFILE_KEY, JSON.stringify({ name: form.name, phone, address: form.address, area: form.area }));
      } catch { /* storage may be blocked — fine */ }
      setPlaced({
        ...result,
        lines: items.map(({ product, qty }) => ({ name: [product.brand, product.name].filter(Boolean).join(' '), qty, price: product.price })),
        form: { ...form, phone },
      });
      onOrderPlaced();
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsPlacing(false);
    }
  };

  // ── Confirmation ──
  if (placed) {
    const message = [
      `Hi! I just placed order #${placed.orderNumber} on Aurelia.`,
      ...placed.lines.map((l) => `• ${l.name} × ${l.qty}`),
      `Total: ${formatTaka(placed.total)} (cash on delivery)`,
      `Name: ${placed.form.name}`,
      `Phone: ${placed.form.phone}`,
      `Address: ${placed.form.address} (${AREA_LABELS[placed.form.area]})`,
    ].join('\n');
    const wa = whatsappLink(settings.whatsapp, message);

    return (
      <>
        <div className="admin-overlay" onClick={handleClose} />
        <div className="admin-modal admin-modal--narrow" role="dialog" aria-label="Order placed">
          <button className="admin-close" onClick={handleClose} aria-label="Close">&times;</button>
          <div className="checkout-done">
            <BloomShape width="44" height="44" style={{ color: 'var(--gold)' }} />
            <h2 className="admin-title">Order placed!</h2>
            <p className="admin-sub">
              Your order number is <strong>#{placed.orderNumber}</strong>. We'll call you on{' '}
              <strong>{placed.form.phone}</strong> to confirm, then deliver. Pay{' '}
              <strong>{formatTaka(placed.total)}</strong> in cash when it arrives.
            </p>
            {wa && (
              <a className="checkout-wa" href={wa} target="_blank" rel="noopener noreferrer">
                Also send it on WhatsApp
              </a>
            )}
            <button className="admin-btn-secondary" style={{ marginTop: '12px' }} onClick={handleClose}>
              Keep shopping
            </button>
          </div>
        </div>
      </>
    );
  }

  // ── Form ──
  return (
    <>
      <div className="admin-overlay" onClick={handleClose} />
      <div className="admin-modal admin-modal--narrow" role="dialog" aria-label="Checkout">
        <button className="admin-close" onClick={handleClose} aria-label="Close">&times;</button>
        <form className="checkout" onSubmit={handleSubmit}>
          <h2 className="admin-title">Checkout</h2>
          <p className="admin-sub" style={{ marginBottom: '18px' }}>
            Cash on delivery — you pay when your order arrives.
            {!user && ' Sign in from the top bar to keep your bag and see your orders later.'}
          </p>

          <label className="label" htmlFor="co-name">Full name</label>
          <input id="co-name" className="admin-input" required maxLength={80} autoComplete="name"
            value={form.name} onChange={set('name')} />

          <label className="label" htmlFor="co-phone">Mobile number</label>
          <input id="co-phone" className="admin-input" required inputMode="tel" autoComplete="tel"
            placeholder="01XXXXXXXXX" value={form.phone} onChange={set('phone')} />

          <label className="label" htmlFor="co-address">Delivery address</label>
          <textarea id="co-address" className="admin-input" required rows="2" maxLength={300}
            autoComplete="street-address" placeholder="House, road, area, city"
            value={form.address} onChange={set('address')} />

          <span className="label">Delivery area</span>
          <div className="checkout-areas">
            {['inside_dhaka', 'outside_dhaka'].map((area) => (
              <label key={area} className={`checkout-area ${form.area === area ? 'active' : ''}`}>
                <input type="radio" name="area" value={area} checked={form.area === area} onChange={set('area')} />
                <span>{AREA_LABELS[area]}</span>
                <span className="checkout-area__fee">
                  {formatTaka(area === 'inside_dhaka' ? settings.delivery_inside_dhaka : settings.delivery_outside_dhaka)}
                </span>
              </label>
            ))}
          </div>

          <label className="label" htmlFor="co-note">Note (optional)</label>
          <input id="co-note" className="admin-input" maxLength={500} placeholder="e.g. call before coming"
            value={form.note} onChange={set('note')} />

          <div className="checkout-summary">
            {items.map(({ product, qty }) => (
              <div key={product.id} className="checkout-line">
                <span>{product.brand ? `${product.brand} ` : ''}{product.name} × {qty}</span>
                <span>{formatTaka(product.price * qty)}</span>
              </div>
            ))}
            <div className="checkout-line muted"><span>Subtotal</span><span>{formatTaka(subtotal)}</span></div>
            <div className="checkout-line muted"><span>Delivery</span><span>{formatTaka(fee)}</span></div>
            <div className="checkout-line total"><span>Total (cash on delivery)</span><span>{formatTaka(total)}</span></div>
          </div>

          {error && <div className="admin-error" role="alert">{error}</div>}
          <button type="submit" className="cart-checkout" disabled={isPlacing || items.length === 0}>
            {isPlacing ? 'Placing order…' : `Place order — ${formatTaka(total)}`}
          </button>
        </form>
      </div>
    </>
  );
}
