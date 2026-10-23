import React, { useEffect, useState } from 'react';
import BloomShape from './BloomShape';

export default function Navbar({ links = [], cartCount, isPulsing, onOpenCart, onToggleMenu }) {
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
        <a href="#top" className="nav__logo">
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
