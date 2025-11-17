// src/lib/api.js
const BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

/**
 * Pass a function that returns a token (e.g., () => getAccessTokenSilently()).
 * We can't use the Auth0 hook in here because this is a plain module (not a component).
 */
export async function authedJson(path, { method = "GET", body, headers = {} } = {}, getToken) {
  let token = null;
  if (typeof getToken === "function") {
    token = await getToken();
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  // Throw helpful error text for easier debugging
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }

  // Try JSON, fall back to text
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}
