import React, { useEffect, useRef } from 'react';
import BloomShape from './BloomShape';

export default function Promo() {
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
      const reveals = sectionRef.current.querySelectorAll('[data-reveal]');
      reveals.forEach((el) => observer.observe(el));
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className="section" ref={sectionRef}>
      <div className="wrap">
        <div className="promo" data-reveal>
          <div className="promo__text">
            <div className="label" style={{ color: 'var(--gold-soft)' }}>the ritual set</div>
            <h2>try<br />it all</h2>
            <p>One of each: cleanse, treat, protect, repeat. Built for anyone who hates deciding where to start.</p>
            <button className="promo__cta">
              shop the set{' '}
              <span className="bloom" style={{ width: '14px', height: '14px' }}>
                <BloomShape width="14" height="14" />
              </span>
            </button>
          </div>
          <BloomShape className="promo__stack spin-slow" style={{ opacity: 0.5 }} />
        </div>
      </div>
    </section>
  );
}
