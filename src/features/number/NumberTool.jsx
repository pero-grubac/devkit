import { useState } from "react";
import { T } from "../../shared/theme";
import { Input, Btn, Row, Card, Label, CopyBtn } from "../../shared/ui";

const SUBS = [
  { id: "base",  label: "Base Converter" },
  { id: "rng",   label: "Random Generator" },
  { id: "round", label: "Rounding / Precision" },
];

const SUB_TAB_STYLE = (active) => ({
  fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em",
  padding: "5px 14px",
  border: `1px solid ${active ? T.acc + "66" : T.border}`,
  background: active ? T.acc + "18" : "transparent",
  color: active ? T.acc : T.dim,
  borderRadius: 4, cursor: "pointer",
});

function lcg(seed) {
  let s = parseInt(seed) || 42;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
}

export function NumberTool() {
  const [num,        setNum]        = useState("255");
  const [sub,        setSub]        = useState("base");
  const [rngMin,     setRngMin]     = useState("1");
  const [rngMax,     setRngMax]     = useState("100");
  const [rngSeed,    setRngSeed]    = useState("42");
  const [rngCount,   setRngCount]   = useState("10");
  const [rngResults, setRngResults] = useState([]);
  const [precision,  setPrecision]  = useState("3");
  const [roundInput, setRoundInput] = useState("3.14159265");

  const n     = parseFloat(num);
  const isInt = !isNaN(n) && Number.isInteger(n) && n >= 0 && n <= Number.MAX_SAFE_INTEGER;
  const isNum = !isNaN(n);

  const bases = isInt ? [
    { label: "Binary (2)",  prefix: "0b", val: Math.floor(n).toString(2) },
    { label: "Octal (8)",   prefix: "0o", val: Math.floor(n).toString(8) },
    { label: "Decimal (10)",prefix: "",   val: Math.floor(n).toString(10) },
    { label: "Hex (16)",    prefix: "0x", val: Math.floor(n).toString(16).toUpperCase() },
    { label: "Base 32",     prefix: "",   val: Math.floor(n).toString(32).toUpperCase() },
    { label: "Base 36",     prefix: "",   val: Math.floor(n).toString(36).toUpperCase() },
  ] : [];

  function generateRng() {
    const min = parseInt(rngMin), max = parseInt(rngMax), count = Math.min(parseInt(rngCount), 100);
    if (isNaN(min) || isNaN(max) || min >= max) return;
    const rng = lcg(rngSeed);
    setRngResults(Array.from({ length: count }, () => Math.floor(rng() * (max - min + 1)) + min));
  }

  const p = parseInt(precision), rv = parseFloat(roundInput);
  const roundings = !isNaN(rv) && !isNaN(p) ? [
    { label: "Round",      val: rv.toFixed(p) },
    { label: "Floor",      val: Math.floor(rv * 10 ** p) / 10 ** p },
    { label: "Ceil",       val: Math.ceil(rv * 10 ** p) / 10 ** p },
    { label: "Truncate",   val: Math.trunc(rv * 10 ** p) / 10 ** p },
    { label: "Scientific", val: rv.toExponential(p) },
    { label: "Fixed",      val: rv.toFixed(p) },
  ] : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 6, borderBottom: `1px solid ${T.border}`, paddingBottom: 10 }}>
        {SUBS.map((s) => <button key={s.id} onClick={() => setSub(s.id)} style={SUB_TAB_STYLE(sub === s.id)}>{s.label}</button>)}
      </div>

      {sub === "base" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <Label>Input Number (decimal or 0x hex or 0b binary)</Label>
            <Input value={num} onChange={setNum} placeholder="255 or 0xFF or 0b11111111" />
            {num && !isInt && <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: T.orange, marginTop: 5 }}>Non-negative integer required for base conversion</div>}
          </div>
          {isInt && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 8 }}>
              {bases.map(({ label, prefix, val }) => (
                <div key={label} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 6, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", color: T.dim, marginBottom: 3 }}>{label.toUpperCase()}</div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 14, color: T.mid }}>
                      <span style={{ color: T.dim }}>{prefix}</span>{val}
                    </div>
                  </div>
                  <CopyBtn text={prefix + val} />
                </div>
              ))}
            </div>
          )}
          {isNum && (
            <Card>
              <Label>Number Facts</Label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8 }}>
                {[
                  ["Is Integer", Number.isInteger(n) ? "yes" : "no"],
                  ["Is Finite",  isFinite(n) ? "yes" : "no"],
                  ["Is NaN",     isNaN(n) ? "yes" : "no"],
                  ["Abs Value",  Math.abs(n)],
                  ["Squared",    (n * n).toExponential(3)],
                  ["√ Sqrt",     Math.sqrt(n).toFixed(6)],
                  ["ln",         Math.log(n).toFixed(6)],
                  ["log₁₀",      Math.log10(n).toFixed(6)],
                ].map(([l, v]) => (
                  <div key={l} style={{ background: T.s2, borderRadius: 4, padding: "8px 10px" }}>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: T.dim, letterSpacing: "0.2em", marginBottom: 3 }}>{l}</div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: T.mid }}>{String(v)}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {sub === "rng" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
            {[["MIN", rngMin, setRngMin], ["MAX", rngMax, setRngMax], ["SEED", rngSeed, setRngSeed], ["COUNT", rngCount, setRngCount]].map(([l, v, s]) => (
              <div key={l}><Label>{l}</Label><Input value={v} onChange={s} type="number" /></div>
            ))}
          </div>
          <Row>
            <Btn variant="accent" onClick={generateRng}>↺ GENERATE</Btn>
            {rngResults.length > 0 && <CopyBtn text={rngResults.join(", ")} />}
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: T.dim, alignSelf: "center" }}>Same seed + params = same sequence</span>
          </Row>
          {rngResults.length > 0 && (
            <div>
              <Label>{rngResults.length} numbers (seed: {rngSeed})</Label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {rngResults.map((n, i) => <span key={i} style={{ fontFamily: "var(--mono)", fontSize: 12, background: T.s2, border: `1px solid ${T.border}`, borderRadius: 4, padding: "5px 10px", color: T.mid }}>{n}</span>)}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginTop: 10 }}>
                {[
                  ["MIN",    Math.min(...rngResults)],
                  ["MAX",    Math.max(...rngResults)],
                  ["AVG",    (rngResults.reduce((a, b) => a + b, 0) / rngResults.length).toFixed(2)],
                  ["MEDIAN", [...rngResults].sort((a, b) => a - b)[Math.floor(rngResults.length / 2)]],
                ].map(([l, v]) => (
                  <Card key={l} style={{ padding: "10px 12px" }}>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: T.dim, letterSpacing: "0.2em", marginBottom: 3 }}>{l}</div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 16, fontWeight: 700, color: T.acc }}>{v}</div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {sub === "round" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Row>
            <div style={{ flex: 2 }}>
              <Label>Number</Label>
              <Input value={roundInput} onChange={setRoundInput} placeholder="3.14159265" />
            </div>
            <div style={{ flex: 1 }}>
              <Label>Decimal Places</Label>
              <Input value={precision} onChange={setPrecision} type="number" />
            </div>
          </Row>
          {roundings.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8 }}>
              {roundings.map(({ label, val }) => (
                <div key={label} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 6, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", color: T.dim, marginBottom: 3 }}>{label.toUpperCase()}</div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 16, fontWeight: 700, color: T.acc }}>{val}</div>
                  </div>
                  <CopyBtn text={String(val)} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
