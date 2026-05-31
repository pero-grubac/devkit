import { useState } from "react";
import { T } from "../../shared/theme";
import { Input, Row, Btn, Card, Label, CopyBtn } from "../../shared/ui";
import { buildCurl, buildFetch, buildAxios } from "./codegen";

const METHODS   = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];
const BODY_TYPES = ["none", "json", "form", "text"];
const OUTPUT_TABS = ["curl", "fetch", "axios"];

const METHOD_COLORS = {
  GET: T.green, POST: "#60a5fa", PUT: T.orange,
  PATCH: T.yellow, DELETE: T.red, HEAD: T.mid, OPTIONS: T.mid,
};

const PRESETS = [
  {
    label: "GET users",
    data: { method: "GET", url: "https://jsonplaceholder.typicode.com/users", headers: [{ key: "Accept", value: "application/json" }], body: "", bodyType: "none" },
  },
  {
    label: "POST JSON",
    data: { method: "POST", url: "https://api.example.com/users", headers: [{ key: "Authorization", value: "Bearer <token>" }, { key: "Accept", value: "application/json" }], body: '{\n  "name": "John Doe",\n  "email": "john@example.com"\n}', bodyType: "json" },
  },
  {
    label: "PUT update",
    data: { method: "PUT", url: "https://api.example.com/users/123", headers: [{ key: "Authorization", value: "Bearer <token>" }], body: '{\n  "name": "Jane Doe"\n}', bodyType: "json" },
  },
  {
    label: "DELETE",
    data: { method: "DELETE", url: "https://api.example.com/users/123", headers: [{ key: "Authorization", value: "Bearer <token>" }], body: "", bodyType: "none" },
  },
];

const inputStyle = (extra = {}) => ({
  background: T.s2, border: `1px solid ${T.border}`, borderRadius: 5,
  color: T.text, fontFamily: "var(--mono)", fontSize: 12,
  padding: "6px 10px", outline: "none", transition: "border-color 0.15s", ...extra,
});
const onFocus = e => (e.target.style.borderColor = T.border2);
const onBlur  = e => (e.target.style.borderColor = T.border);

