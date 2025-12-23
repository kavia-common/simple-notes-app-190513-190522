/**
 * Local fallback store for notes.
 * Uses localStorage so the app remains functional even without backend connectivity.
 */

const STORAGE_KEY = "simple-notes-app.notes.v1";

function safeParse(json, fallback) {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

function nowIso() {
  return new Date().toISOString();
}

function makeId() {
  return `note_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function normalizeNote(note) {
  return {
    id: note.id,
    title: note.title || "",
    content: note.content || "",
    createdAt: note.createdAt || nowIso(),
    updatedAt: note.updatedAt || nowIso(),
  };
}

// PUBLIC_INTERFACE
export function loadNotesFromLocal() {
  /** Load notes array from localStorage. */
  const raw = localStorage.getItem(STORAGE_KEY);
  const parsed = raw ? safeParse(raw, []) : [];
  if (!Array.isArray(parsed)) return [];
  return parsed.map(normalizeNote);
}

// PUBLIC_INTERFACE
export function saveNotesToLocal(notes) {
  /** Persist notes array to localStorage. */
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes || []));
}

// PUBLIC_INTERFACE
export function upsertLocalNote(notes, input) {
  /** Insert or update a note in a local array; returns updated array. */
  const existingIdx = notes.findIndex((n) => n.id === input.id);
  if (existingIdx >= 0) {
    const updated = {
      ...notes[existingIdx],
      ...input,
      updatedAt: nowIso(),
    };
    const next = [...notes];
    next[existingIdx] = normalizeNote(updated);
    return next;
  }
  const created = normalizeNote({
    ...input,
    id: input.id || makeId(),
    createdAt: nowIso(),
    updatedAt: nowIso(),
  });
  return [created, ...notes];
}

// PUBLIC_INTERFACE
export function removeLocalNote(notes, id) {
  /** Remove a note by id from a local array; returns updated array. */
  return notes.filter((n) => n.id !== id);
}
