// Thin fetch wrapper around the backend's /campaign and /gmail routes.
// Every call needs a Supabase access token (from useAuth()'s `session`).
//
// Adjust this env var to match your bundler:
//   Vite -> import.meta.env.VITE_API_BASE_URL
//   CRA  -> process.env.REACT_APP_API_BASE_URL
const API_BASE = import.meta.env.VITE_API_BASE_URL;

async function request(path, token, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      message = body.message || body.error || message;
    } catch {
      // response wasn't JSON — keep the generic message
    }
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  campaigns: {
    list: (token) => request("/campaign", token),
    get: (id, token) => request(`/campaign/${id}`, token),
    stats: (id, token) => request(`/campaign/${id}/stats`, token),
    recipients: (id, token, { limit = 50, offset = 0 } = {}) =>
      request(
        `/campaign/${id}/recipients?limit=${limit}&offset=${offset}`,
        token,
      ),
    create: (payload, token) =>
      request("/campaign/create", token, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    start: (id, token) =>
      request(`/campaign/${id}/start`, token, { method: "PATCH" }),
    pause: (id, token) =>
      request(`/campaign/${id}/pause`, token, { method: "PATCH" }),
    resume: (id, token) =>
      request(`/campaign/${id}/resume`, token, { method: "PATCH" }),
  },
  gmail: {
    connect: (token) => request("/gmail/connect", token),
    accounts: (token) => request("/gmail/accounts", token),
    setStatus: (id, status, token) =>
      request(`/gmail/${id}/status`, token, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    setLimit: (id, daily_limit, token) =>
      request(`/gmail/${id}/limit`, token, {
        method: "PATCH",
        body: JSON.stringify({ daily_limit }),
      }),
    disconnect: (id, token) =>
      request(`/gmail/${id}/disconnect`, token, { method: "PATCH" }),
  },
};