export function HttpBuilder() {
  const [method,   setMethod]   = useState("GET");
  const [url,      setUrl]      = useState("https://jsonplaceholder.typicode.com/users");
  const [headers,  setHeaders]  = useState([{ key: "Accept", value: "application/json" }]);
  const [body,     setBody]     = useState("");
  const [bodyType, setBodyType] = useState("none");
  const [outTab,   setOutTab]   = useState("curl");
  const [response, setResponse] = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [reqError, setReqError] = useState(null);

  const req = { method, url, headers, body, bodyType };

  const outputs = {
    curl:  buildCurl(req),
    fetch: buildFetch(req),
    axios: buildAxios(req),
  };

  const addHeader = () => setHeaders(h => [...h, { key: "", value: "" }]);
  const delHeader = i => setHeaders(h => h.filter((_, j) => j !== i));
  const setHeader = (i, field, val) => setHeaders(h => h.map((x, j) => j === i ? { ...x, [field]: val } : x));

  const applyPreset = p => {
    setMethod(p.data.method); setUrl(p.data.url);
    setHeaders(p.data.headers); setBody(p.data.body); setBodyType(p.data.bodyType);
    setResponse(null); setReqError(null);
  };

  const sendRequest = async () => {
    if (!url.trim()) return;
    setLoading(true); setResponse(null); setReqError(null);
    try {
      const hdrs = new Headers();
      headers.forEach(({ key, value }) => { if (key.trim()) hdrs.set(key, value); });
      if (bodyType === "json" && body.trim()) hdrs.set("Content-Type", "application/json");
      if (bodyType === "form" && body.trim()) hdrs.set("Content-Type", "application/x-www-form-urlencoded");

      const hasBody = body.trim() && method !== "GET" && method !== "HEAD";
      const start = Date.now();
      const res = await fetch(url, {
        method,
        headers: hdrs,
        ...(hasBody ? { body: body.trim() } : {}),
      });
      const elapsed = Date.now() - start;
      const text = await res.text();
      let parsed = null;
      try { parsed = JSON.parse(text); } catch { /* not json */ }

      const resHeaders = {};
      res.headers.forEach((v, k) => { resHeaders[k] = v; });

      setResponse({ status: res.status, statusText: res.statusText, elapsed, text, parsed, headers: resHeaders });
    } catch (e) {
      setReqError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const statusColor = s => s < 300 ? T.green : s < 400 ? T.acc : s < 500 ? T.orange : T.red;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Presets */}
      <div>
        <Label>Presets</Label>
        <Row gap={6}>
          {PRESETS.map(p => (
            <Btn key={p.label} small variant="default" onClick={() => applyPreset(p)}>{p.label}</Btn>
          ))}
        </Row>
      </div>

      {/* Method + URL */}
      <div>
        <Label>Request</Label>
        <div style={{ display: "flex", gap: 8 }}>
          <select value={method} onChange={e => setMethod(e.target.value)}
            style={{ ...inputStyle({ width: 110, fontWeight: 700, color: METHOD_COLORS[method] || T.text, flexShrink: 0 }) }}>
            {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..."
            style={{ ...inputStyle({ flex: 1 }) }} onFocus={onFocus} onBlur={onBlur} />
          <Btn variant="accent" onClick={sendRequest} disabled={loading || !url.trim()}>
            {loading ? "Sending…" : "▶ Send"}
          </Btn>
        </div>
      </div>

      <Row>
        {/* Left — Headers + Body */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Headers */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <Label>Headers</Label>
              <Btn small onClick={addHeader}>+ Add</Btn>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {headers.map((h, i) => (
                <div key={i} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <input value={h.key}   onChange={e => setHeader(i, "key",   e.target.value)} placeholder="Header-Name"
                    style={{ ...inputStyle({ flex: 1 }) }} onFocus={onFocus} onBlur={onBlur} />
                  <input value={h.value} onChange={e => setHeader(i, "value", e.target.value)} placeholder="value"
                    style={{ ...inputStyle({ flex: 2 }) }} onFocus={onFocus} onBlur={onBlur} />
                  <Btn small variant="red" onClick={() => delHeader(i)}>✕</Btn>
                </div>
              ))}
            </div>
          </div>

          {/* Body */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <Label>Body</Label>
              <Row gap={4}>
                {BODY_TYPES.map(t => (
                  <Btn key={t} small variant={bodyType === t ? "accent" : "default"} onClick={() => setBodyType(t)}>{t}</Btn>
                ))}
              </Row>
            </div>
            {bodyType !== "none" && (
              <textarea value={body} onChange={e => setBody(e.target.value)}
                rows={6} spellCheck={false} placeholder={bodyType === "json" ? '{\n  "key": "value"\n}' : "key=value&foo=bar"}
                style={{ width: "100%", ...inputStyle({ lineHeight: 1.6, fontSize: 12 }) }}
                onFocus={onFocus} onBlur={onBlur} />
            )}
          </div>
        </div>

        {/* Right — Code output */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Row gap={4}>
              {OUTPUT_TABS.map(t => (
                <Btn key={t} small variant={outTab === t ? "accent" : "default"} onClick={() => setOutTab(t)}>{t}</Btn>
              ))}
            </Row>
            <CopyBtn text={outputs[outTab]} />
          </div>
          <pre style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 6, padding: "14px 16px", fontFamily: "var(--mono)", fontSize: 11, color: T.mid, lineHeight: 1.8, overflow: "auto", flex: 1, whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0, minHeight: 180 }}>
            {outputs[outTab] || <span style={{ color: T.dim, fontStyle: "italic" }}>Enter a URL to generate code…</span>}
          </pre>
        </div>
      </Row>

      {/* Response */}
      {reqError && (
        <div style={{ background: T.red+"12", border: `1px solid ${T.red}44`, borderRadius: 6, padding: "12px 14px", color: "#fca5a5", fontFamily: "var(--mono)", fontSize: 12 }}>
          ✗ {reqError} — check CORS policy or URL
        </div>
      )}

      {response && (
        <Card>
          <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 22, fontWeight: 700, color: statusColor(response.status) }}>
              {response.status}
            </div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: T.mid }}>{response.statusText}</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: T.dim }}>{response.elapsed}ms</div>
            <div style={{ flex: 1 }} />
            <CopyBtn text={response.text} />
          </div>

          {/* Response headers toggle */}
          <details style={{ marginBottom: 10 }}>
            <summary style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.15em", color: T.dim, cursor: "pointer", textTransform: "uppercase" }}>
              Response Headers ({Object.keys(response.headers).length})
            </summary>
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 3 }}>
              {Object.entries(response.headers).map(([k, v]) => (
                <div key={k} style={{ display: "flex", gap: 10, fontFamily: "var(--mono)", fontSize: 11, lineHeight: 1.6 }}>
                  <span style={{ color: T.acc, minWidth: 160 }}>{k}</span>
                  <span style={{ color: T.mid }}>{v}</span>
                </div>
              ))}
            </div>
          </details>

          <Label>Body</Label>
          <pre style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 6, padding: "12px 14px", fontFamily: "var(--mono)", fontSize: 11, color: T.mid, lineHeight: 1.7, overflow: "auto", maxHeight: 360, whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0 }}>
            {response.parsed ? JSON.stringify(response.parsed, null, 2) : response.text}
          </pre>
        </Card>
      )}
    </div>
  );
}
