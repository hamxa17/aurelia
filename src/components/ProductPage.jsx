import React, { useEffect, useState } from 'react';
import { ACCENTS } from '../data/products';
import { formatTaka, productSlug, categoryLabelOf, noteDetail } from '../data/catalog';
import ProductVisual from './ProductVisual';
import BloomShape from './BloomShape';
import ProductCard from './ProductCard';
import StockBadge from './StockBadge';
import Reviews, { stars } from './Reviews';
import { typesOf, sizesOf, resolveVariant, defaultChoice } from '../data/variants';

export default function ProductPage({ product, related, user, isAdmin, settings, onAddToCart, onOpenProduct, onRequestSignIn, onGoHome }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reviewStats, setReviewStats] = useState({ count: 0, avg: 0 });
  const [choice, setChoice] = useState(() => defaultChoice(product));

  useEffect(() => {
    window.scrollTo(0, 0);
    setQty(1);
    setChoice(defaultChoice(product));
    setReviewStats({ count: 0, avg: 0 });
    document.title = `${[product.brand, product.name].filter(Boolean).join(' ')} — Aurelia`;
    return () => { document.title = 'Aurelia — beauty, undiluted'; };
  }, [product.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const types = typesOf(product);
  const sizes = sizesOf(product);
  const v = resolveVariant(product, choice.type, choice.size);
  const shown = { ...product, image: v.image, price: v.price }; // photo and price follow the choice
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
    onAddToCart(product.id, product, qty, { type: v.type, size: v.size });
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
          <ProductVisual key={v.image} product={shown} className="pdp__visual" />

          <div className="pdp__info">
            {product.brand && <div className="card__brand" style={{ fontSize: '12px' }}>{product.brand}</div>}
            <h1 className="pdp__title">{product.name}</h1>
            {noteDetail(product) && <p className="pdp__note">{noteDetail(product)}</p>}
            {reviewStats.count > 0 && (
              <a className="pdp__rating" href="#reviews">
                <span className="qv-stars">{stars(Math.round(reviewStats.avg))}</span> {reviewStats.avg.toFixed(1)} · {reviewStats.count} review{reviewStats.count > 1 ? 's' : ''}
              </a>
            )}
            <div className="pdp__price">{formatTaka(v.price)}</div>

            {types.length > 0 && (
              <fieldset className="pdp__choice">
                <legend>Type</legend>
                <div className="pdp__chips">
                  {types.map((t) => (
                    <button key={t.label} type="button" className="chip" aria-pressed={choice.type === t.label}
                      onClick={() => setChoice((c) => ({ ...c, type: t.label }))}>{t.label}</button>
                  ))}
                </div>
              </fieldset>
            )}
            {sizes.length > 0 && (
              <fieldset className="pdp__choice">
                <legend>Size</legend>
                <div className="pdp__chips">
                  {sizes.map((sz) => (
                    <button key={sz.label} type="button" className="chip chip--size" aria-pressed={choice.size === sz.label}
                      onClick={() => setChoice((c) => ({ ...c, size: sz.label }))}>
                      <span>{sz.label}</span><span className="chip__price">{formatTaka(sz.price)}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
            )}
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
                {soldOut ? 'Sold out' : added ? 'Added to bag' : 'Add to bag'}
              </button>
            </div>

            <ul className="pdp__perks">
              <li>Cash on delivery</li>
              <li>Delivery {formatTaka(settings.delivery_inside_dhaka)} inside Dhaka · {formatTaka(settings.delivery_outside_dhaka)} outside</li>
              <li>100% authentic</li>
            </ul>

            <div className="pdp__share">
              <span className="pdp__share-label">Share</span>
              <button onClick={copyLink}>{copied ? 'Link copied ✓' : 'Copy link'}</button>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer">Facebook</a>
              <a href={`https://wa.me/?text=${encodeURIComponent(`${fullName} ${url}`)}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
            </div>

            {product.description && (
              <div className="pdp__desc">
                <h3>About this product</h3>
                <p style={{ whiteSpace: 'pre-line' }}>{product.description}</p>
              </div>
            )}
          </div>
        </div>

        <section className="pdp__reviews" id="reviews">
          {reviewStats.count > 0 && <h2>Reviews ({reviewStats.count})</h2>}
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
