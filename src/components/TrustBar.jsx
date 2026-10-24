import React from 'react';
import { formatTaka } from '../data/catalog';

// Small reassurance strip under the marquee: delivery, payment, authenticity
export default function TrustBar({ settings }) {
  const items = [
    {
      title: 'Cash on delivery',
      text: 'Pay when your order arrives',
      icon: <path d="M3 7h18v10H3z M3 10h18 M7 14h3" />,
    },
    {
      title: `Delivery ${formatTaka(settings.delivery_inside_dhaka)}`,
      text: `Inside Dhaka · ${formatTaka(settings.delivery_outside_dhaka)} outside`,
      icon: <path d="M2 7h11v8H2z M13 10h4l3 3v2h-7 M6 18a1.5 1.5 0 1 0 0-.01 M17 18a1.5 1.5 0 1 0 0-.01" />,
    },
    {
      title: '100% authentic',
      text: 'Genuine products from trusted sources',
      icon: <path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z M9 12l2 2 4-4" />,
    },
  ];

  return (
    <div className="trust">
      <div className="wrap trust__inner">
        {items.map((it) => (
          <div className="trust__item" key={it.title}>
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {it.icon}
            </svg>
            <div>
              <div className="trust__title">{it.title}</div>
              <div className="trust__text">{it.text}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
