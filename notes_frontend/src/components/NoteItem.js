import React from "react";

function truncate(text, maxLen) {
  const t = (text || "").trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen - 1)}…`;
}

// PUBLIC_INTERFACE
export default function NoteItem({ note, isSelected, onSelect }) {
  /** Single note row item with title + content preview. */
  return (
    <button
      type="button"
      className={`note-item ${isSelected ? "note-item--selected" : ""}`}
      onClick={() => onSelect(note.id)}
    >
      <div className="note-item__title">{note.title?.trim() ? note.title : "Untitled"}</div>
      <div className="note-item__preview">{truncate(note.content, 90) || "No content yet."}</div>
      <div className="note-item__meta">
        <span className="pill">{new Date(note.updatedAt || note.createdAt || Date.now()).toLocaleString()}</span>
      </div>
    </button>
  );
}
