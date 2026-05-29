import { useState } from "react";
import { T } from "../../shared/theme";
import { Input, Row, Card, Label, CopyBtn } from "../../shared/ui";

function hexToRgb(hex) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? { r: parseInt(r[1], 16), g: parseInt(r[2], 16), b: parseInt(r[3], 16) } : null;
}
function hexToHsl(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  let { r, g, b } = rgb;
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function ColorTool() {
  const [hex, setHex]     = useState("#7c6cf5");
  const [input, setInput] = useState("#7c6cf5");

  const rgb = hexToRgb(hex);
  const hsl = hexToHsl(hex);

  function parseInput(val) {
    setInput(val);
    const v = val.trim();
    if (/^#[0-9a-f]{6}$/i.test(v))  { setHex(v); return; }
    if (/^[0-9a-f]{6}$/i.test(v))   { setHex("#" + v); return; }
    const rgbM = v.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/i);
    if (rgbM) {
      const h = "#" + [1, 2, 3].map((i) => parseInt(rgbM[i]).toString(16).padStart(2, "0")).join("");
      setHex(h);
    }
  }

  const formats = rgb && hsl ? [
    { label: "HEX",           value: hex },
    { label: "RGB",           value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
    { label: "HSL",           value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
    { label: "RGBA",          value: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)` },
    { label: "CSS HSL",       value: `hsl(${hsl.h}deg ${hsl.s}% ${hsl.l}%)` },
    { label: "TAILWIND-LIKE", value: `[${hex}]` },
  ] : [];

  const luminance    = rgb ? (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255 : 0.5;
  const textOnColor  = luminance > 0.5 ? "#000" : "#fff";
  const shades       = hsl ? Array.from({ length: 9 }, (_, i) => { const l = 10 + i * 10; return { l, hex: `hsl(${hsl.h}, ${hsl.s}%, ${l}%)` }; }) : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Row>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
          <input
            type="color"
            value={hex}
            onChange={(e) => { setHex(e.target.value); setInput(e.target.value); }}
            style={{ width: 80, height: 80, border: `2px solid ${T.border2}`, borderRadius: 8, cursor: "pointer", padding: 0, background: "none" }}
          />
          <div style={{ width: 80, height: 40, borderRadius: 6, background: hex, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: textOnColor, opacity: 0.7 }}>Aa</span>
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
          <div>
            <Label>Input (HEX, RGB, CSS)</Label>
            <Input value={input} onChange={parseInput} placeholder="#7c6cf5 or rgb(124, 108, 245)" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {formats.map(({ label, value }) => (
              <div key={label} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 5, padding: "8px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: T.dim, letterSpacing: "0.2em", marginBottom: 2 }}>{label}</div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: T.mid }}>{value}</div>
                </div>
                <CopyBtn text={value} />
              </div>
            ))}
          </div>
        </div>
      </Row>

      {shades.length > 0 && (
        <div>
          <Label>Shades</Label>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {shades.map(({ l, hex: sh }) => (
              <div
                key={l}
                title={sh}
                onClick={() => { setHex(sh); setInput(sh); }}
                style={{ flex: "1 1 40px", height: 40, background: sh, borderRadius: 4, cursor: "pointer", display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 4, border: sh === hex ? `2px solid ${T.text}` : "2px solid transparent", transition: "transform .1s" }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scaleY(1.1)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
              >
                <span style={{ fontFamily: "var(--mono)", fontSize: 8, color: l > 50 ? "#000" : "#fff", opacity: 0.6 }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {rgb && (
        <Row>
          {[
            { label: "Contrast on White", bg: "#fff", contrast: (1.05 / (luminance + 0.05)).toFixed(1), pass: luminance < 0.5 },
            { label: "Contrast on Black", bg: "#000", contrast: ((luminance + 0.05) / 0.05).toFixed(1), pass: luminance > 0.4 },
          ].map(({ label, bg, contrast, pass }) => (
            <Card key={label} style={{ flex: 1 }}>
              <Label>{label}</Label>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <div style={{ background: bg, padding: "8px 14px", borderRadius: 5, fontFamily: "var(--mono)", fontSize: 14, color: hex, fontWeight: 700 }}>Aa</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 20, fontWeight: 700, color: pass ? T.green : T.orange }}>{contrast}:1</div>
              </div>
            </Card>
          ))}
        </Row>
      )}
    </div>
  );
}
