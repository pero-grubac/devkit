import { useState, useEffect, useRef } from "react";
import { T } from "../../shared/theme";
import { Row, Btn, Label, CopyBtn } from "../../shared/ui";

const SAMPLE = `# Hello, Markdown

**Bold**, *italic*, ~~strikethrough~~, and \`inline code\`.

## Lists

- Item one
- Item two
  - Nested item
  - Another nested

1. First
2. Second
3. Third

## Code Block

\`\`\`js
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

## Table

| Name    | Role       | Lang   |
|---------|------------|--------|
| Alice   | Backend    | Rust   |
| Bob     | Frontend   | TS     |
| Carol   | DevOps     | Python |

## Blockquote

> The best tool is the one you actually use.

[A link](https://example.com) and an image alt: ![alt text](https://via.placeholder.com/60)
`;

function loadMarked() {
  return new Promise((resolve) => {
    if (window.marked) { resolve(window.marked); return; }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/marked/9.1.6/marked.min.js";
    s.onload = () => resolve(window.marked);
    document.head.appendChild(s);
  });
}

export function MarkdownTool() {
  const [input,   setInput]   = useState(SAMPLE);
  const [html,    setHtml]    = useState("");
  const [split,   setSplit]   = useState(true);
  const [loading, setLoading] = useState(true);
  const markedRef = useRef(null);

  useEffect(() => {
    loadMarked().then(m => {
      markedRef.current = m;
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!markedRef.current) return;
    try { setHtml(markedRef.current.parse(input)); } catch(e) { setHtml("<p style='color:red'>Parse error</p>"); }
  }, [input, loading]);

  const previewStyles = `
    .md-preview { font-family: var(--sans); font-size: 14px; line-height: 1.75; color: ${T.text}; }
    .md-preview h1,.md-preview h2,.md-preview h3 { color: #fff; font-weight: 700; margin: 1.2em 0 0.4em; border-bottom: 1px solid ${T.border}; padding-bottom: 0.2em; }
    .md-preview h1 { font-size: 1.6em; } .md-preview h2 { font-size: 1.3em; } .md-preview h3 { font-size: 1.1em; }
    .md-preview p { margin: 0.6em 0; }
    .md-preview a { color: ${T.acc}; text-decoration: none; }
    .md-preview a:hover { text-decoration: underline; }
    .md-preview code { background: ${T.s3}; border: 1px solid ${T.border}; border-radius: 3px; padding: 1px 5px; font-family: var(--mono); font-size: 0.88em; color: ${T.green}; }
    .md-preview pre { background: ${T.s2}; border: 1px solid ${T.border}; border-radius: 6px; padding: 12px 14px; overflow-x: auto; margin: 0.8em 0; }
    .md-preview pre code { background: none; border: none; padding: 0; font-size: 0.85em; color: ${T.mid}; }
    .md-preview blockquote { border-left: 3px solid ${T.acc}; margin: 0.8em 0; padding: 0.3em 0 0.3em 1em; color: ${T.mid}; }
    .md-preview ul,.md-preview ol { padding-left: 1.6em; margin: 0.5em 0; }
    .md-preview li { margin: 0.2em 0; }
    .md-preview table { border-collapse: collapse; width: 100%; margin: 0.8em 0; }
    .md-preview th { background: ${T.s3}; color: ${T.text}; font-weight: 700; }
    .md-preview th,.md-preview td { border: 1px solid ${T.border}; padding: 7px 12px; font-size: 13px; }
    .md-preview tr:nth-child(even) td { background: ${T.s2}; }
    .md-preview img { max-width: 100%; border-radius: 4px; }
    .md-preview strong { color: #fff; }
    .md-preview hr { border: none; border-top: 1px solid ${T.border}; margin: 1em 0; }
    .md-preview del { color: ${T.dim}; }
  `;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <style>{previewStyles}</style>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <Btn small variant={split ? "accent" : "default"} onClick={() => setSplit(true)}>Split</Btn>
        <Btn small variant={!split ? "accent" : "default"} onClick={() => setSplit(false)}>Preview only</Btn>
        <div style={{ flex: 1 }} />
        <CopyBtn text={input} />
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        {split && (
          <div style={{ flex: 1 }}>
            <Label>Markdown</Label>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              spellCheck={false}
              rows={24}
              style={{
                width: "100%", background: T.s2, border: `1px solid ${T.border}`,
                borderRadius: 6, color: T.text, fontFamily: "var(--mono)", fontSize: 12,
                padding: "12px 14px", lineHeight: 1.6, resize: "vertical", outline: "none",
              }}
              onFocus={e => e.target.style.borderColor = T.border2}
              onBlur={e  => e.target.style.borderColor = T.border}
            />
          </div>
        )}

        <div style={{ flex: 1 }}>
          <Label>Preview</Label>
          <div
            className="md-preview"
            style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 6, padding: "16px 20px", minHeight: 200, overflow: "auto" }}
            dangerouslySetInnerHTML={{ __html: loading ? "<p style='color:#4e5170;font-style:italic'>Loading marked.js…</p>" : html }}
          />
        </div>
      </div>
    </div>
  );
}
