import React from 'react';

export default function MobileMenu({ links = [], onClose }) {
  return (
    <div className="mobile-menu" id="mobileMenu">
      <img className="mobile-menu__flower mobile-menu__flower--branch" src="/flowers/blossom-branch.webp" alt="" aria-hidden="true" />
      <div className="mobile-menu__foot mobile-menu__foot--top">
        <p>AURELIA · BEAUTY, DELIVERED</p>
      </div>
      {links.map((l) => (
        <a key={l.href} href={l.href} onClick={onClose}>{l.label}</a>
      ))}
    </div>
  );
}
