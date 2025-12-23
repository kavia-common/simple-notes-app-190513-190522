import React from "react";
import NoteItem from "./NoteItem";
import EmptyState from "./EmptyState";

// PUBLIC_INTERFACE
export default function NotesList({ notes, selectedNoteId, onSelectNote, onCreateNew }) {
  /** List view of all notes with selection. */
  if (!notes.length) {
    return (
      <EmptyState
        title="No notes yet"
        description="Create your first note to get started."
        actionLabel="Create a note"
        onAction={onCreateNew}
      />
    );
  }

  return (
    <div className="notes-list" role="list" aria-label="Notes list">
      {notes.map((n) => (
        <NoteItem key={n.id} note={n} isSelected={n.id === selectedNoteId} onSelect={onSelectNote} />
      ))}
    </div>
  );
}
