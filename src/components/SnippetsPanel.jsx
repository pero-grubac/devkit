import { useState } from "react";
import { T } from "../shared/theme";
import { useSnippets } from "../shared/SnippetContext";
import { TABS } from "../shared/registry";

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60)    return "just now";
  if (s < 3600)  return Math.floor(s / 60) + "m ago";
  if (s < 86400) return Math.floor(s / 3600) + "h ago";
  return Math.floor(s / 86400) + "d ago";
}

export function SnippetsPanel({ setTab, collapsed }) {
  const { snippets, remove, rename, clear } = useSnippets();

  const [open,      setOpen]      = useState(false);
  const [search,    setSearch]    = useState("");
  const [copied,    setCopied]    = useState(null);
  const [editId,    setEditId]    = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const filtered = search
    ? snippets.filter(s =>
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.toolLabel.toLowerCase().includes(search.toLowerCase())
      )
    : snippets;

  const copy = (s) => {
    navigator.clipboard.writeText(s.content);
    setCopied(s.id);
    setTimeout(() => setCopied(null), 1500);
  };

  const startRename = (s) => { setEditId(s.id); setEditTitle(s.title); };
  const commitRename = () => {
    if (editId && editTitle.trim()) rename(editId, editTitle.trim());
    setEditId(null);
  };

  // ── Collapsed state: just a star icon with a badge ────────────────────────
  if (collapsed) {
    return (
      <button
        onClick={() => setOpen(o => !o)}
        title={`Snippets (${snippets.length})`}
        style={{
          width: "100%", padding: "8px 0",
          background: "transparent", border: "none",
          borderTop: `1px solid ${T.border}`,
          cursor: "pointer", color: T.dim,
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative",
        }}
      >
        <span style={{ fontSize: 13 }}>★</span>
        {snippets.length > 0 && (
          <span style={{
            position: "absolute", top: 3, right: 4,
            background: T.acc, color: "#fff",
            fontFamily: "var(--mono)", fontSize: 8, fontWeight: 700,
            borderRadius: 8, padding: "1px 4px",
          }}>
            {snippets.length > 9 ? "9+" : snippets.length}
          </span>
        )}
      </button>
    );
  }

  // ── Expanded sidebar panel ─────────────────────────────────────────────────
  return (
    <div style={{ borderTop: `1px solid ${T.border}`, flexShrink: 0 }}>

      {/* Toggle header */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", padding: "9px 13px",
          background: "transparent", border: "none",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          color: open ? T.acc : T.dim,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ fontSize: 12 }}>★</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em" }}>
            SNIPPETS
          </span>
          {snippets.length > 0 && (
            <span style={{
              background: T.acc + "22", color: T.acc,
              fontFamily: "var(--mono)", fontSize: 9, fontWeight: 700,
              borderRadius: 10, padding: "1px 6px",
            }}>
              {snippets.length}
            </span>
          )}
        </div>
        <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: T.dim }}>
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open && (
        <div style={{ maxHeight: 340, display: "flex", flexDirection: "column" }}>

          {/* Search + clear all */}
          <div style={{ padding: "0 8px 6px", display: "flex", gap: 5 }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search…"
              style={{
                flex: 1, background: T.s2, border: `1px solid ${T.border}`,
                borderRadius: 4, color: T.text,
                fontFamily: "var(--mono)", fontSize: 10,
                padding: "4px 8px", outline: "none",
              }}
            />
            {snippets.length > 0 && (
              <button
                onClick={() => { if (window.confirm("Delete all snippets?")) clear(); }}
                title="Clear all"
                style={{ background: "transparent", border: "none", cursor: "pointer", color: T.dim, fontSize: 12, padding: "0 4px" }}
              >
                ✕
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: "auto", padding: "0 8px 8px" }}>

            {filtered.length === 0 && (
              <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: T.dim, textAlign: "center", padding: "14px 0", fontStyle: "italic" }}>
                {snippets.length === 0 ? "No snippets yet.\nClick Save on any output." : "No matches"}
              </div>
            )}

            {filtered.map(s => {
              const tab = TABS.find(t => t.id === s.toolId);
              return (
                <div key={s.id} style={{
                  background: T.s2, border: `1px solid ${T.border}`,
                  borderRadius: 6, padding: "8px 10px", marginBottom: 5,
                }}>

                  {/* Title — double-click to rename */}
                  {editId === s.id ? (
                    <input
                      autoFocus
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      onBlur={commitRename}
                      onKeyDown={e => {
                        if (e.key === "Enter")  commitRename();
                        if (e.key === "Escape") setEditId(null);
                      }}
                      style={{
                        width: "100%", background: T.s3,
                        border: `1px solid ${T.acc}55`, borderRadius: 4,
                        color: T.text, fontFamily: "var(--mono)", fontSize: 11,
                        padding: "3px 6px", outline: "none", marginBottom: 4,
                      }}
                    />
                  ) : (
                    <div
                      onDoubleClick={() => startRename(s)}
                      title="Double-click to rename"
                      style={{
                        fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700,
                        color: T.text, marginBottom: 3,
                        cursor: "text", wordBreak: "break-all",
                      }}
                    >
                      {s.title}
                    </div>
                  )}

                  {/* Tool badge + time */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                    <span style={{
                      fontFamily: "var(--mono)", fontSize: 9, color: T.acc,
                      background: T.acc + "18", borderRadius: 3, padding: "1px 5px",
                    }}>
                      {tab?.icon} {s.toolLabel}
                    </span>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: T.dim }}>
                      {timeAgo(s.createdAt)}
                    </span>
                  </div>

                  {/* Content preview */}
                  <div style={{
                    fontFamily: "var(--mono)", fontSize: 9, color: T.dim,
                    lineHeight: 1.5, marginBottom: 7,
                    wordBreak: "break-all", overflow: "hidden",
                    maxHeight: 32, whiteSpace: "pre",
                  }}>
                    {s.content.slice(0, 80)}{s.content.length > 80 ? "…" : ""}
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 4 }}>
                    <button
                      onClick={() => copy(s)}
                      style={{
                        flex: 1,
                        background: copied === s.id ? T.green + "18" : T.s3,
                        border: `1px solid ${copied === s.id ? T.green + "44" : T.border}`,
                        color: copied === s.id ? T.green : T.mid,
                        borderRadius: 4, fontFamily: "var(--mono)",
                        fontSize: 9, fontWeight: 700, padding: "3px 0", cursor: "pointer",
                      }}
                    >
                      {copied === s.id ? "✓" : "Copy"}
                    </button>

                    <button
                      onClick={() => setTab(s.toolId)}
                      title={`Go to ${s.toolLabel}`}
                      style={{
                        flex: 1, background: T.s3, border: `1px solid ${T.border}`,
                        color: T.mid, borderRadius: 4,
                        fontFamily: "var(--mono)", fontSize: 9, fontWeight: 700,
                        padding: "3px 0", cursor: "pointer",
                      }}
                    >
                      Open
                    </button>

                    <button
                      onClick={() => remove(s.id)}
                      style={{
                        background: T.s3, border: `1px solid ${T.border}`,
                        color: T.dim, borderRadius: 4,
                        fontFamily: "var(--mono)", fontSize: 9,
                        padding: "3px 7px", cursor: "pointer",
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
