import { lazy, Suspense, useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { SnippetProvider } from "./shared/SnippetContext";
import { Sidebar } from "./components/Sidebar";
import { TopBar }  from "./components/TopBar";
import { CommandPalette } from "./components/CommandPalette";
import { TABS } from "./shared/registry";
import { T } from "./shared/theme";
import { toolFromHash, hashFor } from "./shared/route";
import { clearInputs } from "./shared/persist";

// Each tool is its own chunk, fetched the first time it is opened (or preloaded
// when the browser is idle). Once loaded it renders directly, without a
// Suspense round-trip, so switching tools never flashes the loading state.
function tool(load, name) {
  let Loaded = null;
  const preload = () => load().then(m => { Loaded = m[name]; return { default: Loaded }; });
  const Lazy = lazy(preload);
  const Tool = () => (Loaded ? <Loaded /> : <Lazy />);
  Tool.preload = preload;
  return Tool;
}

const TOOLS = {
  json:       tool(() => import("./features/json-formatter"), "JsonFormatter"),
  yaml:       tool(() => import("./features/yaml"),           "YamlTool"),
  base64:     tool(() => import("./features/base64"),         "Base64Tool"),
  jwt:        tool(() => import("./features/jwt-generator"),  "JwtGenerator"),
  hash:       tool(() => import("./features/hash"),           "HashTool"),
  regex:      tool(() => import("./features/regex"),          "RegexTool"),
  color:      tool(() => import("./features/color"),          "ColorTool"),
  palette:    tool(() => import("./features/color-palette"),  "ColorPalette"),
  time:       tool(() => import("./features/timestamp"),      "TimestampTool"),
  uuid:       tool(() => import("./features/uuid"),           "UuidTool"),
  string:     tool(() => import("./features/string-utils"),   "StringTool"),
  number:     tool(() => import("./features/number"),         "NumberTool"),
  ieee754:    tool(() => import("./features/ieee754"),        "Ieee754"),
  diff:       tool(() => import("./features/diff"),           "DiffTool"),
  markdown:   tool(() => import("./features/markdown"),       "MarkdownTool"),
  lorem:      tool(() => import("./features/lorem"),          "LoremTool"),
  commit:     tool(() => import("./features/commit"),         "CommitTool"),
  gitignore:  tool(() => import("./features/gitignore"),      "GitignoreTool"),
  password:   tool(() => import("./features/password"),       "PasswordTool"),
  totp:       tool(() => import("./features/totp"),           "TotpTool"),
  "http-req": tool(() => import("./features/http-builder"),   "HttpBuilder"),
  cron:       tool(() => import("./features/cron"),           "CronTool"),
  http:       tool(() => import("./features/http-status"),    "HttpStatusTool"),
  semver:     tool(() => import("./features/semver"),         "SemverTool"),
  sql:        tool(() => import("./features/sql"),            "SqlTool"),
  chmod:      tool(() => import("./features/chmod"),          "Chmod"),
  url:        tool(() => import("./features/url-parser"),     "UrlParser"),
  ip:         tool(() => import("./features/ip-cidr"),        "IpTool"),
  proto:      tool(() => import("./features/proto-gen"),      "ProtoGen"),
  qr:         tool(() => import("./features/qr-code"),        "QrTool"),
};

const IDS = Object.keys(TOOLS);

// One chunk at a time, so preloading never competes with what the user is doing.
function preloadTools() {
  IDS.reduce((prev, id) => prev.then(() => TOOLS[id].preload().catch(() => {})), Promise.resolve());
}

// ─── Hash route (#/jwt) as the single source of truth for the active tool ────

function subscribeHash(onChange) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

const readTab = () => toolFromHash(window.location.hash, IDS);

function isTyping(el) {
  if (!el) return false;
  return el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName);
}

function ToolLoading() {
  return (
    <div role="status" style={{
      display: "flex", alignItems: "center", gap: 10, padding: "6px 0",
      fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700,
      letterSpacing: "0.2em", color: T.dim,
    }}>
      <span className="tool-spinner" aria-hidden="true" />
      LOADING
    </div>
  );
}

export default function App() {
  const tab = useSyncExternalStore(subscribeHash, readTab);
  // Phones start with the icon rail so the tool gets the screen.
  const [collapsed,   setCollapsed]   = useState(
    () => window.matchMedia("(max-width: 760px)").matches
  );
  const [paletteOpen, setPaletteOpen] = useState(false);
  // Bumped to remount the tool after its saved inputs are cleared.
  const [resetKey,    setResetKey]    = useState(0);
  const ActiveTool = TOOLS[tab];

  // Selecting a tool pushes a history entry, so back/forward walk between tools.
  const setTab = useCallback((id) => {
    if (window.location.hash !== hashFor(id)) window.location.hash = hashFor(id);
  }, []);

  // Normalise empty/unknown hashes in place and keep the tab title in sync.
  useEffect(() => {
    if (window.location.hash !== hashFor(tab)) {
      history.replaceState(history.state, "", hashFor(tab));
    }
    const label = TABS.find(t => t.id === tab)?.label;
    document.title = label ? `${label} · DevKit` : "DevKit";
  }, [tab]);

  // Fetch the remaining tool chunks once the first screen is up.
  useEffect(() => {
    if (!("requestIdleCallback" in window)) {
      const timer = setTimeout(preloadTools, 1500);
      return () => clearTimeout(timer);
    }
    const handle = requestIdleCallback(preloadTools, { timeout: 4000 });
    return () => cancelIdleCallback(handle);
  }, []);

  // Ctrl/Cmd+K anywhere, or "/" when not typing, opens the palette.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(o => !o);
      } else if (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey && !isTyping(e.target)) {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const commands = [
    {
      id: "clear-inputs",
      label: "Clear saved inputs",
      hint: "Forget what every tool remembered",
      keywords: "reset forget storage persist",
      run: () => { clearInputs(); setResetKey(k => k + 1); },
    },
    {
      id: "toggle-sidebar",
      label: collapsed ? "Expand sidebar" : "Collapse sidebar",
      hint: "Sidebar",
      keywords: "sidebar menu rail",
      run: () => setCollapsed(c => !c),
    },
  ];

  return (
    <SnippetProvider>
      <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        <Sidebar tab={tab} setTab={setTab} collapsed={collapsed} setCollapsed={setCollapsed} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
          <TopBar tab={tab} setTab={setTab} onOpenPalette={() => setPaletteOpen(true)} />
          <main key={`${tab}:${resetKey}`} className="tool-page" style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
            <Suspense fallback={<ToolLoading />}>
              <ActiveTool />
            </Suspense>
          </main>
        </div>
      </div>
      {paletteOpen && (
        <CommandPalette
          onClose={() => setPaletteOpen(false)}
          onSelectTool={setTab}
          commands={commands}
        />
      )}
    </SnippetProvider>
  );
}
