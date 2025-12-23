/**
 * Minimal API client for Notes CRUD.
 * Uses env vars for base URL; if not available or unreachable, callers can fallback to local storage.
 */

const DEFAULT_TIMEOUT_MS = 8000;

/**
 * Resolve API base URL from environment variables.
 * Priority: REACT_APP_API_BASE -> REACT_APP_BACKEND_URL -> null
 */
function getApiBaseUrl() {
  const fromApiBase = (process.env.REACT_APP_API_BASE || "").trim();
  if (fromApiBase) return fromApiBase.replace(/\/+$/, "");

  const fromBackendUrl = (process.env.REACT_APP_BACKEND_URL || "").trim();
  if (fromBackendUrl) return fromBackendUrl.replace(/\/+$/, "");

  return null;
}

function timeoutSignal(ms) {
  if (typeof AbortController === "undefined") return { signal: undefined, cancel: () => {} };
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, cancel: () => clearTimeout(t) };
}

async function requestJson(path, options = {}) {
  const base = getApiBaseUrl();
  if (!base) {
    const err = new Error("API base URL not configured");
    err.code = "NO_API_BASE";
    throw err;
  }

  const url = `${base}${path.startsWith("/") ? "" : "/"}${path}`;
  const { signal, cancel } = timeoutSignal(DEFAULT_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      signal: options.signal || signal,
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    if (!res.ok) {
      const err = new Error(data?.message || `Request failed (${res.status})`);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  } catch (e) {
    // Normalize fetch failures (CORS, DNS, refused connection, timeout).
    const err = new Error(e?.message || "Network error");
    err.cause = e;
    err.code = err.code || "NETWORK_ERROR";
    throw err;
  } finally {
    cancel();
  }
}

// PUBLIC_INTERFACE
export function getConfiguredApiBaseUrl() {
  /** Returns API base URL if configured, else null. */
  return getApiBaseUrl();
}

// PUBLIC_INTERFACE
export async function listNotes() {
  /** Lists all notes from backend. Expected to return an array. */
  return requestJson("/notes", { method: "GET" });
}

// PUBLIC_INTERFACE
export async function getNote(noteId) {
  /** Fetch a single note by id. */
  return requestJson(`/notes/${encodeURIComponent(noteId)}`, { method: "GET" });
}

// PUBLIC_INTERFACE
export async function createNote(payload) {
  /** Create note. Payload: {title, content} */
  return requestJson("/notes", { method: "POST", body: JSON.stringify(payload) });
}

// PUBLIC_INTERFACE
export async function updateNote(noteId, payload) {
  /** Update note. Payload: {title, content} */
  return requestJson(`/notes/${encodeURIComponent(noteId)}`, { method: "PUT", body: JSON.stringify(payload) });
}

// PUBLIC_INTERFACE
export async function deleteNote(noteId) {
  /** Delete note by id. */
  return requestJson(`/notes/${encodeURIComponent(noteId)}`, { method: "DELETE" });
}
