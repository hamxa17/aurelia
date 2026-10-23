import React from 'react';

export default function MobileMenu({ links = [], onClose }) {
  return (
    <div className="mobile-menu" id="mobileMenu">
      {links.map((l) => (
        <a key={l.href} href={l.href} onClick={onClose}>{l.label}</a>
      ))}
      <div className="mobile-menu__foot">
        <p>AURELIA · BEAUTY, UNDILUTED</p>
      </div>
    </div>
  );
}
