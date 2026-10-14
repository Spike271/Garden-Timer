# Garden Timer

Garden Timer is a mindful botanical Pomodoro focus application for the web. It pairs focus sessions with generative algorithmic botanical growth and real-time celestial lighting (sun and moon cycles synchronized to local time). Completing focus intervals nurtures a blooming tree, while skipping sessions gently wilts the plant, providing calm positive reinforcement without abrasive timers or high-stress gamification.

---

## Tech Stack & Architecture

- **Language:** JavaScript (ES Modules / JSX)
- **Framework & Libraries:** React 18 (`react`, `react-dom`), HTML5 Canvas
- **Styling & Fonts:** Tailwind CSS (CDN), Material Symbols, Google Fonts (_Newsreader_, _Plus Jakarta Sans_)
- **Build Tool & Bundler:** Vite 8 (`@vitejs/plugin-react`)
- **Package Manager:** npm (configured via `package.json` and `package-lock.json`)
- **Linter:** Oxlint (`.oxlintrc.json`)

---

## Entry Points

The project is structured with multi-page entry points configured in `vite.config.js`:

- `index.html` — Standalone landing and visual timer experience with built-in canvas and session controls.
- `app.html` — Full React application entry mounting `/src/main.jsx`.
- `src/main.jsx` — React root rendering `<App />` wrapped with `SettingsProvider` and `GardenProvider`.
- Rewrites: Requests to `/garden-timer` or `/app` in development are redirected to `/app.html`.

---

## Prerequisites & Requirements

- **Node.js:** Node.js 18.x or later (recommended: Node.js 20+ LTS)
- **Package Manager:** `npm` (v9+) or compatible package manager (`pnpm`, `yarn`)
- Modern web browser with HTML5 Canvas support

---

## Getting Started

### 1. Clone & Install Dependencies

```bash
git clone <repository-url>
cd Garden-Timer
npm install
```

### 2. Development Server

Start the local Vite development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

By default, Vite runs at `http://localhost:5173/`.

- Open `http://localhost:5173/` to view `index.html`.
- Open `http://localhost:5173/app` or `http://localhost:5173/app.html` to view the React application.

### 3. Production Build

Build static assets for production:

```bash
npm run build
```

Production build artifacts will be output to the `dist/` directory.

### 4. Preview Build

Preview the production build locally:

```bash
npm run preview
```

---

## Available Scripts

Defined in `package.json`:

| Script            | Command        | Description                                                        |
| ----------------- | -------------- | ------------------------------------------------------------------ |
| `npm run dev`     | `vite`         | Starts local development server with HMR.                          |
| `npm run build`   | `vite build`   | Compiles and bundles production-ready assets for all entry points. |
| `npm run preview` | `vite preview` | Serves the production build locally for verification.              |

---

