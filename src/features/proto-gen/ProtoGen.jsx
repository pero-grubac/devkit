import { useState, useEffect } from "react";
import { T } from "../../shared/theme";
import { Row, Btn, Card, Label, CopyBtn } from "../../shared/ui";
import { SaveBtn } from "../../shared/SaveBtn";
import { LANG_MAP, PARSERS, toProto, UNIVERSAL_SCALARS } from "./parser";
import { ORM_MAP } from "./ormParser";

// ─── Mode tabs ────────────────────────────────────────────────────────────────
const MODES = [
  { id: "plain", label: "Plain Class" },
  { id: "orm", label: "ORM / Schema" },
  { id: "custom", label: "Custom Builder" },
];

const PLAIN_LANGS = Object.keys(LANG_MAP);
const ORM_KEYS = Object.keys(ORM_MAP);

// Group ORM entries by group label
const ORM_GROUPS = ORM_KEYS.reduce((acc, k) => {
  const g = ORM_MAP[k].group;
  if (!acc[g]) acc[g] = [];
  acc[g].push(k);
  return acc;
}, {});

// Proto scalar types for Custom Builder dropdown
const PROTO_SCALARS = [
  "string",
  "int32",
  "int64",
  "uint32",
  "uint64",
  "float",
  "double",
  "bool",
  "bytes",
  "sint32",
  "sint64",
  "fixed32",
  "fixed64",
  "google.protobuf.Timestamp",
  "google.protobuf.Empty",
];

const FIELD_MODIFIERS = [
  { value: "", label: "— none —" },
  { value: "repeated", label: "repeated" },
  { value: "optional", label: "optional" },
];

// ─── Syntax highlight ─────────────────────────────────────────────────────────
function highlightProto(plainText) {
  return plainText
    .split("\n")
    .map((line) => {
      let l = line
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      const ci = l.indexOf("//");
      if (ci !== -1) {
        return (
          tokenise(l.slice(0, ci)) +
          `<span style="color:#4e5170;font-style:italic">${l.slice(ci)}</span>`
        );
      }
      return tokenise(l);
    })
    .join("\n");
}

function tokenise(l) {
  const parts = [];
  const qRe = /"([^"]*)"/g;
  let lastIdx = 0,
    m;
  while ((m = qRe.exec(l)) !== null) {
    if (m.index > lastIdx)
      parts.push({ type: "code", text: l.slice(lastIdx, m.index) });
    parts.push({ type: "string", text: m[1] });
    lastIdx = m.index + m[0].length;
  }
  if (lastIdx < l.length) parts.push({ type: "code", text: l.slice(lastIdx) });

  return parts
    .map((p) => {
      if (p.type === "string")
        return `<span style="color:#86efac">"${p.text}"</span>`;
      let t = p.text;
      t = t.replace(
        /(=\s*)(\d+)(;)/g,
        `$1<span style="color:#f59e0b">$2</span>$3`,
      );
      t = t.replace(
        /\b(syntax|package|import|option|message|service|rpc|returns|repeated|optional|map|oneof|enum|reserved|proto3|proto2)\b/g,
        `<span style="color:#7c6cf5;font-weight:700">$1</span>`,
      );
      t = t.replace(
        /\b(string|int32|int64|uint32|uint64|sint32|sint64|fixed32|fixed64|sfixed32|sfixed64|float|double|bool|bytes)\b/g,
        `<span style="color:#3dd68c">$1</span>`,
      );
      t = t.replace(
        /(message|service|rpc|enum)(<\/span>)?\s+([A-Z]\w*)/g,
        `$1$2 <span style="color:#5b8af5;font-weight:700">$3</span>`,
      );
      return t;
    })
    .join("");
}

// ─── Shared helpers ───────────────────────────────────────────────────────────
function toSnake(s) {
  return s.replace(/([A-Z])/g, (m) => "_" + m.toLowerCase()).replace(/^_/, "");
}

