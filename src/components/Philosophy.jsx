import React, { useEffect, useRef } from 'react';

export default function Philosophy() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      const reveals = sectionRef.current.querySelectorAll('[data-reveal]');
      reveals.forEach((el) => observer.observe(el));
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className="philosophy" id="philosophy" ref={sectionRef}>
      <div className="wrap">
        <div className="bubble" data-reveal>
          <p>Aurelia is a small shop with a simple promise: only genuine products, at fair prices, delivered to your door. Every item is picked by hand from trusted suppliers — no fakes, no guesswork. Order, pay when it arrives, and message us any time if you need help choosing.</p>
          <div className="label">— why shop with aurelia</div>
        </div>
      </div>
    </section>
  );
}
