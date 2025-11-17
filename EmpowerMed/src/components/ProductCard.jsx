// src/components/ProductCard.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "../styles/Products.module.css";

// Image-only, large hero slideshow (fade + subtle zoom)
export function HeroCarousel({ items = [], intervalMs = 4000 }) {
  const slides = React.useMemo(
    () => (items || []).filter(p => !!p?.image).map(p => ({
      id: p.id,
      src: p.image,
      alt: p.name || "slide",
    })),
    [items]
  );

  const [i, setI] = React.useState(0);
  const timer = React.useRef(null);

  React.useEffect(() => {
    if (!slides.length) return;
    timer.current = setInterval(() => setI(n => (n + 1) % slides.length), intervalMs);
    return () => clearInterval(timer.current);
  }, [slides.length, intervalMs]);

  if (!slides.length) return null;

  const go = (d) => {
    clearInterval(timer.current);
    setI((prev) => (prev + d + slides.length) % slides.length);
  };

  return (
    <div className={styles.heroWrap}>
      <div className={styles.heroCarousel} aria-roledescription="carousel">
        {slides.map((s, idx) => (
          <div
            key={s.id ?? idx}
            className={`${styles.heroSlide} ${idx === i ? styles.heroSlideActive : ""}`}
            aria-hidden={idx !== i}
          >
            <img src={s.src} alt={s.alt} />
            <div className={styles.heroOverlay} />
          </div>
        ))}

        <button
          className={`${styles.heroArrow} ${styles.heroArrowLeft}`}
          aria-label="Previous slide"
          onClick={() => go(-1)}
        >‹</button>

        <button
          className={`${styles.heroArrow} ${styles.heroArrowRight}`}
          aria-label="Next slide"
          onClick={() => go(+1)}
        >›</button>

        <div className={styles.heroDots}>
          {slides.map((_, idx) => (
            <button
              key={idx}
              className={`${styles.heroDot} ${idx === i ? styles.heroDotActive : ""}`}
              aria-label={`Go to slide ${idx + 1}`}
              onClick={() => { clearInterval(timer.current); setI(idx); }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}


/* ------------------------------------------------------------------
   PRODUCT CARD (default export)
------------------------------------------------------------------- */
export default function ProductCard({ product }) {
  const { name, price = 0, image, badges = [], externalUrl } = product || {};
  const href = externalUrl || "https://empowermed.threeinternational.com/en";

  return (
    <article className={styles.card}>
      <a href={href} target="_blank" rel="noopener noreferrer">
        <img className={styles.thumb} src={image} alt={name} />
      </a>

      <div className={styles.body}>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.name}
          style={{ textDecoration: "none", display: "inline-block" }}
        >
          {name}
        </a>

        {!!badges.length && (
          <div className={styles.tags}>
            {badges.map((b) => (
              <span key={b} className={styles.tag}>
                {b}
              </span>
            ))}
          </div>
        )}

        <div className={styles.priceRow}>
          <div>
            <div className={styles.price}>${Number(price).toFixed(2)}</div>
            <div className={styles.muted}>Ships from THREE</div>
          </div>
          <a href={href} target="_blank" rel="noopener noreferrer" className={styles.cta}>
            Shop
          </a>
        </div>
      </div>
    </article>
  );
}
