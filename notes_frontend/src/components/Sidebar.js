import React from "react";

// PUBLIC_INTERFACE
export default function Sidebar({ isOpen, activeView, onSelectView, notesCount }) {
  /** Left sidebar navigation. */
  return (
    <aside className={`sidebar ${isOpen ? "sidebar--open" : ""}`} aria-label="Sidebar navigation">
      <nav className="sidebar__nav">
        <button
          type="button"
          className={`sidebar__item ${activeView === "list" ? "sidebar__item--active" : ""}`}
          onClick={() => onSelectView("list")}
        >
          <span className="sidebar__icon" aria-hidden="true">
            🗒️
          </span>
          <span className="sidebar__label">All notes</span>
          <span className="sidebar__badge" aria-label={`${notesCount} notes`}>
            {notesCount}
          </span>
        </button>

        <button
          type="button"
          className={`sidebar__item ${activeView === "new" ? "sidebar__item--active" : ""}`}
          onClick={() => onSelectView("new")}
        >
          <span className="sidebar__icon" aria-hidden="true">
            ✍️
          </span>
          <span className="sidebar__label">Create</span>
        </button>
      </nav>

      <div className="sidebar__footer">
        <div className="muted">
          Tip: Your notes are saved locally if the backend isn’t available.
        </div>
      </div>
    </aside>
  );
}
