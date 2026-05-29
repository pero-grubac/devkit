import { useState } from "react";
import { T } from "../../shared/theme";
import { Textarea, Btn, Row, Label, CopyBtn } from "../../shared/ui";

function computeDiff(a, b) {
  const aL = a.split("\n"), bL = b.split("\n");
  const m = aL.length, n = bL.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = aL[i - 1] === bL[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
  const ops = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && aL[i - 1] === bL[j - 1]) { ops.unshift({ type: "eq",  val: aL[i - 1], lineA: i, lineB: j }); i--; j--; }
    else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) { ops.unshift({ type: "add", val: bL[j - 1], lineB: j }); j--; }
    else { ops.unshift({ type: "del", val: aL[i - 1], lineA: i }); i--; }
  }
  return ops;
}

function charDiff(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
  const ops = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) { ops.unshift({ t: "eq",  c: a[i - 1] }); i--; j--; }
    else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) { ops.unshift({ t: "add", c: b[j - 1] }); j--; }
    else { ops.unshift({ t: "del", c: a[i - 1] }); i--; }
  }
  return ops;
}

const lineStyle    = { display: "flex", alignItems: "baseline", fontFamily: "var(--mono)", fontSize: 12, lineHeight: 1.7 };
const lnStyle      = { minWidth: 36, padding: "1px 8px", fontSize: 10, color: T.dim, textAlign: "right", flexShrink: 0, background: "rgba(255,255,255,0.02)", borderRight: `1px solid ${T.border}`, userSelect: "none" };
const gutStyle     = { minWidth: 20, padding: "1px 4px", textAlign: "center", flexShrink: 0, fontWeight: 700 };
const contentStyle = { padding: "1px 8px 1px 4px", whiteSpace: "pre-wrap", wordBreak: "break-all", flex: 1 };

function renderCD(a, b, side) {
  return charDiff(a, b).map((op, idx) => {
    if (op.t === "eq") return <span key={idx}>{op.c}</span>;
    if (op.t === "del" && side === "del") return <span key={idx} style={{ background: "#f5555533", color: "#ff8080", textDecoration: "line-through", borderRadius: 2 }}>{op.c}</span>;
    if (op.t === "add" && side === "add") return <span key={idx} style={{ background: "#3dd68c25", color: T.green, fontWeight: 600, borderRadius: 2 }}>{op.c}</span>;
    return null;
  });
}

export function DiffTool() {
  const [left,     setLeft]     = useState("");
  const [right,    setRight]    = useState("");
  const [ignoreWS, setIgnoreWS] = useState(false);

  const norm = (s) => ignoreWS ? s.split("\n").map((l) => l.trim()).join("\n") : s;
  const ops  = left || right ? computeDiff(norm(left), norm(right)) : [];
  const added   = ops.filter((o) => o.type === "add").length;
  const deleted = ops.filter((o) => o.type === "del").length;

  function buildRows() {
    const rows = []; let i = 0;
    while (i < ops.length) {
      if (ops[i].type === "del" && i + 1 < ops.length && ops[i + 1].type === "add") {
        rows.push({ type: "change", del: ops[i].val, add: ops[i + 1].val, lineA: ops[i].lineA, lineB: ops[i + 1].lineB }); i += 2;
      } else if (ops[i].type === "del") { rows.push({ type: "del-only", val: ops[i].val, lineA: ops[i].lineA }); i++;
      } else if (ops[i].type === "add") { rows.push({ type: "add-only", val: ops[i].val, lineB: ops[i].lineB }); i++;
      } else { rows.push(ops[i]); i++; }
    }
    return rows;
  }

  const rows = buildRows();

  function renderRow(row, side, idx) {
    if (row.type === "eq")
      return <div key={idx} style={{ ...lineStyle, color: T.dim }}><span style={lnStyle}>{side === "left" ? row.lineA : row.lineB}</span><span style={{ ...gutStyle, color: T.dim }}> </span><span style={contentStyle}>{row.val}</span></div>;
    if (side === "left" && row.type === "del-only")
      return <div key={idx} style={{ ...lineStyle, background: T.red + "12", borderLeft: `2px solid ${T.red}55` }}><span style={lnStyle}>{row.lineA}</span><span style={{ ...gutStyle, color: T.red }}>−</span><span style={{ ...contentStyle, color: "#fca5a5" }}>{row.val || "↵"}</span></div>;
    if (side === "right" && row.type === "add-only")
      return <div key={idx} style={{ ...lineStyle, background: T.green + "10", borderLeft: `2px solid ${T.green}55` }}><span style={lnStyle}>{row.lineB}</span><span style={{ ...gutStyle, color: T.green }}>+</span><span style={{ ...contentStyle, color: "#86efac" }}>{row.val || "↵"}</span></div>;
    if ((side === "left" && row.type === "add-only") || (side === "right" && row.type === "del-only"))
      return <div key={idx} style={{ ...lineStyle, background: "rgba(255,255,255,0.02)", minHeight: 22 }}><span style={lnStyle} /><span style={gutStyle} /><span style={contentStyle} /></div>;
    if (row.type === "change") {
      if (side === "left") return <div key={idx} style={{ ...lineStyle, background: T.red + "10", borderLeft: `2px solid ${T.orange}55` }}><span style={lnStyle}>{row.lineA}</span><span style={{ ...gutStyle, color: T.orange }}>~</span><span style={{ ...contentStyle, color: "#fca5a5" }}>{renderCD(row.del, row.add, "del")}</span></div>;
      return <div key={idx} style={{ ...lineStyle, background: T.green + "08", borderLeft: `2px solid ${T.orange}55` }}><span style={lnStyle}>{row.lineB}</span><span style={{ ...gutStyle, color: T.orange }}>~</span><span style={{ ...contentStyle, color: "#86efac" }}>{renderCD(row.del, row.add, "add")}</span></div>;
    }
    return null;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Row>
        {added > 0 && <span style={{ fontFamily: "var(--mono)", fontSize: 10, padding: "3px 10px", background: T.green + "15", border: `1px solid ${T.green}44`, color: T.green, borderRadius: 3 }}>+{added} added</span>}
        {deleted > 0 && <span style={{ fontFamily: "var(--mono)", fontSize: 10, padding: "3px 10px", background: T.red + "15", border: `1px solid ${T.red}44`, color: T.red, borderRadius: 3 }}>−{deleted} removed</span>}
        <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontFamily: "var(--mono)", fontSize: 10, color: T.dim, marginLeft: "auto" }}>
          <input type="checkbox" checked={ignoreWS} onChange={(e) => setIgnoreWS(e.target.checked)} />
          Ignore leading/trailing whitespace
        </label>
        {(left || right) && (
          <Btn small onClick={() => { const t = left; setLeft(right); setRight(t); }}>⇄ SWAP</Btn>
        )}
      </Row>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><Label>Original A</Label>{left && <CopyBtn text={left} />}</div>
          <Textarea value={left} onChange={setLeft} rows={6} placeholder={"Paste original text here...\n\nfunction hello() {\n  return 'world';\n}"} />
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><Label>Modified B</Label>{right && <CopyBtn text={right} />}</div>
          <Textarea value={right} onChange={setRight} rows={6} placeholder={"Paste modified text here...\n\nfunction hello(name) {\n  return `Hello, ${name}!`;\n}"} />
        </div>
      </div>

      {rows.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {["left", "right"].map((side) => (
            <div key={side}>
              <Label>Diff — {side === "left" ? "A" : "B"}</Label>
              <div style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 6, overflow: "auto", maxHeight: 400 }}>
                {rows.map((row, idx) => renderRow(row, side, idx))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
