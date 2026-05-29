import { useState } from "react";
import { T } from "../../shared/theme";
import { Textarea, Btn, Row, Card, Label, CopyBtn } from "../../shared/ui";

const DEMO = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzEyMyIsIm5hbWUiOiJQZXJvIEdydWJhYyIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTcxNjAwMDAwMCwiZXhwIjoxNzE2MDg2NDAwfQ.placeholder_signature";

function syntaxHL(json) {
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (m) => {
      let cls = "jn";
      if (/^"/.test(m)) cls = /:$/.test(m) ? "jk" : "js";
      else if (/true|false/.test(m)) cls = "jb";
      else if (/null/.test(m)) cls = "jnull";
      return `<span class="${cls}">${m}</span>`;
    },
  );
}

function decode64(s) {
  try {
    s = s.replace(/-/g, "+").replace(/_/g, "/");
    while (s.length % 4) s += "=";
    return JSON.parse(atob(s));
  } catch { return null; }
}

function fmtTime(ts) {
  if (!ts) return "—";
  return new Date(ts * 1000).toISOString().replace("T", " ").slice(0, 19) + " UTC";
}
function fmtDuration(secs) {
  if (secs < 0) return "EXPIRED";
  if (secs < 60) return secs + "s";
  if (secs < 3600) return Math.floor(secs / 60) + "m " + (secs % 60) + "s";
  return Math.floor(secs / 3600) + "h " + Math.floor((secs % 3600) / 60) + "m";
}

export function JwtTool() {
  const [token, setToken] = useState("");

  const parts   = token.trim().split(".");
  const isValid = parts.length === 3;
  const header  = isValid ? decode64(parts[0]) : null;
  const payload = isValid ? decode64(parts[1]) : null;
  const sig     = isValid ? parts[2] : null;

  const now     = Math.floor(Date.now() / 1000);
  const exp     = payload?.exp;
  const iat     = payload?.iat;
  const expired = exp && exp < now;
  const timeLeft = exp ? exp - now : null;

  const preStyle = { background: T.s2, border: `1px solid ${T.border}`, borderRadius: 6, padding: "12px 14px", fontFamily: "var(--mono)", fontSize: 12, lineHeight: 1.7, overflowX: "auto", whiteSpace: "pre-wrap" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <Label>JWT Token</Label>
          <Btn small variant="default" onClick={() => setToken(DEMO)}>LOAD DEMO</Btn>
        </div>
        <Textarea value={token} onChange={setToken} rows={3} placeholder="Paste your JWT token here..." />
      </div>

      {token && !isValid && (
        <div style={{ background: T.red + "12", border: `1px solid ${T.red}44`, borderRadius: 6, padding: "10px 14px", color: "#fca5a5", fontFamily: "var(--mono)", fontSize: 12 }}>
          ✗ Invalid JWT — must have exactly 3 parts separated by dots
        </div>
      )}

      {isValid && (
        <>
          <Card>
            <div style={{ fontFamily: "var(--mono)", fontSize: 11, wordBreak: "break-all", lineHeight: 1.8 }}>
              <span style={{ color: "#f59e0b" }}>{parts[0]}</span>
              <span style={{ color: T.dim }}>.</span>
              <span style={{ color: T.acc2 }}>{parts[1]}</span>
              <span style={{ color: T.dim }}>.</span>
              <span style={{ color: T.green }}>{parts[2].slice(0, 20)}…</span>
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
              {[["HEADER", "#f59e0b"], ["PAYLOAD", T.acc2], ["SIGNATURE", T.green]].map(([l, c]) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
                  <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: T.dim, letterSpacing: "0.2em" }}>{l}</span>
                </div>
              ))}
            </div>
          </Card>

          {exp && (
            <Card style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              {[
                { l: "STATUS",    v: expired ? "⚠ EXPIRED" : "✓ VALID", c: expired ? T.red : T.green },
                { l: "ISSUED",    v: fmtTime(iat),   c: T.mid },
                { l: "EXPIRES",   v: fmtTime(exp),   c: expired ? T.red : T.mid },
                ...(timeLeft !== null ? [{ l: "TIME LEFT", v: fmtDuration(timeLeft), c: expired ? T.red : T.orange }] : []),
              ].map(({ l, v, c }) => (
                <div key={l}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 8, letterSpacing: "0.2em", color: T.dim, marginBottom: 4 }}>{l}</div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: l === "STATUS" || l === "TIME LEFT" ? 13 : 11, fontWeight: l === "STATUS" || l === "TIME LEFT" ? 700 : 400, color: c }}>{v}</div>
                </div>
              ))}
            </Card>
          )}

          <Row>
            {header && (
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <Label>Header</Label><CopyBtn text={JSON.stringify(header, null, 2)} />
                </div>
                <pre style={preStyle} dangerouslySetInnerHTML={{ __html: syntaxHL(JSON.stringify(header, null, 2)) }} />
              </div>
            )}
            {payload && (
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <Label>Payload</Label><CopyBtn text={JSON.stringify(payload, null, 2)} />
                </div>
                <pre style={preStyle} dangerouslySetInnerHTML={{ __html: syntaxHL(JSON.stringify(payload, null, 2)) }} />
              </div>
            )}
          </Row>

          <Card>
            <Label>Signature (not verified)</Label>
            <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: T.green, wordBreak: "break-all" }}>{sig}</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: T.dim, marginTop: 8 }}>
              ⚠ Client-side JWT decoders cannot verify signatures. Use a server-side library for verification.
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
