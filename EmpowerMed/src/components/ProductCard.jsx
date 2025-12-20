// src/components/ProductCard.jsx
import React from "react";
import styles from "../styles/Products.module.css";

function formatPrice(dollars) {
  if (dollars == null || dollars === "") return "$0.00";
  const n = Number(dollars);
  if (!Number.isFinite(n)) return "$0.00";
  return `$${n.toFixed(2)}`;
}

export function HeroCarousel({ items = [], intervalMs = 4000 }) {
  const slides = React.useMemo(
    () =>
      (items || [])
        .map((p) => ({
          id: p.id,
          src: p.image_url || p.image,
          alt: p.name || "slide",
        }))
        .filter((s) => !!s.src),
    [items]
  );

  const [i, setI] = React.useState(0);
  const timer = React.useRef(null);

  React.useEffect(() => {
    if (!slides.length) return;

    if (timer.current) clearInterval(timer.current);

    timer.current = setInterval(
      () => setI((n) => (n + 1) % slides.length),
      intervalMs
    );

    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [slides.length, intervalMs]);

  if (!slides.length) return null;

  const go = (d) => {
    if (timer.current) clearInterval(timer.current);
    setI((prev) => (prev + d + slides.length) % slides.length);
  };

  return (
    <div className={styles.heroWrap}>
      <div className={styles.heroCarousel} aria-roledescription="carousel">
        {slides.map((s, idx) => (
          <div
            key={s.id ?? idx}
            className={`${styles.heroSlide} ${
              idx === i ? styles.heroSlideActive : ""
            }`}
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
        >
          ‹
        </button>

        <button
          className={`${styles.heroArrow} ${styles.heroArrowRight}`}
          aria-label="Next slide"
          onClick={() => go(+1)}
        >
          ›
        </button>

        <div className={styles.heroDots}>
          {slides.map((_, idx) => (
            <button
              key={idx}
              className={`${styles.heroDot} ${
                idx === i ? styles.heroDotActive : ""
              }`}
              aria-label={`Go to slide ${idx + 1}`}
              onClick={() => {
                if (timer.current) clearInterval(timer.current);
                setI(idx);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProductCard({ product }) {
  const {
    name,
    price,
    price_cents,
    image_url,
    image,
    tags = [],
    external_url,
    externalUrl,
  } = product || {};

  const img = image_url || image || "";
  const href =
    external_url ||
    externalUrl ||
    "https://empowermed.threeinternational.com/en";

  const displayPrice =
    price != null
      ? formatPrice(price)
      : price_cents != null
      ? formatPrice(Number(price_cents) / 100)
      : "$0.00";

  return (
    <article className={styles.card}>
      <a href={href} target="_blank" rel="noopener noreferrer">
        {img ? (
          <img className={styles.thumb} src={img} alt={name || "Product image"} />
        ) : (
          <div
            className={styles.thumb}
            aria-label="No image available"
          />
        )}
      </a>

      <div className={styles.body}>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.name}
          style={{ textDecoration: "none", display: "inline-block" }}
        >
          {name || "Untitled product"}
        </a>

        {!!tags.length && (
          <div className={styles.tags}>
            {tags.map((t) => (
              <span key={t} className={styles.tag}>
                {t}
              </span>
            ))}
          </div>
        )}

        <div className={styles.priceRow}>
          <div>
            <div className={styles.price}>{displayPrice}</div>
            <div className={styles.muted}>Ships from THREE</div>
          </div>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.cta}
          >
            Shop
          </a>
        </div>
      </div>
    </article>
  );
}