<div align="center">

# 🛠️ DevKit

![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646cff?style=flat-square&logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2024-f7df1e?style=flat-square&logo=javascript&logoColor=black)
![CSS](https://img.shields.io/badge/CSS-3-1572b6?style=flat-square&logo=css3&logoColor=white)
![No Backend](https://img.shields.io/badge/Backend-None-3dd68c?style=flat-square&logoColor=white)
![localStorage](https://img.shields.io/badge/Storage-localStorage-f5a623?style=flat-square)

[![Live Demo](https://img.shields.io/badge/🛠️_Live_Demo-devkit-7c6cf5?style=for-the-badge)](https://pero-grubac.github.io/devkit/)

</div>

---

## 📌 Project Overview

**DevKit** is a developer utility toolkit built as a single-page React app. Every tool is self-contained, responds instantly as you type. Outputs from any tool can be saved to a persistent **Snippet Library** stored in `localStorage` — accessible from the sidebar at any time. No backend. No tracking. No ads. Everything runs in your browser.


---

## ✨ Features

- ⚡ **Instant** — every tool responds as you type, no loading spinners
- 📌 **Snippet Library** — save any output with a custom title, browse, copy, and reopen from the sidebar
- 🧩 **29 tools** across 7 categories — Data, Text, Dev, Security, Network, System, Numeric
- 🎨 **Consistent dark UI** — single CSS file, shared design tokens, no inline style soup
- 🏗️ **Feature-based architecture** — each tool is an isolated folder, trivial to add or remove

---

## 🧰 Tools

### 📦 Data

| Tool | Description |
|------|-------------|
| **JSON** | Format and validate · minify · syntax highlight · key count and depth stats |
| **YAML** | JSON ↔ YAML · YAML ↔ JSON · Python dict → JSON/YAML (handles `True`/`False`/`None`) |
| **Base64** | Text encode/decode · URL-safe mode · Image → Base64 with drag & drop |
| **JWT** | Decode tokens with expiry status · sign new tokens (HS256/384/512) via Web Crypto API |
| **Hash** | MD5 (pure JS) · SHA-1/256/512 (Web Crypto) · hex upper/lower toggle |

### 📝 Text

| Tool | Description |
|------|-------------|
| **Regex** | Live match highlighting · flags · replace mode · match count |
| **Diff** | Line-by-line and char-by-char diff · unified patch output |
| **String** | 13 case conversions · word/char/sentence stats · clean & transform operations |
| **Markdown** | Split-pane live preview · HTML output mode for CMS and email templates |
| **Lorem Ipsum** | Paragraphs / sentences / words mode · configurable counts · word and char stats |

### 🔧 Dev

| Tool | Description |
|------|-------------|
| **UUID** | Generate v4 UUIDs · bulk generation · copy all |
| **Commit** | Conventional commit message builder with emoji, type, scope, and breaking change flag |
| **Color** | Color picker with HEX / RGB / HSL / RGBA / CSS HSL / Tailwind output |
| **Color Palette** | Generate 10-step shades · complementary, triadic, analogous harmonies · export CSS vars or Tailwind config |
| **Gitignore** | 34 templates across languages, frameworks, editors, and OS · fully editable before download |
| **Cron** | Parse expressions into human description · next 8 run times · 9 common presets |
| **HTTP Status** | Searchable reference for all 1xx–5xx codes with descriptions, grouped by class |
| **Semver** | Parse version breakdown · bump major/minor/patch/alpha/beta/rc · compare two versions |
| **SQL** | Format and syntax-highlight SQL queries · 2/4-space indent toggle |

### 🔒 Security

| Tool | Description |
|------|-------------|
| **Password** | CSPRNG generator · configurable charset (upper/lower/digits/symbols) · live entropy score |
| **TOTP** | RFC 6238 live 2FA codes · 30s countdown bar · current and next code display |

### 🌐 Network

| Tool | Description |
|------|-------------|
| **HTTP Request** | REST client with real request sending · curl / fetch / axios code generator |
| **URL** | Parse URL into parts · build URL from parts · encode/decode query params |
| **IP / CIDR** | IPv4 info (class, private/public, decimal/hex/binary) · full subnet calculator |
| **QR Code** | Pure-JS QR encoder (no CDN) · 4 EC levels · 4 scales · PNG download |

### 🖥️ System

| Tool | Description |
|------|-------------|
| **Chmod** | Click checkboxes or type octal/symbolic · instant bidirectional conversion · common presets |

### 🔢 Numeric

| Tool | Description |
|------|-------------|
| **Timestamp** | Unix ↔ human date · relative time · ISO, UTC, local formats |
| **Number** | Base converter (bin/oct/dec/hex) · random number generator · rounding and precision |
| **IEEE 754** | Visualize 32/64-bit float bit layout · sign/exponent/mantissa breakdown · floating point quirks panel |

---

## ⚙️ How It Works

### Architecture

DevKit uses a **feature-based** architecture. Each tool lives in its own folder under `src/features/` and exposes exactly one export through `index.js`. The tool knows nothing about the rest of the app — it only imports from `../../shared/`.

```
App.jsx  →  imports each feature via index.js
                ↓
         TOOLS map  { json: JsonFormatter, yaml: YamlTool, ... }
                ↓
         renders <ActiveTool /> inside <main>
```

### Snippet Library

The snippet system has three layers:

```
snippets.js          — pure localStorage: load / save / delete / update
SnippetContext.jsx   — React context, holds snippets in memory, syncs to localStorage
SaveBtn.jsx          — inline popover component, calls context.add()
SnippetsPanel.jsx    — sidebar panel: search, copy, open, rename (double-click), delete
```

Any tool adds snippet support with one line:
```jsx
<SaveBtn content={output} toolId="json" toolLabel="JSON" />
```

### Shared design system

All colors are defined once in `shared/theme.js` as a `T` object and mirrored as CSS custom properties in `index.css`. Components in `shared/ui.jsx` (`Btn`, `Input`, `Card`, `Label`, `CopyBtn`, `Textarea`, `Row`, `OutputBox`, `ErrorBox`) are used across every tool.

---

## 📁 Project Structure

```
devkit-v2/
├── index.html
├── vite.config.js
├── package.json
├── eslint.config.js
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx                          # Entry point — mounts App, imports index.css
    ├── App.jsx                           # Shell — TOOLS map, SnippetProvider, layout
    ├── index.css                         # All global styles — single source of truth
    │
    ├── shared/                           # Shared across all features
    │   ├── theme.js                      # Color tokens (T object)
    │   ├── registry.js                   # TABS + GROUPS navigation config
    │   ├── ui.jsx                        # Btn, Input, Textarea, Card, Label, CopyBtn, Row…
    │   ├── SaveBtn.jsx                   # Snippet save popover component
    │   ├── SnippetContext.jsx            # React context + useSnippets() hook
    │   └── snippets.js                  # Pure localStorage read/write/delete/update
    │
    ├── components/                       # Layout components (not tools)
    │   ├── Sidebar.jsx                   # Collapsible nav sidebar + SnippetsPanel
    │   ├── TopBar.jsx                    # Active tool title + dot navigation
    │   └── SnippetsPanel.jsx             # Saved snippets: search, copy, open, rename, delete
    │
    └── features/                         # One folder per tool — flat structure
        │
        ├── json-formatter/
        │   ├── format.js                 # syntaxHL, parseJson, jsonStats — pure functions
        │   ├── JsonFormatter.jsx
        │   └── index.js
        │
        ├── yaml/
        │   ├── pythonDict.js             # Python dict literal → valid JSON conversion
        │   ├── YamlTool.jsx              # 4 modes: JSON↔YAML, Python→JSON/YAML
        │   └── index.js
        │
        ├── hash/
        │   ├── md5.js                    # Pure JS MD5 implementation
        │   ├── digest.js                 # Web Crypto SHA-1/256/512 wrapper + ALGOS config
        │   ├── HashTool.jsx
        │   └── index.js
        │
        ├── jwt-generator/
        │   ├── sign.js                   # Web Crypto JWT signing — HS256/384/512
        │   ├── JwtGenerator.jsx          # Decode mode + Sign mode
        │   └── index.js
        │
        ├── color-palette/
        │   ├── palette.js                # HSL math, shade/harmony/tint generation, CSS/Tailwind export
        │   ├── ColorPalette.jsx          # Shades · Harmonies · CSS Vars · Tailwind output tabs
        │   └── index.js
        │
        ├── url-parser/
        │   ├── url.js                    # parseUrl, buildUrl, encodeParam, decodeParam
        │   ├── UrlParser.jsx             # Parse · Build · Encode/Decode modes
        │   └── index.js
        │
        ├── http-builder/
        │   ├── codegen.js                # buildCurl, buildFetch, buildAxios — pure functions
        │   ├── HttpBuilder.jsx           # REST client + code generator
        │   └── index.js
        │
        ├── chmod/
        │   ├── chmod.js                  # octalToState, stateToSymbolic, symbolicToState, presets
        │   ├── Chmod.jsx                 # Checkbox grid + parse input + presets
        │   └── index.js
        │
        ├── ieee754/
        │   ├── ieee754.js               # analyzeFloat32, analyzeFloat64, INTERESTING presets
        │   ├── Ieee754.jsx              # Bit visualizer + stats card + quirks panel
        │   └── index.js
        │
        ├── base64/
        │   ├── Base64Tool.jsx            # Text encode/decode + Image → Base64 with drag & drop
        │   └── index.js
        │
        ├── diff/
        │   ├── DiffTool.jsx              # Line diff + char diff + unified patch
        │   └── index.js
        │
        ├── gitignore/
        │   ├── GitignoreTool.jsx         # 34 templates, tag picker, editable output, download
        │   └── index.js
        │
        ├── password/
        │   ├── PasswordTool.jsx          # CSPRNG generator, charset options, entropy meter
        │   └── index.js
        │
        ├── color/
        │   ├── ColorTool.jsx             # Picker + HEX/RGB/HSL/RGBA/Tailwind conversions
        │   └── index.js
        │
        ├── regex/            ├── commit/           ├── string-utils/
        ├── lorem/            ├── uuid/             ├── timestamp/
        ├── number/           ├── totp/             ├── cron/
        ├── http-status/      ├── semver/           ├── sql/
        ├── ip-cidr/          ├── qr-code/
        │
        └── (each folder has: ToolName.jsx  +  index.js)
```

---

## 🚀 Setup & Run

### Prerequisites

- Node.js 18+
- npm

### 1. Clone the repository

```bash
git clone https://github.com/your-username/devkit.git
cd devkit
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start local dev server on port 3000 |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

---

## 🏗️ Tech Stack

| Tool | Version | Role |
|------|---------|------|
| React | 19 | UI framework |
| Vite | 8 | Dev server & bundler |
| Web Crypto API | — | JWT signing, SHA-1/256/512 hashing |
| localStorage | — | Snippet library persistence |
| js-yaml | CDN | YAML parsing (lazy-loaded on first use) |
| marked.js | CDN | Markdown rendering (lazy-loaded on first use) |

No external UI libraries. No CSS frameworks. No state management libraries.

---

## ➕ Adding a New Tool

1. Add an entry to `src/shared/registry.js` — TABS array and GROUPS array
2. Create `src/features/my-tool/MyTool.jsx`
3. Create `src/features/my-tool/index.js`:
   ```js
   export { MyTool } from './MyTool';
   ```
4. Optionally add `myLogic.js` for pure non-React logic (no imports from React)
5. Import and register in `src/App.jsx`:
   ```js
   import { MyTool } from './features/my-tool';
   const TOOLS = { ..., 'my-tool': MyTool };
   ```
6. Add `<SaveBtn>` next to any output to make it saveable:
   ```jsx
   import { SaveBtn } from '../../shared/SaveBtn';
   <SaveBtn content={output} toolId="my-tool" toolLabel="My Tool" />
   ```

---

## 🌍 Deploy to GitHub Pages

1. Set `base` in `vite.config.js` to match your repo name:

```js
export default defineConfig({
  plugins: [react()],
  base: '/devkit/',
  server: { port: 3000 },
})
```

2. Add `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci && npm run build
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

3. In **Settings → Pages → Source** select **GitHub Actions**.

Site will be live at `https://<your-username>.github.io/devkit/`

---

_All tools run entirely in the browser. No data ever leaves your machine._
