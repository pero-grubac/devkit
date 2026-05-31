import { useState, useEffect } from "react";
import { T } from "../../shared/theme";
import { Input, Row, Btn, Card, Label, CopyBtn } from "../../shared/ui";
import { parseUrl, buildUrl, encodeParam, decodeParam } from "./url";

const DEMO = "https://api.example.com:8080/v2/users?page=1&limit=20&sort=created_at&order=desc#results";

const MODES = [
  { id: "parse",   label: "Parse URL"    },
  { id: "build",   label: "Build URL"    },
  { id: "encode",  label: "Encode/Decode"},
];

// ─── Parse mode ──────────────────────────────────────────────────────────────
function ParseMode() {
  const [input, setInput] = useState(DEMO);
  const parsed = parseUrl(input);

  const Field = ({ label, value, accent }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: `1px solid ${T.border}` }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.18em", color: T.dim, textTransform: "uppercase", width: 80, flexShrink: 0 }}>{label}</div>
      <div style={{ flex: 1, fontFamily: "var(--mono)", fontSize: 12, color: accent ? T.acc : T.text, wordBreak: "break-all" }}>
        {value || <span style={{ color: T.dim, fontStyle: "italic" }}>—</span>}
      </div>
      {value && <CopyBtn text={value} />}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <Label>URL</Label>
          <Btn small onClick={() => setInput(DEMO)}>Demo</Btn>
        </div>
        <Input value={input} onChange={setInput} placeholder="https://example.com/path?key=value" />
      </div>

      {input && !parsed.ok && (
        <div style={{ background: T.red+"12", border: `1px solid ${T.red}44`, borderRadius: 6, padding: "10px 14px", color: "#fca5a5", fontFamily: "var(--mono)", fontSize: 12 }}>
          ✗ Invalid URL — must include protocol (https://)
        </div>
      )}

      {parsed.ok && (
        <Row>
          <Card style={{ flex: 1 }}>
            <Field label="Protocol" value={parsed.protocol} accent />
            <Field label="Host"     value={parsed.host}     accent />
            <Field label="Port"     value={parsed.port} />
            <Field label="Path"     value={parsed.path} />
            <Field label="Hash"     value={parsed.hash} />
            <Field label="Origin"   value={parsed.origin} />
          </Card>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            <Label>Query Parameters ({parsed.params.length})</Label>
            {parsed.params.length === 0
              ? <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: T.dim, fontStyle: "italic", padding: "10px 0" }}>No query parameters</div>
              : parsed.params.map(({ key, value }, i) => (
                <div key={i} style={{ display: "flex", gap: 8, background: T.s2, border: `1px solid ${T.border}`, borderRadius: 6, padding: "8px 12px", alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: T.acc, minWidth: 100 }}>{key}</span>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: T.dim }}>→</span>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: T.text, flex: 1, wordBreak: "break-all" }}>{value}</span>
                  <CopyBtn text={value} />
                </div>
              ))
            }
          </div>
        </Row>
      )}
    </div>
  );
}

