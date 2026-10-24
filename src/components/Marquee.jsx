import React from 'react';
import BloomShape from './BloomShape';

const marqueeItems = [
  '100% authentic',
  'cash on delivery',
  'delivery across Bangladesh',
  'trusted brands',
  'skincare · hair care · supplements',
  'carefully picked'
];

export default function Marquee() {
  const items = [...marqueeItems, ...marqueeItems]; // Duplicate for seamless infinite scrolling loop

  return (
    <div className="marquee">
      <div className="marquee__track">
        {items.map((text, idx) => (
          <span key={idx}>
            {text}{' '}
            <BloomShape width="11" height="11" style={{ opacity: 0.8, display: 'inline-block', marginLeft: '6px' }} />
          </span>
        ))}
      </div>
    </div>
  );
}
