import React from 'react';

export default function MobileMenu({ onClose }) {
  return (
    <div className="mobile-menu" id="mobileMenu">
      <a href="#new-arrivals" onClick={onClose}>New</a>
      <a href="#skincare" onClick={onClose}>Skincare</a>
      <a href="#haircare" onClick={onClose}>Hair</a>
      <a href="#supplements" onClick={onClose}>Supplements</a>
      <a href="#lipbalm" onClick={onClose}>Lip</a>
      <div className="mobile-menu__foot">
        <p>AURELIA · BEAUTY, UNDILUTED</p>
      </div>
    </div>
  );
}
