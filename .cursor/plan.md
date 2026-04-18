## Plan

1. Reproduce the `styled-components` import resolution error.
2. Confirm runtime dependency installation state.
3. Install or reconcile dependencies, then verify startup/build passes.
# Plan

1. Add Firebase SDK dependency.
2. Create a reusable Firebase config module.
3. Ensure analytics initializes safely in browser-only context.
4. Verify lint status for changed files.
# IELTS Admin Panel Build Plan

## Goals
- Build a complete IELTS Admin Panel from current Vite React starter.
- Use JavaScript only, Styled Components, Firebase, TipTap, React Router v6.
- Follow strict folder structure with `index.jsx` + `styles.js` in every component/page/feature folder.

## Steps
1. Install required dependencies and scaffold all required folders/files.
2. Implement app foundation (`App.jsx`, `main.jsx`, theme, global styles).
3. Implement Firebase layer (`config.js`, `auth.js`, `firestore.js`) with write verification and cascade deletes.
4. Implement hooks (`useAuth.js`, `usePassages.js`) and router with protected admin routing.
5. Build reusable UI components and layout shell.
6. Build pages and feature modules for passages, questions, preview, vocabulary, words, students, dashboard.
7. Add `.env` template with required `VITE_FIREBASE_*` variables.
8. Run lint and fix issues.
