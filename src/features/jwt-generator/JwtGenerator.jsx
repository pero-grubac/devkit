import { useState } from "react";
import { T } from "../../shared/theme";
import { Input, Row, Btn, Card, Label, CopyBtn } from "../../shared/ui";
import { signJwt, nowSec, expSec } from "./sign";

const ALGS    = ["HS256", "HS384", "HS512"];
const EXPIRES = [
  { label: "15 min",  hours: 0.25 },
  { label: "1 hour",  hours: 1    },
  { label: "24 hours",hours: 24   },
  { label: "7 days",  hours: 168  },
  { label: "30 days", hours: 720  },
  { label: "Never",   hours: null },
];

const DEFAULT_PAYLOAD = `{
  "sub": "user_123",
  "name": "John Doe",
  "role": "admin"
}`;

export function JwtGenerator() {
  const [mode,    setMode]    = useState("decode");
  const [token,   setToken]   = useState("");
  const [payload, setPayload] = useState(DEFAULT_PAYLOAD);
  const [secret,  setSecret]  = useState("your-secret-key");
  const [alg,     setAlg]     = useState("HS256");
  const [expires, setExpires] = useState(EXPIRES[1]);
  const [result,  setResult]  = useState("");
  const [error,   setError]   = useState(null);
  const [signing, setSigning] = useState(false);

  // ── Decode ────────────────────────────────────────────────────────────────
  function decode64(s) {
    try {
      s = s.replace(/-/g, "+").replace(/_/g, "/");
      while (s.length % 4) s += "=";
      return JSON.parse(atob(s));
    } catch { return null; }
  }

  const parts   = token.trim().split(".");
  const isValid = parts.length === 3;
  const header  = isValid ? decode64(parts[0]) : null;
  const dPayload = isValid ? decode64(parts[1]) : null;
  const sig     = isValid ? parts[2] : null;
  const now     = nowSec();
  const exp     = dPayload?.exp;
  const expired = exp && exp < now;

  const fmtTime = ts => ts ? new Date(ts * 1000).toISOString().replace("T"," ").slice(0,19)+" UTC" : "—";
  const fmtLeft = s  => {
    if (s < 0) return "EXPIRED";
    if (s < 60) return s + "s";
    if (s < 3600) return Math.floor(s/60) + "m";
    return Math.floor(s/3600) + "h " + Math.floor((s%3600)/60) + "m";
  };

  const syntaxHL = json => json.replace(
    /(\"(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*\"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    m => {
      let cls = "jn";
      if (/^"/.test(m)) cls = /:$/.test(m) ? "jk" : "js";
      else if (/true|false/.test(m)) cls = "jb";
      else if (/null/.test(m)) cls = "jnull";
      return `<span class="${cls}">${m}</span>`;
    }
  );

  const preStyle = { background: T.s2, border: `1px solid ${T.border}`, borderRadius: 6, padding: "12px 14px", fontFamily: "var(--mono)", fontSize: 12, lineHeight: 1.7, overflowX: "auto", whiteSpace: "pre-wrap", margin: 0 };

  // ── Sign ──────────────────────────────────────────────────────────────────
  const sign = async () => {
    setError(null); setSigning(true);
    try {
      let parsed;
      try { parsed = JSON.parse(payload); } catch { throw new Error("Payload is not valid JSON"); }
      if (!secret.trim()) throw new Error("Secret cannot be empty");

      const fullPayload = {
        ...parsed,
        iat: nowSec(),
        ...(expires.hours !== null ? { exp: expSec(expires.hours) } : {}),
      };
      const jwt = await signJwt(fullPayload, secret, alg);
      setResult(jwt);
    } catch (e) {
      setError(e.message);
      setResult("");
    } finally {
      setSigning(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Mode toggle */}
      <Row gap={6}>
        {[{id:"decode",label:"Decode"},{id:"sign",label:"Sign / Generate"}].map(m => (
          <Btn key={m.id} variant={mode === m.id ? "accent" : "default"} onClick={() => setMode(m.id)}>
            {m.label}
          </Btn>
        ))}
      </Row>

      {/* ── DECODE ── */}
      {mode === "decode" && (
        <>
          <div>
            <Label>JWT Token</Label>
            <textarea
              value={token}
              onChange={e => setToken(e.target.value)}
              rows={3}
              spellCheck={false}
              placeholder="Paste JWT token here..."
              style={{ width:"100%", background:T.s2, border:`1px solid ${T.border}`, borderRadius:6, color:T.text, fontFamily:"var(--mono)", fontSize:12, padding:"12px 14px", lineHeight:1.6, outline:"none", transition:"border-color 0.15s" }}
              onFocus={e=>(e.target.style.borderColor=T.border2)}
              onBlur={e=>(e.target.style.borderColor=T.border)}
            />
          </div>

          {token && !isValid && (
            <div style={{ background:T.red+"12", border:`1px solid ${T.red}44`, borderRadius:6, padding:"10px 14px", color:"#fca5a5", fontFamily:"var(--mono)", fontSize:12 }}>
              ✗ Invalid JWT — must have exactly 3 dot-separated parts
            </div>
          )}

          {isValid && (
            <>
              {/* Colour-coded token */}
              <Card>
                <div style={{ fontFamily:"var(--mono)", fontSize:11, wordBreak:"break-all", lineHeight:1.8 }}>
                  <span style={{ color:"#f59e0b" }}>{parts[0]}</span>
                  <span style={{ color:T.dim }}>.</span>
                  <span style={{ color:T.acc2 }}>{parts[1]}</span>
                  <span style={{ color:T.dim }}>.</span>
                  <span style={{ color:T.green }}>{parts[2]}</span>
                </div>
              </Card>

              {/* Status strip */}
              {exp && (
                <Card style={{ display:"flex", gap:24, flexWrap:"wrap" }}>
                  {[
                    { l:"STATUS",   v: expired ? "⚠ EXPIRED" : "✓ VALID",    c: expired ? T.red : T.green },
                    { l:"ISSUED",   v: fmtTime(dPayload?.iat),                 c: T.mid },
                    { l:"EXPIRES",  v: fmtTime(exp),                           c: expired ? T.red : T.mid },
                    { l:"TIME LEFT",v: fmtLeft(exp - now),                     c: expired ? T.red : T.orange },
                  ].map(({l,v,c}) => (
                    <div key={l}>
                      <div style={{ fontFamily:"var(--mono)", fontSize:8, letterSpacing:"0.2em", color:T.dim, marginBottom:4 }}>{l}</div>
                      <div style={{ fontFamily:"var(--mono)", fontSize:12, fontWeight:700, color:c }}>{v}</div>
                    </div>
                  ))}
                </Card>
              )}

              {/* Header + Payload */}
              <Row>
                {header && (
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                      <Label>Header</Label><CopyBtn text={JSON.stringify(header,null,2)} />
                    </div>
                    <pre style={preStyle} dangerouslySetInnerHTML={{ __html: syntaxHL(JSON.stringify(header,null,2)) }} />
                  </div>
                )}
                {dPayload && (
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                      <Label>Payload</Label><CopyBtn text={JSON.stringify(dPayload,null,2)} />
                    </div>
                    <pre style={preStyle} dangerouslySetInnerHTML={{ __html: syntaxHL(JSON.stringify(dPayload,null,2)) }} />
                  </div>
                )}
              </Row>

              <Card>
                <Label>Signature (not verified client-side)</Label>
                <div style={{ fontFamily:"var(--mono)", fontSize:11, color:T.green, wordBreak:"break-all", marginTop:4 }}>{sig}</div>
                <div style={{ fontFamily:"var(--mono)", fontSize:10, color:T.dim, marginTop:8 }}>
                  ⚠ Client-side decoders cannot verify signatures. Use a server-side library for verification.
                </div>
              </Card>
            </>
          )}
        </>
      )}

      {/* ── SIGN ── */}
      {mode === "sign" && (
        <>
          <Row>
            <div style={{ flex: 1 }}>
              <Label>Payload (JSON)</Label>
              <textarea
                value={payload}
                onChange={e => setPayload(e.target.value)}
                rows={8}
                spellCheck={false}
                style={{ width:"100%", background:T.s2, border:`1px solid ${T.border}`, borderRadius:6, color:T.text, fontFamily:"var(--mono)", fontSize:12, padding:"12px 14px", lineHeight:1.6, outline:"none", transition:"border-color 0.15s" }}
                onFocus={e=>(e.target.style.borderColor=T.border2)}
                onBlur={e=>(e.target.style.borderColor=T.border)}
              />
            </div>

            <div style={{ flex: 1, display:"flex", flexDirection:"column", gap:12 }}>
              <div>
                <Label>Secret Key</Label>
                <Input value={secret} onChange={setSecret} placeholder="your-secret-key" />
              </div>

              <div>
                <Label>Algorithm</Label>
                <Row gap={6}>
                  {ALGS.map(a => (
                    <Btn key={a} small variant={alg===a?"accent":"default"} onClick={() => setAlg(a)}>{a}</Btn>
                  ))}
                </Row>
              </div>

              <div>
                <Label>Expires</Label>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {EXPIRES.map(e => (
                    <Btn key={e.label} small variant={expires.label===e.label?"accent":"default"} onClick={() => setExpires(e)}>
                      {e.label}
                    </Btn>
                  ))}
                </div>
              </div>

              <Btn variant="accent" onClick={sign} disabled={signing}>
                {signing ? "Signing…" : "⚡ Generate JWT"}
              </Btn>
            </div>
          </Row>

          {error && (
            <div style={{ background:T.red+"12", border:`1px solid ${T.red}44`, borderRadius:6, padding:"10px 14px", color:"#fca5a5", fontFamily:"var(--mono)", fontSize:12 }}>
              ✗ {error}
            </div>
          )}

          {result && (
            <Card>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <Label>Generated JWT</Label>
                <CopyBtn text={result} />
              </div>
              <div style={{ fontFamily:"var(--mono)", fontSize:11, wordBreak:"break-all", lineHeight:1.8 }}>
                {result.split(".").map((part, i) => (
                  <span key={i}>
                    <span style={{ color: [T.orange, T.acc2, T.green][i] }}>{part}</span>
                    {i < 2 && <span style={{ color: T.dim }}>.</span>}
                  </span>
                ))}
              </div>
              <div style={{ fontFamily:"var(--mono)", fontSize:10, color:T.dim, marginTop:10 }}>
                iat and exp added automatically. Algorithm: {alg}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
