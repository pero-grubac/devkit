import { useState, useEffect } from "react";
import { T } from "../../shared/theme";
import { Textarea, Row, Btn, Card, Label, CopyBtn, ErrorBox, OutputBox } from "../../shared/ui";
import { syntaxHL, parseJson, jsonStats } from "./format";

export function JsonFormatter() {
  const [input,  setInput]  = useState('{\n  "name": "devkit",\n  "version": "1.0.0",\n  "active": true\n}');
  const [indent, setIndent] = useState(2);
  const [result, setResult] = useState({ ok: false, parsed: null, error: null });

  useEffect(() => {
    setResult(parseJson(input));
  }, [input]);

  const formatted = result.parsed != null ? JSON.stringify(result.parsed, null, indent) : "";
  const minified  = result.parsed != null ? JSON.stringify(result.parsed) : "";
  const stats     = result.parsed != null ? jsonStats(result.parsed) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Row>
        <div style={{ flex: 1 }}>
          <Label>Input JSON</Label>
          <Textarea value={input} onChange={setInput} rows={14} />
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Label>Formatted</Label>
            <Row gap={6}>
              {[2, 4].map(n => (
                <Btn key={n} small variant={indent === n ? "accent" : "default"} onClick={() => setIndent(n)}>
                  {n}sp
                </Btn>
              ))}
              {formatted && <CopyBtn text={formatted} />}
            </Row>
          </div>

          {result.error
            ? <ErrorBox message={result.error} />
            : <OutputBox maxHeight={360}>
                {formatted
                  ? <span dangerouslySetInnerHTML={{ __html: syntaxHL(formatted) }} />
                  : <span style={{ color: T.dim, fontStyle: "italic" }}>Output appears here...</span>
                }
              </OutputBox>
          }
        </div>
      </Row>

      {result.parsed != null && (
        <Row gap={10}>
          <Card style={{ flex: 1 }}>
            <Label>Minified</Label>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <div style={{ flex: 1, fontFamily: "var(--mono)", fontSize: 11, color: T.mid, wordBreak: "break-all", lineHeight: 1.5 }}>
                {minified.slice(0, 200)}{minified.length > 200 ? "…" : ""}
              </div>
              <CopyBtn text={minified} />
            </div>
          </Card>

          {stats && (
            <Card style={{ display: "flex", gap: 24 }}>
              {[["KEYS", stats.keys], ["DEPTH", stats.depth], ["CHARS", formatted.length], ["SAVED", `${((1 - minified.length / formatted.length) * 100).toFixed(0)}%`]].map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 8, letterSpacing: "0.25em", color: T.dim, marginBottom: 4 }}>{l}</div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 20, fontWeight: 700, color: T.acc }}>{v}</div>
                </div>
              ))}
            </Card>
          )}
        </Row>
      )}
    </div>
  );
}
