// src/lib/api.js - FIXED VERSION for api.empowermedwellness.com
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/* ---------- CSRF handling ---------- */
let _csrf = null;

function readCookie(name) {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

async function ensureCsrf() {
  if (_csrf) return _csrf;

  const c = readCookie("XSRF-TOKEN");
  if (c) {
    _csrf = c;
    console.log('✅ Using cached CSRF token');
    return _csrf;
  }
  
  console.log('🔄 Fetching CSRF token from:', `${API_BASE_URL}/csrf-token`);
  
  try {
    const r = await fetch(`${API_BASE_URL}/csrf-token`, { 
      credentials: "include",
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!r.ok) {
      const text = await r.text();
      console.error('❌ CSRF fetch failed:', r.status, text);
      throw new Error(`CSRF fetch failed: ${r.status}`);
    }
    
    const data = await r.json();
    _csrf = data?.csrfToken || null;
    
    if (!_csrf) {
      throw new Error('No CSRF token in response');
    }
    
    console.log('✅ CSRF token received');
    return _csrf;
    
  } catch (error) {
    console.error('❌ CSRF token error:', error);
    throw error;
  }
}

const NEEDS_CSRF = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/* ---------- Core helper ---------- */
export async function authedJson(
  path,
  { method = "GET", body, headers = {} } = {},
  getToken
) {
  const upper = method.toUpperCase();

  // CSRF for unsafe methods
  let csrfHeader = {};
  if (NEEDS_CSRF.has(upper)) {
    try {
      const token = await ensureCsrf();
      if (token) {
        csrfHeader = { "X-XSRF-TOKEN": token };
        console.log(`🔒 Attached CSRF token for ${upper} request`);
      } else {
        throw new Error('No CSRF token available');
      }
    } catch (error) {
      console.error(`❌ CSRF token error for ${upper}:`, error.message);
      throw new Error(`CSRF protection failed: ${error.message}`);
    }
  }

  // Optional Bearer auth
  let bearerHeader = {};
  if (typeof getToken === "function") {
    try {
      const t = await getToken();
      if (t) bearerHeader = { Authorization: `Bearer ${t}` };
    } catch (error) {
      console.warn('⚠️ Auth token fetch failed:', error.message);
      // Continue without auth - some endpoints might work without it
    }
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: upper,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...bearerHeader,
      ...csrfHeader,
      ...headers,
    },
    body: body != null ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    console.error(`❌ ${upper} ${path} failed:`, res.status, text);
    
    // Clear CSRF cache on CSRF errors
    if (res.status === 403 && text.includes('CSRF')) {
      _csrf = null;
      console.log('🔄 CSRF error detected, clearing cache');
    }
    
    throw new Error(`${res.status}: ${text}`);
  }

  console.log(`✅ ${upper} ${path} successful`);
  
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

/* ---------- Convenience wrappers ---------- */
export const getJson  = (path, getToken, headers) => 
  authedJson(path, { method: "GET", headers }, getToken);

export const postJson = (path, body, getToken, headers) => 
  authedJson(path, { method: "POST", body, headers }, getToken);

export const putJson  = (path, body, getToken, headers) => 
  authedJson(path, { method: "PUT", body, headers }, getToken);

export const patchJson = (path, body, getToken, headers) => 
  authedJson(path, { method: "PATCH", body, headers }, getToken);

export const deleteJson = (path, getToken, headers) => 
  authedJson(path, { method: "DELETE", headers }, getToken);

export const delJson = deleteJson; // Alias for backward compatibility

/* ---------- Admin: Products ---------- */
export async function adminCreateProduct(payload, getToken) {
  return postJson(`/api/admin/products`, payload, getToken);
}

export async function adminUpdateProduct(id, patch, getToken) {
  return putJson(`/api/admin/products/${id}`, patch, getToken);
}

export async function adminDeleteProduct(id, getToken) {
  return deleteJson(`/api/admin/products/${id}`, getToken);
}

/* ---------- Admin: Users ---------- */
export async function adminGetUsers(params = '', getToken) {
  const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
  return getJson(`/api/admin/users${queryString}`, getToken);
}

export async function adminUpdateUser(userId, data, getToken) {
  return putJson(`/api/admin/users/${userId}`, data, getToken);
}

export async function adminUpdateUserStatus(userId, isActive, getToken) {
  return patchJson(`/api/admin/users/${userId}/status`, { is_active: isActive }, getToken);
}

export async function adminDeleteUser(userId, getToken) {
  return deleteJson(`/api/admin/users/${userId}`, getToken);
}

/* ---------- Public catalog ---------- */
export const fetchProducts = (params = "", getToken) => 
  getJson(`/api/products${params}`, getToken);

export const fetchCategories = (_ = "", getToken) => 
  getJson(`/api/categories`, getToken);

/* ---------- Test function ---------- */
export async function testCsrfConnection() {
  try {
    console.log('🧪 Testing CSRF connection...');
    const token = await ensureCsrf();
    console.log('✅ CSRF token available:', !!token);
    return { success: true, token: !!token };
  } catch (error) {
    console.error('❌ CSRF test failed:', error);
    return { success: false, error: error.message };
  }
}

/* ---------- Initialize ---------- */
if (typeof window !== 'undefined') {
  // Pre-fetch CSRF token in background
  setTimeout(() => {
    ensureCsrf().catch(() => {
      // Silent fail on initialization
    });
  }, 1000);
}