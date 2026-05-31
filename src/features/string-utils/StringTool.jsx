import { useState } from "react";
import { T } from "../../shared/theme";
import { Textarea, Card, Label, CopyBtn } from "../../shared/ui";

// ─── Case converters ─────────────────────────────────────────────────────────
function toSlug(s)     { return s.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-").replace(/^-+|-+$/g, ""); }
function toCamel(s)    { return s.replace(/[-_\s]+(.)/g, (_, c) => c.toUpperCase()).replace(/^(.)/, c => c.toLowerCase()); }
function toSnake(s)    { return s.replace(/([A-Z])/g, "_$1").replace(/[-\s]+/g, "_").toLowerCase().replace(/^_/, ""); }
function toKebab(s)    { return s.replace(/([A-Z])/g, "-$1").replace(/[_\s]+/g, "-").toLowerCase().replace(/^-/, ""); }
function toPascal(s)   { return s.replace(/[-_\s]+(.)/g, (_, c) => c.toUpperCase()).replace(/^(.)/, c => c.toUpperCase()); }
function toConstant(s) { return toSnake(s).toUpperCase(); }
function toTitle(s)    { return s.replace(/\w\S*/g, t => t[0].toUpperCase() + t.slice(1).toLowerCase()); }

// ─── New case converters ──────────────────────────────────────────────────────
function toSentence(s) {
  return s.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, c => c.toUpperCase());
}
function toStudly(s) {
  // LaRaVeL style — alternate upper/lower on each letter (not space-based)
  let upper = true;
  return s.split("").map(c => {
    if (/\s/.test(c)) return c;
    const out = upper ? c.toUpperCase() : c.toLowerCase();
    upper = !upper;
    return out;
  }).join("");
}
function toDot(s)  { return toSnake(s).replace(/_/g, "."); }
function toPath(s) { return toKebab(s).replace(/-/g, "/"); }

const SUBS = [
  { id: "case",  label: "Cases"             },
  { id: "stats", label: "Statistics"        },
  { id: "clean", label: "Clean / Transform" },
];

const SUB_TAB_STYLE = active => ({
  fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em",
  padding: "5px 14px",
  border: `1px solid ${active ? T.acc + "66" : T.border}`,
  background: active ? T.acc + "18" : "transparent",
  color: active ? T.acc : T.dim,
  borderRadius: 4, cursor: "pointer",
});

function ResultCard({ label, value }) {
  return (
    <div style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 6, padding: "10px 14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", color: T.dim }}>{label}</div>
        <CopyBtn text={value} />
      </div>
      <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: T.mid, wordBreak: "break-all", lineHeight: 1.5 }}>
        {value.slice(0, 80)}{value.length > 80 ? "…" : ""}
      </div>
    </div>
  );
}

export function StringTool() {
  const [input, setInput] = useState("Hello World, this is a sample string for testing all the string utilities.");
  const [sub,   setSub]   = useState("case");

  const words     = input.trim().split(/\s+/).filter(Boolean);
  const chars     = input.length;
  const lines     = input.split("\n").length;
  const sentences = input.split(/[.!?]+/).filter(s => s.trim()).length;
  const unique    = new Set(words.map(w => w.toLowerCase())).size;
  const charFreq  = [...input.toLowerCase()].reduce((acc, c) => { if (/[a-z]/.test(c)) acc[c] = (acc[c] || 0) + 1; return acc; }, {});
  const topChars  = Object.entries(charFreq).sort((a, b) => b[1] - a[1]).slice(0, 10);

  const cases = [
    { label: "slug-case",      fn: toSlug     },
    { label: "camelCase",      fn: toCamel    },
    { label: "snake_case",     fn: toSnake    },
    { label: "kebab-case",     fn: toKebab    },
    { label: "PascalCase",     fn: toPascal   },
    { label: "CONSTANT_CASE",  fn: toConstant },
    { label: "Title Case",     fn: toTitle    },
    { label: "Sentence case",  fn: toSentence },
    { label: "StUdLy CaSe",    fn: toStudly   },
    { label: "dot.case",       fn: toDot      },
    { label: "path/case",      fn: toPath     },
    { label: "lowercase",      fn: s => s.toLowerCase() },
    { label: "UPPERCASE",      fn: s => s.toUpperCase() },
  ];

  const cleanFns = [
    { label: "Clean whitespace",       fn: s => s.replace(/\s+/g, " ").trim()                         },
    { label: "Remove line breaks",     fn: s => s.replace(/[\r\n]+/g, " ").trim()                     },
    { label: "Reverse string",         fn: s => [...s].reverse().join("")                              },
    { label: "Reverse words",          fn: s => s.split(/\s+/).reverse().join(" ")                    },
    { label: "Remove duplicate lines", fn: s => [...new Set(s.split("\n"))].join("\n")                 },
    { label: "Sort lines A→Z",         fn: s => s.split("\n").sort().join("\n")                        },
    { label: "Sort lines Z→A",         fn: s => s.split("\n").sort().reverse().join("\n")              },
    { label: "Extract numbers",        fn: s => s.match(/-?\d+\.?\d*/g)?.join(", ") || "none"         },
    { label: "Extract emails",         fn: s => s.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g)?.join(", ") || "none" },
    { label: "Extract URLs",           fn: s => s.match(/https?:\/\/[^\s]+/g)?.join(", ") || "none"   },
    { label: "Count words",            fn: s => String(s.trim().split(/\s+/).filter(Boolean).length)   },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <Label>Input</Label>
        <Textarea value={input} onChange={setInput} rows={4} />
      </div>

      <div style={{ display: "flex", gap: 6, borderBottom: `1px solid ${T.border}`, paddingBottom: 10 }}>
        {SUBS.map(s => (
          <button key={s.id} onClick={() => setSub(s.id)} style={SUB_TAB_STYLE(sub === s.id)}>{s.label}</button>
        ))}
      </div>

      {sub === "case" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 8 }}>
          {cases.map(({ label, fn }) => <ResultCard key={label} label={label} value={fn(input)} />)}
        </div>
      )}

      {sub === "stats" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8 }}>
            {[
              ["CHARS",       chars],
              ["WORDS",       words.length],
              ["LINES",       lines],
              ["SENTENCES",   sentences],
              ["UNIQUE WORDS",unique],
              ["AVG WORD LEN",words.length ? (input.replace(/\s/g, "").length / words.length).toFixed(1) : 0],
            ].map(([l, v]) => (
              <Card key={l} style={{ padding: "12px 14px" }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 8, letterSpacing: "0.25em", color: T.dim, marginBottom: 4 }}>{l}</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 22, fontWeight: 700, color: T.acc }}>{v}</div>
              </Card>
            ))}
          </div>
          <Card>
            <Label>Top Characters</Label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {topChars.map(([c, n]) => (
                <div key={c} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 4, padding: "6px 10px", textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 16, color: T.text }}>{c}</div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: T.dim }}>{n}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {sub === "clean" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 8 }}>
          {cleanFns.map(({ label, fn }) => {
            const out = String(fn(input));
            return (
              <div key={label} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 6, padding: "10px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.15em", color: T.dim }}>{label}</div>
                  <CopyBtn text={out} />
                </div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: T.mid, wordBreak: "break-all", lineHeight: 1.5 }}>
                  {out.slice(0, 100)}{out.length > 100 ? "…" : ""}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
