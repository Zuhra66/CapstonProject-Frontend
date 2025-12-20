// src/lib/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

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
    return _csrf;
  }
  
  try {
    const r = await fetch(`${API_BASE_URL}/csrf-token`, { 
      credentials: "include",
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!r.ok) {
      const text = await r.text();
      throw new Error(`CSRF fetch failed: ${r.status}`);
    }
    
    const data = await r.json();
    _csrf = data?.csrfToken || null;
    
    if (!_csrf) {
      throw new Error('No CSRF token in response');
    }
    
    return _csrf;
    
  } catch (error) {
    throw error;
  }
}

const NEEDS_CSRF = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export async function authedJson(
  path,
  { method = "GET", body, headers = {} } = {},
  getToken
) {
  const upper = method.toUpperCase();

  let csrfHeader = {};
  if (NEEDS_CSRF.has(upper)) {
    try {
      const token = await ensureCsrf();
      if (token) {
        csrfHeader = { "X-XSRF-TOKEN": token };
      } else {
        throw new Error('No CSRF token available');
      }
    } catch (error) {
      throw new Error(`CSRF protection failed: ${error.message}`);
    }
  }

  let bearerHeader = {};
  if (typeof getToken === "function") {
    try {
      const t = await getToken();
      if (t) bearerHeader = { Authorization: `Bearer ${t}` };
    } catch (error) {
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
    
    if (res.status === 403 && text.includes('CSRF')) {
      _csrf = null;
    }
    
    throw new Error(`${res.status}: ${text}`);
  }

  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

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

export const delJson = deleteJson;

export async function adminCreateProduct(payload, getToken) {
  return postJson(`/api/admin/products`, payload, getToken);
}

export async function adminUpdateProduct(id, patch, getToken) {
  return putJson(`/api/admin/products/${id}`, patch, getToken);
}

export async function adminDeleteProduct(id, getToken) {
  return deleteJson(`/api/admin/products/${id}`, getToken);
}

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

export const subscribeToNewsletter = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/newsletter/subscribe`, {
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
    throw error;
  }
};

export const getNewsletterSubscribers = async (params = {}, getToken) => {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, value);
      }
    });

    const response = await authedJson(`/api/newsletter/subscribers?${queryParams}`, 
      { method: "GET" }, 
      getToken
    );

    return response;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch subscribers');
  }
};

export const getNewsletterStats = async (getToken) => {
  try {
    const response = await authedJson('/api/newsletter/stats', 
      { method: "GET" }, 
      getToken
    );

    return response;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch stats');
  }
};

export const exportSubscribersCSV = async (params = {}, getToken) => {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, value);
      }
    });

    const response = await fetch(`${API_BASE_URL}/api/newsletter/export?${queryParams}`, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${await getToken()}`,
      },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to export subscribers');
    }

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
    throw error;
  }
};

export const deleteSubscriber = async (subscriberId, getToken) => {
  try {
    const response = await authedJson(`/api/newsletter/subscribers/${subscriberId}`, 
      { method: "DELETE" }, 
      getToken
    );

    return response;
  } catch (error) {
    throw new Error(error.message || 'Failed to delete subscriber');
  }
};

export const fetchProducts = (params = "", getToken) => 
  getJson(`/api/products${params}`, getToken);

export const fetchCategories = (_ = "", getToken) => 
  getJson(`/api/categories`, getToken);

export async function testCsrfConnection() {
  try {
    const token = await ensureCsrf();
    return { success: true, token: !!token };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

if (typeof window !== 'undefined') {
  setTimeout(() => {
    ensureCsrf().catch(() => {
      // Silent fail on initialization
    });
  }, 1000);
}