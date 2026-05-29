import { useState, useEffect } from "react";
import { T } from "../../shared/theme";
import { Input, Row, Card, Label, Btn, CopyBtn } from "../../shared/ui";

function parseSemver(str) {
  const m = str.trim().replace(/^v/, "").match(/^(\d+)\.(\d+)\.(\d+)(?:-([^\+]+))?(?:\+(.+))?$/);
  if (!m) return null;
  return {
    major: parseInt(m[1]),
    minor: parseInt(m[2]),
    patch: parseInt(m[3]),
    prerelease: m[4] || null,
    build: m[5] || null,
    raw: str.trim(),
  };
}

function compareSemver(a, b) {
  if (a.major !== b.major) return a.major > b.major ? 1 : -1;
  if (a.minor !== b.minor) return a.minor > b.minor ? 1 : -1;
  if (a.patch !== b.patch) return a.patch > b.patch ? 1 : -1;
  // pre-release: no pre-release > with pre-release
  if (!a.prerelease && b.prerelease)  return 1;
  if (a.prerelease  && !b.prerelease) return -1;
  if (a.prerelease  && b.prerelease)  return a.prerelease.localeCompare(b.prerelease);
  return 0;
}

function bump(v, type) {
  if (!v) return "";
  switch(type) {
    case "major": return `${v.major + 1}.0.0`;
    case "minor": return `${v.major}.${v.minor + 1}.0`;
    case "patch": return `${v.major}.${v.minor}.${v.patch + 1}`;
    case "alpha": return `${v.major}.${v.minor}.${v.patch + 1}-alpha.1`;
    case "beta":  return `${v.major}.${v.minor}.${v.patch + 1}-beta.1`;
    case "rc":    return `${v.major}.${v.minor}.${v.patch + 1}-rc.1`;
    default: return "";
  }
}

export function SemverTool() {
  const [input, setInput]   = useState("1.4.2");
  const [vA,    setVA]      = useState("1.4.2");
  const [vB,    setVB]      = useState("2.0.0-beta.1");

  const parsed = parseSemver(input);
  const pA = parseSemver(vA);
  const pB = parseSemver(vB);

  const cmp = pA && pB ? compareSemver(pA, pB) : null;
  const cmpLabel = cmp === null ? "—" : cmp > 0 ? "A > B" : cmp < 0 ? "A < B" : "A = B";
  const cmpColor = cmp === null ? T.dim : cmp > 0 ? T.green : cmp < 0 ? T.red : T.acc;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Parse / bump */}
      <Card>
        <Label>Parse & Bump</Label>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <Input value={input} onChange={setInput} placeholder="1.0.0" style={{ flex: 1 }} />
        </div>

        {!parsed && input && (
          <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: T.red }}>Invalid semver — expected MAJOR.MINOR.PATCH[-prerelease][+build]</div>
        )}

        {parsed && (
          <>
            {/* Breakdown */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 6, marginBottom: 12 }}>
              {[
                ["MAJOR", parsed.major, T.red],
                ["MINOR", parsed.minor, T.orange],
                ["PATCH", parsed.patch, T.green],
                ["PRE",   parsed.prerelease || "—", T.acc],
                ["BUILD", parsed.build || "—",      T.mid],
              ].map(([l, v, color]) => (
                <div key={l} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 5, padding: "8px 10px", textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 8, letterSpacing: "0.2em", color: T.dim, marginBottom: 3 }}>{l}</div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 15, fontWeight: 700, color }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Bump buttons */}
            <Label>Bump to</Label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["major","minor","patch","alpha","beta","rc"].map(type => {
                const result = bump(parsed, type);
                return (
                  <div key={type} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 5, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.15em", color: T.dim, textTransform: "uppercase" }}>{type}</div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: T.acc }}>{result}</div>
                    <CopyBtn text={result} />
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Card>

      {/* Compare */}
      <Card>
        <Label>Compare Two Versions</Label>
        <Row>
          <div style={{ flex: 1 }}>
            <Label>Version A</Label>
            <Input value={vA} onChange={setVA} placeholder="1.0.0" />
            {!pA && vA && <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: T.red, marginTop: 4 }}>Invalid</div>}
          </div>
          <div style={{ display: "flex", alignItems: "center", paddingTop: 22 }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 18, fontWeight: 700, color: cmpColor, minWidth: 60, textAlign: "center" }}>{cmpLabel}</div>
          </div>
          <div style={{ flex: 1 }}>
            <Label>Version B</Label>
            <Input value={vB} onChange={setVB} placeholder="2.0.0" />
            {!pB && vB && <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: T.red, marginTop: 4 }}>Invalid</div>}
          </div>
        </Row>
      </Card>

    </div>
  );
}
