// src/pages/Products.jsx
import React, { useEffect, useMemo, useState } from "react";
import styles from "../styles/Products.module.css";
import ProductCard, { HeroCarousel } from "../components/ProductCard";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([{ name: "All", slug: "All" }]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");

  // Load categories (for filter pills)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/categories`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error(`Categories ${res.status}`);
        const rows = await res.json();
        if (!alive) return;
        setCategories([{ name: "All", slug: "All" }, ...rows]);
      } catch (e) {
        // fallback: still render "All" only
        console.warn("Categories load failed:", e);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Load products from backend (respects q/category via query params)
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr("");
    (async () => {
      try {
        const url = new URL(`${API_BASE}/api/products`);
        if (q) url.searchParams.set("q", q);
        if (cat && cat !== "All") url.searchParams.set("category", cat);

        const res = await fetch(url.toString(), { credentials: "include" });
        if (!res.ok) throw new Error(`Products ${res.status}`);
        const rows = await res.json();

        // rows come shaped like:
        // { id, name, slug, price, image, externalUrl, isActive, category:{name,slug}, tags:[...] }
        if (!alive) return;
        setProducts(rows);
      } catch (e) {
        console.error(e);
        if (!alive) return;
        setErr("We couldn’t load products. Please try again.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [q, cat]);

  // Client-side filtering (lightweight), in case you want it in addition to server filters
  const filtered = useMemo(() => {
    const list = products || [];
    if (!q && (cat === "All" || !cat)) return list;

    return list.filter((p) => {
      const hay = `${p.name} ${(p.tags || []).join(" ")}`.toLowerCase();
      const matchesQ = q ? hay.includes(q.toLowerCase()) : true;
      const matchesCat =
        cat === "All" ? true : p?.category?.slug === cat || p?.category?.name === cat;
      return matchesQ && matchesCat;
    });
  }, [products, q, cat]);

  return (
    <div className={styles.page}>
      {/* Full-bleed banner with image-only slideshow */}
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <HeroCarousel items={products} intervalMs={4000} />
        </div>
      </header>

      <main className={styles.wrap}>
        <div className={styles.toolbar}>
          <div className={styles.search}>
            <div className={styles.searchIcon}>🔎</div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products…"
              aria-label="Search products"
            />
          </div>

          <div className={styles.filters}>
            {categories.map((c) => (
              <button
                key={c.slug}
                onClick={() => setCat(c.slug)}
                className={`${styles.pill} ${cat === c.slug ? styles.pillActive : ""}`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {loading && <div className={styles.muted}>Loading products…</div>}
        {err && !loading && <div className={styles.muted}>{err}</div>}

        {!loading && !err && (
          <section className={styles.grid}>
            {filtered.map((p) => (
              <ProductCard key={p.id} product={{
                name: p.name,
                price: p.price,
                image: p.image,
                badges: p.tags,
                externalUrl: p.externalUrl
              }} />
            ))}
            {!filtered.length && (
              <div className={styles.muted}>No products match your search.</div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
