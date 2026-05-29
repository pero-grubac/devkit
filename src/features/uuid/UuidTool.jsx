import { useState, useEffect } from "react";
import { T } from "../../shared/theme";
import { Btn, Row, Label, CopyBtn } from "../../shared/ui";

function uuid4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}
function uuid7() {
  const ts = Date.now().toString(16).padStart(12, "0");
  const rand = () => Math.random().toString(16).slice(2);
  return `${ts.slice(0, 8)}-${ts.slice(8, 12)}-7${rand().slice(0, 3)}-${(((Math.random() * 4) | 0) + 8).toString(16)}${rand().slice(0, 3)}-${rand().slice(0, 12)}`;
}
function cuid() {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `c${ts}${rand}`;
}

export function UuidTool() {
  const [uuids,     setUuids]     = useState([uuid4()]);
  const [count,     setCount]     = useState(5);
  const [format,    setFormat]    = useState("v4");
  const [uppercase, setUppercase] = useState(false);
  const [noDashes,  setNoDashes]  = useState(false);

  function gen() {
    const fns = { v4: uuid4, v7: uuid7, cuid };
    let list = Array.from({ length: count }, fns[format] || uuid4);
    if (uppercase) list = list.map((s) => s.toUpperCase());
    if (noDashes)  list = list.map((s) => s.replace(/-/g, ""));
    setUuids(list);
  }

  useEffect(() => { gen(); }, [format, count, uppercase, noDashes]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Row>
        {["v4", "v7", "cuid"].map((f) => (
          <Btn key={f} variant={format === f ? "accent" : "default"} onClick={() => setFormat(f)}>
            {f === "cuid" ? "CUID" : "UUID " + f.toUpperCase()}
          </Btn>
        ))}
        <Btn variant={uppercase ? "accent" : "default"} small onClick={() => setUppercase(!uppercase)}>UPPERCASE</Btn>
        <Btn variant={noDashes ? "accent" : "default"}  small onClick={() => setNoDashes(!noDashes)}>NO DASHES</Btn>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: T.dim }}>COUNT</span>
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(50, +e.target.value)))}
            style={{ width: 56, background: T.s2, border: `1px solid ${T.border}`, borderRadius: 5, color: T.text, fontFamily: "var(--mono)", fontSize: 12, padding: "6px 8px", outline: "none", textAlign: "center" }}
          />
        </div>
        <Btn variant="accent" onClick={gen}>↺ GENERATE</Btn>
      </Row>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <Label>{uuids.length} {format.toUpperCase()} generated</Label>
          <CopyBtn text={uuids.join("\n")} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {uuids.map((id, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: T.s2, border: `1px solid ${T.border}`, borderRadius: 5, padding: "9px 14px" }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: 13, color: T.mid, letterSpacing: "0.04em" }}>{id}</span>
              <CopyBtn text={id} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