// ─── Build mode ──────────────────────────────────────────────────────────────
function BuildMode() {
  const [protocol, setProtocol] = useState("https");
  const [host,     setHost]     = useState("api.example.com");
  const [port,     setPort]     = useState("");
  const [path,     setPath]     = useState("/v1/users");
  const [params,   setParams]   = useState([{ key: "page", value: "1" }, { key: "limit", value: "20" }]);
  const [hash,     setHash]     = useState("");
  const [output,   setOutput]   = useState("");

  useEffect(() => {
    setOutput(buildUrl({ protocol, host, port, path, params, hash }));
  }, [protocol, host, port, path, params, hash]);

  const addParam  = () => setParams(p => [...p, { key: "", value: "" }]);
  const delParam  = i  => setParams(p => p.filter((_, j) => j !== i));
  const setParam  = (i, field, val) => setParams(p => p.map((x, j) => j === i ? { ...x, [field]: val } : x));

  const inputStyle = { background: T.s2, border: `1px solid ${T.border}`, borderRadius: 5, color: T.text, fontFamily: "var(--mono)", fontSize: 12, padding: "6px 10px", outline: "none", transition: "border-color 0.15s" };
  const focus = e => (e.target.style.borderColor = T.border2);
  const blur  = e => (e.target.style.borderColor = T.border);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Row gap={8}>
        <div>
          <Label>Protocol</Label>
          <select value={protocol} onChange={e => setProtocol(e.target.value)}
            style={{ ...inputStyle, width: 100 }}>
            {["https", "http", "ftp", "ws", "wss"].map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <Label>Host</Label>
          <input value={host} onChange={e => setHost(e.target.value)} placeholder="example.com" style={{ ...inputStyle, width: "100%" }} onFocus={focus} onBlur={blur} />
        </div>
        <div style={{ width: 80 }}>
          <Label>Port</Label>
          <input value={port} onChange={e => setPort(e.target.value)} placeholder="8080" style={{ ...inputStyle, width: "100%" }} onFocus={focus} onBlur={blur} />
        </div>
        <div style={{ flex: 1 }}>
          <Label>Path</Label>
          <input value={path} onChange={e => setPath(e.target.value)} placeholder="/api/v1" style={{ ...inputStyle, width: "100%" }} onFocus={focus} onBlur={blur} />
        </div>
        <div style={{ width: 120 }}>
          <Label>Hash</Label>
          <input value={hash} onChange={e => setHash(e.target.value)} placeholder="section" style={{ ...inputStyle, width: "100%" }} onFocus={focus} onBlur={blur} />
        </div>
      </Row>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <Label>Query Parameters</Label>
          <Btn small onClick={addParam}>+ Add</Btn>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {params.map((p, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input value={p.key}   onChange={e => setParam(i, "key",   e.target.value)} placeholder="key"   style={{ ...inputStyle, flex: 1 }} onFocus={focus} onBlur={blur} />
              <span style={{ color: T.dim, fontFamily: "var(--mono)", fontSize: 12 }}>=</span>
              <input value={p.value} onChange={e => setParam(i, "value", e.target.value)} placeholder="value" style={{ ...inputStyle, flex: 2 }} onFocus={focus} onBlur={blur} />
              <Btn small variant="red" onClick={() => delParam(i)}>✕</Btn>
            </div>
          ))}
        </div>
      </div>

      {output && (
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <Label>Result URL</Label>
            <CopyBtn text={output} />
          </div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: T.acc, wordBreak: "break-all", lineHeight: 1.7 }}>
            {output}
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Encode/Decode mode ───────────────────────────────────────────────────────
function EncodeMode() {
  const [input,  setInput]  = useState("hello world & foo=bar+baz");
  const encoded = encodeParam(input);
  const decoded = decodeParam(input);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <Label>Input</Label>
        <Input value={input} onChange={setInput} placeholder="Text to encode or decode..." />
      </div>
      <Row>
        <Card style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <Label>Encoded</Label>
            <CopyBtn text={encoded} />
          </div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: T.green, wordBreak: "break-all", lineHeight: 1.7 }}>
            {encoded || <span style={{ color: T.dim }}>—</span>}
          </div>
        </Card>
        <Card style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <Label>Decoded</Label>
            <CopyBtn text={decoded} />
          </div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: T.acc, wordBreak: "break-all", lineHeight: 1.7 }}>
            {decoded || <span style={{ color: T.dim }}>—</span>}
          </div>
        </Card>
      </Row>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function UrlParser() {
  const [mode, setMode] = useState("parse");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Row gap={6}>
        {MODES.map(m => (
          <Btn key={m.id} variant={mode === m.id ? "accent" : "default"} onClick={() => setMode(m.id)}>
            {m.label}
          </Btn>
        ))}
      </Row>

      {mode === "parse"  && <ParseMode  />}
      {mode === "build"  && <BuildMode  />}
      {mode === "encode" && <EncodeMode />}
    </div>
  );
}
