import { useState, useEffect } from "react";
import { T } from "../../shared/theme";
import { Row, Btn, Label, CopyBtn } from "../../shared/ui";
import { SaveBtn } from "../../shared/SaveBtn";

// Lightweight SQL formatter — no deps
const KEYWORDS = new Set([
  "SELECT","FROM","WHERE","JOIN","LEFT","RIGHT","INNER","OUTER","FULL","CROSS",
  "ON","AND","OR","NOT","IN","IS","NULL","AS","DISTINCT","GROUP","BY","ORDER",
  "HAVING","LIMIT","OFFSET","UNION","ALL","INSERT","INTO","VALUES","UPDATE",
  "SET","DELETE","CREATE","TABLE","INDEX","VIEW","DROP","ALTER","ADD","COLUMN",
  "PRIMARY","KEY","FOREIGN","REFERENCES","UNIQUE","DEFAULT","CONSTRAINT",
  "IF","EXISTS","WITH","CASE","WHEN","THEN","ELSE","END","BETWEEN","LIKE",
  "ASC","DESC","INNER","OUTER","CROSS","NATURAL","USING",
]);

function tokenize(sql) {
  const tokens = [];
  let i = 0;
  while (i < sql.length) {
    // whitespace
    if (/\s/.test(sql[i])) { i++; continue; }
    // line comment
    if (sql[i] === "-" && sql[i+1] === "-") {
      let j = i; while (j < sql.length && sql[j] !== "\n") j++;
      tokens.push({ type: "comment", val: sql.slice(i, j) }); i = j; continue;
    }
    // block comment
    if (sql[i] === "/" && sql[i+1] === "*") {
      let j = i + 2; while (j < sql.length - 1 && !(sql[j] === "*" && sql[j+1] === "/")) j++;
      tokens.push({ type: "comment", val: sql.slice(i, j + 2) }); i = j + 2; continue;
    }
    // string
    if (sql[i] === "'" || sql[i] === '"' || sql[i] === "`") {
      const q = sql[i]; let j = i + 1;
      while (j < sql.length && (sql[j] !== q || sql[j-1] === "\\")) j++;
      tokens.push({ type: "string", val: sql.slice(i, j + 1) }); i = j + 1; continue;
    }
    // number
    if (/\d/.test(sql[i]) || (sql[i] === "-" && /\d/.test(sql[i+1]))) {
      let j = i + 1; while (j < sql.length && /[\d.]/.test(sql[j])) j++;
      tokens.push({ type: "number", val: sql.slice(i, j) }); i = j; continue;
    }
    // word / keyword
    if (/[a-zA-Z_]/.test(sql[i])) {
      let j = i; while (j < sql.length && /[\w.]/.test(sql[j])) j++;
      const word = sql.slice(i, j);
      tokens.push({ type: KEYWORDS.has(word.toUpperCase()) ? "keyword" : "ident", val: word }); i = j; continue;
    }
    // punctuation
    if (sql[i] === "(") { tokens.push({ type: "lparen", val: "(" }); i++; continue; }
    if (sql[i] === ")") { tokens.push({ type: "rparen", val: ")" }); i++; continue; }
    if (sql[i] === ",") { tokens.push({ type: "comma",  val: "," }); i++; continue; }
    if (sql[i] === ";") { tokens.push({ type: "semi",   val: ";" }); i++; continue; }
    tokens.push({ type: "other", val: sql[i] }); i++;
  }
  return tokens;
}

// Newline-before these keywords at top level
const NEWLINE_BEFORE = new Set(["SELECT","FROM","WHERE","JOIN","LEFT","RIGHT","INNER","OUTER","FULL",
  "CROSS","GROUP","ORDER","HAVING","LIMIT","OFFSET","UNION","ON","SET","VALUES","RETURNING"]);
const NEWLINE_AFTER_AND_OR = true;

