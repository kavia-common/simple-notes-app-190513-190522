import React from "react";

// PUBLIC_INTERFACE
export default function Header({ onToggleSidebar, isSidebarOpen, onNewNote }) {
  /** Top application header with responsive sidebar toggler. */
  return (
    <header className="app-header" role="banner">
      <div className="app-header__left">
        <button
          type="button"
          className="icon-btn app-header__menu"
          aria-label={isSidebarOpen ? "Close navigation" : "Open navigation"}
          onClick={onToggleSidebar}
        >
          <span aria-hidden="true">☰</span>
        </button>

        <div className="brand">
          <div className="brand__mark" aria-hidden="true">
            N
          </div>
          <div className="brand__text">
            <div className="brand__title">Simple Notes</div>
            <div className="brand__subtitle">Create, edit, and organize</div>
          </div>
        </div>
      </div>

      <div className="app-header__right">
        <button type="button" className="btn btn-primary" onClick={onNewNote}>
          New note
        </button>
      </div>
    </header>
  );
}
