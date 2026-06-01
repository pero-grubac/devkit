// Drop next to any CopyBtn to make that output saveable.
// <SaveBtn content={output} toolId="json" toolLabel="JSON" />

import { useState } from "react";
import { T } from "./theme";
import { useSnippets } from "./SnippetContext";

export function SaveBtn({ content, toolId, toolLabel, defaultTitle = "" }) {
  const { add }  = useSnippets();
  const [open,   setOpen]   = useState(false);
  const [title,  setTitle]  = useState(defaultTitle);
  const [saved,  setSaved]  = useState(false);

  if (!content) return null;

  const commit = () => {
    if (!content.trim()) return;
    add({ title: title.trim() || toolLabel, content, toolId, toolLabel });
    setSaved(true);
    setOpen(false);
    setTitle(defaultTitle);
    setTimeout(() => setSaved(false), 2000);
  };

  const base = {
    borderRadius: 5,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.1em",
    padding: "4px 10px",
    cursor: "pointer",
    whiteSpace: "nowrap",
    fontFamily: "var(--mono)",
    border: "none",
    transition: "filter 0.15s",
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        style={{
          ...base,
          background: saved ? T.green + "18" : T.s3,
          border: `1px solid ${saved ? T.green + "55" : T.border2}`,
          color: saved ? T.green : T.mid,
        }}
        onClick={() => { if (!saved) setOpen(o => !o); }}
        onMouseEnter={e => (e.currentTarget.style.filter = "brightness(1.3)")}
        onMouseLeave={e => (e.currentTarget.style.filter = "none")}
      >
        {saved ? "✓ Saved" : "Save"}
      </button>

      {open && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 99 }}
            onClick={() => setOpen(false)}
          />
          <div style={{
            position: "absolute", right: 0, top: "calc(100% + 6px)", zIndex: 100,
            background: T.s1, border: `1px solid ${T.border2}`,
            borderRadius: 8, padding: 12, width: 240,
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
          }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", color: T.dim, marginBottom: 6 }}>
              SAVE SNIPPET
            </div>

            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter")  commit();
                if (e.key === "Escape") setOpen(false);
              }}
              placeholder={`${toolLabel} snippet`}
              style={{
                width: "100%", background: T.s2, border: `1px solid ${T.border}`,
                borderRadius: 5, color: T.text, fontFamily: "var(--mono)",
                fontSize: 12, padding: "7px 10px", outline: "none", marginBottom: 8,
              }}
              onFocus={e => (e.target.style.borderColor = T.border2)}
              onBlur={e  => (e.target.style.borderColor = T.border)}
            />

            <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: T.dim, marginBottom: 8, lineHeight: 1.5, wordBreak: "break-all" }}>
              {content.length > 60 ? content.slice(0, 60) + "…" : content}
            </div>

            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={commit}
                style={{ ...base, flex: 1, background: T.acc + "22", border: `1px solid ${T.acc}66`, color: T.acc }}
              >
                Save
              </button>
              <button
                onClick={() => setOpen(false)}
                style={{ ...base, flex: 1, background: T.s3, border: `1px solid ${T.border2}`, color: T.mid }}
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
