import React from 'react';

export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="footer__top">
          <div className="footer__brand">
            <div className="display" style={{ color: 'var(--ivory)' }}>aurelia*</div>
            <p style={{ color: 'rgba(251,244,236,.7)' }}>Beauty, undiluted. Formulas for skin, hair and the routine in between.</p>
            <form className="newsletter" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="your email" />
              <button type="submit">join</button>
            </form>
          </div>
          <div className="footer__cols">
            <div className="footer__col">
              <span className="label">shop</span>
              <a href="#new-arrivals">New arrivals</a>
              <a href="#skincare">Skincare</a>
              <a href="#haircare">Hair care</a>
              <a href="#supplements">Supplements</a>
              <a href="#lipbalm">Lip balm</a>
            </div>
            <div className="footer__col">
              <span className="label">learn</span>
              <a href="#philosophy">Our standard</a>
              <a href="#philosophy">Ingredients</a>
              <a href="#philosophy">Journal</a>
            </div>
            <div className="footer__col">
              <span className="label">company</span>
              <a href="#top">About</a>
              <a href="#top">Contact</a>
              <a href="#top">Wholesale</a>
            </div>
          </div>
        </div>
        <div className="footer__bottom">
          <span>© 2026 Aurelia. All rights reserved.</span>
          <span>Made for skin, not for shelves.</span>
        </div>
        <div style={{ fontSize: '11px', color: 'rgba(251,244,236,.45)', marginTop: '10px' }}>
          Some product photos from{' '}
          <a href="https://world.openbeautyfacts.org" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>Open Beauty Facts</a>
          {' '}contributors, licensed{' '}
          <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>CC BY-SA 3.0</a>.
        </div>
      </div>
    </footer>
  );
}
