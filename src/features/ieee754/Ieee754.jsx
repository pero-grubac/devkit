import { useState } from "react";
import { T } from "../../shared/theme";
import { Row, Btn, Card, Label, CopyBtn } from "../../shared/ui";
import { analyzeFloat32, analyzeFloat64, INTERESTING } from "./ieee754";

function BitField({ bits, color, label, width }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: 8, letterSpacing: "0.15em", color: T.dim, textTransform: "uppercase" }}>{label}</div>
      <div style={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "center", maxWidth: width }}>
        {bits.split("").map((b, i) => (
          <div key={i} style={{
            width: 14, height: 20, borderRadius: 2,
            background: b === "1" ? color : T.s3,
            border: `1px solid ${b === "1" ? color + "66" : T.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--mono)", fontSize: 9, fontWeight: 700,
            color: b === "1" ? "#fff" : T.dim,
            transition: "background 0.1s",
          }}>
            {b}
          </div>
        ))}
      </div>
      <div style={{ fontFamily: "var(--mono)", fontSize: 8, color, opacity: 0.7 }}>{bits.length} bits</div>
    </div>
  );
}

export function Ieee754() {
  const [input, setInput]     = useState("0.1");
  const [precision, setPrec]  = useState(32);

  const num = parseFloat(input);
  const valid = !isNaN(num) || input.trim() === "Infinity" || input.trim() === "-Infinity" || input.trim() === "NaN";
  const parsed = valid ? (input.trim() === "Infinity" ? Infinity : input.trim() === "-Infinity" ? -Infinity : input.trim() === "NaN" ? NaN : num) : NaN;
  const info = valid ? (precision === 32 ? analyzeFloat32(parsed) : analyzeFloat64(parsed)) : null;

  const catColor = (c) => {
    if (c.includes("Infinity")) return T.orange;
    if (c === "NaN")            return T.red;
    if (c.includes("Zero"))     return T.dim;
    if (c === "Subnormal")      return T.yellow;
    return T.green;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Input + precision */}
      <Row gap={10}>
        <div style={{ flex: 1 }}>
          <Label>Number</Label>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Enter a number..."
            style={{ width: "100%", background: T.s2, border: `1px solid ${T.border}`, borderRadius: 6, color: T.text, fontFamily: "var(--mono)", fontSize: 16, fontWeight: 700, padding: "10px 14px", outline: "none", transition: "border-color 0.15s" }}
            onFocus={e => (e.target.style.borderColor = T.border2)}
            onBlur={e  => (e.target.style.borderColor = T.border)}
          />
        </div>
        <div>
          <Label>Precision</Label>
          <Row gap={6}>
            {[32, 64].map(p => (
              <Btn key={p} variant={precision===p?"accent":"default"} onClick={() => setPrec(p)}>{p}-bit</Btn>
            ))}
          </Row>
        </div>
      </Row>

      {/* Presets */}
      <div>
        <Label>Interesting values</Label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {INTERESTING.map(({ label, value }) => (
            <Btn key={label} small variant="default" onClick={() => setInput(String(value))}>{label}</Btn>
          ))}
        </div>
      </div>

      {info && (
        <>
          {/* Bit visualisation */}
          <Card>
            <Label>Bit Layout — IEEE 754 {precision}-bit</Label>
            <div style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap", justifyContent: "center", alignItems: "flex-end" }}>
              <BitField bits={info.signBit}  color={T.red}    label="Sign"     width={20}  />
              <BitField bits={info.expBits}  color={T.orange} label="Exponent" width={precision===32?130:170} />
              <BitField bits={info.mantBits} color={T.acc}    label="Mantissa" width={precision===32?350:650} />
            </div>

            <div style={{ display: "flex", justifyContent: "center", marginTop: 14, gap: 10, flexWrap: "wrap" }}>
              {[
                { l:"Sign",     v: info.sign === 0 ? "0 (+)" : "1 (–)", c: T.red    },
                { l:"Exponent", v: `${info.expRaw} (biased) → ${info.expActual} (actual)`, c: T.orange },
                { l:"Hex",      v: info.hexStr, c: T.mid },
              ].map(({ l, v, c }) => (
                <div key={l} style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 8, letterSpacing: "0.2em", color: T.dim, marginBottom: 3 }}>{l}</div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: c }}>{v}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Stats */}
          <Row>
            <Card style={{ flex: 1 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { l:"Category",   v: info.category,  c: catColor(info.category) },
                  { l:"Decimal",    v: String(parsed),  c: T.text  },
                  { l:"Hex",        v: "0x" + info.hexStr, c: T.mid },
                  { l:"Binary",     v: info.bits.slice(0, 32) + (info.bits.length > 32 ? "…" : ""), c: T.dim },
                ].map(({ l, v, c }) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${T.border}`, paddingBottom: 8 }}>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.18em", color: T.dim, textTransform: "uppercase" }}>{l}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: c }}>{v}</span>
                      <CopyBtn text={v} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card style={{ flex: 1 }}>
              <Label>Floating Point Quirks</Label>
              <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { expr: "0.1 + 0.2",     expected: "0.3",  actual: String(0.1+0.2) },
                  { expr: "0.1 + 0.2 === 0.3", expected: "true", actual: String(0.1+0.2===0.3) },
                  { expr: "1/3",           expected: "0.333…",actual: String(1/3) },
                  { expr: "MAX_SAFE_INT+1 === MAX_SAFE_INT+2", expected:"false", actual: String(Number.MAX_SAFE_INTEGER+1 === Number.MAX_SAFE_INTEGER+2) },
                ].map(({ expr, expected, actual }) => (
                  <div key={expr} style={{ background: T.s2, borderRadius: 5, padding: "8px 10px" }}>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: T.acc }}>{expr}</div>
                    <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: T.dim }}>expected: <span style={{ color: T.green }}>{expected}</span></span>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: T.dim }}>actual: <span style={{ color: actual === expected ? T.green : T.red }}>{actual}</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Row>
        </>
      )}
    </div>
  );
}
