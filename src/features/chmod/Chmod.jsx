import { useState } from "react";
import { T } from "../../shared/theme";
import { Row, Btn, Card, Label, CopyBtn } from "../../shared/ui";
import { PERMS, BITS, DEFAULT_STATE, stateToOctal, stateToSymbolic, octalToState, symbolicToState, PRESETS } from "./chmod";

export function Chmod() {
  const [state,    setState]    = useState(DEFAULT_STATE);
  const [octalIn,  setOctalIn]  = useState("");
  const [symIn,    setSymIn]    = useState("");
  const [parseErr, setParseErr] = useState(null);

  const octal    = stateToOctal(state);
  const symbolic = stateToSymbolic(state);

  const toggle = (who, bit) => {
    setState(s => ({ ...s, [who]: { ...s[who], [bit]: !s[who][bit] } }));
    setOctalIn(""); setSymIn(""); setParseErr(null);
  };

  const applyOctal = () => {
    const s = octalToState(octalIn);
    if (!s) { setParseErr("Invalid octal — use 3 digits, each 0–7"); return; }
    setState(s); setSymIn(""); setParseErr(null);
  };

  const applySym = () => {
    const s = symbolicToState(symIn);
    if (!s) { setParseErr("Invalid symbolic — expected 9 chars like rwxr-xr-x"); return; }
    setState(s); setOctalIn(""); setParseErr(null);
  };

  const applyPreset = octal => {
    const s = octalToState(octal);
    if (s) { setState(s); setOctalIn(""); setSymIn(""); setParseErr(null); }
  };

  const inputStyle = {
    background: T.s2, border: `1px solid ${T.border}`, borderRadius: 5,
    color: T.text, fontFamily: "var(--mono)", fontSize: 14, fontWeight: 700,
    padding: "8px 12px", outline: "none", transition: "border-color 0.15s", width: "100%",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Checkbox grid */}
      <Card>
        <div style={{ display: "grid", gridTemplateColumns: "80px repeat(3, 1fr)", gap: 8, alignItems: "center" }}>
          {/* Header row */}
          <div />
          {BITS.map(b => (
            <div key={b.key} style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", color: T.dim, textAlign: "center", textTransform: "uppercase" }}>
              {b.label}
            </div>
          ))}

          {/* Permission rows */}
          {PERMS.map(({ label, key }) => (
            <>
              <div key={key + "_label"} style={{ fontFamily: "var(--mono)", fontSize: 11, color: T.mid }}>{label}</div>
              {BITS.map(b => {
                const on = state[key][b.key];
                return (
                  <div key={b.key} style={{ display: "flex", justifyContent: "center" }}>
                    <div
                      onClick={() => toggle(key, b.key)}
                      style={{
                        width: 42, height: 42, borderRadius: 6, cursor: "pointer",
                        background: on ? T.acc + "22" : T.s2,
                        border: `1px solid ${on ? T.acc + "66" : T.border}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: "var(--mono)", fontSize: 16, fontWeight: 700,
                        color: on ? T.acc : T.dim,
                        transition: "all 0.15s",
                        userSelect: "none",
                      }}
                    >
                      {on ? b.key : "–"}
                    </div>
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </Card>

      {/* Output strip */}
      <Row gap={10}>
        {[
          { label: "Octal",    value: octal,                      color: T.acc   },
          { label: "Symbolic", value: symbolic,                   color: T.green },
          { label: "chmod",    value: `chmod ${octal} filename`,  color: T.mid   },
        ].map(({ label, value, color }) => (
          <Card key={label} style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 8, letterSpacing: "0.2em", color: T.dim, marginBottom: 4 }}>{label}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: label === "Octal" ? 32 : 18, fontWeight: 700, color }}>{value}</div>
            </div>
            <CopyBtn text={value} />
          </Card>
        ))}
      </Row>

      {/* Parse input */}
      <Row gap={10}>
        <div style={{ flex: 1 }}>
          <Label>Parse Octal (e.g. 755)</Label>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={octalIn} onChange={e => setOctalIn(e.target.value)} onKeyDown={e => e.key === "Enter" && applyOctal()}
              placeholder="755" maxLength={3} style={{ ...inputStyle, width: 80, textAlign: "center", letterSpacing: "0.3em" }}
              onFocus={e => (e.target.style.borderColor = T.border2)} onBlur={e => (e.target.style.borderColor = T.border)} />
            <Btn variant="accent" onClick={applyOctal}>Apply</Btn>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <Label>Parse Symbolic (e.g. rwxr-xr-x)</Label>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={symIn} onChange={e => setSymIn(e.target.value)} onKeyDown={e => e.key === "Enter" && applySym()}
              placeholder="rwxr-xr-x" maxLength={10} style={{ ...inputStyle, width: 140, letterSpacing: "0.1em" }}
              onFocus={e => (e.target.style.borderColor = T.border2)} onBlur={e => (e.target.style.borderColor = T.border)} />
            <Btn variant="accent" onClick={applySym}>Apply</Btn>
          </div>
        </div>
      </Row>

      {parseErr && (
        <div style={{ background: T.red+"12", border: `1px solid ${T.red}44`, borderRadius: 6, padding: "10px 14px", color: "#fca5a5", fontFamily: "var(--mono)", fontSize: 12 }}>
          ✗ {parseErr}
        </div>
      )}

      {/* Presets */}
      <div>
        <Label>Common Presets</Label>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {PRESETS.map(p => (
            <div key={p.octal} style={{ display: "flex", alignItems: "center", gap: 12, background: T.s2, border: `1px solid ${octal === p.octal ? T.acc + "55" : T.border}`, borderRadius: 6, padding: "9px 14px", cursor: "pointer", transition: "border-color 0.15s" }}
              onClick={() => applyPreset(p.octal)}>
              <span style={{ fontFamily: "var(--mono)", fontSize: 14, fontWeight: 700, color: T.acc, width: 36 }}>{p.octal}</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: T.green, width: 100 }}>{p.label.split("—")[1]?.trim()}</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: T.dim, flex: 1 }}>{p.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
