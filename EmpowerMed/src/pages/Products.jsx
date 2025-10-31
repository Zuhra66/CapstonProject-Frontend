// src/pages/ProductsPage.jsx
import { useMemo, useState } from "react";
import bannerImg from "../assets/ThreeProducts.jpeg";

const STORE_URL = "https://empowermed.threeinternational.com/en";

// Demo data – swap to your API later
const ALL_PRODUCTS = [
  {
    id: "vitamin-d",
    name: "Vitamin D3 5000 IU",
    price: 18.99,
    image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop",
    benefits: ["Immune", "Bone"],
    category: "Vitamins",
  },
  {
    id: "magnesium",
    name: "Magnesium Glycinate",
    price: 22.5,
    image:
      "https://images.unsplash.com/photo-1582719478250-71f41c2f6e9b?q=80&w=1200&auto=format&fit=crop",
    benefits: ["Calm", "Sleep", "Recovery"],
    category: "Minerals",
  },
  {
    id: "omega-3",
    name: "Omega-3 Fish Oil",
    price: 25.0,
    image:
      "https://images.unsplash.com/photo-1576092768245-6a4d2f6b0b5a?q=80&w=1200&auto=format&fit=crop",
    benefits: ["Heart", "Brain"],
    category: "Oils",
  },
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
      {/* FULL-WIDTH BANNER — entire image, no cropping */}
      <section
        className="
          relative w-screen -mx-[calc(50vw-50%)]
          mt-8 mb-10 rounded-b-[2rem] shadow-xl
        "
      >
        <img
          src={bannerImg}
          alt="EmpowerMed featured products"
          className="block w-full h-auto"   // keep natural aspect ratio
        />
        {/* overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/25 to-transparent" />
        {/* centered content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
       
        </div>
      </section>

      {/* CONTENT CONTAINER */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold">Products</h2>
            <p className="text-gray-600">Explore our curated essentials</p>
          </div>

          <div className="flex gap-2">
            <input
              type="search"
              placeholder="Search products…"
              className="rounded-xl border px-4 py-2 outline-none focus:ring w-64"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
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
              className="group rounded-2xl bg-white/70 shadow hover:shadow-xl transition p-4"
            >
              <div className="overflow-hidden rounded-xl">
                <img
                  src={p.image}
                  alt={p.name}
                  className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              <h3 className="mt-4 text-lg font-semibold">{p.name}</h3>
              <div className="mt-1 text-gray-600 text-sm flex gap-2 flex-wrap">
                {p.benefits.map((b) => (
                  <span key={b} className="text-xs bg-indigo-50 px-2 py-1 rounded-full">
                    {b}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-xl font-semibold">${p.price.toFixed(2)}</span>
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
          <p className="text-gray-500">No products match your search.</p>
        )}
      </main>
    </>
  );
}
