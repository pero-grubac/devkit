import { useState } from "react";
import { T } from "../../shared/theme";
import { Textarea, Input, Btn, Row, Card, Label, CopyBtn } from "../../shared/ui";

const COMMIT_TYPES = [
  { type: "feat",     emoji: "✨", desc: "New feature" },
  { type: "fix",      emoji: "🐛", desc: "Bug fix" },
  { type: "refactor", emoji: "♻️", desc: "Code restructure" },
  { type: "docs",     emoji: "📝", desc: "Documentation" },
  { type: "style",    emoji: "💅", desc: "Formatting" },
  { type: "test",     emoji: "🧪", desc: "Tests" },
  { type: "chore",    emoji: "🔧", desc: "Build / deps" },
  { type: "perf",     emoji: "⚡", desc: "Performance" },
  { type: "ci",       emoji: "👷", desc: "CI/CD" },
  { type: "revert",   emoji: "⏪", desc: "Revert" },
];

export function CommitTool() {
  const [type,    setType]    = useState("");
  const [scope,   setScope]   = useState("");
  const [breaking,setBreaking]= useState(false);
  const [desc,    setDesc]    = useState("");
  const [body,    setBody]    = useState("");
  const [footer,  setFooter]  = useState("");

  const commit  = type ? `${type}${scope ? `(${scope})` : ""}${breaking ? "!" : ""}: ${desc}${body ? "\n\n" + body : ""}${footer ? "\n\n" + footer : ""}` : "";
  const descLen = desc.trim().length;
  const valid   = type && descLen >= 3 && descLen <= 72;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <Label>Commit Type</Label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 6 }}>
          {COMMIT_TYPES.map((t) => (
            <button
              key={t.type}
              onClick={() => setType(t.type)}
              style={{
                background: type === t.type ? T.acc + "18" : T.s2,
                border: `1px solid ${type === t.type ? T.acc + "66" : T.border}`,
                borderRadius: 6, padding: "10px", cursor: "pointer", textAlign: "left",
                display: "flex", flexDirection: "column", gap: 3, transition: "all .15s",
              }}
            >
              <span style={{ fontSize: 16 }}>{t.emoji}</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700, color: type === t.type ? T.acc : T.text }}>{t.type}</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: T.dim }}>{t.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <Row>
        <div style={{ flex: 1 }}>
          <Label>Scope <span style={{ color: T.dim, fontWeight: 400 }}>optional</span></Label>
          <Input value={scope} onChange={(v) => setScope(v.toLowerCase().replace(/\s/g, "-"))} placeholder="auth, api, db..." />
        </div>
        <div>
          <Label>Breaking</Label>
          <Btn variant={breaking ? "red" : "default"} onClick={() => setBreaking(!breaking)}>
            {breaking ? "⚠ YES" : "NO"}
          </Btn>
        </div>
      </Row>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <Label>Subject <span style={{ color: T.dim, fontWeight: 400 }}>imperative, no capital, no period</span></Label>
          <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: descLen > 72 ? T.red : descLen > 50 ? T.orange : T.green }}>{descLen}/72</span>
        </div>
        <Input value={desc} onChange={setDesc} placeholder="add user authentication endpoint" />
      </div>

      <div>
        <Label>Body <span style={{ color: T.dim, fontWeight: 400 }}>optional — explain WHY</span></Label>
        <Textarea value={body} onChange={setBody} rows={3} placeholder="Previously auth was on the frontend, moving to backend improves security." />
      </div>

      <div>
        <Label>Footer <span style={{ color: T.dim, fontWeight: 400 }}>BREAKING CHANGE / closes #123</span></Label>
        <Input value={footer} onChange={setFooter} placeholder="Closes #42" />
      </div>

      {commit && (
        <Card style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Label>Commit Message</Label>
            <div style={{ display: "flex", gap: 6 }}>
              {valid
                ? <span style={{ fontFamily: "var(--mono)", fontSize: 9, padding: "3px 8px", background: T.green + "18", border: `1px solid ${T.green}44`, color: T.green, borderRadius: 3 }}>✓ VALID</span>
                : <span style={{ fontFamily: "var(--mono)", fontSize: 9, padding: "3px 8px", background: T.red + "18", border: `1px solid ${T.red}44`, color: T.red, borderRadius: 3 }}>TOO SHORT</span>
              }
              <CopyBtn text={commit} />
            </div>
          </div>
          <pre style={{ fontFamily: "var(--mono)", fontSize: 13, color: T.acc, whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.7, background: T.s3, padding: "12px", borderRadius: 5 }}>
            {commit}
          </pre>
          <div style={{ display: "flex", gap: 6, background: "#000", padding: "10px 14px", borderRadius: 5, flexWrap: "wrap", fontFamily: "var(--mono)", fontSize: 12 }}>
            <span style={{ color: T.green }}>$</span>
            <span style={{ color: T.acc2 }}>git commit -m </span>
            <span style={{ color: T.orange, wordBreak: "break-all" }}>"{commit.split("\n")[0]}"</span>
          </div>
        </Card>
      )}
    </div>
  );
}
