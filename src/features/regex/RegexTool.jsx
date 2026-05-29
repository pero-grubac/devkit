import { useState } from "react";
import { T } from "../../shared/theme";
import { Textarea, Input, Btn, Row, Label, ResultBox } from "../../shared/ui";

const PRESETS = [
  { name: "Email", pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}", flags: "g" },
  { name: "URL",   pattern: "https?:\\/\\/[^\\s]+", flags: "g" },
  { name: "IPv4",  pattern: "\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b", flags: "g" },
  { name: "Date",  pattern: "\\d{4}-\\d{2}-\\d{2}", flags: "g" },
  { name: "Hex",   pattern: "#[0-9a-fA-F]{3,6}\\b", flags: "g" },
  { name: "UUID",  pattern: "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}", flags: "gi" },
];

function highlight(str, re) {
  if (!re || !str) return [str];
  const parts = [];
  let last = 0;
  const gre = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
  let m;
  try {
    while ((m = gre.exec(str)) !== null) {
      if (m.index > last) parts.push(<span key={last}>{str.slice(last, m.index)}</span>);
      parts.push(<mark key={m.index} style={{ background: T.acc + "33", color: T.acc, borderRadius: 2, padding: "0 1px" }}>{m[0]}</mark>);
      last = m.index + m[0].length;
      if (m[0].length === 0) break;
    }
  } catch {}
  parts.push(<span key={last}>{str.slice(last)}</span>);
  return parts;
}

export function RegexTool() {
  const [pattern, setPattern]       = useState("");
  const [flags, setFlags]           = useState("g");
  const [test, setTest]             = useState("Contact us at hello@example.com or visit https://example.com\nIP: 192.168.1.1, Date: 2024-05-21");
  const [replace, setReplace]       = useState("");
  const [showReplace, setShowReplace] = useState(false);

  let re = null, err = null, matches = [], replaced = "";
  try {
    if (pattern) {
      re = new RegExp(pattern, flags.includes("g") ? flags : flags + "g");
      matches = [...test.matchAll(re)];
      if (showReplace) replaced = test.replace(re, replace);
    }
  } catch (e) { err = e.message; }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <Label>Quick Presets</Label>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {PRESETS.map((p) => (
            <Btn key={p.name} small onClick={() => { setPattern(p.pattern); setFlags(p.flags); }}>{p.name}</Btn>
          ))}
        </div>
      </div>

      <div>
        <Label>Pattern</Label>
        <div style={{ display: "flex", alignItems: "center", gap: 0, background: T.s2, border: `1px solid ${err ? T.red + "55" : T.border}`, borderRadius: 6, overflow: "hidden" }}>
          <span style={{ padding: "9px 12px", fontFamily: "var(--mono)", fontSize: 16, color: T.acc, fontWeight: 700, flexShrink: 0 }}>/</span>
          <input
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="[a-z]+"
            spellCheck={false}
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontFamily: "var(--mono)", fontSize: 13, color: T.text, padding: "9px 4px" }}
          />
          <span style={{ padding: "9px 6px", fontFamily: "var(--mono)", fontSize: 16, color: T.acc, fontWeight: 700 }}>/</span>
          <input
            value={flags}
            onChange={(e) => setFlags(e.target.value.replace(/[^gimsuy]/g, "").slice(0, 6))}
            placeholder="gi"
            spellCheck={false}
            style={{ width: 52, background: T.s3, border: "none", borderLeft: `1px solid ${T.border}`, outline: "none", fontFamily: "var(--mono)", fontSize: 13, color: T.orange, padding: "9px 10px", textAlign: "center" }}
          />
        </div>
        {err && <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: T.red, marginTop: 5 }}>✗ {err}</div>}
      </div>

      {pattern && !err && (
        <div style={{ display: "flex", gap: 8 }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700, padding: "3px 10px", background: T.acc + "18", border: `1px solid ${T.acc}44`, color: T.acc, borderRadius: 3 }}>
            {matches.length} match{matches.length !== 1 ? "es" : ""}
          </span>
          {matches.length > 0 && (
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700, padding: "3px 10px", background: T.s3, border: `1px solid ${T.border2}`, color: T.mid, borderRadius: 3 }}>
              {matches[0].length - 1} capture group{matches[0].length - 1 !== 1 ? "s" : ""}
            </span>
          )}
          <Btn small onClick={() => setShowReplace(!showReplace)}>{showReplace ? "HIDE REPLACE" : "REPLACE"}</Btn>
        </div>
      )}

      {showReplace && (
        <div>
          <Label>Replace With</Label>
          <Input value={replace} onChange={setReplace} placeholder="Replacement string... ($1 for groups)" />
          {replaced && <ResultBox label="Result" value={replaced} />}
        </div>
      )}

      <div>
        <Label>Test String</Label>
        <Textarea value={test} onChange={setTest} rows={4} />
        {re && matches.length > 0 && (
          <div style={{ marginTop: 8, background: T.s2, border: `1px solid ${T.border}`, borderRadius: 6, padding: "12px 14px", fontFamily: "var(--mono)", fontSize: 13, lineHeight: 1.8, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
            {highlight(test, re)}
          </div>
        )}
      </div>

      {matches.length > 0 && (
        <div>
          <Label>Matches</Label>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {matches.slice(0, 20).map((m, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", background: T.s2, border: `1px solid ${T.border}`, borderRadius: 5, padding: "7px 12px", fontFamily: "var(--mono)", fontSize: 11, flexWrap: "wrap" }}>
                <span style={{ color: T.dim, minWidth: 24 }}>#{i}</span>
                <span style={{ color: T.acc, flex: 1 }}>"{m[0]}"</span>
                <span style={{ color: T.dim }}>@ {m.index}</span>
                {m.length > 1 && m.slice(1).map((g, j) => (
                  <span key={j} style={{ color: T.orange, background: T.orange + "18", padding: "1px 6px", borderRadius: 3 }}>
                    g{j + 1}: {g ?? "∅"}
                  </span>
                ))}
              </div>
            ))}
            {matches.length > 20 && (
              <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: T.dim, textAlign: "center" }}>+{matches.length - 20} more matches</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
