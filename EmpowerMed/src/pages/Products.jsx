// src/pages/Products.jsx
import React, { useEffect, useMemo, useState } from "react";
import styles from "../styles/Products.module.css";
import ProductCard, { HeroCarousel } from "../components/ProductCard";

/** Normalize API base */
const RAW_BASE = import.meta.env.VITE_API_URL ?? "";
const API_BASE =
  RAW_BASE === ""
    ? ""
    : RAW_BASE
        .replace(
          "http://empowermed-backend.onrender.com",
          "https://empowermed-backend.onrender.com"
        )
        .replace(/\/+$/, "");

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([{ name: "All", slug: "all" }]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");

  const urlBase = API_BASE || window.location.origin;

  // --------------------------
  // Load categories
  // --------------------------
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const url = API_BASE ? `${API_BASE}/api/categories` : "/api/categories";
        const res = await fetch(url, { credentials: "include" });
        if (!res.ok) throw new Error(`Categories ${res.status}`);

        let rows = await res.json(); // expect array of categories
        if (!alive) return;

        rows = (rows || []).map((c) => {
          const name = c.name || c.slug || "Unknown";
          const slug = (c.slug || name)
            .toString()
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-");
          return { ...c, name, slug };
        });

        setCategories([{ name: "All", slug: "all" }, ...rows]);
      } catch (e) {
        if (!alive) return;
        setCategories([{ name: "All", slug: "all" }]);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // --------------------------
  // Load products (server-side filter)
  // --------------------------
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr("");

    (async () => {
      try {
        const url = new URL("/api/products", urlBase);
        if (q) url.searchParams.set("q", q);
        if (cat && cat !== "all") url.searchParams.set("category", cat);

        const res = await fetch(url.toString(), { credentials: "include" });
        if (!res.ok) throw new Error(`Products ${res.status}`);

        const rows = await res.json();
        if (!alive) return;

        setProducts(rows || []);
      } catch (e) {
        console.error("Products load error:", e);
        if (!alive) return;
        setErr("We couldn't load products. Please try again.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [q, cat, urlBase]);

  // --------------------------
  // Client-side filter
  // --------------------------
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

  // --------------------------
  // Render
  // --------------------------
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
                className={`${styles.pill} ${
                  cat === c.slug ? styles.pillActive : ""
                }`}
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
                  price: p.price, // dollars
                  price_cents: p.price_cents, // legacy safety
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
