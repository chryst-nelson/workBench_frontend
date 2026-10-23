const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

let accessToken = null;
let onAuthLost = () => {};
let refreshing = null;

export const setAccessToken = (t) => {
  accessToken = t;
};
export const setAuthLostHandler = (fn) => {
  onAuthLost = fn;
};

export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const parse = async (res) => {
  if (res.status === 204) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
};

const toError = (res, body) =>
  new ApiError(
    res.status,
    body?.error?.code || "UNKNOWN",
    body?.error?.message || "Something went wrong. Try again.",
    body?.error?.details,
  );

export const refreshSession = () => {
  if (!refreshing) {
    refreshing = fetch(`${BASE}/auth/refresh`, { method: "POST", credentials: "include" })
      .then(async (res) => {
        const body = await parse(res);
        if (!res.ok) throw toError(res, body);
        accessToken = body.data.accessToken;
        return body.data;
      })
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
};

const send = (path, { method = "GET", body, query } = {}) => {
  const qs = query
    ? "?" +
      new URLSearchParams(
        Object.entries(query).filter(([, v]) => v !== undefined && v !== null && v !== ""),
      ).toString()
    : "";
  return fetch(`${BASE}${path}${qs}`, {
    method,
    credentials: "include",
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
};

export const api = async (path, opts = {}) => {
  let res;
  try {
    res = await send(path, opts);
  } catch {
    throw new ApiError(0, "NETWORK", "Can't reach the server. Check your connection and try again.");
  }
  if (res.status === 401 && !opts.noRefresh && accessToken) {
    try {
      await refreshSession();
      res = await send(path, opts);
    } catch {
      accessToken = null;
      onAuthLost();
      throw new ApiError(401, "SESSION_EXPIRED", "Your session expired. Sign in again.");
    }
  }
  const body = await parse(res);
  if (!res.ok) throw toError(res, body);
  return body;
};

export const get = (path, query) => api(path, { query });
export const post = (path, body, opts) => api(path, { method: "POST", body: body ?? {}, ...opts });
export const patch = (path, body) => api(path, { method: "PATCH", body });
export const put = (path, body) => api(path, { method: "PUT", body });
export const del = (path) => api(path, { method: "DELETE" });
