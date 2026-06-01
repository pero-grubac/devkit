import { useState, useEffect, useRef } from "react";
import { T } from "../../shared/theme";
import { Row, Btn, Label, CopyBtn, ErrorBox, OutputBox } from "../../shared/ui";
import { pythonDictToJson } from "./pythonDict";
import { SaveBtn } from "../../shared/SaveBtn";

const CDN_JSYAML = "https://cdnjs.cloudflare.com/ajax/libs/js-yaml/4.1.0/js-yaml.min.js";

function loadJsYaml() {
  return new Promise((resolve, reject) => {
    if (window.jsyaml) { resolve(window.jsyaml); return; }
    const s = document.createElement("script");
    s.src = CDN_JSYAML;
    s.onload  = () => resolve(window.jsyaml);
    s.onerror = () => reject(new Error("Failed to load js-yaml"));
    document.head.appendChild(s);
  });
}

const MODES = [
  { id: "json2yaml", label: "JSON → YAML",   inLabel: "JSON Input",   outLabel: "YAML Output"  },
  { id: "yaml2json", label: "YAML → JSON",   inLabel: "YAML Input",   outLabel: "JSON Output"  },
  { id: "py2json",   label: "Python → JSON", inLabel: "Python Dict",  outLabel: "JSON Output"  },
  { id: "py2yaml",   label: "Python → YAML", inLabel: "Python Dict",  outLabel: "YAML Output"  },
];

const SAMPLES = {
  json2yaml: '{\n  "name": "devkit",\n  "version": "1.0.0",\n  "active": true,\n  "tags": ["json", "yaml"]\n}',
  yaml2json: "name: devkit\nversion: 1.0.0\nactive: true\ntags:\n  - json\n  - yaml\n",
  py2json:   "{'name': 'devkit', 'version': '1.0.0', 'active': True, 'count': None, 'tags': ['json', 'yaml']}",
  py2yaml:   "{'dictv': {'pstbetao': {'merchant_account': '123', 'merchant_name': 'PST BET', 'key': 'PSTBETUAT', 'timeout': 15.0, 'log_requests': True, 'log_level': 'error'}}}",
};

export function YamlTool() {
  const [mode,   setMode]   = useState("json2yaml");
  const [input,  setInput]  = useState(SAMPLES.json2yaml);
  const [output, setOutput] = useState("");
  const [error,  setError]  = useState(null);
  const [indent, setIndent] = useState(2);
  const [ready,  setReady]  = useState(false);
  const yaml = useRef(null);

  useEffect(() => {
    loadJsYaml()
      .then(lib => { yaml.current = lib; setReady(true); })
      .catch(e  => setError(e.message));
  }, []);

  useEffect(() => {
    if (!ready || !input.trim()) { setOutput(""); setError(null); return; }
    try {
      if (mode === "json2yaml") {
        setOutput(yaml.current.dump(JSON.parse(input), { indent, lineWidth: -1 }));
      } else if (mode === "yaml2json") {
        setOutput(JSON.stringify(yaml.current.load(input), null, indent));
      } else if (mode === "py2json") {
        setOutput(JSON.stringify(JSON.parse(pythonDictToJson(input)), null, indent));
      } else if (mode === "py2yaml") {
        setOutput(yaml.current.dump(JSON.parse(pythonDictToJson(input)), { indent, lineWidth: -1 }));
      }
      setError(null);
    } catch (e) {
      setError(e.message);
      setOutput("");
    }
  }, [input, mode, indent, ready]);

  const switchMode = m => { setMode(m); setInput(SAMPLES[m]); setError(null); };
  const active = MODES.find(m => m.id === mode);
  const isPython = mode.startsWith("py");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Row gap={6}>
        {MODES.map(m => (
          <Btn key={m.id} variant={mode === m.id ? "accent" : "default"} onClick={() => switchMode(m.id)}>
            {m.label}
          </Btn>
        ))}
        <div style={{ flex: 1 }} />
        <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: T.dim, alignSelf: "center" }}>Indent</span>
        {[2, 4].map(n => (
          <Btn key={n} small variant={indent === n ? "accent" : "default"} onClick={() => setIndent(n)}>{n}sp</Btn>
        ))}
      </Row>

      {isPython && (
        <div style={{ background: T.acc + "12", border: `1px solid ${T.acc}33`, borderRadius: 6, padding: "10px 14px", fontFamily: "var(--mono)", fontSize: 11, color: T.mid, lineHeight: 1.7 }}>
          ℹ Paste a Python dict literal.
          Converts <span style={{ color: T.acc }}>True / False / None</span> → <span style={{ color: T.green }}>true / false / null</span> and single quotes → double quotes automatically.
        </div>
      )}

      <Row>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          <Label>{active?.inLabel}</Label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            rows={18}
            spellCheck={false}
            style={{ width: "100%", background: T.s2, border: `1px solid ${T.border}`, borderRadius: 6, color: T.text, fontFamily: "var(--mono)", fontSize: 12, padding: "12px 14px", lineHeight: 1.6, outline: "none", transition: "border-color 0.15s" }}
            onFocus={e => (e.target.style.borderColor = T.border2)}
            onBlur={e  => (e.target.style.borderColor = T.border)}
          />
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Label>{active?.outLabel}</Label>
            {output && <><CopyBtn text={output} /><SaveBtn content={output} toolId="yaml" toolLabel="YAML" /></>}
          </div>
          {!ready
            ? <div style={{ padding: 12, color: T.dim, fontSize: 12, fontStyle: "italic" }}>Loading js-yaml…</div>
            : error
            ? <ErrorBox message={error} tip={isPython ? "Make sure it's a valid Python dict literal. Variables and function calls are not supported." : undefined} />
            : <OutputBox maxHeight={440}>
                {output || <span style={{ color: T.dim, fontStyle: "italic" }}>Output appears here…</span>}
              </OutputBox>
          }
        </div>
      </Row>
    </div>
  );
}
