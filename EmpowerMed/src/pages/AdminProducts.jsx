// src/pages/AdminProducts.jsx
import { useEffect, useMemo, useState } from "react";
import {
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
} from "../lib/api";

const API = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function AdminProducts() {
  const [list, setList] = useState([]);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    price_cents: 0,
    image_url: "",
    external_url: "",
    category_id: null,
    is_active: true,
  });

  async function loadAll() {
    try {
      setLoading(true);
      setError("");
      const [pRes, cRes] = await Promise.all([
        fetch(`${API}/api/products`, { credentials: "include" }),
        fetch(`${API}/api/categories`, { credentials: "include" }),
      ]);
      if (!pRes.ok) throw new Error(`Products ${pRes.status}`);
      if (!cRes.ok) throw new Error(`Categories ${cRes.status}`);
      const [products, categories] = await Promise.all([pRes.json(), cRes.json()]);
      setList(products || []);
      setCats(categories || []);
    } catch (e) {
      setError(e.message || "Failed to load products/categories");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const validForm = useMemo(() => {
    if (!form.name.trim()) return false;
    if (!Number.isFinite(+form.price_cents) || +form.price_cents < 0) return false;
    // category_id optional; image/external optional
    return true;
  }, [form]);

  function updateForm(prop, val) {
    setForm((f) => ({ ...f, [prop]: val }));
  }

  async function create() {
    if (!validForm) return;
    try {
      setBusy(true);
      await adminCreateProduct({
        ...form,
        price_cents: Number(form.price_cents) | 0,
        category_id:
          form.category_id === "" || form.category_id === null
            ? null
            : Number(form.category_id),
      });
      // reset
      setForm({
        name: "",
        price_cents: 0,
        image_url: "",
        external_url: "",
        category_id: null,
        is_active: true,
      });
      await loadAll();
    } catch (e) {
      alert(e?.message || "Create failed");
    } finally {
      setBusy(false);
    }
  }

  async function quickToggleActive(p) {
    try {
      setBusy(true);
      await adminUpdateProduct(p.id, { is_active: !p.is_active });
      await loadAll();
    } catch (e) {
      alert(e?.message || "Update failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id) {
    if (!confirm("Delete product?")) return;
    try {
      setBusy(true);
      await adminDeleteProduct(id);
      await loadAll();
    } catch (e) {
      alert(e?.message || "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-wrap" style={{ padding: "1rem" }}>
      <h2 style={{ marginBottom: "1rem" }}>Products (Admin)</h2>

      {loading && <div>Loading…</div>}
      {error && (
        <div style={{ color: "crimson", marginBottom: "1rem" }}>{error}</div>
      )}

      {/* Create card */}
      <div
        className="card"
        style={{
          border: "1px solid #e5e7eb",
          padding: "1rem",
          borderRadius: 8,
          marginBottom: "1.25rem",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Create product</h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 180px",
            gap: "0.75rem 1rem",
            alignItems: "center",
            maxWidth: 800,
          }}
        >
          <label>
            <div>Name</div>
            <input
              value={form.name}
              onChange={(e) => updateForm("name", e.target.value)}
              placeholder="Visage Super Serum"
              style={{ width: "100%" }}
            />
          </label>

          <label>
            <div>Price (cents)</div>
            <input
              type="number"
              min={0}
              value={form.price_cents}
              onChange={(e) => updateForm("price_cents", e.target.value)}
              placeholder="15900"
              style={{ width: "100%" }}
            />
          </label>

          <label style={{ gridColumn: "1 / -1" }}>
            <div>Image URL</div>
            <input
              value={form.image_url}
              onChange={(e) => updateForm("image_url", e.target.value)}
              placeholder="/images/visage.jpg or https://…"
              style={{ width: "100%" }}
            />
          </label>

          <label style={{ gridColumn: "1 / -1" }}>
            <div>External URL</div>
            <input
              value={form.external_url}
              onChange={(e) => updateForm("external_url", e.target.value)}
              placeholder="https://threeinternational.com/…"
              style={{ width: "100%" }}
            />
          </label>

          <label>
            <div>Category</div>
            <select
              value={form.category_id ?? ""}
              onChange={(e) =>
                updateForm(
                  "category_id",
                  e.target.value ? Number(e.target.value) : null
                )
              }
              style={{ width: "100%" }}
            >
              <option value="">— none —</option>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={!!form.is_active}
              onChange={(e) => updateForm("is_active", e.target.checked)}
            />
            Active
          </label>

          <div style={{ gridColumn: "1 / -1" }}>
            <button
              onClick={create}
              disabled={!validForm || busy}
              style={{
                padding: "0.5rem 0.9rem",
                borderRadius: 6,
                background: validForm && !busy ? "#0ea5e9" : "#93c5fd",
                color: "white",
                border: "none",
                cursor: validForm && !busy ? "pointer" : "not-allowed",
              }}
            >
              {busy ? "Saving…" : "Create"}
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <div
        className="card"
        style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "1rem" }}
      >
        <h3 style={{ marginTop: 0 }}>Existing products</h3>
        {!list.length && <div>No products found.</div>}

        <ul className="list" style={{ listStyle: "none", paddingLeft: 0 }}>
          {list.map((p) => (
            <li
              key={p.id}
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(200px,1fr) 120px 140px 110px 110px",
                alignItems: "center",
                gap: 12,
                padding: "0.5rem 0",
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>
                  {p.category ? p.category : "—"} •{" "}
                  {p.is_active ? "active" : "inactive"}
                </div>
              </div>

              <div>${(p.price_cents / 100).toFixed(2)}</div>

              <div style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                {p.external_url ? (
                  <a href={p.external_url} target="_blank" rel="noreferrer">
                    External link ↗
                  </a>
                ) : (
                  <span style={{ color: "#94a3b8" }}>no link</span>
                )}
              </div>

              <button
                disabled={busy}
                onClick={() => quickToggleActive(p)}
                style={{
                  padding: "0.35rem 0.6rem",
                  borderRadius: 6,
                  border: "1px solid #cbd5e1",
                  background: "#fff",
                  cursor: busy ? "not-allowed" : "pointer",
                }}
              >
                {p.is_active ? "Deactivate" : "Activate"}
              </button>

              <button
                disabled={busy}
                onClick={() => remove(p.id)}
                style={{
                  padding: "0.35rem 0.6rem",
                  borderRadius: 6,
                  border: "1px solid #ef4444",
                  background: "#fee2e2",
                  color: "#b91c1c",
                  cursor: busy ? "not-allowed" : "pointer",
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