function format(sql, indent = 2) {
  const tokens = tokenize(sql);
  let out = "";
  let depth = 0;
  const pad = () => " ".repeat(depth * indent);

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    const up = t.val.toUpperCase();

    if (t.type === "keyword" && NEWLINE_BEFORE.has(up) && out.trim().length > 0) {
      out += "\n" + pad() + t.val.toUpperCase();
      out += " ";
      continue;
    }
    if (t.type === "keyword" && (up === "AND" || up === "OR")) {
      out += "\n" + pad() + "  " + t.val.toUpperCase() + " ";
      continue;
    }
    if (t.type === "keyword") { out += t.val.toUpperCase() + " "; continue; }
    if (t.type === "lparen") {
      out = out.trimEnd();
      out += "("; depth++; continue;
    }
    if (t.type === "rparen") {
      depth = Math.max(0, depth - 1);
      out = out.trimEnd() + ")";
      const next = tokens[i+1];
      if (next && next.type !== "comma" && next.type !== "rparen" && next.type !== "semi") out += " ";
      continue;
    }
    if (t.type === "comma") { out = out.trimEnd() + ",\n" + pad() + "  "; continue; }
    if (t.type === "semi")  { out = out.trimEnd() + ";\n"; continue; }
    out += t.val + " ";
  }
  return out.trim();
}

function highlight(sql) {
  return sql.replace(
    /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|-?\d+(?:\.\d*)?|\b(?:SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|FULL|CROSS|ON|AND|OR|NOT|IN|IS|NULL|AS|DISTINCT|GROUP|BY|ORDER|HAVING|LIMIT|OFFSET|UNION|ALL|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|DROP|ALTER|ADD|WITH|CASE|WHEN|THEN|ELSE|END|BETWEEN|LIKE|ASC|DESC)\b)/gi,
    (m) => {
      if (/^["'`]/.test(m)) return `<span style="color:${T.green}">${m}</span>`;
      if (/^-?\d/.test(m))  return `<span style="color:#f59e0b">${m}</span>`;
      return `<span style="color:${T.acc};font-weight:600">${m.toUpperCase()}</span>`;
    }
  );
}

const SAMPLE = `SELECT u.id, u.name, u.email, COUNT(o.id) AS order_count, SUM(o.total) AS total_spent FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.created_at > '2024-01-01' AND u.active = 1 GROUP BY u.id, u.name, u.email HAVING COUNT(o.id) > 0 ORDER BY total_spent DESC LIMIT 50;`;

export function SqlTool() {
  const [input,  setInput]  = useState(SAMPLE);
  const [indent, setIndent] = useState(2);
  const [output, setOutput] = useState("");

  useEffect(() => {
    if (!input.trim()) { setOutput(""); return; }
    try { setOutput(format(input, indent)); } catch(e) { setOutput(""); }
  }, [input, indent]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Row>
        <div style={{ flex: 1 }}>
          <Label>Input SQL</Label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            rows={6}
            spellCheck={false}
            placeholder="Paste SQL here…"
            style={{ width: "100%", background: T.s2, border: `1px solid ${T.border}`, borderRadius: 6, color: T.text, fontFamily: "var(--mono)", fontSize: 12, padding: "12px 14px", lineHeight: 1.6, resize: "vertical", outline: "none" }}
            onFocus={e => e.target.style.borderColor = T.border2}
            onBlur={e  => e.target.style.borderColor = T.border}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <Label>Formatted</Label>
            <div style={{ display: "flex", gap: 6 }}>
              {[2, 4].map(n => (
                <Btn key={n} small variant={indent === n ? "accent" : "default"} onClick={() => setIndent(n)}>{n}sp</Btn>
              ))}
              {output && <><CopyBtn text={output} /><SaveBtn content={output} toolId="sql" toolLabel="SQL" /></>}
            </div>
          </div>
          <pre
            style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 6, padding: "12px 14px", fontFamily: "var(--mono)", fontSize: 12, lineHeight: 1.7, overflow: "auto", maxHeight: 380, whiteSpace: "pre-wrap", wordBreak: "break-word", color: T.mid, margin: 0 }}
            dangerouslySetInnerHTML={{ __html: output ? highlight(output) : '<span style="color:#4e5170;font-style:italic">Formatted SQL appears here…</span>' }}
          />
        </div>
      </Row>
    </div>
  );
}
