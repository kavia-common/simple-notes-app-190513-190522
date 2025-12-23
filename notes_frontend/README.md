# Simple Notes App (Frontend)

A modern, responsive React single-page app where users can create, view, edit, and delete notes (title + content).  
Layout: top header + left sidebar navigation + main content area.

## Running

In this directory:

- `npm start` – runs the app on port 3000 (Create React App / react-scripts)
- `npm run build` – production build

## API configuration (environment variables)

This frontend **attempts to use a backend API for CRUD**, but will **gracefully fall back to local browser storage** if the backend is not configured or not reachable.

The API base URL is resolved in the following order:

1. `REACT_APP_API_BASE`
2. `REACT_APP_BACKEND_URL`
3. If neither is set (or the backend is unreachable), the app runs in **offline mode** using local storage.

### Fallback behavior

- If the backend cannot be reached (network/CORS/timeout), the app shows a small “Offline mode” toast and continues using **local notes**.
- Notes are saved in `localStorage` under a versioned key, so the UI remains functional without any backend.
- Even when a backend is reachable, the app keeps a local copy as a lightweight offline cache.

## UI notes

- Responsive: on smaller screens the sidebar collapses behind a menu button in the header.
- Accessibility: semantic landmarks (`header`, `aside`, `main`), labeled form fields, and focus-visible styles.

## Customizing styles

Theme colors are defined as CSS variables in `src/App.css`:

- Primary: `#3b82f6`
- Success accent: `#06b6d4`
- Error: `#EF4444`
- Background: `#f9fafb`
- Surface: `#ffffff`
- Text: `#111827`
