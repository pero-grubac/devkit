import { useState, useEffect } from "react";
import { T } from "../../shared/theme";
import { Card, Label, CopyBtn, Btn } from "../../shared/ui";
import { md5 } from "./md5";
import { digest, ALGOS } from "./digest";

export function HashTool() {
  const [input,  setInput]  = useState("");
  const [hashes, setHashes] = useState({});
  const [upper,  setUpper]  = useState(false);

  useEffect(() => {
    if (!input) { setHashes({}); return; }
    (async () => {
      const r = { md5: md5(input) };
      for (const algo of ["SHA-1", "SHA-256", "SHA-512"])
        r[algo] = await digest(algo, input);
      setHashes(r);
    })();
  }, [input]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <Label>Input String</Label>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Enter text to hash..."
          rows={4}
          spellCheck={false}
          style={{ width: "100%", background: T.s2, border: `1px solid ${T.border}`, borderRadius: 6, color: T.text, fontFamily: "var(--mono)", fontSize: 13, padding: "12px 14px", lineHeight: 1.6, outline: "none", transition: "border-color 0.15s" }}
          onFocus={e => (e.target.style.borderColor = T.border2)}
          onBlur={e  => (e.target.style.borderColor = T.border)}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Label>Hashes</Label>
        <Btn small variant={upper ? "accent" : "default"} onClick={() => setUpper(u => !u)}>
          {upper ? "HEX UPPER" : "hex lower"}
        </Btn>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {ALGOS.map(({ id, label, bits, note }) => {
          const val    = upper ? (hashes[id] ?? "").toUpperCase() : (hashes[id] ?? "");
          const danger = id === "md5" || id === "SHA-1";
          return (
            <Card key={id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700, color: danger ? T.orange : T.acc }}>{label}</span>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 9,  color: T.dim }}>{bits} bits</span>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 9,  color: danger ? T.orange + "99" : T.dim, fontStyle: "italic" }}>{note}</span>
                </div>
                {val && <CopyBtn text={val} />}
              </div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: T.mid, wordBreak: "break-all", lineHeight: 1.6, background: T.s2, borderRadius: 4, padding: "8px 10px" }}>
                {val || <span style={{ color: T.dim, fontStyle: "italic" }}>—</span>}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