function buildProtoFromMessages(messages, pkgName, addService) {
  const needsTimestamp = messages.some((m) =>
    m.fields.some((f) => f.rawType === "google.protobuf.Timestamp"),
  );
  const needsEmpty = messages.some((m) =>
    m.fields.some((f) => f.rawType === "google.protobuf.Empty"),
  );
  const needsStruct = messages.some((m) =>
    m.fields.some((f) => f.rawType === "google.protobuf.Struct"),
  );

  const lines = [];
  lines.push(`syntax = "proto3";`, "");
  lines.push(`package ${pkgName || "mypackage"};`, "");
  if (needsTimestamp) lines.push(`import "google/protobuf/timestamp.proto";`);
  if (needsEmpty) lines.push(`import "google/protobuf/empty.proto";`);
  if (needsStruct) lines.push(`import "google/protobuf/struct.proto";`);
  if (needsTimestamp || needsEmpty || needsStruct) lines.push("");

  for (const msg of messages) {
    lines.push(`message ${msg.name} {`);
    msg.fields.forEach((f, i) => {
      if (!f.name) return;
      const name = toSnake(f.name);
      const mod = f.modifier ? f.modifier + " " : f.optional ? "optional " : "";
      lines.push(`  ${mod}${f.rawType} ${name} = ${i + 1};`);
    });
    lines.push("}", "");
  }

  if (addService && messages.length > 0) {
    const last = messages[messages.length - 1];
    const n = last.name;
    lines.push(
      `service ${n}Service {`,
      `  rpc Get${n}(Get${n}Request) returns (${n});`,
      `  rpc Create${n}(${n}) returns (${n});`,
      `  rpc Update${n}(${n}) returns (${n});`,
      `  rpc Delete${n}(Delete${n}Request) returns (google.protobuf.Empty);`,
      `  rpc List${n}s(List${n}sRequest) returns (${n}ListResponse);`,
      `}`,
      "",
      `message Get${n}Request { string id = 1; }`,
      "",
      `message Delete${n}Request { string id = 1; }`,
      "",
      `message List${n}sRequest { int32 page = 1; int32 page_size = 2; }`,
      "",
      `message ${n}ListResponse { repeated ${n} items = 1; int32 total = 2; }`,
    );
  }

  return lines.join("\n").trim();
}

// ─── Preview Modal ────────────────────────────────────────────────────────────
function PreviewModal({ output, pkgName, onClose }) {
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 200,
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(2px)",
        }}
      />
      <div
        style={{
          position: "fixed",
          zIndex: 201,
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          width: "min(860px,92vw)",
          maxHeight: "82vh",
          background: T.s1,
          border: `1px solid ${T.border2}`,
          borderRadius: 10,
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 20px",
            borderBottom: `1px solid ${T.border}`,
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: 11,
                fontWeight: 700,
                color: T.acc,
              }}
            >
              {pkgName}.proto
            </span>
            <span
              style={{ fontFamily: "var(--mono)", fontSize: 9, color: T.dim }}
            >
              {output.split("\n").length} lines · {output.length} chars
            </span>
          </div>
          <Row gap={8}>
            <CopyBtn text={output} />
            <SaveBtn
              content={output}
              toolId="proto-gen"
              toolLabel="Proto"
              defaultTitle={`${pkgName}.proto`}
            />
            <button
              onClick={onClose}
              style={{
                background: T.s3,
                border: `1px solid ${T.border2}`,
                color: T.mid,
                borderRadius: 5,
                fontFamily: "var(--mono)",
                fontSize: 13,
                padding: "4px 10px",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </Row>
        </div>
        <pre
          style={{
            flex: 1,
            overflow: "auto",
            margin: 0,
            padding: "20px 24px",
            fontFamily: "var(--mono)",
            fontSize: 13,
            lineHeight: 1.75,
            color: T.mid,
            whiteSpace: "pre",
            background: "transparent",
          }}
          dangerouslySetInnerHTML={{ __html: highlightProto(output) }}
        />
      </div>
    </>
  );
}

