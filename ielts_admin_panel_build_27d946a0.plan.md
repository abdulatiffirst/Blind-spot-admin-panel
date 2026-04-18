---
name: IELTS Admin Panel Build
overview: Build the IELTS Admin Panel from a fresh Vite React template using JavaScript-only React, Styled Components, Firebase (Auth/Firestore/Storage), TipTap, and React Router v6 with your strict folder/file conventions.
todos:
  - id: install-and-scaffold
    content: Install dependencies and scaffold full folder/file architecture with index.jsx + styles.js in each component/page/feature folder.
    status: pending
  - id: firebase-core
    content: Implement Firebase config, auth helpers, and verified Firestore/Storage CRUD including cascade deletes.
    status: pending
  - id: routing-and-auth
    content: Implement useAuth/usePassages hooks and protected React Router v6 navigation with admin checks.
    status: pending
  - id: ui-and-layout
    content: Build shared UI components and layout shell (Sidebar + Layout) with theme/global styles.
    status: pending
  - id: pages-and-features
    content: "Implement all pages and features: passages/question builder/preview, vocabulary lists+words, students management, and dashboard placeholder."
    status: pending
  - id: final-validation
    content: Run lint, resolve issues, validate rule compliance (JS-only, no TS, required modal behavior, required env variables).
    status: pending
isProject: false
---

# IELTS Admin Panel Implementation Plan

## Scope And Baseline
- Convert the current starter app into a full admin panel, keeping **JavaScript only** (`.js` / `.jsx`) and no TypeScript usage.
- Enforce your folder contract: each component/page/feature folder contains exactly `index.jsx` + `styles.js`.
- Install required dependencies and keep existing Vite setup intact.

## 1) Foundation Setup
- Install packages: `styled-components`, `react-router-dom`, `firebase`, `@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`, `@tiptap/extension-underline`.
- Create all required directories and files under `src` per your tree.
- Add app-wide theme and global styles:
  - [src/styles/theme.js](src/styles/theme.js)
  - [src/styles/GlobalStyles.js](src/styles/GlobalStyles.js)
- Replace starter UI in [src/App.jsx](src/App.jsx) and [src/main.jsx](src/main.jsx) to use `ThemeProvider`, `GlobalStyles`, and router entrypoint.

## 2) Firebase Layer (Config + Auth + Verified CRUD)
- Implement Firebase bootstrap using only `import.meta.env.VITE_*`:
  - [src/firebase/config.js](src/firebase/config.js)
- Implement auth helpers:
  - [src/firebase/auth.js](src/firebase/auth.js)
- Implement Firestore/Storage operations with strict post-write verification via immediate `getDoc` readback:
  - [src/firebase/firestore.js](src/firebase/firestore.js)
- Add robust verification helper behavior for all writes:
  - Success only if doc exists and expected data matches.
  - Otherwise throw exactly: `Failed to save. Please try again.`
- Implement cascade deletion flows:
  - Passage delete also deletes linked questions.
  - Vocabulary list delete also deletes words subcollection.

## 3) Auth State + Routing
- Build admin-aware auth hook with `onAuthStateChanged` and users-role check:
  - [src/hooks/useAuth.js](src/hooks/useAuth.js)
- Build passages data hook by type:
  - [src/hooks/usePassages.js](src/hooks/usePassages.js)
- Implement router with protected routes and redirects:
  - [src/router/index.jsx](src/router/index.jsx)
- Route map:
  - `/login`, `/`, `/dashboard`, `/reading`, `/listening`, `/vocabulary`, `/students`
  - Unauthenticated users redirected to `/login`
  - Non-admin authenticated users see `Access Denied`

## 4) Shared UI And Layout System
- Build reusable UI components (logic in `index.jsx`, styles in `styles.js`):
  - [src/components/ui/Button/index.jsx](src/components/ui/Button/index.jsx)
  - [src/components/ui/Input/index.jsx](src/components/ui/Input/index.jsx)
  - [src/components/ui/Modal/index.jsx](src/components/ui/Modal/index.jsx)
  - [src/components/ui/Table/index.jsx](src/components/ui/Table/index.jsx)
  - [src/components/ui/TagInput/index.jsx](src/components/ui/TagInput/index.jsx)
- Implement app shell:
  - [src/components/layout/Sidebar/index.jsx](src/components/layout/Sidebar/index.jsx)
  - [src/components/layout/Layout/index.jsx](src/components/layout/Layout/index.jsx)

## 5) Pages + Core Feature Modules
- Pages:
  - [src/pages/Login/index.jsx](src/pages/Login/index.jsx)
  - [src/pages/Dashboard/index.jsx](src/pages/Dashboard/index.jsx)
  - [src/pages/Reading/index.jsx](src/pages/Reading/index.jsx)
  - [src/pages/Listening/index.jsx](src/pages/Listening/index.jsx)
  - [src/pages/Vocabulary/index.jsx](src/pages/Vocabulary/index.jsx)
  - [src/pages/Students/index.jsx](src/pages/Students/index.jsx)
- Passage feature modules:
  - [src/features/passages/PassageList/index.jsx](src/features/passages/PassageList/index.jsx)
  - [src/features/passages/PassageForm/index.jsx](src/features/passages/PassageForm/index.jsx)
  - [src/features/passages/QuestionBuilder/index.jsx](src/features/passages/QuestionBuilder/index.jsx)
  - [src/features/passages/PreviewModal/index.jsx](src/features/passages/PreviewModal/index.jsx)
- Vocabulary modules:
  - [src/features/vocabulary/VocabList/index.jsx](src/features/vocabulary/VocabList/index.jsx)
  - [src/features/vocabulary/VocabForm/index.jsx](src/features/vocabulary/VocabForm/index.jsx)
  - [src/features/vocabulary/WordForm/index.jsx](src/features/vocabulary/WordForm/index.jsx)
- Student module:
  - [src/features/students/StudentList/index.jsx](src/features/students/StudentList/index.jsx)

## 6) Business Rules Implementation Details
- `PassageForm`
  - Reading: TipTap editor with Bold/Italic/Underline/H2/H3/Bullet list.
  - Listening: Storage upload to `audio/{passageId}/{filename}` with progress + player.
  - Shared validation of required fields.
  - Question section fully manageable in create/edit/view contexts.
- `QuestionBuilder`
  - Supports all 4 IELTS question types.
  - Note completion blank parsing with `/\((\d+)\)/g` and dynamic answer fields.
- `PreviewModal`
  - Full-screen simulation mode, no Firestore writes.
  - Reading split-pane; listening single-column with audio.
  - Local scoring and explanation display after submit.
- `VocabForm`/`WordForm`
  - Connected passage select and words CRUD under subcollection.
- `StudentList`
  - Student-only filtering and deletion verification.

## 7) Integration + Quality Pass
- Ensure all modal bodies follow `max-height: 80vh; overflow-y: auto`.
- Apply loading/error/success states on all async actions.
- Confirm date formatting and action handlers across tables.
- Run lint and fix introduced issues.
- Verify no `.ts/.tsx` files and that each requested folder follows the two-file pattern.

## 8) Environment Setup
- Create root `.env` template with required Firebase keys:
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_AUTH_DOMAIN`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_STORAGE_BUCKET`
  - `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - `VITE_FIREBASE_APP_ID`

## Deliverable Outcome
- A complete runnable IELTS admin panel matching your structure and behavior requirements, using Vite + React (JavaScript only), styled-components, Firebase, TipTap, and React Router v6.