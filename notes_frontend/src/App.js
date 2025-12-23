import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";

import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import NotesList from "./components/NotesList";
import NoteEditor from "./components/NoteEditor";
import EmptyState from "./components/EmptyState";
import ToastCenter from "./components/ToastCenter";

import {
  createNote as apiCreate,
  deleteNote as apiDelete,
  getConfiguredApiBaseUrl,
  listNotes as apiList,
  updateNote as apiUpdate,
} from "./api/client";
import { loadNotesFromLocal, removeLocalNote, saveNotesToLocal, upsertLocalNote } from "./storage/localNotes";

function sortNotes(notes) {
  return [...notes].sort((a, b) => {
    const at = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const bt = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return bt - at;
  });
}

function normalizeBackendNote(n) {
  // Backend shape is unknown; support common variants.
  return {
    id: String(n.id ?? n.noteId ?? n._id ?? ""),
    title: n.title ?? "",
    content: n.content ?? "",
    createdAt: n.createdAt ?? n.created_at ?? new Date().toISOString(),
    updatedAt: n.updatedAt ?? n.updated_at ?? n.createdAt ?? n.created_at ?? new Date().toISOString(),
  };
}

// PUBLIC_INTERFACE
function App() {
  /** Simple Notes App main entry. Provides API-first CRUD with local fallback. */
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [notes, setNotes] = useState(() => sortNotes(loadNotesFromLocal()));
  const [selectedId, setSelectedId] = useState(null);

  // view: "list" | "new" | "edit"
  const [view, setView] = useState("list");

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [inlineError, setInlineError] = useState("");

  const [backendAvailable, setBackendAvailable] = useState(false);

  const [toasts, setToasts] = useState([]);

  const apiBase = useMemo(() => getConfiguredApiBaseUrl(), []);
  const selectedNote = useMemo(() => notes.find((n) => n.id === selectedId) || null, [notes, selectedId]);

  const addToast = useCallback((toast) => {
    const id = toast.id || `t_${Math.random().toString(16).slice(2)}_${Date.now()}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Persist local notes anytime they change (safe even when backend is used; acts as offline cache).
  useEffect(() => {
    saveNotesToLocal(notes);
  }, [notes]);

  const closeSidebarOnSmallScreens = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  const loadFromBackendIfPossible = useCallback(async () => {
    if (!apiBase) {
      setBackendAvailable(false);
      return;
    }

    setIsLoading(true);
    setInlineError("");
    try {
      const result = await apiList();
      const arr = Array.isArray(result) ? result : result?.notes || result?.data || [];
      const normalized = sortNotes(arr.map(normalizeBackendNote).filter((n) => n.id));
      setNotes(normalized);
      setBackendAvailable(true);
    } catch (e) {
      setBackendAvailable(false);
      addToast({
        variant: "info",
        title: "Offline mode",
        message: "Backend not reachable. Using local notes instead.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [apiBase, addToast]);

  useEffect(() => {
    loadFromBackendIfPossible();
  }, [loadFromBackendIfPossible]);

  const handleSelectView = useCallback(
    (nextView) => {
      setInlineError("");
      if (nextView === "new") {
        setSelectedId(null);
        setView("new");
      } else {
        setView("list");
      }
      closeSidebarOnSmallScreens();
    },
    [closeSidebarOnSmallScreens]
  );

  const handleSelectNote = useCallback(
    (id) => {
      setSelectedId(id);
      setView("edit");
      closeSidebarOnSmallScreens();
    },
    [closeSidebarOnSmallScreens]
  );

  const handleNewNote = useCallback(() => {
    setSelectedId(null);
    setView("new");
    setInlineError("");
    closeSidebarOnSmallScreens();
  }, [closeSidebarOnSmallScreens]);

  const handleCancelEditor = useCallback(() => {
    setInlineError("");
    if (notes.length === 0) {
      setView("list");
      setSelectedId(null);
      return;
    }
    setView("list");
  }, [notes.length]);

  const handleSave = useCallback(
    async ({ title, content }) => {
      setIsSaving(true);
      setInlineError("");

      const payload = { title: title || "", content: content || "" };

      // API-first if backendAvailable and apiBase is configured.
      if (backendAvailable && apiBase) {
        try {
          let saved;
          if (view === "new") saved = await apiCreate(payload);
          else saved = await apiUpdate(selectedId, payload);

          // Try to accept both {note: {...}} and raw note returns.
          const raw = saved?.note || saved?.data || saved;
          const normalized = normalizeBackendNote(raw || { ...payload, id: selectedId || raw?.id });

          setNotes((prev) => sortNotes(upsertLocalNote(prev, normalized)));
          setSelectedId(normalized.id);
          setView("edit");
          addToast({ variant: "success", title: "Saved", message: "Your note was saved." });
          return;
        } catch (e) {
          // If backend save fails, fall back to local.
          setBackendAvailable(false);
          addToast({
            variant: "info",
            title: "Switched to offline mode",
            message: "Save failed on backend. Your changes will be kept locally.",
          });
        }
      }

      // Local fallback save
      try {
        const id = view === "edit" && selectedId ? selectedId : undefined;
        const localNote = { id, ...payload };
        setNotes((prev) => sortNotes(upsertLocalNote(prev, localNote)));
        if (!selectedId) {
          const created = upsertLocalNote([], localNote)[0];
          setSelectedId(created.id);
        }
        setView("edit");
        addToast({ variant: "success", title: "Saved locally", message: "Stored in your browser." });
      } catch (e) {
        setInlineError("Could not save note. Please try again.");
      } finally {
        setIsSaving(false);
      }
    },
    [backendAvailable, apiBase, view, selectedId, addToast]
  );

  const handleDelete = useCallback(async () => {
    if (!selectedId) return;

    setIsSaving(true);
    setInlineError("");

    if (backendAvailable && apiBase) {
      try {
        await apiDelete(selectedId);
        setNotes((prev) => sortNotes(removeLocalNote(prev, selectedId)));
        setSelectedId(null);
        setView("list");
        addToast({ variant: "success", title: "Deleted", message: "Note removed." });
        return;
      } catch (e) {
        setBackendAvailable(false);
        addToast({
          variant: "info",
          title: "Offline mode",
          message: "Backend delete failed. Deleting locally instead.",
        });
      }
    }

    // Local delete
    setNotes((prev) => sortNotes(removeLocalNote(prev, selectedId)));
    setSelectedId(null);
    setView("list");
    setIsSaving(false);
    addToast({ variant: "success", title: "Deleted locally", message: "Note removed from this browser." });
  }, [selectedId, backendAvailable, apiBase, addToast]);

  const main = useMemo(() => {
    if (isLoading) {
      return (
        <div className="panel">
          <div className="spinner" aria-label="Loading" />
          <div className="muted">Loading notes…</div>
        </div>
      );
    }

    if (view === "new") {
      return (
        <NoteEditor
          mode="new"
          note={null}
          isSaving={isSaving}
          onSave={handleSave}
          onCancel={handleCancelEditor}
          onDelete={null}
          error={inlineError}
        />
      );
    }

    if (view === "edit") {
      if (!selectedNote) {
        return (
          <EmptyState
            title="Select a note"
            description="Choose a note from the list to view or edit it."
            actionLabel="Create a new note"
            onAction={handleNewNote}
          />
        );
      }

      return (
        <NoteEditor
          mode="edit"
          note={selectedNote}
          isSaving={isSaving}
          onSave={handleSave}
          onCancel={handleCancelEditor}
          onDelete={handleDelete}
          error={inlineError}
        />
      );
    }

    // list view
    return (
      <div className="split">
        <section className="split__left" aria-label="Notes">
          <div className="split__header">
            <div>
              <h1 className="h1">Notes</h1>
              <div className="muted">
                {backendAvailable && apiBase ? "Synced with backend" : "Stored locally"}
                {apiBase ? "" : " (no API URL configured)"}
              </div>
            </div>
            <button type="button" className="btn btn-secondary" onClick={handleNewNote}>
              Create
            </button>
          </div>

          <NotesList notes={notes} selectedNoteId={selectedId} onSelectNote={handleSelectNote} onCreateNew={handleNewNote} />
        </section>

        <section className="split__right" aria-label="Preview">
          {selectedNote ? (
            <div className="preview">
              <div className="preview__title">{selectedNote.title?.trim() ? selectedNote.title : "Untitled"}</div>
              <div className="preview__content">{selectedNote.content?.trim() ? selectedNote.content : "No content."}</div>
              <div className="preview__actions">
                <button type="button" className="btn btn-primary" onClick={() => setView("edit")}>
                  Edit
                </button>
              </div>
            </div>
          ) : (
            <EmptyState
              title="Pick a note to preview"
              description="Or create a new one to start writing."
              actionLabel="New note"
              onAction={handleNewNote}
            />
          )}
        </section>
      </div>
    );
  }, [
    apiBase,
    backendAvailable,
    handleCancelEditor,
    handleDelete,
    handleNewNote,
    handleSave,
    handleSelectNote,
    inlineError,
    isLoading,
    isSaving,
    notes,
    selectedId,
    selectedNote,
    view,
  ]);

  return (
    <div className="app-shell">
      <Header
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((v) => !v)}
        onNewNote={handleNewNote}
      />

      <div className="app-body">
        <Sidebar isOpen={isSidebarOpen} activeView={view === "new" ? "new" : "list"} onSelectView={handleSelectView} notesCount={notes.length} />
        <main className="main" role="main">
          {main}
        </main>
      </div>

      <ToastCenter toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;
