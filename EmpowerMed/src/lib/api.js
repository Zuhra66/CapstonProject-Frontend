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

// Add these functions to your existing api.js file

// Newsletter API functions
export const subscribeToNewsletter = async (email) => {
  try {
    const response = await fetch(`${API_URL}/api/newsletter/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Subscription failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    throw error;
  }
};

// Admin newsletter functions
export const getNewsletterSubscribers = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, value);
      }
    });

    const token = getAuthToken();
    const response = await fetch(`${API_URL}/api/newsletter/subscribers?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch subscribers');
    }

    return await response.json();
  } catch (error) {
    console.error('Get subscribers error:', error);
    throw error;
  }
};

export const getNewsletterStats = async () => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/api/newsletter/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch stats');
    }

    return await response.json();
  } catch (error) {
    console.error('Get stats error:', error);
    throw error;
  }
};

export const exportSubscribersCSV = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, value);
      }
    });

    const token = getAuthToken();
    const response = await fetch(`${API_URL}/api/newsletter/export?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to export subscribers');
    }

    // Create download link for CSV
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    const filename = response.headers.get('Content-Disposition')?.split('filename=')[1] || 
                     `empowermed-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    return true;
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
};

export const deleteSubscriber = async (subscriberId) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/api/newsletter/subscribers/${subscriberId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete subscriber');
    }

    return await response.json();
  } catch (error) {
    console.error('Delete subscriber error:', error);
    throw error;
  }
};

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