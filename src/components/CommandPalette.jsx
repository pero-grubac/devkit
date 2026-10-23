import { useState, useEffect, useRef } from "react";
import { T } from "../shared/theme";
import { TABS } from "../shared/registry";
import { rankItems, TOOL_FIELDS } from "../shared/fuzzy";
import { useSnippets } from "../shared/useSnippets";

const SNIPPET_FIELDS = [
  { key: "title",     weight: 2 },
  { key: "toolLabel", weight: 1 },
  { key: s => s.content.slice(0, 200), weight: 0.5 },
];

const COMMAND_FIELDS = [
  { key: "label",    weight: 2 },
  { key: "keywords", weight: 1 },
];

const kbd = {
  fontFamily: "var(--mono)", fontSize: 9, color: T.mid,
  background: T.s3, border: `1px solid ${T.border2}`,
  borderRadius: 4, padding: "1px 5px",
};

// Ctrl+K palette: jump to a tool, reopen a snippet's tool, or run a command.
export function CommandPalette({ onClose, onSelectTool, commands }) {
  const { snippets } = useSnippets();
  const [query,  setQuery]  = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);

  // Remember what had focus so closing hands it back.
  useEffect(() => {
    const prev = document.activeElement;
    inputRef.current?.focus();
    return () => { if (prev?.isConnected) prev.focus(); };
  }, []);

  const sections = [
    {
      label: "Tools",
      items: rankItems(query, TABS, TOOL_FIELDS).map(t => ({
        key: "tool-" + t.id, icon: t.icon, title: t.label, sub: t.sub,
        run: () => onSelectTool(t.id),
      })),
    },
    {
      label: "Snippets",
      items: rankItems(query, snippets, SNIPPET_FIELDS).slice(0, query ? 8 : 5).map(s => ({
        key: "snippet-" + s.id,
        icon: TABS.find(t => t.id === s.toolId)?.icon ?? "★",
        title: s.title, sub: `${s.toolLabel} snippet`,
        run: () => onSelectTool(s.toolId),
      })),
    },
    {
      label: "Commands",
      items: rankItems(query, commands, COMMAND_FIELDS).map(c => ({
        key: "cmd-" + c.id, icon: "›", title: c.label, sub: c.hint,
        run: c.run,
      })),
    },
  ].filter(s => s.items.length > 0);

  // Index of each section's first item in the flat, keyboard-navigable list.
  let offset = 0;
  for (const s of sections) { s.start = offset; offset += s.items.length; }

  const flat    = sections.flatMap(s => s.items);
  const current = Math.min(active, flat.length - 1);
  const activeId = current >= 0 ? `palette-${flat[current].key}` : undefined;

  useEffect(() => {
    if (activeId) document.getElementById(activeId)?.scrollIntoView({ block: "nearest" });
  }, [activeId]);

  const choose = (item) => {
    onClose();
    item.run();
  };

  const onKeyDown = (e) => {
    const n = flat.length;
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "Tab") {
      // Focus trap: the search box is the only focusable element.
      e.preventDefault();
      inputRef.current?.focus();
    } else if (e.key === "ArrowDown" && n) {
      e.preventDefault();
      setActive((current + 1) % n);
    } else if (e.key === "ArrowUp" && n) {
      e.preventDefault();
      setActive((current - 1 + n) % n);
    } else if (e.key === "Home" && n && e.ctrlKey) {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End" && n && e.ctrlKey) {
      e.preventDefault();
      setActive(n - 1);
    } else if (e.key === "Enter" && current >= 0) {
      e.preventDefault();
      choose(flat[current]);
    }
  };

  return (
    <div
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(5, 5, 10, 0.62)", backdropFilter: "blur(2px)",
        display: "flex", justifyContent: "center", alignItems: "flex-start",
        padding: "12vh 16px 16px",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onKeyDown={onKeyDown}
        className="palette"
        style={{
          width: "100%", maxWidth: 560, maxHeight: "70vh",
          display: "flex", flexDirection: "column",
          background: T.s1, border: `1px solid ${T.border2}`, borderRadius: 10,
          boxShadow: "0 18px 50px rgba(0, 0, 0, 0.55)", overflow: "hidden",
        }}
      >
        {/* Search box */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderBottom: `1px solid ${T.border}` }}>
          <span aria-hidden="true" style={{ color: T.acc, fontSize: 15 }}>⌕</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setActive(0); }}
            placeholder="Search tools, snippets, commands…"
            spellCheck={false}
            autoComplete="off"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-autocomplete="list"
            aria-activedescendant={activeId}
            aria-label="Search tools, snippets and commands"
            style={{
              flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none",
              color: T.text, fontFamily: "var(--sans)", fontSize: 15,
            }}
          />
          <kbd style={kbd}>esc</kbd>
        </div>

        {/* Results */}
        <div id="palette-list" role="listbox" aria-label="Results" style={{ overflowY: "auto", padding: "6px 6px 8px" }}>
          {flat.length === 0 && (
            <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: T.dim, textAlign: "center", padding: "22px 0", fontStyle: "italic" }}>
              No matches
            </div>
          )}

          {sections.map(section => (
            <div key={section.label} role="group" aria-label={section.label}>
              <div aria-hidden="true" className="group-label" style={{ border: "none", margin: 0, padding: "10px 10px 5px" }}>
                {section.label}
              </div>
              {section.items.map((item, j) => {
                const i  = section.start + j;
                const on = i === current;
                return (
                  <div
                    key={item.key}
                    id={`palette-${item.key}`}
                    role="option"
                    aria-selected={on}
                    onMouseMove={() => { if (!on) setActive(i); }}
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => choose(item)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "8px 10px", borderRadius: 6, cursor: "pointer",
                      background: on ? T.acc + "1c" : "transparent",
                      borderLeft: `2px solid ${on ? T.acc : "transparent"}`,
                    }}
                  >
                    <span aria-hidden="true" style={{
                      width: 30, flexShrink: 0, textAlign: "center",
                      fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700,
                      color: on ? T.acc : T.mid,
                    }}>
                      {item.icon}
                    </span>
                    <span style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "baseline", gap: 8, overflow: "hidden" }}>
                      <span style={{ fontFamily: "var(--sans)", fontSize: 13, fontWeight: on ? 600 : 500, color: on ? T.text : T.mid, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.title}
                      </span>
                      {item.sub && (
                        <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: T.dim, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {item.sub}
                        </span>
                      )}
                    </span>
                    {on && <span aria-hidden="true" style={{ fontFamily: "var(--mono)", fontSize: 11, color: T.acc }}>↵</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Key hints */}
        <div aria-hidden="true" className="palette-hints" style={{
          display: "flex", gap: 14, padding: "8px 14px", borderTop: `1px solid ${T.border}`,
          fontFamily: "var(--mono)", fontSize: 9, color: T.dim,
        }}>
          <span><kbd style={kbd}>↑</kbd> <kbd style={kbd}>↓</kbd> navigate</span>
          <span><kbd style={kbd}>↵</kbd> open</span>
          <span><kbd style={kbd}>esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