// ─── Shared output panel ──────────────────────────────────────────────────────
function OutputPanel({ output, error, pkgName, onPreview }) {
  const iStyle = {
    background: T.s2,
    border: `1px solid ${T.border}`,
    borderRadius: 6,
    padding: "12px 14px",
    fontFamily: "var(--mono)",
    fontSize: 12,
    lineHeight: 1.7,
    overflow: "auto",
    minHeight: 180,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    color: T.mid,
    margin: 0,
  };
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Label>Output — .proto</Label>
        <Row gap={6}>
          {output && (
            <Btn small variant="accent" onClick={onPreview}>
              👁 Preview
            </Btn>
          )}
          {output && <CopyBtn text={output} />}
          <SaveBtn
            content={output}
            toolId="proto-gen"
            toolLabel="Proto"
            defaultTitle={`${pkgName}.proto`}
          />
        </Row>
      </div>
      {error ? (
        <div
          style={{
            background: T.red + "12",
            border: `1px solid ${T.red}44`,
            borderRadius: 6,
            padding: "12px 14px",
            color: "#fca5a5",
            fontFamily: "var(--mono)",
            fontSize: 12,
            lineHeight: 1.7,
          }}
        >
          ✗ {error}
        </div>
      ) : (
        <pre
          style={iStyle}
          dangerouslySetInnerHTML={{
            __html: output
              ? highlightProto(output)
              : `<span style="color:${T.dim};font-style:italic">Proto output appears here…</span>`,
          }}
        />
      )}
    </div>
  );
}

