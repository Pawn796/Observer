// Simple API client wrapper using fetch with timeout, retry, token injection and refresh
// Usage: import { api } from './api/client.js';

const DEFAULT_TIMEOUT = 10000; // ms
const MAX_RETRIES = 1;

function getBaseUrl() {
  return (typeof process !== 'undefined' && process.env.API_BASE_URL) || window.API_BASE_URL || 'http://localhost:4000';
}

function logRequest(method, url, meta = {}) {
  console.debug('[api] request', method, url, meta);
}

function logResponse(method, url, status, time) {
  console.debug('[api] response', method, url, status, time + 'ms');
}

async function withTimeout(promise, timeout) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await promise(controller.signal);
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

function getStoredTokens() {
  try {
    const raw = localStorage.getItem('observer_tokens');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) { return null; }
}
function setStoredTokens(t) { localStorage.setItem('observer_tokens', JSON.stringify(t)); }
function clearStoredTokens() { localStorage.removeItem('observer_tokens'); }

async function fetchWithAuth(path, options = {}, { retry = MAX_RETRIES } = {}) {
  const base = getBaseUrl();
  const url = path.startsWith('http') ? path : base + path;
  const method = (options.method || 'GET').toUpperCase();
  const start = Date.now();
  logRequest(method, url, options);

  const tokens = getStoredTokens();
  const headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers || {});
  if (tokens && tokens.accessToken) headers['Authorization'] = 'Bearer ' + tokens.accessToken;

  const attempt = async (signal) => {
    const res = await fetch(url, Object.assign({}, options, { headers, signal }));
    const time = Date.now() - start;
    logResponse(method, url, res.status, time);

    if (res.status === 401 && tokens && tokens.refreshToken) {
      // try refresh once
      if (retry > 0) {
        const ok = await tryRefresh(tokens.refreshToken);
        if (ok) {
          return fetchWithAuth(path, options, { retry: retry - 1 });
        }
      }
      // not refreshed
      clearStoredTokens();
      const err = new Error('Unauthorized');
      err.status = 401;
      throw err;
    }

    let body = null;
    try { body = await res.json(); } catch (e) { body = null; }

    if (!res.ok) {
      const err = new Error(body && body.message ? body.message : 'API Error');
      err.status = res.status;
      err.body = body;
      throw err;
    }
    return body;
  };

  return withTimeout(attempt, options.timeout || DEFAULT_TIMEOUT);
}

async function tryRefresh(refreshToken) {
  try {
    const base = getBaseUrl();
    const res = await fetch(base + '/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    if (!res.ok) return false;
    const body = await res.json();
    setStoredTokens(body);
    return true;
  } catch (e) {
    return false;
  }
}

export const api = {
  async login(username, password) {
    const base = getBaseUrl();
    const res = await fetchWithAuth('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }, { retry: 0 });
    if (res && res.accessToken) setStoredTokens(res);
    return res;
  },
  logout() {
    clearStoredTokens();
  },
  async getAccounts() {
    return fetchWithAuth('/accounts', { method: 'GET' });
  },
  async createAccount(payload) {
    return fetchWithAuth('/accounts', { method: 'POST', body: JSON.stringify(payload) });
  },
  async updateAccount(id, payload) {
    return fetchWithAuth('/accounts/' + encodeURIComponent(id), { method: 'PUT', body: JSON.stringify(payload) });
  },
  async deleteAccount(id) {
    return fetchWithAuth('/accounts/' + encodeURIComponent(id), { method: 'DELETE' });
  },
  async updateOrder(orderArray) {
    return fetchWithAuth('/accounts/order', { method: 'PUT', body: JSON.stringify({ order: orderArray }) });
  }
};

// convenience wrappers
export async function clientGet(path) { return api.getAccounts(); }
