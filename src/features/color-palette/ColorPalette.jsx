import { useState, useEffect } from "react";
import { T } from "../../shared/theme";
import { Row, Btn, Card, Label, CopyBtn } from "../../shared/ui";
import { generatePalette, toCssVars, toTailwind } from "./palette";

const OUTPUT_MODES = ["Shades", "Harmonies", "CSS Vars", "Tailwind"];

function Swatch({ hex, label, size = 40 }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(hex); setCopied(true); setTimeout(() => setCopied(false), 1200); };
  const lum = parseInt(hex.slice(1,3),16)*0.299 + parseInt(hex.slice(3,5),16)*0.587 + parseInt(hex.slice(5,7),16)*0.114;
  const textColor = lum > 140 ? "#000" : "#fff";

  return (
    <div
      onClick={copy}
      title={`${hex} — click to copy`}
      style={{ width: size, flexShrink: 0, cursor: "pointer", transition: "transform 0.1s" }}
      onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.08)")}
      onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
    >
      <div style={{ height: size, borderRadius: 6, background: hex, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {copied && <span style={{ fontSize: 14, color: textColor }}>✓</span>}
      </div>
      {label && (
        <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: T.dim, textAlign: "center", marginTop: 3, letterSpacing: "0.05em" }}>
          {label}
        </div>
      )}
    </div>
  );
}

export function ColorPalette() {
  const [input,   setInput]   = useState("#7c6cf5");
  const [hex,     setHex]     = useState("#7c6cf5");
  const [output,  setOutput]  = useState("Shades");
  const [palette, setPalette] = useState(null);
  const [varName, setVarName] = useState("primary");

  useEffect(() => {
    const v = input.trim();
    const clean = v.startsWith("#") ? v : "#" + v;
    if (/^#[0-9a-f]{6}$/i.test(clean)) {
      setHex(clean);
      setPalette(generatePalette(clean));
    }
  }, [input]);

  const inputStyle = {
    background: T.s2, border: `1px solid ${T.border}`, borderRadius: 6,
    color: T.text, fontFamily: "var(--mono)", fontSize: 13,
    padding: "9px 12px", outline: "none", transition: "border-color 0.15s",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Input row */}
      <Row gap={10}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="color" value={hex} onChange={e => { setHex(e.target.value); setInput(e.target.value); }}
            style={{ width: 44, height: 44, borderRadius: 8, border: `1px solid ${T.border}`, padding: 2, background: T.s2, cursor: "pointer" }} />
          <div>
            <Label>Hex Color</Label>
            <input value={input} onChange={e => setInput(e.target.value)} placeholder="#7c6cf5"
              style={{ ...inputStyle, width: 130 }}
              onFocus={e => (e.target.style.borderColor = T.border2)}
              onBlur={e  => (e.target.style.borderColor = T.border)} />
          </div>
        </div>

        {palette && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, flex: 1 }}>
            {palette.shades.map(s => <Swatch key={s.name} hex={s.hex} size={28} />)}
          </div>
        )}
      </Row>

      {/* Output mode tabs */}
      <Row gap={6}>
        {OUTPUT_MODES.map(m => (
          <Btn key={m} small variant={output === m ? "accent" : "default"} onClick={() => setOutput(m)}>{m}</Btn>
        ))}
      </Row>

      {palette && (
        <>
          {/* Shades */}
          {output === "Shades" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {palette.shades.map(s => {
                const lum = parseInt(s.hex.slice(1,3),16)*0.299 + parseInt(s.hex.slice(3,5),16)*0.587 + parseInt(s.hex.slice(5,7),16)*0.114;
                const tc  = lum > 140 ? "#000" : "#fff";
                return (
                  <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 52, fontFamily: "var(--mono)", fontSize: 11, color: T.dim, textAlign: "right" }}>{s.name}</div>
                    <div style={{ flex: 1, height: 36, borderRadius: 6, background: s.hex, display: "flex", alignItems: "center", paddingLeft: 12, cursor: "pointer" }}
                      onClick={() => navigator.clipboard.writeText(s.hex)}>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: tc }}>{s.hex}</span>
                    </div>
                    <CopyBtn text={s.hex} />
                  </div>
                );
              })}
            </div>
          )}

          {/* Harmonies */}
          {output === "Harmonies" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { label: "Complementary", swatches: palette.complementary },
                { label: "Triadic",       swatches: palette.triadic       },
                { label: "Analogous",     swatches: palette.analogous     },
                { label: "Tints",         swatches: palette.tints         },
                { label: "Muted",         swatches: palette.muted         },
              ].map(({ label, swatches }) => (
                <Card key={label}>
                  <Label>{label}</Label>
                  <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                    {swatches.map(s => <Swatch key={s.name} hex={s.hex} label={s.name} size={48} />)}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* CSS Vars */}
          {output === "CSS Vars" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Row gap={8}>
                <div>
                  <Label>Variable name</Label>
                  <input value={varName} onChange={e => setVarName(e.target.value)} placeholder="primary"
                    style={{ ...inputStyle, width: 150 }}
                    onFocus={e => (e.target.style.borderColor = T.border2)}
                    onBlur={e  => (e.target.style.borderColor = T.border)} />
                </div>
              </Row>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <Label>CSS Custom Properties</Label>
                  <CopyBtn text={`:root {\n${toCssVars(palette.shades, varName)}\n}`} />
                </div>
                <pre style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 6, padding: "14px 16px", fontFamily: "var(--mono)", fontSize: 12, color: T.mid, lineHeight: 1.8, overflow: "auto", margin: 0 }}>
                  <span style={{ color: T.acc }}>:root</span>{" {\n"}
                  {palette.shades.map(s => (
                    <span key={s.name}>
                      {"  "}
                      <span style={{ color: T.acc2 }}>--{varName}-{s.name}</span>
                      {": "}
                      <span style={{ color: T.green }}>{s.hex}</span>
                      {";\n"}
                    </span>
                  ))}
                  {"}"}
                </pre>
              </div>
            </div>
          )}

          {/* Tailwind */}
          {output === "Tailwind" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <Label>tailwind.config.js</Label>
                <CopyBtn text={toTailwind(palette.shades, varName)} />
              </div>
              <pre style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 6, padding: "14px 16px", fontFamily: "var(--mono)", fontSize: 12, color: T.mid, lineHeight: 1.8, overflow: "auto", margin: 0 }}>
                {toTailwind(palette.shades, varName)}
              </pre>
            </div>
          )}
        </>
      )}
    </div>
  );
}
