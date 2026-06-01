import { useState, useCallback } from "react";
import { T } from "../../shared/theme";
import { SaveBtn } from "../../shared/SaveBtn";
import { Row, Btn, Card, Label, CopyBtn } from "../../shared/ui";

const SETS = {
  upper:   { chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ", label: "A–Z" },
  lower:   { chars: "abcdefghijklmnopqrstuvwxyz", label: "a–z" },
  digits:  { chars: "0123456789",                 label: "0–9" },
  symbols: { chars: "!@#$%^&*()-_=+[]{}|;:,.<>?", label: "!@#" },
  ambig:   { chars: "O0Il1",                       label: "Excl. ambiguous" },
};

function entropy(length, poolSize) {
  return (length * Math.log2(poolSize)).toFixed(1);
}

function entropyColor(bits) {
  if (bits < 40) return T.red;
  if (bits < 60) return T.orange;
  if (bits < 80) return T.yellow;
  return T.green;
}

function entropyLabel(bits) {
  if (bits < 40) return "Weak";
  if (bits < 60) return "Fair";
  if (bits < 80) return "Strong";
  return "Very Strong";
}

function generatePassword(length, opts) {
  let pool = "";
  if (opts.upper)   pool += SETS.upper.chars;
  if (opts.lower)   pool += SETS.lower.chars;
  if (opts.digits)  pool += SETS.digits.chars;
  if (opts.symbols) pool += SETS.symbols.chars;
  if (opts.noAmbig) pool = pool.split("").filter(c => !SETS.ambig.chars.includes(c)).join("");
  if (!pool) return "";
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(n => pool[n % pool.length]).join("");
}

export function PasswordTool() {
  const [length,  setLength]  = useState(20);
  const [opts,    setOpts]    = useState({ upper: true, lower: true, digits: true, symbols: true, noAmbig: false });
  const [batch,   setBatch]   = useState(5);
  const [passwords, setPasswords] = useState([]);

  const pool = (() => {
    let p = "";
    if (opts.upper)   p += SETS.upper.chars;
    if (opts.lower)   p += SETS.lower.chars;
    if (opts.digits)  p += SETS.digits.chars;
    if (opts.symbols) p += SETS.symbols.chars;
    if (opts.noAmbig) p = p.split("").filter(c => !SETS.ambig.chars.includes(c)).join("");
    return p;
  })();

  const bits = pool.length ? parseFloat(entropy(length, pool.length)) : 0;

  const generate = useCallback(() => {
    setPasswords(Array.from({ length: batch }, () => generatePassword(length, opts)));
  }, [length, opts, batch]);

  const toggle = (key) => setOpts(o => ({ ...o, [key]: !o[key] }));

  const SliderRow = ({ label, value, min, max, onChange }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: T.dim, width: 80, letterSpacing: "0.15em" }}>{label}</div>
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(+e.target.value)}
        style={{ flex: 1, accentColor: T.acc }} />
      <div style={{ fontFamily: "var(--mono)", fontSize: 13, fontWeight: 700, color: T.acc, width: 28, textAlign: "right" }}>{value}</div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Row>
        <Card style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
          <SliderRow label="LENGTH" value={length} min={4} max={128} onChange={setLength} />
          <SliderRow label="BATCH"  value={batch}  min={1} max={20}  onChange={setBatch}  />

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { key: "upper",   label: "A–Z" },
              { key: "lower",   label: "a–z" },
              { key: "digits",  label: "0–9" },
              { key: "symbols", label: "!@#" },
              { key: "noAmbig",label: "No O0Il" },
            ].map(({ key, label }) => (
              <Btn key={key} small variant={opts[key] ? "accent" : "default"} onClick={() => toggle(key)}>
                {label}
              </Btn>
            ))}
          </div>

          <Btn variant="accent" onClick={generate}>GENERATE</Btn>
        </Card>

        <Card style={{ display: "flex", flexDirection: "column", gap: 6, justifyContent: "center", minWidth: 160, alignItems: "center" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.25em", color: T.dim }}>ENTROPY</div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 36, fontWeight: 700, color: entropyColor(bits) }}>{bits}</div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: entropyColor(bits) }}>bits · {entropyLabel(bits)}</div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: T.dim, marginTop: 4 }}>pool: {pool.length} chars</div>
        </Card>
      </Row>

      {passwords.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <Label>Generated Passwords</Label>
          {passwords.map((pw, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, background: T.s2, border: `1px solid ${T.border}`, borderRadius: 6, padding: "10px 14px" }}>
              <div style={{ flex: 1, fontFamily: "var(--mono)", fontSize: 13, color: T.text, letterSpacing: "0.04em", wordBreak: "break-all" }}>{pw}</div>
              <CopyBtn text={pw} /><SaveBtn content={pw} toolId="password" toolLabel="Password" defaultTitle={`Password ${i+1}`} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
