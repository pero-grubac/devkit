import { useState, useEffect } from "react";
import { T } from "../../shared/theme";
import { Input, Btn, Row, Card, Label, CopyBtn } from "../../shared/ui";

const PRESETS = [
  { label: "Now",          val: () => String(Math.floor(Date.now() / 1000)) },
  { label: "Now (ms)",     val: () => String(Date.now()) },
  { label: "Start of day", val: () => { const d = new Date(); d.setHours(0, 0, 0, 0); return String(Math.floor(d.getTime() / 1000)); } },
  { label: "Unix epoch",   val: () => "0" },
  { label: "Y2K",          val: () => "946684800" },
];

function parse(val) {
  val = val.trim();
  if (/^\d{10}$/.test(val)) return new Date(parseInt(val) * 1000);
  if (/^\d{13}$/.test(val)) return new Date(parseInt(val));
  const d = new Date(val);
  if (!isNaN(d)) return d;
  return null;
}

export function TimestampTool() {
  const [input, setInput] = useState(String(Math.floor(Date.now() / 1000)));
  const [now, setNow]     = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const date  = parse(input);
  const valid = date && !isNaN(date);

  const formats = valid ? [
    { label: "Unix (seconds)", value: String(Math.floor(date.getTime() / 1000)) },
    { label: "Unix (ms)",      value: String(date.getTime()) },
    { label: "ISO 8601",       value: date.toISOString() },
    { label: "UTC String",     value: date.toUTCString() },
    { label: "Local",          value: date.toLocaleString() },
    { label: "Date only",      value: date.toISOString().slice(0, 10) },
    { label: "Time only",      value: date.toISOString().slice(11, 19) + " UTC" },
    { label: "Relative", value: (() => {
      const diff = now - date.getTime(), abs = Math.abs(diff), sign = diff > 0 ? "ago" : "from now";
      if (abs < 60000)    return Math.floor(abs / 1000) + "s " + sign;
      if (abs < 3600000)  return Math.floor(abs / 60000) + "m " + sign;
      if (abs < 86400000) return Math.floor(abs / 3600000) + "h " + sign;
      return Math.floor(abs / 86400000) + "d " + sign;
    })() },
  ] : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <Label>Input — Unix timestamp, ISO string, or any date format</Label>
        <Input value={input} onChange={setInput} placeholder="1716000000 or 2024-05-21T00:00:00Z" />
        {input && !valid && <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: T.red, marginTop: 5 }}>✗ Could not parse date</div>}
      </div>

      <div>
        <Label>Quick Presets</Label>
        <Row gap={6}>
          {PRESETS.map((p) => (<Btn key={p.label} small onClick={() => setInput(p.val())}>{p.label}</Btn>))}
        </Row>
      </div>

      {valid && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 8 }}>
          {formats.map(({ label, value }) => (
            <div key={label} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 6, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: T.dim, letterSpacing: "0.2em", marginBottom: 3 }}>{label.toUpperCase()}</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: T.mid }}>{value}</div>
              </div>
              <CopyBtn text={value} />
            </div>
          ))}
        </div>
      )}

      <Card>
        <Label>Current Time</Label>
        <div style={{ fontFamily: "var(--mono)", fontSize: 14, color: T.acc }}>
          {new Date(now).toISOString().replace("T", " ").slice(0, 19)} UTC
        </div>
        <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: T.dim, marginTop: 4 }}>
          {Math.floor(now / 1000)} (unix) · {now} (ms)
        </div>
      </Card>
    </div>
  );
}
