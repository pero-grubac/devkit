import { useState } from "react";
import { T } from "../../shared/theme";
import { Textarea, Btn, Row, Card, Label, CopyBtn } from "../../shared/ui";

export function Base64Tool() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("encode");
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
    } catch (e) {
      return "⚠ " + e.message;
    }
  })();

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setInput(ev.target.result.split(",")[1]);
      setMode("decode");
    };
    reader.readAsDataURL(f);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Row>
        {["encode", "decode"].map((m) => (
          <Btn key={m} variant={mode === m ? "accent" : "default"} onClick={() => setMode(m)}>
            {m === "encode" ? "TEXT → BASE64" : "BASE64 → TEXT"}
          </Btn>
        ))}
        <Btn small variant={urlSafe ? "accent" : "default"} onClick={() => setUrlSafe(!urlSafe)}>
          {urlSafe ? "✓ URL-SAFE" : "URL-SAFE"}
        </Btn>
        <label style={{ fontFamily: "var(--mono)", fontSize: 10, color: T.dim, cursor: "pointer", padding: "7px 10px", border: `1px solid ${T.border}`, borderRadius: 5 }}>
          📎 FILE
          <input type="file" style={{ display: "none" }} onChange={handleFile} />
        </label>
      </Row>

      <div>
        <Label>{mode === "encode" ? "Plain Text" : "Base64"}</Label>
        <Textarea value={input} onChange={setInput} rows={4} placeholder={mode === "encode" ? "Enter text to encode..." : "Paste base64 to decode..."} />
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <Label>{mode === "encode" ? "Base64 Output" : "Decoded Text"}</Label>
          {output && !output.startsWith("⚠") && <CopyBtn text={output} />}
        </div>
        <div
          style={{
            background: T.s2,
            border: `1px solid ${output?.startsWith("⚠") ? T.red + "55" : T.border}`,
            borderRadius: 6,
            padding: "12px 14px",
            fontFamily: "var(--mono)",
            fontSize: 13,
            color: output?.startsWith("⚠") ? T.red : T.mid,
            minHeight: 80,
            wordBreak: "break-all",
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
          }}
        >
          {output || <span style={{ color: T.dim, fontStyle: "italic" }}>Output appears here...</span>}
        </div>
      </div>

      {output && !output.startsWith("⚠") && (
        <div style={{ display: "flex", gap: 12 }}>
          {[
            ["INPUT",  input.length],
            ["OUTPUT", output.length],
            ["RATIO",  (output.length / (input.length || 1)).toFixed(2) + "x"],
          ].map(([l, v]) => (
            <Card key={l} style={{ padding: "10px 16px" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 8, letterSpacing: "0.25em", color: T.dim, marginBottom: 3 }}>{l}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 16, fontWeight: 700, color: T.acc }}>{v}</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
