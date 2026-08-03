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
          <p>A good routine isn't the one with the most steps — it's the one you actually finish. Every Aurelia formula is built to earn its place on your shelf, with ingredients you can pronounce and results you can see by the second week, not the second bottle.</p>
          <div className="label">— the aurelia standard</div>
        </div>
      </div>
    </section>
  );
}
