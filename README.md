<div align="center">
    <img src="src/assets/images/app.png" width="160" height="160" alt="app logo">
    <h1>React Quillplate</h1>
    <p><b>Opinionated React + TypeScript + Vite starter with Tailwind & Redux Toolkit</b></p>
</div>

## 🚀 Project overview
This repository is a practical starter for applications built with React (v18) + TypeScript and Vite. It combines:

- Fast build & HMR with Vite
- Type-safe routing with TanStack React Router
- Centralized state with Redux Toolkit and optional persistence (redux-persist)
- Tailwind CSS for utility-first styling (dark mode enabled)
- Tooling: ESLint, Prettier, Husky, Commitlint

## ✨ Notable libraries

- react, react-dom (v18)
- vite (dev server + build)
- typescript
- @reduxjs/toolkit, react-redux, redux-persist
- @tanstack/react-router (type-safe routing)
- tailwindcss
- @heroicons/react, clsx, tailwind-merge

Dev tooling (selected): eslint, prettier, husky, commitlint, npm-run-all

---

## 🏗️ Getting started

1. Clone the repository

```bash
git clone https://github.com/quill-pro/internal-boilerplate-react.git
cd react-boilerplate
```

2. Install dependencies (pnpm recommended)

```bash
pnpm install
```

3. Run the dev server

```bash
pnpm dev
```

Open http://localhost:5173 (Vite's default) in your browser.

---

## 🔧 Scripts

Scripts available in `package.json` (highlights):

- `pnpm dev` — start Vite dev server
- `pnpm build` — typecheck (tsc) and build production bundle
- `pnpm serve` — preview the production build locally
- `pnpm lint` / `pnpm lint:fix` — run ESLint
- `pnpm format` / `pnpm format:fix` — run Prettier
- `pnpm typecheck` — run TypeScript typecheck
- `pnpm validate` — run typecheck, lint and format checks in parallel
- `pnpm deploy` — validate, build and serve (composed script)

Use the scripts in `package.json` as the single source of truth. They are tailored for the included tooling (Husky + commitlint are used in the repo hooks).

---

## 🗂️ **Project Structure**
```
├── src
│   ├── assets            # Images, icons
│   ├── components        # Reusable components (buttons, modals, tables)
│   ├── features          # Domain features
│   ├── hooks             # Custom React hooks
│   ├── pages             # Main pages
│   ├── redux             # State management and services
│   ├── routes            # Application routing
│   └── utils             # Utility functions
```

- 🥙 **kebab-case**: For filenames.
- 🅿️ **PascalCase**: For component files.
- 🐫 **camelCase**: For variables and functions.

---

## 📝 **Additional Info**

### 🖥️ **Editor Setup**
For an optimal coding experience, use **VSCode** with these settings:
- Enable **ESLint** and **Prettier**.
- Auto-fix errors on save:
  ```json
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
  ```

### 📜 **Commit Message Guidelines**
Thanks to **Husky** pre-commit hooks, the code is linted and formatted before every commit.  
Follow **Conventional Commits**:
- **Types**: `chore`, `build`, `docs`, `feat`, `fix`, `refactor`, `style`, `test`
- Example: `feat(customers): add customer search feature`