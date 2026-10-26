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
  bgPaper = false,
  onAddToCart,
  onOpenQuickView
}) {
  const [selectedTab, setSelectedTab] = useState(null);
  const [sort, setSort] = useState('featured');
  const sortList = (list) => {
    const l = [...list];
    if (sort === 'low') l.sort((a, b) => a.price - b.price);
    if (sort === 'high') l.sort((a, b) => b.price - a.price);
    if (sort === 'stock') l.sort((a, b) => (a.stock === 0) - (b.stock === 0));
    return l;
  };
  const categories = isTabbed && products ? Object.keys(products) : [];
  // Fall back to the first tab if the chosen one disappears (e.g. its last product was deleted)
  const activeTab = categories.includes(selectedTab) ? selectedTab : categories[0] || null;
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
  }, [activeTab, products]);

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
            <p className="section__desc">{description}</p>
          </div>
          <div className="section__aside">
            <label className="sort">
              <span className="label">sort</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="featured">Featured</option>
                <option value="low">Price: low to high</option>
                <option value="high">Price: high to low</option>
                <option value="stock">In stock first</option>
              </select>
            </label>
          </div>
        </div>

        {isTabbed ? (
          <>
            <div className="tabs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`tab ${activeTab === cat ? 'active' : ''}`}
                  onClick={() => setSelectedTab(cat)}
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
                  {sortList(products[cat]).map((prod) => (
                    <ProductCard
                      key={prod.id}
                      id={prod.id}
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
            {sortList(products).map((prod) => (
              <ProductCard
                key={prod.id}
                id={prod.id}
                product={prod}
                onAddToCart={onAddToCart}
                onOpenQuickView={onOpenQuickView}
              />
            ))}
          </div>
        ) : (
          <div className="grid" data-reveal-stagger>
            {sortList(products).map((prod) => (
              <ProductCard
                key={prod.id}
                id={prod.id}
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
