import { useState, useRef } from "react";
import { T } from "../../shared/theme";
import { Textarea, Btn, Row, Card, Label, CopyBtn } from "../../shared/ui";

const MODES = [
  { id: "encode",  label: "Text → Base64" },
  { id: "decode",  label: "Base64 → Text" },
  { id: "image",   label: "Image → Base64" },
];

// ── Text encode/decode ────────────────────────────────────────────────────────
function TextMode() {
  const [input,   setInput]   = useState("");
  const [mode,    setMode]    = useState("encode");
  const [urlSafe, setUrlSafe] = useState(false);

  const output = (() => {
    if (!input) return "";
    try {
      if (mode === "encode") {
        let b = btoa(unescape(encodeURIComponent(input)));
        if (urlSafe) b = b.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
        return b;
      } else {
        let s = input;
        if (urlSafe) s = s.replace(/-/g, "+").replace(/_/g, "/");
        return decodeURIComponent(escape(atob(s)));
      }
    } catch (e) { return "⚠ " + e.message; }
  })();

  const isError = output.startsWith("⚠");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Row gap={6}>
        {["encode", "decode"].map(m => (
          <Btn key={m} variant={mode === m ? "accent" : "default"} onClick={() => setMode(m)}>
            {m === "encode" ? "Text → Base64" : "Base64 → Text"}
          </Btn>
        ))}
        <Btn small variant={urlSafe ? "accent" : "default"} onClick={() => setUrlSafe(v => !v)}>
          URL-Safe
        </Btn>
      </Row>

      <div>
        <Label>{mode === "encode" ? "Plain Text" : "Base64"}</Label>
        <Textarea value={input} onChange={setInput} rows={5}
          placeholder={mode === "encode" ? "Enter text to encode…" : "Paste base64 to decode…"} />
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <Label>{mode === "encode" ? "Base64 Output" : "Decoded Text"}</Label>
          {output && !isError && <CopyBtn text={output} />}
        </div>
        <div style={{ background: T.s2, border: `1px solid ${isError ? T.red+"55" : T.border}`, borderRadius: 6, padding: "12px 14px", fontFamily: "var(--mono)", fontSize: 13, color: isError ? T.red : T.mid, minHeight: 80, wordBreak: "break-all", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
          {output || <span style={{ color: T.dim, fontStyle: "italic" }}>Output appears here…</span>}
        </div>
      </div>

      {output && !isError && (
        <Row gap={8}>
          {[["INPUT", input.length], ["OUTPUT", output.length], ["RATIO", (output.length / (input.length || 1)).toFixed(2) + "x"]].map(([l, v]) => (
            <Card key={l} style={{ padding: "10px 16px" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 8, letterSpacing: "0.25em", color: T.dim, marginBottom: 3 }}>{l}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 16, fontWeight: 700, color: T.acc }}>{v}</div>
            </Card>
          ))}
        </Row>
      )}
    </div>
  );
}

// ── Image → Base64 ────────────────────────────────────────────────────────────
function ImageMode() {
  const [result,    setResult]    = useState(null);
  const [dragging,  setDragging]  = useState(false);
  const inputRef = useRef(null);

  const processFile = file => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = e => {
      const dataUrl = e.target.result;
      const base64  = dataUrl.split(",")[1];
      setResult({ dataUrl, base64, mime: file.type, name: file.name, size: file.size });
    };
    reader.readAsDataURL(file);
  };

  const onDrop = e => {
    e.preventDefault(); setDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  const outputs = result ? [
    { label: "Base64 (raw)",          value: result.base64 },
    { label: "Data URL",              value: result.dataUrl },
    { label: "<img> tag",             value: `<img src="${result.dataUrl}" alt="${result.name}" />` },
    { label: "CSS background-image",  value: `background-image: url('${result.dataUrl}');` },
  ] : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        style={{ border: `2px dashed ${dragging ? T.acc : T.border}`, borderRadius: 8, padding: "32px", textAlign: "center", cursor: "pointer", background: dragging ? T.acc+"08" : T.s1, transition: "all 0.15s" }}
      >
        <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => processFile(e.target.files[0])} />
        <div style={{ fontFamily: "var(--mono)", fontSize: 13, color: dragging ? T.acc : T.dim }}>
          {dragging ? "Drop image here" : "Click or drag an image here"}
        </div>
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: T.dim, marginTop: 6 }}>
          PNG, JPG, GIF, SVG, WebP
        </div>
      </div>

      {result && (
        <>
          {/* Preview + info */}
          <Row gap={14}>
            <div style={{ width: 120, height: 90, borderRadius: 6, overflow: "hidden", border: `1px solid ${T.border}`, flexShrink: 0 }}>
              <img src={result.dataUrl} alt={result.name} style={{ width: "100%", height: "100%", objectFit: "contain", background: T.s2 }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, justifyContent: "center" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: T.text }}>{result.name}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: T.dim }}>{result.mime}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: T.dim }}>{(result.size / 1024).toFixed(1)} KB → {(result.base64.length / 1024).toFixed(1)} KB base64</div>
            </div>
          </Row>

          {/* Output options */}
          {outputs.map(({ label, value }) => (
            <div key={label}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                <Label>{label}</Label>
                <CopyBtn text={value} />
              </div>
              <div style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 6, padding: "10px 12px", fontFamily: "var(--mono)", fontSize: 11, color: T.mid, wordBreak: "break-all", lineHeight: 1.6, maxHeight: 80, overflow: "hidden" }}>
                {value.slice(0, 120)}…
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function Base64Tool() {
  const [mode, setMode] = useState("encode");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Row gap={6}>
        {MODES.map(m => (
          <Btn key={m.id} variant={mode === m.id ? "accent" : "default"} onClick={() => setMode(m.id)}>
            {m.label}
          </Btn>
        ))}
      </Row>

      {mode === "encode" || mode === "decode" ? <TextMode /> : <ImageMode />}
    </div>
  );
}