// ─── Plain class mode ─────────────────────────────────────────────────────────
function PlainMode({ pkgName, addService }) {
  const [lang, setLang] = useState("python");
  const [input, setInput] = useState(LANG_MAP.python.placeholder);
  const [output, setOutput] = useState("");
  const [error, setError] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      setWarnings([]);
      return;
    }
    try {
      const messages = PARSERS[lang](input);
      if (messages.length === 0) {
        setError("No classes/structs found.");
        setOutput("");
        return;
      }
      const typeMap = LANG_MAP[lang].map;
      const warns = [];
      const known = new Set(messages.map((m) => m.name));
      for (const msg of messages) {
        for (const f of msg.fields) {
          const c = f.rawType
            .replace(/^(?:List|Vec|Array)\[?:?<?\[?/, "")
            .replace(/[\]>)]+$/, "")
            .trim()
            .split(/[, ]+/)[0];
          if (
            !typeMap[f.rawType] &&
            !typeMap[c] &&
            !known.has(c) &&
            !UNIVERSAL_SCALARS[c] &&
            !UNIVERSAL_SCALARS[f.rawType]
          )
            warns.push(
              `"${msg.name}.${f.name}" — unknown type "${f.rawType}", treated as "${c}"`,
            );
        }
      }
      setWarnings(warns);
      setOutput(
        toProto(messages, typeMap, { packageName: pkgName, addService }),
      );
      setError(null);
    } catch (e) {
      setError(e.message);
      setOutput("");
    }
  }, [input, lang, pkgName, addService]);

  const taStyle = {
    width: "100%",
    background: T.s2,
    border: `1px solid ${T.border}`,
    borderRadius: 6,
    color: T.text,
    fontFamily: "var(--mono)",
    fontSize: 12,
    padding: "12px 14px",
    lineHeight: 1.6,
    outline: "none",
    transition: "border-color .15s",
    resize: "vertical",
  };

  return (
    <>
      {preview && (
        <PreviewModal
          output={output}
          pkgName={pkgName}
          onClose={() => setPreview(false)}
        />
      )}
      <div>
        <Label>Language</Label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {PLAIN_LANGS.map((l) => (
            <Btn
              key={l}
              small
              variant={lang === l ? "accent" : "default"}
              onClick={() => {
                setLang(l);
                setInput(LANG_MAP[l].placeholder);
              }}
            >
              {LANG_MAP[l].label}
            </Btn>
          ))}
        </div>
      </div>
      <Row>
        <div
          style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}
        >
          <Label>Input — {LANG_MAP[lang].label}</Label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            rows={22}
            style={taStyle}
            onFocus={(e) => (e.target.style.borderColor = T.border2)}
            onBlur={(e) => (e.target.style.borderColor = T.border)}
          />
        </div>
        <OutputPanel
          output={output}
          error={error}
          pkgName={pkgName}
          onPreview={() => setPreview(true)}
        />
      </Row>
      {warnings.length > 0 && (
        <div
          style={{
            background: T.orange + "12",
            border: `1px solid ${T.orange}44`,
            borderRadius: 6,
            padding: "12px 14px",
          }}
        >
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: 9,
              letterSpacing: "0.2em",
              color: T.orange,
              marginBottom: 6,
            }}
          >
            ⚠ TYPE WARNINGS
          </div>
          {warnings.map((w, i) => (
            <div
              key={i}
              style={{
                fontFamily: "var(--mono)",
                fontSize: 11,
                color: T.orange + "cc",
                lineHeight: 1.7,
              }}
            >
              • {w}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ─── ORM mode ─────────────────────────────────────────────────────────────────
function OrmMode({ pkgName, addService }) {
  const [ormKey, setOrmKey] = useState("sqlalchemy");
  const [input, setInput] = useState(ORM_MAP.sqlalchemy.placeholder);
  const [output, setOutput] = useState("");
  const [error, setError] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      setWarnings([]);
      return;
    }
    try {
      const orm = ORM_MAP[ormKey];
      const messages = orm.parser(input);
      if (messages.length === 0) {
        setError(
          "No models found. Check that your input matches the selected ORM format.",
        );
        setOutput("");
        return;
      }

      // Build warnings for fields that stayed as unknown message types
      const warns = [];
      const SCALARS = new Set([
        "int32",
        "int64",
        "uint32",
        "uint64",
        "sint32",
        "sint64",
        "fixed32",
        "fixed64",
        "sfixed32",
        "sfixed64",
        "float",
        "double",
        "bool",
        "string",
        "bytes",
        "google.protobuf.Timestamp",
        "google.protobuf.Empty",
      ]);
      const knownMsgs = new Set(messages.map((m) => m.name));
      for (const msg of messages) {
        for (const f of msg.fields) {
          if (!SCALARS.has(f.rawType) && !knownMsgs.has(f.rawType))
            warns.push(
              `"${msg.name}.${f.name}" — type "${f.rawType}" treated as message reference`,
            );
        }
      }
      setWarnings(warns);
      setOutput(buildProtoFromMessages(messages, pkgName, addService));
      setError(null);
    } catch (e) {
      setError(e.message);
      setOutput("");
    }
  }, [input, ormKey, pkgName, addService]);

  const taStyle = {
    width: "100%",
    background: T.s2,
    border: `1px solid ${T.border}`,
    borderRadius: 6,
    color: T.text,
    fontFamily: "var(--mono)",
    fontSize: 12,
    padding: "12px 14px",
    lineHeight: 1.6,
    outline: "none",
    transition: "border-color .15s",
    resize: "vertical",
  };

  return (
    <>
      {preview && (
        <PreviewModal
          output={output}
          pkgName={pkgName}
          onClose={() => setPreview(false)}
        />
      )}
      <div>
        <Label>Framework / ORM</Label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {Object.entries(ORM_GROUPS).map(([group, keys]) => (
            <div
              key={group}
              style={{ display: "flex", flexDirection: "column", gap: 5 }}
            >
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 8,
                  letterSpacing: "0.2em",
                  color: T.dim,
                  textTransform: "uppercase",
                }}
              >
                {group}
              </div>
              <div style={{ display: "flex", gap: 5 }}>
                {keys.map((k) => (
                  <Btn
                    key={k}
                    small
                    variant={ormKey === k ? "accent" : "default"}
                    onClick={() => {
                      setOrmKey(k);
                      setInput(ORM_MAP[k].placeholder);
                    }}
                  >
                    {ORM_MAP[k].label}
                  </Btn>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Row>
        <div
          style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}
        >
          <Label>Input — {ORM_MAP[ormKey].label} model</Label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            rows={22}
            style={taStyle}
            onFocus={(e) => (e.target.style.borderColor = T.border2)}
            onBlur={(e) => (e.target.style.borderColor = T.border)}
          />
        </div>
        <OutputPanel
          output={output}
          error={error}
          pkgName={pkgName}
          onPreview={() => setPreview(true)}
        />
      </Row>
      {warnings.length > 0 && (
        <div
          style={{
            background: T.orange + "12",
            border: `1px solid ${T.orange}44`,
            borderRadius: 6,
            padding: "12px 14px",
          }}
        >
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: 9,
              letterSpacing: "0.2em",
              color: T.orange,
              marginBottom: 6,
            }}
          >
            ⚠ TYPE NOTES
          </div>
          {warnings.map((w, i) => (
            <div
              key={i}
              style={{
                fontFamily: "var(--mono)",
                fontSize: 11,
                color: T.orange + "cc",
                lineHeight: 1.7,
              }}
            >
              • {w}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ─── Custom Builder ───────────────────────────────────────────────────────────
function CustomMode({ pkgName, addService }) {
  const [msgName, setMsgName] = useState("MyMessage");
  const [fields, setFields] = useState([
    { id: 1, name: "id", type: "int32", modifier: "", customType: "" },
    { id: 2, name: "name", type: "string", modifier: "", customType: "" },
    { id: 3, name: "email", type: "string", modifier: "", customType: "" },
    {
      id: 4,
      name: "tags",
      type: "string",
      modifier: "repeated",
      customType: "",
    },
  ]);
  const [nextId, setNextId] = useState(5);
  const [output, setOutput] = useState("");
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (!msgName.trim()) {
      setOutput("");
      return;
    }
    const messages = [
      {
        name: msgName.trim(),
        fields: fields
          .filter((f) => f.name.trim())
          .map((f) => ({
            name: f.name,
            rawType:
              f.type === "__custom__"
                ? f.customType.trim() || "string"
                : f.type,
            modifier: f.modifier || undefined,
          })),
      },
    ];
    setOutput(buildProtoFromMessages(messages, pkgName, addService));
  }, [fields, msgName, pkgName, addService]);

  const add = () => {
    setFields((f) => [
      ...f,
      { id: nextId, name: "", type: "string", modifier: "", customType: "" },
    ]);
    setNextId((n) => n + 1);
  };
  const del = (id) => setFields((f) => f.filter((x) => x.id !== id));
  const upd = (id, k, v) =>
    setFields((f) => f.map((x) => (x.id === id ? { ...x, [k]: v } : x)));
  const move = (id, d) => {
    const i = fields.findIndex((f) => f.id === id),
      j = i + d;
    if (j < 0 || j >= fields.length) return;
    const a = [...fields];
    [a[i], a[j]] = [a[j], a[i]];
    setFields(a);
  };

  const sel = {
    background: T.s2,
    border: `1px solid ${T.border}`,
    borderRadius: 5,
    color: T.text,
    fontFamily: "var(--mono)",
    fontSize: 11,
    padding: "5px 8px",
    outline: "none",
    cursor: "pointer",
  };
  const inp = {
    background: T.s2,
    border: `1px solid ${T.border}`,
    borderRadius: 5,
    color: T.text,
    fontFamily: "var(--mono)",
    fontSize: 11,
    padding: "5px 8px",
    outline: "none",
    transition: "border-color .15s",
  };

  return (
    <>
      {preview && (
        <PreviewModal
          output={output}
          pkgName={pkgName}
          onClose={() => setPreview(false)}
        />
      )}

      <div>
        <Label>Message Name</Label>
        <input
          value={msgName}
          onChange={(e) => setMsgName(e.target.value)}
          placeholder="MyMessage"
          style={{
            ...inp,
            fontSize: 14,
            fontWeight: 700,
            padding: "8px 12px",
            width: 280,
          }}
          onFocus={(e) => (e.target.style.borderColor = T.border2)}
          onBlur={(e) => (e.target.style.borderColor = T.border)}
        />
      </div>

      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Label>Fields</Label>
          <Btn small onClick={add}>
            + Add field
          </Btn>
        </div>

        {/* Headers */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "28px 1fr 170px 110px 1fr 60px",
            gap: 6,
            marginBottom: 5,
            padding: "0 4px",
          }}
        >
          {["#", "Field Name", "Type", "Modifier", "Custom Type", ""].map(
            (h) => (
              <div
                key={h}
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 8,
                  letterSpacing: "0.18em",
                  color: T.dim,
                  textTransform: "uppercase",
                }}
              >
                {h}
              </div>
            ),
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {fields.map((f, idx) => (
            <div
              key={f.id}
              style={{
                display: "grid",
                gridTemplateColumns: "28px 1fr 170px 110px 1fr 60px",
                gap: 6,
                alignItems: "center",
                background: T.s2,
                border: `1px solid ${T.border}`,
                borderRadius: 6,
                padding: "6px 8px",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 10,
                  color: T.dim,
                  textAlign: "center",
                }}
              >
                {idx + 1}
              </div>
              <input
                value={f.name}
                onChange={(e) => upd(f.id, "name", e.target.value)}
                placeholder="field_name"
                style={{ ...inp, width: "100%" }}
                onFocus={(e) => (e.target.style.borderColor = T.border2)}
                onBlur={(e) => (e.target.style.borderColor = T.border)}
              />
              <select
                value={f.type}
                onChange={(e) => upd(f.id, "type", e.target.value)}
                style={{ ...sel, width: "100%" }}
              >
                <optgroup label="Scalar">
                  {PROTO_SCALARS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Custom">
                  <option value="__custom__">custom message…</option>
                </optgroup>
              </select>
              <select
                value={f.modifier}
                onChange={(e) => upd(f.id, "modifier", e.target.value)}
                style={{ ...sel, width: "100%" }}
              >
                {FIELD_MODIFIERS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <input
                value={f.customType}
                onChange={(e) => upd(f.id, "customType", e.target.value)}
                placeholder={f.type === "__custom__" ? "MessageName" : "—"}
                disabled={f.type !== "__custom__"}
                style={{
                  ...inp,
                  width: "100%",
                  opacity: f.type === "__custom__" ? 1 : 0.3,
                }}
                onFocus={(e) => (e.target.style.borderColor = T.border2)}
                onBlur={(e) => (e.target.style.borderColor = T.border)}
              />
              <div style={{ display: "flex", gap: 3 }}>
                <button
                  onClick={() => move(f.id, -1)}
                  disabled={idx === 0}
                  style={{
                    ...sel,
                    padding: "3px 5px",
                    opacity: idx === 0 ? 0.3 : 1,
                  }}
                >
                  ↑
                </button>
                <button
                  onClick={() => move(f.id, 1)}
                  disabled={idx === fields.length - 1}
                  style={{
                    ...sel,
                    padding: "3px 5px",
                    opacity: idx === fields.length - 1 ? 0.3 : 1,
                  }}
                >
                  ↓
                </button>
                <button
                  onClick={() => del(f.id)}
                  style={{ ...sel, padding: "3px 5px", color: T.red }}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
          {fields.length === 0 && (
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: 12,
                color: T.dim,
                textAlign: "center",
                padding: 20,
                fontStyle: "italic",
              }}
            >
              No fields — click "+ Add field"
            </div>
          )}
        </div>
      </div>

      {output && (
        <Card>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <Label>Generated Proto</Label>
            <Row gap={6}>
              <Btn small variant="accent" onClick={() => setPreview(true)}>
                👁 Preview
              </Btn>
              <CopyBtn text={output} />
              <SaveBtn
                content={output}
                toolId="proto-gen"
                toolLabel="Proto"
                defaultTitle={`${pkgName || "mypackage"}.proto`}
              />
            </Row>
          </div>
          <pre
            style={{
              background: T.s2,
              border: `1px solid ${T.border}`,
              borderRadius: 6,
              padding: "12px 14px",
              fontFamily: "var(--mono)",
              fontSize: 11,
              lineHeight: 1.7,
              overflow: "auto",
              maxHeight: 260,
              whiteSpace: "pre-wrap",
              margin: 0,
              color: T.mid,
            }}
            dangerouslySetInnerHTML={{ __html: highlightProto(output) }}
          />
        </Card>
      )}
    </>
  );
}

// ─── Root component ───────────────────────────────────────────────────────────
export function ProtoGen() {
  const [mode, setMode] = useState("plain");
  const [pkgName, setPkgName] = useState("mypackage");
  const [addService, setAddService] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Top bar */}
      <Row gap={8}>
        <div style={{ display: "flex", gap: 6 }}>
          {MODES.map((m) => (
            <Btn
              key={m.id}
              variant={mode === m.id ? "accent" : "default"}
              onClick={() => setMode(m.id)}
            >
              {m.label}
            </Btn>
          ))}
        </div>
        <input
          value={pkgName}
          onChange={(e) =>
            setPkgName(e.target.value.replace(/\s/g, "").toLowerCase())
          }
          placeholder="package name"
          style={{
            flex: 1,
            background: T.s2,
            border: `1px solid ${T.border}`,
            borderRadius: 6,
            color: T.text,
            fontFamily: "var(--mono)",
            fontSize: 12,
            padding: "7px 12px",
            outline: "none",
            transition: "border-color .15s",
          }}
          onFocus={(e) => (e.target.style.borderColor = T.border2)}
          onBlur={(e) => (e.target.style.borderColor = T.border)}
        />
        <Btn
          variant={addService ? "accent" : "default"}
          onClick={() => setAddService((v) => !v)}
        >
          {addService ? "✓ Service" : "Service scaffold"}
        </Btn>
      </Row>

      {mode === "plain" && (
        <PlainMode pkgName={pkgName} addService={addService} />
      )}
      {mode === "orm" && <OrmMode pkgName={pkgName} addService={addService} />}
      {mode === "custom" && (
        <CustomMode pkgName={pkgName} addService={addService} />
      )}

      <Card>
        <Label>
          {mode === "plain"
            ? "Plain Class"
            : mode === "orm"
              ? "ORM / Schema"
              : "Custom Builder"}
        </Label>
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: 11,
            color: T.dim,
            lineHeight: 1.9,
          }}
        >
          {mode === "plain" &&
            "Paste any class, struct or interface. Fields are mapped to protobuf scalar types. Unknown types become message references."}
          {mode === "orm" &&
            "Paste your ORM model. Column types, relationships and nullable flags are all parsed automatically. ForeignKey → int64 _id field, OneToMany/ManyToMany → repeated."}
          {mode === "custom" &&
            'Build a message field by field — no code needed. Select "custom message…" to reference another message type. Use ↑↓ to reorder.'}{" "}
          <span style={{ color: T.acc }}>👁 Preview</span> opens the full proto
          before you copy or save.
        </div>
      </Card>
    </div>
  );
}
