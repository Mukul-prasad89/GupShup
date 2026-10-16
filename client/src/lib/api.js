const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

let memoryToken = null;
export function setMemoryToken(t) {
  memoryToken = t;
}
export function getMemoryToken() {
  return memoryToken;
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth && memoryToken) headers.Authorization = `Bearer ${memoryToken}`;
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  // Fire-and-forget: wakes sleeping free-tier Render + Neon. Never throws.
  wake: () => {
    try {
      fetch(`${API_URL}/api/health`, { method: 'GET', credentials: 'omit', keepalive: true }).catch(() => {});
      fetch(`${API_URL}/api/warm`, { method: 'GET', credentials: 'omit', keepalive: true }).catch(() => {});
    } catch { /* ignore */ }
    return Promise.resolve();
  },
  register: (payload) => request('/api/auth/register', { method: 'POST', body: payload, auth: false }),
  login: (payload) => request('/api/auth/login', { method: 'POST', body: payload, auth: false }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  me: () => request('/api/auth/me'),
  searchUsers: (q) => request(`/api/users/search?q=${encodeURIComponent(q)}`),
  getUser: (username) => request(`/api/users/${encodeURIComponent(username)}`),
  updateMe: (payload) => request('/api/users/me', { method: 'PATCH', body: payload }),
  sendRequest: (userId) => request(`/api/follow-requests/${userId}`, { method: 'POST' }),
  receivedRequests: () => request('/api/follow-requests/received'),
  sentRequests: () => request('/api/follow-requests/sent'),
  respondRequest: (id, action) => request(`/api/follow-requests/${id}`, { method: 'PATCH', body: { action } }),
  cancelRequest: (id) => request(`/api/follow-requests/${id}`, { method: 'DELETE' }),
  follows: () => request('/api/follows'),
  unfollow: (userId) => request(`/api/follows/${userId}`, { method: 'DELETE' }),
  conversations: () => request('/api/conversations'),
  createDirect: (userId) => request(`/api/conversations/direct/${userId}`, { method: 'POST' }),
  messages: (id, { cursor, limit = 30 } = {}) => {
    const qs = new URLSearchParams({ limit: String(limit) });
    if (cursor) qs.set('cursor', cursor);
    return request(`/api/conversations/${id}/messages?${qs}`);
  },
  sendMessage: (id, payload) => request(`/api/conversations/${id}/messages`, { method: 'POST', body: payload }),
};

export { API_URL };
