import { useState } from "react";
import { T } from "./theme";

// ─── Btn ─────────────────────────────────────────────────────────────────────
export function Btn({ children, onClick, variant = "default", small = false, disabled = false }) {
  const styles = {
    default: { background: T.s3,         border: `1px solid ${T.border2}`, color: T.mid   },
    accent:  { background: T.acc + "22", border: `1px solid ${T.acc}66`,  color: T.acc   },
    green:   { background: T.green+"18", border: `1px solid ${T.green}55`,color: T.green  },
    red:     { background: T.red  +"18", border: `1px solid ${T.red}55`,  color: T.red   },
  };
  const v = styles[variant] ?? styles.default;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...v,
        borderRadius: 5,
        fontSize: small ? 10 : 11,
        fontWeight: 700,
        letterSpacing: "0.1em",
        padding: small ? "4px 10px" : "7px 16px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        transition: "filter 0.15s",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.filter = "brightness(1.3)"; }}
      onMouseLeave={e => { e.currentTarget.style.filter = "none"; }}
    >
      {children}
    </button>
  );
}

// ─── Input ───────────────────────────────────────────────────────────────────
export function Input({ value, onChange, placeholder, type = "text" }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange?.(e.target.value)}
      placeholder={placeholder}
      spellCheck={false}
      style={{
        width: "100%",
        background: T.s2,
        border: `1px solid ${T.border}`,
        borderRadius: 6,
        color: T.text,
        fontSize: 13,
        padding: "9px 12px",
        outline: "none",
        transition: "border-color 0.15s",
      }}
      onFocus={e => (e.target.style.borderColor = T.border2)}
      onBlur={e  => (e.target.style.borderColor = T.border)}
    />
  );
}

// ─── Textarea ────────────────────────────────────────────────────────────────
export function Textarea({ value, onChange, placeholder, rows = 6, readOnly = false }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange?.(e.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      rows={rows}
      spellCheck={false}
      style={{
        width: "100%",
        background: T.s2,
        border: `1px solid ${T.border}`,
        borderRadius: 6,
        color: readOnly ? T.mid : T.text,
        fontFamily: "var(--mono)",
        fontSize: 12,
        padding: "12px 14px",
        lineHeight: 1.6,
        outline: "none",
        transition: "border-color 0.15s",
      }}
      onFocus={e => (e.target.style.borderColor = T.border2)}
      onBlur={e  => (e.target.style.borderColor = T.border)}
    />
  );
}

// ─── Label ───────────────────────────────────────────────────────────────────
export function Label({ children }) {
  return (
    <div style={{
      fontFamily: "var(--mono)",
      fontSize: 9,
      fontWeight: 700,
      letterSpacing: "0.25em",
      color: T.dim,
      marginBottom: 6,
      textTransform: "uppercase",
    }}>
      {children}
    </div>
  );
}

// ─── Card ────────────────────────────────────────────────────────────────────
export function Card({ children, style }) {
  return (
    <div style={{
      background: T.s1,
      border: `1px solid ${T.border}`,
      borderRadius: 8,
      padding: "16px 18px",
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── Row ─────────────────────────────────────────────────────────────────────
export function Row({ children, gap = 10 }) {
  return (
    <div style={{ display: "flex", gap, alignItems: "flex-start", flexWrap: "wrap" }}>
      {children}
    </div>
  );
}

// ─── CopyBtn ─────────────────────────────────────────────────────────────────
export function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <Btn small variant={copied ? "green" : "default"} onClick={copy}>
      {copied ? "✓ Copied" : "Copy"}
    </Btn>
  );
}

// ─── ErrorBox ────────────────────────────────────────────────────────────────
export function ErrorBox({ message, tip }) {
  return (
    <div style={{
      background: "#f5555512",
      border: "1px solid #f5555544",
      borderRadius: 6,
      padding: "12px 14px",
      color: "#fca5a5",
      fontSize: 12,
      lineHeight: 1.7,
    }}>
      <span style={{ color: "#f55b5b", marginRight: 8 }}>✗</span>
      {message}
      {tip && <div style={{ color: "#4e5170", marginTop: 6, fontSize: 11 }}>{tip}</div>}
    </div>
  );
}

// ─── OutputBox ───────────────────────────────────────────────────────────────
export function OutputBox({ children, maxHeight = 380 }) {
  return (
    <pre style={{
      background: "#14141e",
      border: "1px solid #22222f",
      borderRadius: 6,
      padding: "12px 14px",
      fontFamily: "var(--mono)",
      fontSize: 12,
      lineHeight: 1.7,
      overflow: "auto",
      maxHeight,
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
      color: "#7c809a",
      margin: 0,
    }}>
      {children}
    </pre>
  );
}

// ─── ResultBox ────────────────────────────────────────────────────────────────
export function ResultBox({ label, value, mono = true }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <Label>{label}</Label>
        {value && <CopyBtn text={value} />}
      </div>
      <div style={{
        background: "#14141e",
        border: "1px solid #22222f",
        borderRadius: 6,
        padding: "10px 14px",
        fontFamily: mono ? "var(--mono)" : "var(--sans)",
        fontSize: 13,
        color: "#7c809a",
        minHeight: 40,
        wordBreak: "break-all",
        lineHeight: 1.6,
        whiteSpace: "pre-wrap",
      }}>
        {value || <span style={{ color: "#4e5170", fontStyle: "italic" }}>—</span>}
      </div>
    </div>
  );
}
