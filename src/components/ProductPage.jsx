import React, { useEffect, useState } from 'react';
import { ACCENTS } from '../data/products';
import { formatTaka, productSlug, categoryLabelOf } from '../data/catalog';
import BloomShape from './BloomShape';
import ProductCard from './ProductCard';
import StockBadge from './StockBadge';
import Reviews, { stars } from './Reviews';

export default function ProductPage({ product, related, user, isAdmin, settings, onAddToCart, onOpenProduct, onRequestSignIn, onGoHome }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reviewStats, setReviewStats] = useState({ count: 0, avg: 0 });

  useEffect(() => {
    window.scrollTo(0, 0);
    setQty(1);
    setReviewStats({ count: 0, avg: 0 });
    document.title = `${[product.brand, product.name].filter(Boolean).join(' ')} — Aurelia`;
    return () => { document.title = 'Aurelia — beauty, undiluted'; };
  }, [product.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const [bg, fg] = ACCENTS[product.accent] || ACCENTS.rose;
  const soldOut = product.stock === 0;
  const maxQty = Math.min(product.stock ?? 50, 50);
  const fullName = [product.brand, product.name].filter(Boolean).join(' ');
  const url = `${window.location.origin}/product/${productSlug(product)}`;
  const section = categoryLabelOf(product).replace(/^.*— /, '');

  const copyLink = async () => {
    try {
      if (navigator.share && /Mobi/i.test(navigator.userAgent)) {
        await navigator.share({ title: fullName, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch { /* cancelled or blocked */ }
  };

  const handleAdd = () => {
    onAddToCart(product.id, product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <main className="pdp">
      <div className="wrap">
        <nav className="pdp__crumbs" aria-label="Breadcrumb">
          <a href="/" onClick={(e) => { e.preventDefault(); onGoHome(); }}>Home</a>
          <span>/</span>
          <a href={`/#${product.section === 'newArrivals' ? 'new-arrivals' : product.section}`}
            onClick={(e) => { e.preventDefault(); onGoHome(product.section === 'newArrivals' ? 'new-arrivals' : product.section); }}>{section}</a>
          <span>/</span>
          <span>{product.name}</span>
        </nav>

        <div className="pdp__grid">
          <div className="pdp__visual" style={{ background: product.image ? '#fff' : bg }}>
            {product.badge && <span className="card__badge">{product.badge}</span>}
            {product.image ? (
              <img src={product.image} alt={fullName} />
            ) : (
              <span className="bloom" style={{ color: fg }}><BloomShape /></span>
            )}
          </div>

          <div className="pdp__info">
            {product.brand && <div className="card__brand" style={{ fontSize: '12px' }}>{product.brand}</div>}
            <h1 className="pdp__title">{product.name}</h1>
            <p className="pdp__note">{product.note}</p>
            {reviewStats.count > 0 && (
              <a className="pdp__rating" href="#reviews">
                <span className="qv-stars">{stars(Math.round(reviewStats.avg))}</span> {reviewStats.avg.toFixed(1)} · {reviewStats.count} review{reviewStats.count > 1 ? 's' : ''}
              </a>
            )}
            <div className="pdp__price">{formatTaka(product.price)}</div>
            <StockBadge stock={product.stock} large />

            <div className="pdp__buy">
              {!soldOut && (
                <div className="stepper stepper--qv">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="decrease">−</button>
                  <span className="stepper__val">{qty}</span>
                  <button onClick={() => setQty((q) => Math.min(maxQty, q + 1))} aria-label="increase">+</button>
                </div>
              )}
              <button className={`btn-add btn-add--qv ${added ? 'added' : ''}`} disabled={soldOut} onClick={handleAdd}>
                {soldOut ? 'sold out' : added ? 'added to bag ✓' : 'add to bag'}
              </button>
            </div>

            <ul className="pdp__perks">
              <li>Cash on delivery</li>
              <li>Delivery {formatTaka(settings.delivery_inside_dhaka)} inside Dhaka · {formatTaka(settings.delivery_outside_dhaka)} outside</li>
              <li>100% authentic</li>
            </ul>

            <div className="pdp__share">
              <span className="label">share</span>
              <button onClick={copyLink}>{copied ? 'Link copied ✓' : 'Copy link'}</button>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer">Facebook</a>
              <a href={`https://wa.me/?text=${encodeURIComponent(`${fullName} ${url}`)}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
            </div>

            {(product.description || product.note) && (
              <div className="pdp__desc">
                <h3>About this product</h3>
                <p style={{ whiteSpace: 'pre-line' }}>{product.description || product.note}</p>
              </div>
            )}
          </div>
        </div>

        <section className="pdp__reviews" id="reviews">
          <h2>Reviews{reviewStats.count ? ` (${reviewStats.count})` : ''}</h2>
          <Reviews
            productId={product.id}
            user={user}
            isAdmin={isAdmin}
            onRequestSignIn={onRequestSignIn}
            onLoaded={(r) => setReviewStats({ count: r.length, avg: r.length ? r.reduce((s, x) => s + x.rating, 0) / r.length : 0 })}
          />
        </section>

        {related.length > 0 && (
          <section className="pdp__related">
            <h2>You may also like</h2>
            <div className="grid">
              {related.map((p) => (
                <ProductCard key={p.id} id={p.id} product={p} onAddToCart={onAddToCart} onOpenQuickView={() => onOpenProduct(p)} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
