import React, { useEffect, useRef } from 'react';
import BloomShape from './BloomShape';
import { whatsappLink } from '../data/catalog';

export default function Promo({ settings }) {
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
            <div className="label" style={{ color: 'var(--gold-soft)' }}>not sure what to pick?</div>
            <h2>ask<br />us</h2>
            <p>Tell us your skin or hair type and we'll suggest what to try first — no pressure, no upsell.</p>
            {settings?.whatsapp ? (
              <a className="promo__cta" href={whatsappLink(settings?.whatsapp, 'Hi Aurelia! I need help choosing a product.')} target="_blank" rel="noopener noreferrer">
                chat on WhatsApp{' '}
                <span className="bloom" style={{ width: '14px', height: '14px' }}>
                  <BloomShape width="14" height="14" />
                </span>
              </a>
            ) : (
              <a className="promo__cta" href="#skincare">
                start with skincare{' '}
                <span className="bloom" style={{ width: '14px', height: '14px' }}>
                  <BloomShape width="14" height="14" />
                </span>
              </a>
            )}
          </div>
          <BloomShape className="promo__stack spin-slow" style={{ opacity: 0.5 }} />
        </div>
      </div>
    </section>
  );
}
