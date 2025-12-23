import React from "react";

// PUBLIC_INTERFACE
export default function EmptyState({ title, description, actionLabel, onAction }) {
  /** Simple empty state panel for list/editor. */
  return (
    <div className="empty">
      <div className="empty__icon" aria-hidden="true">
        📝
      </div>
      <h2 className="empty__title">{title}</h2>
      {description ? <p className="empty__desc">{description}</p> : null}
      {actionLabel && onAction ? (
        <button type="button" className="btn btn-primary" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
