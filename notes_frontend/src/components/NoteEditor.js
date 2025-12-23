import React, { useEffect, useMemo, useState } from "react";

function normalizeDraft(note) {
  return {
    title: note?.title || "",
    content: note?.content || "",
  };
}

// PUBLIC_INTERFACE
export default function NoteEditor({
  mode,
  note,
  isSaving,
  onSave,
  onCancel,
  onDelete,
  error,
}) {
  /** Editor to create or edit a note. */
  const initial = useMemo(() => normalizeDraft(note), [note]);
  const [title, setTitle] = useState(initial.title);
  const [content, setContent] = useState(initial.content);

  useEffect(() => {
    setTitle(initial.title);
    setContent(initial.content);
  }, [initial.title, initial.content]);

  const canDelete = mode === "edit";

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ title, content });
  };

  return (
    <div className="editor">
      <div className="editor__header">
        <div>
          <h1 className="editor__title">{mode === "new" ? "New note" : "Edit note"}</h1>
          <div className="editor__subtitle">Keep it simple. Keep it searchable.</div>
        </div>

        <div className="editor__actions">
          {canDelete ? (
            <button type="button" className="btn btn-danger btn-ghost" onClick={onDelete} disabled={isSaving}>
              Delete
            </button>
          ) : null}
          <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={isSaving}>
            Cancel
          </button>
          <button type="submit" form="note-form" className="btn btn-primary" disabled={isSaving}>
            {isSaving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="inline-alert inline-alert--error" role="status">
          {error}
        </div>
      ) : null}

      <form id="note-form" className="editor__form" onSubmit={handleSubmit}>
        <label className="field">
          <span className="field__label">Title</span>
          <input
            type="text"
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Grocery list"
            autoFocus
          />
        </label>

        <label className="field">
          <span className="field__label">Content</span>
          <textarea
            className="textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note here…"
            rows={14}
          />
        </label>
      </form>
    </div>
  );
}
