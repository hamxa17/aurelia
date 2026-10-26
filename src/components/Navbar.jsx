import React, { useEffect, useState } from 'react';
import BloomShape from './BloomShape';

export default function Navbar({ links = [], cartCount, isPulsing, onOpenCart, onToggleMenu, onOpenAccount, isSignedIn, onOpenSearch }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className="nav">
      <div 
        className="nav__inner wrap" 
        style={{ 
          maxWidth: '920px', 
          paddingLeft: '8px', 
          paddingRight: '8px',
          boxShadow: scrolled 
            ? '0 14px 34px -12px rgba(76,27,39,0.35)' 
            : '0 10px 30px -14px rgba(76,27,39,0.25)'
        }}
      >
        <a href="/" className="nav__logo">
          <span className="bloom" style={{ width: '20px', height: '20px' }}>
            <BloomShape width="20" height="20" />
          </span>
          aurelia
        </a>
        <div className="nav__links">
          {links.map((l) => (
            <a key={l.href} className="nav__link" href={l.href}>{l.label}</a>
          ))}
        </div>
        <div className="nav__actions">
          <button className="nav__account" onClick={onOpenSearch} aria-label="Search">
            <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" strokeLinecap="round" /></svg>
          </button>
          <button className="nav__account" onClick={onOpenAccount} aria-label={isSignedIn ? 'Your account' : 'Sign in'}>
            <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" strokeLinecap="round" />
            </svg>
            {isSignedIn && <span className="nav__account-dot" />}
          </button>
          <button className="nav__cart" onClick={onOpenCart} aria-label="Open bag">
          bag <span className={`nav__cart-count ${isPulsing ? 'pulse' : ''}`}>{cartCount}</span>
        </button>
        <button className="nav__burger" onClick={onToggleMenu} aria-label="Open menu">
          <span></span><span></span><span></span>
        </button>
        </div>
      </div>
    </nav>
  );
}
