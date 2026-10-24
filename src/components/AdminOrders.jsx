import React, { useCallback, useEffect, useState } from 'react';
import { fetchOrders, updateOrderStatus, formatTaka, whatsappLink, AREA_LABELS, ORDER_STATUSES } from '../data/catalog';

const FILTERS = ['open', 'all', ...ORDER_STATUSES];
const OPEN = ['pending', 'confirmed', 'shipped'];

export default function AdminOrders({ onPendingCount }) {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('open');
  const [expanded, setExpanded] = useState(null);

  const load = useCallback(async () => {
    try {
      const data = await fetchOrders({ limit: 200 });
      setOrders(data);
      setError('');
      onPendingCount?.(data.filter((o) => o.status === 'pending').length);
    } catch (err) {
      setError(err.message || 'Could not load orders.');
    }
  }, [onPendingCount]);

  // Load now, then check for new orders every 30 seconds while the panel is open
  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  const changeStatus = async (order, status) => {
    if (status === 'cancelled' && !window.confirm(`Cancel order #${order.order_number}?`)) return;
    try {
      await updateOrderStatus(order.id, status);
      await load();
    } catch (err) {
      setError(err.message || 'Could not update the order.');
    }
  };

  const visible = (orders || []).filter((o) =>
    filter === 'all' ? true : filter === 'open' ? OPEN.includes(o.status) : o.status === filter
  );

  return (
    <div>
      <div className="admin-section-head">
        <h3>Orders</h3>
        <button className="admin-btn-secondary" onClick={load}>Refresh</button>
      </div>

      <div className="orders-filters">
        {FILTERS.map((f) => (
          <button key={f} className={`admin-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'open' ? 'To do' : f[0].toUpperCase() + f.slice(1)}
            {orders && f !== 'all' && (
              <span className="orders-filters__count">
                {orders.filter((o) => (f === 'open' ? OPEN.includes(o.status) : o.status === f)).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {error && <div className="admin-error" style={{ margin: '12px 0' }}>{error}</div>}

      {orders === null ? (
        <p className="admin-sub">Loading orders…</p>
      ) : visible.length === 0 ? (
        <p className="admin-sub" style={{ marginTop: '18px' }}>No orders here yet.</p>
      ) : (
        <div className="orders-list">
          {visible.map((o) => {
            const isOpen = expanded === o.id;
            const itemCount = o.order_items.reduce((s, i) => s + i.qty, 0);
            return (
              <div key={o.id} className={`order-card ${o.status === 'pending' ? 'order-card--new' : ''}`}>
                <button className="order-card__head" onClick={() => setExpanded(isOpen ? null : o.id)}>
                  <span className="order-card__num">#{o.order_number}</span>
                  <span className="order-card__who">{o.customer_name}</span>
                  <span className="order-card__when">
                    {new Date(o.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="order-card__total">{formatTaka(o.total)}</span>
                  <span className={`order-status order-status--${o.status}`}>{o.status}</span>
                </button>

                {isOpen && (
                  <div className="order-card__body">
                    <div className="admin-grid-2">
                      <div>
                        <div className="label">Customer</div>
                        <p><strong>{o.customer_name}</strong></p>
                        <p>
                          <a href={`tel:${o.phone}`}>{o.phone}</a>
                          {' · '}
                          <a href={whatsappLink(o.phone)} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                        </p>
                        <p>{o.address}</p>
                        <p className="admin-item-note">{AREA_LABELS[o.area]}</p>
                        {o.note && <p className="order-card__note">Note: {o.note}</p>}
                      </div>
                      <div>
                        <div className="label">Items ({itemCount})</div>
                        {o.order_items.map((it, i) => (
                          <div key={i} className="checkout-line">
                            <span>{it.brand ? `${it.brand} ` : ''}{it.name} × {it.qty}</span>
                            <span>{formatTaka(it.price * it.qty)}</span>
                          </div>
                        ))}
                        <div className="checkout-line muted"><span>Delivery</span><span>{formatTaka(o.delivery_fee)}</span></div>
                        <div className="checkout-line total"><span>Collect in cash</span><span>{formatTaka(o.total)}</span></div>
                      </div>
                    </div>

                    <div className="order-card__actions">
                      <span className="label">Status</span>
                      {ORDER_STATUSES.map((s) => (
                        <button
                          key={s}
                          className={`admin-tab ${o.status === s ? 'active' : ''}`}
                          onClick={() => o.status !== s && changeStatus(o, s)}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
