// src/pages/AdminProducts.jsx
import React, { useEffect, useState, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import useAuthFetch from "../lib/useAuth";
import { NavLink } from "react-router-dom";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5001").replace(
  /\/+$/,
  ""
);

export default function AdminProducts() {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  const authFetch = useAuthFetch();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  // ref for hidden file input
  const fileInputRef = useRef(null);

  // form state – price is in *dollars*
  const [form, setForm] = useState({
    id: null,
    name: "",
    price: "",
    image_url: "",
    external_url: "",
    category_id: "",
    is_active: true,
  });

  const isEditing = form.id !== null;

  /* -------------------------- Helpers -------------------------- */
  const resetForm = () =>
    setForm({
      id: null,
      name: "",
      price: "",
      image_url: "",
      external_url: "",
      category_id: "",
      is_active: true,
    });

  const formatMoney = (v) => {
    if (v === null || v === undefined || v === "") return "$0.00";
    const n = Number(v);
    if (!Number.isFinite(n)) return "$0.00";
    return n.toLocaleString(undefined, {
      style: "currency",
      currency: "USD",
    });
  };

  /* -------------------------- Load data -------------------------- */
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        if (isLoading) return;

        if (!isAuthenticated) {
          await loginWithRedirect({
            appState: { returnTo: window.location.pathname },
          });
          return;
        }

        const [productsRes, categoriesRes] = await Promise.all([
          authFetch(`/api/admin/products?limit=200`),
          fetch(API_BASE ? `${API_BASE}/api/categories` : "/api/categories"),
        ]);

        const productsJson = productsRes.data;
        const categoriesJson = categoriesRes.ok
          ? await categoriesRes.json().catch(() => [])
          : [];

        if (!alive) return;

        setProducts(productsJson.products || []);
        setCategories(categoriesJson.categories || categoriesJson || []);
        setError("");
      } catch (err) {
        if (!alive) return;
        console.error("Admin products load error:", err);
        setError("Failed to load products.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [isLoading, isAuthenticated, loginWithRedirect, authFetch]);

  /* -------------------------- Form handlers -------------------------- */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEdit = (product) => {
    setForm({
      id: product.id,
      name: product.name || "",
      price:
        product.price !== null && product.price !== undefined
          ? String(product.price)
          : "",
      image_url: product.image_url || "",
      external_url: product.external_url || "",
      category_id: product.category_id ?? "",
      is_active: product.is_active ?? true,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const handleDeactivateToggle = async (product) => {
    try {
      setSaving(true);
      const res = await authFetch(`/api/admin/products/${product.id}`, {
        method: "PUT",
        data: {
          is_active: !product.is_active,
        },
      });

      const updated = res.data;
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } catch (err) {
      console.error("Deactivate product error:", err);
      alert("Failed to update product status.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) {
      return;
    }

    try {
      setSaving(true);
      await authFetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
      });

      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      if (form.id === product.id) {
        resetForm();
      }
    } catch (err) {
      console.error("Delete product error:", err);
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to delete product.";
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  // when user selects a file for the image
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === "string") {
        // store as data URL in image_url
        setForm((f) => ({ ...f, image_url: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerFilePicker = (e) => {
    e.preventDefault();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const priceNumber = Number(form.price);
      if (!form.name || !Number.isFinite(priceNumber)) {
        alert("Please provide both a name and a numeric price in dollars.");
        setSaving(false);
        return;
      }

      const payload = {
        name: form.name.trim(),
        price: priceNumber,
        image_url: form.image_url || null, // may be URL OR data URL
        external_url: form.external_url.trim() || null,
        category_id: form.category_id || null,
        is_active: !!form.is_active,
      };

      let res;
      if (isEditing) {
        res = await authFetch(`/api/admin/products/${form.id}`, {
          method: "PUT",
          data: payload,
        });
      } else {
        res = await authFetch(`/api/admin/products`, {
          method: "POST",
          data: payload,
        });
      }

      const saved = res.data;

      if (isEditing) {
        setProducts((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
      } else {
        setProducts((prev) => [saved, ...prev]);
      }

      resetForm();
      // clear the file input so you can pick the same file again if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("Save product error:", err);
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to save product.";
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  /* -------------------------- Render states -------------------------- */
  if (isLoading) {
    return (
      <div className="page-content pt-small">
        <div className="container">
          <p>Auth0 is loading…</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-content pt-small">
        <div className="container">
          <p>Loading products…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-content pt-small">
        <div className="container">
          <div className="alert alert-danger">{error}</div>
        </div>
      </div>
    );
  }

  /* -------------------------- Main render -------------------------- */
  return (
    <div className="page-content pt-small">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="display-font mb-0">Products (Admin)</h1>
          <NavLink to="/products" className="btn btn-outline-secondary btn-sm">
            View storefront
          </NavLink>
        </div>

        {/* Create / edit form */}
        <section className="mb-5">
          <h2 className="display-font mb-3">
            {isEditing ? "Edit product" : "Create product"}
          </h2>

          <form onSubmit={handleSubmit} className="mb-3">
            <div className="row g-3">
              <div className="col-md-4">
                <label htmlFor="name" className="form-label body-font">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="form-control"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-2">
                <label htmlFor="price" className="form-label body-font">
                  Price (USD)
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-control"
                  value={form.price}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-3">
                <label htmlFor="category_id" className="form-label body-font">
                  Category
                </label>
                <select
                  id="category_id"
                  name="category_id"
                  className="form-select"
                  value={form.category_id}
                  onChange={handleChange}
                >
                  <option value="">Uncategorized</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name || "Untitled"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-3 d-flex align-items-end">
                <div className="form-check">
                  <input
                    id="is_active"
                    name="is_active"
                    type="checkbox"
                    className="form-check-input"
                    checked={form.is_active}
                    onChange={handleChange}
                  />
                  <label
                    className="form-check-label body-font ms-1"
                    htmlFor="is_active"
                  >
                    Active
                  </label>
                </div>
              </div>

              {/* IMAGE: URL + upload from computer */}
              <div className="col-md-6">
                <label htmlFor="image_url" className="form-label body-font">
                  Image
                </label>
                <div className="input-group">
                  <input
                    id="image_url"
                    name="image_url"
                    type="text"
                    className="form-control"
                    value={form.image_url}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                  />
                  <button
                    className="btn btn-outline-secondary"
                    onClick={triggerFilePicker}
                    type="button"
                  >
                    Upload…
                  </button>
                </div>
                <small className="text-muted body-font">
                  Paste an image URL, or click <strong>Upload…</strong> to pick a
                  file from your computer.
                </small>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleFileSelect}
                />
              </div>

              <div className="col-md-6">
                <label htmlFor="external_url" className="form-label body-font">
                  External link URL
                </label>
                <input
                  id="external_url"
                  name="external_url"
                  type="url"
                  className="form-control"
                  value={form.external_url}
                  onChange={handleChange}
                  placeholder="https://vendor.com/product"
                />
              </div>

              <div className="col-12 mt-3">
                <button
                  type="submit"
                  className="btn btn-primary me-2"
                  disabled={saving}
                >
                  {saving
                    ? "Saving…"
                    : isEditing
                    ? "Save changes"
                    : "Create product"}
                </button>

                {isEditing && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleCancelEdit}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </form>
        </section>

        {/* Existing products */}
        <section>
          <h2 className="display-font mb-3">Existing products</h2>

          {products.length === 0 ? (
            <p>No products yet.</p>
          ) : (
            <div className="list-group">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <div>
                    <div className="fw-semibold body-font">{p.name}</div>
                    <div className="text-muted small body-font">
                      {p.category?.name || "Uncategorized"} ·{" "}
                      {p.is_active ? "active" : "inactive"}
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-3">
                    <div className="body-font">{formatMoney(p.price)}</div>

                    {p.external_url && (
                      <a
                        href={p.external_url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-link btn-sm"
                      >
                        External link ↗
                      </a>
                    )}

                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => handleEdit(p)}
                      disabled={saving}
                    >
                      Edit
                    </button>

                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => handleDeactivateToggle(p)}
                      disabled={saving}
                    >
                      {p.is_active ? "Deactivate" : "Activate"}
                    </button>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(p)}
                      disabled={saving}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
