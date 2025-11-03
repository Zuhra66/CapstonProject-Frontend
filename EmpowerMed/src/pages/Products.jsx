import React, { useMemo, useState } from "react";
import bannerImg from "../assets/ThreeProducts.jpeg";
import "../styles/Global.css";
const STORE_URL = "https://empowermed.threeinternational.com/en";
// Demo data – replace image URLs when you have real photos
const ALL_PRODUCTS = [
  { id: "visage-super-serum", name: "VISAGE SUPER SERUM", price: 89.0, image: "", benefits: ["Firming", "Brightening"], category: "Skincare" },
  { id: "visage-creme-caviar", name: "VISAGE CRÈME CAVIAR", price: 98.0, image: "", benefits: ["Hydration", "Nourishing"], category: "Skincare" },
  { id: "eternel", name: "ÉTERNEL", price: 76.0, image: "", benefits: ["Renewal", "Glow"], category: "Skincare" },
  { id: "kynetik-clean-caffeine", name: "KYNETIK CLEAN CAFFEINE", price: 32.0, image: "", benefits: ["Energy", "Focus"], category: "Beverage" },
  { id: "vitalite", name: "VITALITÉ", price: 45.0, image: "", benefits: ["Daily Multinutrient"], category: "Supplement" },
  { id: "collagene", name: "COLLAGÈNE", price: 49.0, image: "", benefits: ["Skin", "Hair", "Nails"], category: "Supplement" },
  { id: "pure-cleanse", name: "PURE CLEANSE", price: 39.0, image: "", benefits: ["Detox", "Digestive"], category: "Skincare" },
  { id: "revive", name: "REVÍVÉ", price: 44.0, image: "", benefits: ["Recovery", "Antioxidants"], category: "Supplement" },
  { id: "purifi", name: "PURIFÍ", price: 42.0, image: "", benefits: ["Gut", "Cleanse"], category: "Supplement" },
  { id: "imune", name: "IMÚNE", price: 46.0, image: "", benefits: ["Immune Support"], category: "Supplement" },
  { id: "radiant-toner", name: "RADIANT TONER", price: 36.0, image: "", benefits: ["Balance", "Refine"], category: "Skincare" },
];
export default function ProductsPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const categories = useMemo(
    () => ["All", ...new Set(ALL_PRODUCTS.map((p) => p.category))],
    []
  );
  const products = useMemo(() => {
    const text = q.trim().toLowerCase();
    return ALL_PRODUCTS.filter((p) => {
      const matchesText =
        !text ||
        p.name.toLowerCase().includes(text) ||
        p.benefits.join(" ").toLowerCase().includes(text);
      const matchesCat = cat === "All" || p.category === cat;
      return matchesText && matchesCat;
    });
  }, [q, cat]);
  return (
    <>
      
     {/* CENTERED BANNER */}
{/* CENTERED BANNER (Global.css themed) */}
<section className="container" style={{ marginTop: "7rem", marginBottom: "4rem" }}>
  <div className="products-hero">
    <img src={bannerImg} alt="EmpowerMed Products" />
    <div className="products-hero__overlay" />
    <div className="products-hero__title">EmpowerMed Products</div>
  </div>
</section>


      {/* CONTENT */}
      <main className="max-w-6xl mx-auto px-4 pb-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-indigo-800">PRODUCTS</h2>
            <p className="text-gray-600">Explore our curated wellness essentials</p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <input
                type="search"
                placeholder="Search products…"
                className="rounded-xl border px-4 py-2 pl-10 outline-none focus:ring w-64"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <span className="absolute left-3 top-2.5 text-gray-400">
                <i className="fas fa-search" />
              </span>
            </div>
            <a
              href={STORE_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700"
            >
              Shop All
            </a>
          </div>
        </div>
        {/* Category chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-3 py-1 rounded-full border transition ${
                cat === c ? "bg-indigo-600 text-white border-indigo-600" : "hover:bg-gray-50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        {/* Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <article
              key={p.id}
              className="group rounded-2xl bg-white/80 shadow hover:shadow-xl transition p-4"
            >
              <div className="overflow-hidden rounded-xl">
                <img
                  src={p.image || "/placeholder.png"}
                  alt={p.name}
                  className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-800">{p.name}</h3>
              <div className="mt-1 text-gray-600 text-sm flex gap-2 flex-wrap">
                {p.benefits.map((b) => (
                  <span key={b} className="text-xs bg-indigo-50 px-2 py-1 rounded-full">
                    {b}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xl font-semibold text-indigo-800">
                  ${p.price.toFixed(2)}
                </span>
                <a
                  href={STORE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700"
                  aria-label={`Shop ${p.name} on EmpowerMed store`}
                >
                  Shop
                </a>
              </div>
            </article>
          ))}
        </section>
        {products.length === 0 && (
          <div className="text-center mt-6">
            <img src="/no-results.png" alt="No results" className="mx-auto h-40 w-40" />
            <p className="text-gray-500 mt-4">No products match your search.</p>
          </div>
        )}
      </main>
    </>
  );
}