import { useState, useEffect } from "react";
import { T } from "../../shared/theme";
import { Input, Btn, Row, Card, Label, CopyBtn } from "../../shared/ui";
import { formatDate, FORMAT_TOKENS, COMMON_ZONES, zoneSnapshot, dayOfYear, isoWeek, quarter, isLeapYear } from "./timeFormat";

const PRESETS = [
  { label: "Now",          val: () => String(Math.floor(Date.now() / 1000)) },
  { label: "Now (ms)",     val: () => String(Date.now()) },
  { label: "Start of day", val: () => { const d = new Date(); d.setHours(0, 0, 0, 0); return String(Math.floor(d.getTime() / 1000)); } },
  { label: "Unix epoch",   val: () => "0" },
  { label: "Y2K",          val: () => "946684800" },
];

const LOCAL_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

function parse(val) {
  val = val.trim();
  if (/^\d{10}$/.test(val)) return new Date(parseInt(val) * 1000);
  if (/^\d{13}$/.test(val)) return new Date(parseInt(val));
  const d = new Date(val);
  if (!isNaN(d)) return d;
  return null;
}

function FormatCard({ label, value }) {
  return (
    <div style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 6, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: T.dim, letterSpacing: "0.2em", marginBottom: 3 }}>{label.toUpperCase()}</div>
        <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: T.mid, wordBreak: "break-all" }}>{value}</div>
      </div>
      <CopyBtn text={String(value)} />
    </div>
  );
}

export function TimestampTool() {
  const [input,   setInput]   = useState(String(Math.floor(Date.now() / 1000)));
  const [now,     setNow]     = useState(Date.now());
  const [pattern, setPattern] = useState("YYYY-MM-DD HH:mm:ss");

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
    { label: "RFC 2822",       value: date.toUTCString() },
    { label: "Local",          value: date.toLocaleString() },
    { label: "Date only",      value: date.toISOString().slice(0, 10) },
    { label: "Time only",      value: date.toISOString().slice(11, 19) + " UTC" },
    { label: "Day of week",    value: date.toLocaleDateString(undefined, { weekday: "long" }) },
    { label: "Day of year",    value: `${dayOfYear(date)} / ${isLeapYear(date.getFullYear()) ? 366 : 365}` },
    { label: "ISO week",       value: (() => { const w = isoWeek(date); return `${w.year}-W${String(w.week).padStart(2, "0")}`; })() },
    { label: "Quarter",        value: `Q${quarter(date)} ${date.getFullYear()}` },
    { label: "Leap year",      value: isLeapYear(date.getFullYear()) ? "Yes" : "No" },
    { label: "Local UTC offset", value: `UTC${-date.getTimezoneOffset() >= 0 ? "+" : "-"}${String(Math.floor(Math.abs(date.getTimezoneOffset()) / 60)).padStart(2, "0")}:${String(Math.abs(date.getTimezoneOffset()) % 60).padStart(2, "0")}` },
    { label: "Relative", value: (() => {
      const diff = now - date.getTime(), abs = Math.abs(diff), sign = diff > 0 ? "ago" : "from now";
      if (abs < 60000)    return Math.floor(abs / 1000) + "s " + sign;
      if (abs < 3600000)  return Math.floor(abs / 60000) + "m " + sign;
      if (abs < 86400000) return Math.floor(abs / 3600000) + "h " + sign;
      return Math.floor(abs / 86400000) + "d " + sign;
    })() },
  ] : [];

  const zones = valid ? [LOCAL_ZONE, ...COMMON_ZONES.filter(z => z !== LOCAL_ZONE)].map(z => zoneSnapshot(date, z)) : [];

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
          {formats.map(({ label, value }) => <FormatCard key={label} label={label} value={value} />)}
        </div>
      )}

      {valid && (
        <Card>
          <Label>Custom Format</Label>
          <Row gap={10} style={{ alignItems: "stretch" }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <Input value={pattern} onChange={setPattern} placeholder="YYYY-MM-DD HH:mm:ss" />
            </div>
            <div style={{ flex: 2, minWidth: 260, display: "flex", alignItems: "center", gap: 8, background: T.s2, border: `1px solid ${T.border}`, borderRadius: 6, padding: "0 12px" }}>
              <span style={{ flex: 1, fontFamily: "var(--mono)", fontSize: 13, color: T.acc, wordBreak: "break-all" }}>
                {formatDate(date, pattern) || <span style={{ color: T.dim, fontStyle: "italic" }}>Invalid pattern</span>}
              </span>
              <CopyBtn text={formatDate(date, pattern)} />
            </div>
          </Row>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 10 }}>
            {FORMAT_TOKENS.map(([token, desc]) => (
              <span key={token} title={desc} style={{ fontFamily: "var(--mono)", fontSize: 10, color: T.dim, background: T.s2, border: `1px solid ${T.border}`, borderRadius: 4, padding: "3px 8px", cursor: "default" }}>
                <span style={{ color: T.acc2 }}>{token}</span> — {desc}
              </span>
            ))}
          </div>
        </Card>
      )}

      {valid && (
        <div>
          <Label>World Clock</Label>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {zones.map((z, i) => (
              <div key={z.zone} style={{ display: "flex", alignItems: "center", gap: 12, background: T.s2, border: `1px solid ${T.border}`, borderRadius: 6, padding: "8px 14px" }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: i === 0 ? T.acc : T.text, minWidth: 160 }}>
                  {z.zone}{i === 0 ? " (local)" : ""}
                </span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: T.mid, flex: 1 }}>{z.display}</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: T.dim, minWidth: 60, textAlign: "right" }}>{z.offset}</span>
                <CopyBtn text={`${z.display} ${z.offset}`} />
              </div>
            ))}
          </div>
        </div>
      )}

      <Card>
        <Label>Current Time</Label>
        <div style={{ fontFamily: "var(--mono)", fontSize: 14, color: T.acc }}>
          {new Date(now).toISOString().replace("T", " ").slice(0, 19)} UTC
        </div>
        <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: T.dim, marginTop: 4 }}>
          {Math.floor(now / 1000)} (unix) · {now} (ms) · {new Date(now).toLocaleDateString(undefined, { weekday: "long" })}
        </div>
      </Card>
    </div>
  );
}
