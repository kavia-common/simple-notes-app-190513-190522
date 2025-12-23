import React, { useEffect } from "react";

// PUBLIC_INTERFACE
export default function ToastCenter({ toasts, onDismiss }) {
  /** Lightweight, non-intrusive toast renderer. */
  useEffect(() => {
    if (!toasts.length) return;
    const timers = toasts.map((t) =>
      setTimeout(() => {
        onDismiss(t.id);
      }, t.timeoutMs || 3000)
    );
    return () => timers.forEach(clearTimeout);
  }, [toasts, onDismiss]);

  return (
    <div className="toast-center" aria-live="polite" aria-relevant="additions removals">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.variant || "info"}`}>
          <div className="toast__content">
            <div className="toast__title">{t.title}</div>
            {t.message ? <div className="toast__message">{t.message}</div> : null}
          </div>
          <button type="button" className="icon-btn toast__close" aria-label="Dismiss" onClick={() => onDismiss(t.id)}>
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
