// src/lib/adminApi.js
const API = import.meta.env.VITE_API_URL;

async function getCsrf() {
  const r = await fetch(`${API}/csrf-token`, { credentials: "include" });
  const { csrfToken } = await r.json();
  return csrfToken;
}

export async function adminListProducts({ search = "", category = "", page = 1, limit = 20 } = {}) {
  const url = new URL(`${API}/api/admin/products`);
  if (search) url.searchParams.set("search", search);
  if (category) url.searchParams.set("category", category);
  url.searchParams.set("page", page);
  url.searchParams.set("limit", limit);
  const r = await fetch(url, { credentials: "include" });
  if (!r.ok) throw new Error(`list failed ${r.status}`);
  return r.json();
}

export async function adminCreateProduct(data) {
  const token = await getCsrf();
  const r = await fetch(`${API}/api/admin/products`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", "X-XSRF-TOKEN": token },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error(`create failed ${r.status}`);
  return r.json();
}

export async function adminUpdateProduct(id, data) {
  const token = await getCsrf();
  const r = await fetch(`${API}/api/admin/products/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json", "X-XSRF-TOKEN": token },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error(`update failed ${r.status}`);
  return r.json();
}

export async function adminDeleteProduct(id) {
  const token = await getCsrf();
  const r = await fetch(`${API}/api/admin/products/${id}`, {
    method: "DELETE",
    credentials: "include",
    headers: { "X-XSRF-TOKEN": token },
  });
  if (!(r.ok || r.status === 204)) throw new Error(`delete failed ${r.status}`);
}
