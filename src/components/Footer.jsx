import React from 'react';
import { whatsappLink } from '../data/catalog';

export default function Footer({ settings }) {
  const s = settings || {};
  const wa = whatsappLink(s.whatsapp);
  const hasContact = wa || s.phone || s.email || s.facebook_url;

  return (
    <footer>
      <div className="wrap">
        <div className="footer__top">
          <div className="footer__brand">
            <div className="display" style={{ color: 'var(--ivory)' }}>aurelia*</div>
            <p style={{ color: 'rgba(251,244,236,.7)' }}>
              Authentic skincare, hair care and supplements, delivered across Bangladesh. Cash on delivery.
            </p>
          </div>
          <div className="footer__cols">
            <div className="footer__col">
              <span className="label">shop</span>
              <a href="#skincare">Skincare</a>
              <a href="#haircare">Hair care</a>
              <a href="#supplements">Supplements</a>
              <a href="#philosophy">About us</a>
            </div>
            {hasContact && (
              <div className="footer__col">
                <span className="label">contact</span>
                {wa && <a href={wa} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
                {s.phone && <a href={`tel:${s.phone.replace(/[^\d+]/g, '')}`}>{s.phone}</a>}
                {s.email && <a href={`mailto:${s.email}`}>{s.email}</a>}
                {s.facebook_url && <a href={s.facebook_url} target="_blank" rel="noopener noreferrer">Facebook</a>}
              </div>
            )}
          </div>
        </div>
        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} Aurelia. All rights reserved.</span>
          <span>Genuine products only.</span>
        </div>
        <div style={{ fontSize: '11px', color: 'rgba(251,244,236,.45)', marginTop: '10px' }}>
          Some product photos from{' '}
          <a href="https://world.openbeautyfacts.org" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>Open Beauty Facts</a>
          {' '}contributors, licensed{' '}
          <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>CC BY-SA 3.0</a>.
          Brand names belong to their owners; Aurelia is an independent retailer.
        </div>
      </div>
    </footer>
  );
}
