import React, { useState, useEffect, useRef } from 'react';
import ProductCard from './ProductCard';
import BloomShape from './BloomShape';

export default function ProductSection({
  id,
  title,
  tagline,
  description,
  products,
  isTabbed = false,
  isHorizontalScroll = false,
  prefix = 'prod',
  bgPaper = false,
  onAddToCart,
  onOpenQuickView
}) {
  const [activeTab, setActiveTab] = useState(isTabbed && products ? Object.keys(products)[0] : null);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      const reveals = sectionRef.current.querySelectorAll('[data-reveal], [data-reveal-stagger]');
      reveals.forEach((el) => observer.observe(el));
    }

    return () => observer.disconnect();
  }, [activeTab]);

  const categories = isTabbed && products ? Object.keys(products) : [];

  return (
    <section 
      className="section" 
      id={id} 
      ref={sectionRef} 
      style={bgPaper ? { background: 'var(--paper)' } : {}}
    >
      <div className="wrap">
        <div className="section__head" data-reveal>
          <div>
            <div className="section-tag label">
              <BloomShape width="12" height="12" /> {tagline}
            </div>
            <h2>{title}</h2>
          </div>
          <p>{description}</p>
        </div>

        {isTabbed ? (
          <>
            <div className="tabs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`tab ${activeTab === cat ? 'active' : ''}`}
                  onClick={() => setActiveTab(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {categories.map((cat) => (
              <div
                key={cat}
                className={`tab-panel ${activeTab === cat ? 'active' : ''}`}
              >
                <div className="grid" data-reveal-stagger>
                  {products[cat].map((prod, j) => (
                    <ProductCard
                      key={`${prefix}-${cat}-${j}`}
                      id={`${prefix}-${cat.replace(/\s/g, '')}-${j}`}
                      product={prod}
                      onAddToCart={onAddToCart}
                      onOpenQuickView={onOpenQuickView}
                    />
                  ))}
                </div>
              </div>
            ))}
          </>
        ) : isHorizontalScroll ? (
          <div className="hscroll" id={`${id}Row`}>
            {products.map((prod, i) => (
              <ProductCard
                key={`${prefix}-${i}`}
                id={`${prefix}-${i}`}
                product={prod}
                onAddToCart={onAddToCart}
                onOpenQuickView={onOpenQuickView}
              />
            ))}
          </div>
        ) : (
          <div className="grid" data-reveal-stagger>
            {products.map((prod, i) => (
              <ProductCard
                key={`${prefix}-${i}`}
                id={`${prefix}-${i}`}
                product={prod}
                onAddToCart={onAddToCart}
                onOpenQuickView={onOpenQuickView}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
