import { useState, useEffect } from "react";
import { T } from "../../shared/theme";
import { Input, Card, Label, Btn } from "../../shared/ui";

const PRESETS = [
  { label: "Every minute",       expr: "* * * * *" },
  { label: "Every 5 min",        expr: "*/5 * * * *" },
  { label: "Every hour",         expr: "0 * * * *" },
  { label: "Daily at midnight",  expr: "0 0 * * *" },
  { label: "Daily at 9am",       expr: "0 9 * * *" },
  { label: "Weekdays at 9am",    expr: "0 9 * * 1-5" },
  { label: "Every Sunday",       expr: "0 0 * * 0" },
  { label: "1st of month",       expr: "0 0 1 * *" },
  { label: "Quarterly",          expr: "0 0 1 1,4,7,10 *" },
];

function parsePart(val, min, max, names = null) {
  if (val === "*") return null; // means "every"
  if (val.startsWith("*/")) {
    const step = parseInt(val.slice(2));
    return `every ${step} (from ${min})`;
  }
  const expand = (v) => {
    if (names && isNaN(v)) {
      const idx = names.findIndex(n => n.toLowerCase() === v.toLowerCase());
      return idx >= 0 ? idx : parseInt(v);
    }
    return parseInt(v);
  };
  if (val.includes(",")) return val.split(",").map(v => names ? (names[expand(v)] || v) : v).join(", ");
  if (val.includes("-")) {
    const [a, b] = val.split("-").map(expand);
    const from = names ? names[a] : a;
    const to   = names ? names[b] : b;
    return `${from}–${to}`;
  }
  const n = expand(val);
  return names ? (names[n] || val) : String(n);
}

const MONTHS = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function describeCron(expr) {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return null;
  const [min, hour, dom, month, dow] = parts;

  const p = {
    min:   parsePart(min,   0, 59),
    hour:  parsePart(hour,  0, 23),
    dom:   parsePart(dom,   1, 31),
    month: parsePart(month, 1, 12, MONTHS),
    dow:   parsePart(dow,   0, 6,  DAYS),
  };

  const parts2 = [];

  // minute/hour description
  if (min === "*" && hour === "*") {
    parts2.push("Every minute");
  } else if (min.startsWith("*/") && hour === "*") {
    parts2.push(`Every ${min.slice(2)} minutes`);
  } else if (hour === "*") {
    parts2.push(`At minute ${p.min} of every hour`);
  } else if (min === "0") {
    parts2.push(`At ${p.hour}:00`);
  } else {
    parts2.push(`At ${p.hour}:${String(min).padStart(2,"0")}`);
  }

  if (dow !== "*") parts2.push(`on ${p.dow}`);
  if (dom !== "*") parts2.push(`on day ${p.dom} of the month`);
  if (month !== "*") parts2.push(`in ${p.month}`);

  return parts2.join(", ");
}

function nextRuns(expr, count = 8) {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return [];
  const [minP, hourP, domP, monthP, dowP] = parts;

  function matches(val, n, min, max) {
    if (val === "*") return true;
    if (val.startsWith("*/")) { const s = parseInt(val.slice(2)); return (n - min) % s === 0; }
    if (val.includes(",")) return val.split(",").map(Number).includes(n);
    if (val.includes("-")) { const [a,b] = val.split("-").map(Number); return n >= a && n <= b; }
    return parseInt(val) === n;
  }

  const results = [];
  const d = new Date();
  d.setSeconds(0, 0);
  d.setMinutes(d.getMinutes() + 1);

  for (let i = 0; i < 50000 && results.length < count; i++) {
    if (
      matches(monthP, d.getMonth() + 1, 1, 12) &&
      matches(domP,   d.getDate(),       1, 31) &&
      matches(dowP,   d.getDay(),        0, 6)  &&
      matches(hourP,  d.getHours(),      0, 23) &&
      matches(minP,   d.getMinutes(),    0, 59)
    ) {
      results.push(new Date(d));
    }
    d.setMinutes(d.getMinutes() + 1);
  }
  return results;
}

export function CronTool() {
  const [expr,  setExpr]  = useState("0 9 * * 1-5");
  const [desc,  setDesc]  = useState("");
  const [runs,  setRuns]  = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const parts = expr.trim().split(/\s+/);
    if (parts.length !== 5) {
      setError("Cron expression must have exactly 5 fields: min hour dom month dow");
      setDesc(""); setRuns([]); return;
    }
    try {
      const d = describeCron(expr);
      const r = nextRuns(expr);
      setDesc(d); setRuns(r); setError(null);
    } catch(e) {
      setError(e.message); setDesc(""); setRuns([]);
    }
  }, [expr]);

  const fmtDate = (d) => d.toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  const fields = [
    { label: "MIN",   range: "0–59" },
    { label: "HOUR",  range: "0–23" },
    { label: "DOM",   range: "1–31" },
    { label: "MONTH", range: "1–12" },
    { label: "DOW",   range: "0–6"  },
  ];
  const parts = expr.trim().split(/\s+/);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <Label>Cron Expression</Label>
        <Input value={expr} onChange={setExpr} placeholder="* * * * *" />
      </div>

      {/* Field labels */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
        {fields.map(({ label, range }, i) => (
          <div key={label} style={{ background: T.s2, border: `1px solid ${parts[i] && parts[i] !== "*" ? T.acc + "55" : T.border}`, borderRadius: 5, padding: "8px 10px", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", color: T.dim, marginBottom: 3 }}>{label}</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 14, fontWeight: 700, color: parts[i] && parts[i] !== "*" ? T.acc : T.mid }}>{parts[i] || "?"}</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: T.dim, marginTop: 2 }}>{range}</div>
          </div>
        ))}
      </div>

      {error ? (
        <div style={{ background: T.red + "12", border: `1px solid ${T.red}44`, borderRadius: 6, padding: "10px 14px", color: "#fca5a5", fontSize: 12 }}>{error}</div>
      ) : (
        <>
          {desc && (
            <Card>
              <Label>Description</Label>
              <div style={{ fontFamily: "var(--sans)", fontSize: 15, color: T.text }}>{desc}</div>
            </Card>
          )}

          {runs.length > 0 && (
            <div>
              <Label>Next {runs.length} Runs</Label>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {runs.map((d, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, background: T.s2, border: `1px solid ${T.border}`, borderRadius: 5, padding: "8px 14px" }}>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: T.dim, width: 18, textAlign: "right" }}>#{i+1}</div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: T.mid }}>{fmtDate(d)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div>
        <Label>Presets</Label>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {PRESETS.map(({ label, expr: e }) => (
            <Btn key={e} small variant={expr === e ? "accent" : "default"} onClick={() => setExpr(e)}>{label}</Btn>
          ))}
        </div>
      </div>
    </div>
  );
}
