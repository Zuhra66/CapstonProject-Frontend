import React, { useEffect, useMemo, useState } from "react";
import styles from "../styles/Products.module.css";
import ProductCard, { HeroCarousel } from "../components/ProductCard";

const API = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([{ name: "All", slug: "all" }]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr("");
    (async () => {
      try {
        const url = new URL(`${API}/api/products`);
        if (q) url.searchParams.set("q", q);
        if (cat && cat !== "all") url.searchParams.set("category", cat);

        const res = await fetch(url.toString(), {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error(`Failed to load products`);
        }

        const json = await res.json();
        if (!alive) return;

        const rows = Array.isArray(json) ? json : json.products || [];
        setProducts(rows);
      } catch (e) {
        if (!alive) return;
        setErr("We couldn't load products. Please try again.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [q, cat]);

  const filtered = useMemo(() => {
    const list = products || [];
    const ql = q.trim().toLowerCase();
    const cl = (cat || "all").toLowerCase();

    if (!ql && cl === "all") return list;

    return list.filter((p) => {
      const hay = `${p.name || ""} ${(p.tags || []).join(" ")}`.toLowerCase();
      const matchesQ = ql ? hay.includes(ql) : true;

      let matchesCat = true;
      if (cl !== "all") {
        const pc = p?.category;
        if (typeof pc === "string") {
          matchesCat = pc.toLowerCase() === cl;
        } else {
          const prodSlug = pc?.slug?.toLowerCase();
          const prodName = pc?.name?.toLowerCase();
          matchesCat = prodSlug === cl || prodName === cl;
        }
      }

      return matchesQ && matchesCat;
    });
  }, [products, q, cat]);

  return (
    <div className={styles.page}>
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
              <ProductCard
                key={p.id}
                product={{
                  id: p.id,
                  name: p.name,
                  price_cents: p.price_cents || 0,
                  image_url: p.image_url,
                  tags: p.tags || [],
                  external_url: p.external_url,
                }}
              />
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