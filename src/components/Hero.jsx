import React, { useEffect, useState } from 'react';
import BloomShape from './BloomShape';

export default function Hero() {
  const [orb1Transform, setOrb1Transform] = useState('translateY(0px)');
  const [orb2Transform, setOrb2Transform] = useState('translateY(0px)');

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduceMotion && window.matchMedia('(hover:hover)').matches) {
      const handleScroll = () => {
        const y = window.scrollY;
        setOrb1Transform(`translateY(${y * 0.15}px)`);
        setOrb2Transform(`translateY(${y * 0.25}px)`);
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <header className="hero">
      {/* Painted lilies: pink hanging from the top-right, cream rising from the bottom-left */}
      <div className="hero__garden" aria-hidden="true">
        <img className="hero__flower hero__flower--hang" src="/flowers/lilies-pink.webp" alt="" style={{ transform: orb1Transform }} />
        <img className="hero__flower hero__flower--rise" src="/flowers/lilies-cream.webp" alt="" style={{ transform: orb2Transform }} />
      </div>
      <div className="wrap">
        <div className="hero__nav-space"></div>
        <div className="hero__content">
          <div className="hero__eyebrow label">
            <BloomShape width="14" height="14" /> beauty, delivered
          </div>
          <h1 className="hero__wordmark" aria-label="Aurelia">
            <span style={{ animationDelay: '.05s' }}>A</span>
            <span style={{ animationDelay: '.1s' }}>u</span>
            <span style={{ animationDelay: '.15s' }}>r</span>
            <span style={{ animationDelay: '.2s' }}>e</span>
            <span style={{ animationDelay: '.25s' }}>l</span>
            <span style={{ animationDelay: '.3s' }}>i</span>
            <span style={{ animationDelay: '.35s' }}>a</span>
          </h1>
          <p className="hero__tag">Skincare, hair care and supplements from the brands you already love — 100% authentic, delivered to your door.</p>
        </div>
      </div>
    </header>
  );
}
