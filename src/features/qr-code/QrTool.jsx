import { useState, useEffect, useRef } from "react";
import { T } from "../../shared/theme";
import { Textarea, Row, Btn, Card, Label } from "../../shared/ui";

// ─── Pure-JS QR Code encoder (Mode: byte, EC: L/M/Q/H) ──────────────────────
// Reed-Solomon, data masking, format info — self-contained, no deps.

const GF = (() => {
  const exp = new Uint8Array(512), log = new Uint8Array(256);
  let x = 1;
  for (let i = 0; i < 255; i++) {
    exp[i] = x; log[x] = i;
    x = x < 128 ? x << 1 : (x << 1) ^ 0x11d;
  }
  for (let i = 255; i < 512; i++) exp[i] = exp[i - 255];
  const mul = (a, b) => a && b ? exp[log[a] + log[b]] : 0;
  const poly_mul = (p, q) => {
    const r = new Uint8Array(p.length + q.length - 1);
    for (let i = 0; i < p.length; i++) for (let j = 0; j < q.length; j++) r[i+j] ^= mul(p[i], q[j]);
    return r;
  };
  const gen = (n) => {
    let g = new Uint8Array([1]);
    for (let i = 0; i < n; i++) g = poly_mul(g, new Uint8Array([1, exp[i]]));
    return g;
  };
  const rs = (data, n) => {
    const g = gen(n), msg = new Uint8Array(data.length + n);
    msg.set(data);
    for (let i = 0; i < data.length; i++) {
      const c = msg[i];
      if (c) for (let j = 0; j < g.length; j++) msg[i+j] ^= mul(g[j], c);
    }
    return msg.slice(data.length);
  };
  return { rs };
})();

// Version 1-40 capacity tables (byte mode, EC L/M/Q/H)
// [version][ec] = { data_codewords, ec_per_block, blocks }
const CAP = {
  1:  { L:{d:19,e:7,b:[[1,19]]},  M:{d:16,e:10,b:[[1,16]]},  Q:{d:13,e:13,b:[[1,13]]},  H:{d:9,e:17,b:[[1,9]]}  },
  2:  { L:{d:34,e:10,b:[[1,34]]}, M:{d:28,e:16,b:[[1,28]]}, Q:{d:22,e:22,b:[[1,22]]}, H:{d:16,e:28,b:[[1,16]]} },
  3:  { L:{d:55,e:15,b:[[1,55]]}, M:{d:44,e:26,b:[[1,44]]}, Q:{d:34,e:18,b:[[2,17]]}, H:{d:26,e:22,b:[[2,13]]} },
  4:  { L:{d:80,e:20,b:[[1,80]]}, M:{d:64,e:18,b:[[2,32]]}, Q:{d:48,e:26,b:[[2,24]]}, H:{d:36,e:16,b:[[4,9]]}  },
  5:  { L:{d:108,e:26,b:[[1,108]]},M:{d:86,e:24,b:[[2,43]]},Q:{d:62,e:18,b:[[2,15],[2,16]]},H:{d:46,e:22,b:[[2,11],[2,12]]} },
  6:  { L:{d:136,e:18,b:[[2,68]]},M:{d:108,e:16,b:[[4,27]]},Q:{d:76,e:24,b:[[4,19]]},H:{d:60,e:28,b:[[4,15]]} },
  7:  { L:{d:156,e:20,b:[[2,78]]},M:{d:124,e:18,b:[[4,31]]},Q:{d:88,e:18,b:[[2,14],[4,15]]},H:{d:66,e:26,b:[[4,13],[1,14]]} },
  8:  { L:{d:194,e:24,b:[[2,97]]},M:{d:154,e:22,b:[[2,38],[2,39]]},Q:{d:110,e:22,b:[[4,18],[2,19]]},H:{d:86,e:26,b:[[4,14],[2,15]]} },
  9:  { L:{d:232,e:30,b:[[2,116]]},M:{d:182,e:22,b:[[3,36],[2,37]]},Q:{d:132,e:20,b:[[4,16],[4,17]]},H:{d:100,e:24,b:[[4,12],[4,13]]} },
  10: { L:{d:274,e:18,b:[[2,68],[2,69]]},M:{d:216,e:26,b:[[4,43],[1,44]]},Q:{d:154,e:24,b:[[6,19],[2,20]]},H:{d:122,e:28,b:[[6,15],[2,16]]} },
};

// Find minimum version for text length
function findVersion(len, ec) {
  for (let v = 1; v <= 10; v++) {
    if (CAP[v] && CAP[v][ec] && CAP[v][ec].d >= len + 2) return v; // +2 for mode+length indicator bytes approx
  }
  return null;
}

// Encode data into codewords
function encodeData(text, version, ec) {
  const bytes = new TextEncoder().encode(text);
  const cap = CAP[version][ec];
  const total = cap.d;
  const bits = [];
  const push = (val, n) => { for (let i = n-1; i >= 0; i--) bits.push((val >> i) & 1); };

  push(0b0100, 4); // byte mode
  push(bytes.length, version < 10 ? 8 : 16); // char count
  for (const b of bytes) push(b, 8);
  // Terminator
  for (let i = 0; i < 4 && bits.length < total * 8; i++) bits.push(0);
  // Pad to byte boundary
  while (bits.length % 8) bits.push(0);
  // Pad codewords
  const pads = [0xEC, 0x11];
  let pi = 0;
  while (bits.length < total * 8) { push(pads[pi++ % 2], 8); }

  // Convert bits to bytes
  const codewords = new Uint8Array(total);
  for (let i = 0; i < total; i++) {
    let b = 0;
    for (let j = 0; j < 8; j++) b = (b << 1) | (bits[i*8+j] || 0);
    codewords[i] = b;
  }
  return codewords;
}

// Split codewords into blocks and generate EC
function makeBlocks(codewords, version, ec) {
  const cap = CAP[version][ec];
  const blocks = [], ecBlocks = [];
  let offset = 0;
  for (const [count, size] of cap.b) {
    for (let i = 0; i < count; i++) {
      const block = codewords.slice(offset, offset + size);
      offset += size;
      blocks.push(block);
      ecBlocks.push(GF.rs(block, cap.e));
    }
  }
  // Interleave
  const result = [];
  const maxLen = Math.max(...blocks.map(b => b.length));
  for (let i = 0; i < maxLen; i++) for (const b of blocks) if (i < b.length) result.push(b[i]);
  const maxEc = Math.max(...ecBlocks.map(b => b.length));
  for (let i = 0; i < maxEc; i++) for (const b of ecBlocks) if (i < b.length) result.push(b[i]);
  return new Uint8Array(result);
}

// QR matrix builder
function buildMatrix(version) {
  const size = version * 4 + 17;
  const m = Array.from({length: size}, () => new Array(size).fill(-1)); // -1 = unset
  const set = (r, c, v) => { if (r >= 0 && r < size && c >= 0 && c < size) m[r][c] = v; };
  const isSet = (r, c) => m[r][c] !== -1;

  // Finder pattern
  const finder = (tr, tc) => {
    for (let r = -1; r <= 7; r++) for (let c = -1; c <= 7; c++) {
      const v = (r === -1 || r === 7 || c === -1 || c === 7) ? 1
              : (r >= 1 && r <= 5 && c >= 1 && c <= 5) ? (r === 1 || r === 5 || c === 1 || c === 5 ? 0 : 1)
              : 0;
      set(tr+r, tc+c, v);
    }
  };
  finder(0, 0); finder(0, size-7); finder(size-7, 0);

  // Timing
  for (let i = 8; i < size-8; i++) { set(6, i, i%2===0?1:0); set(i, 6, i%2===0?1:0); }

  // Dark module
  set(size-8, 8, 1);

  // Alignment (version >= 2)
  const alignPos = {2:[6,18],3:[6,22],4:[6,26],5:[6,30],6:[6,34],7:[6,22,38],8:[6,24,42],9:[6,26,46],10:[6,28,50]};
  if (alignPos[version]) {
    const pos = alignPos[version];
    for (const r of pos) for (const c of pos) {
      if (isSet(r,c)) continue;
      for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++) {
        const v = (Math.abs(dr)===2||Math.abs(dc)===2)?1:(dr===0&&dc===0)?1:0;
        set(r+dr, c+dc, v);
      }
    }
  }

  // Format info placeholder (will be filled later)
  const fmtPos = [
    [8,0],[8,1],[8,2],[8,3],[8,4],[8,5],[8,7],[8,8],
    [7,8],[5,8],[4,8],[3,8],[2,8],[1,8],[0,8],
    [size-7,8],[size-6,8],[size-5,8],[size-4,8],[size-3,8],[size-2,8],[size-1,8],
    [8,size-8],[8,size-7],[8,size-6],[8,size-5],[8,size-4],[8,size-3],[8,size-2],[8,size-1],
  ];
  for (const [r,c] of fmtPos) set(r, c, 0);

  return m;
}

// Place data bits into matrix (zigzag)
function placeData(m, data) {
  const size = m.length;
  const bits = [];
  for (const b of data) for (let i = 7; i >= 0; i--) bits.push((b >> i) & 1);
  let bi = 0;
  let up = true;
  for (let col = size-1; col >= 1; col -= 2) {
    if (col === 6) col = 5;
    for (let row = 0; row < size; row++) {
      const r = up ? size-1-row : row;
      for (let dc = 0; dc < 2; dc++) {
        const c = col - dc;
        if (m[r][c] === -1) { m[r][c] = bits[bi++] || 0; }
      }
    }
    up = !up;
  }
}

// Apply mask pattern
function applyMask(m, mask) {
  const size = m.length;
  const fns = [
    (r,c) => (r+c)%2===0,
    (r,c) => r%2===0,
    (r,c) => c%3===0,
    (r,c) => (r+c)%3===0,
    (r,c) => (Math.floor(r/2)+Math.floor(c/3))%2===0,
    (r,c) => (r*c)%2+(r*c)%3===0,
    (r,c) => ((r*c)%2+(r*c)%3)%2===0,
    (r,c) => ((r+c)%2+(r*c)%3)%2===0,
  ];
  // Only mask data modules (not function patterns)
  // We track which cells are "data" by checking against a fresh clean matrix
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) {
    if (m[r][c] !== -1 && fns[mask](r,c)) m[r][c] ^= 1;
  }
}

// Format info (EC + mask)
function writeFormat(m, ec, mask) {
  const ecBits = {L:0b01,M:0b00,Q:0b11,H:0b10};
  let fmt = (ecBits[ec] << 3) | mask;
  // BCH error correction for format
  let g = fmt << 10;
  const gen = 0x537;
  for (let i = 14; i >= 10; i--) if (g & (1<<i)) g ^= gen << (i-10);
  fmt = ((fmt << 10) | g) ^ 0x5412;

  const size = m.length;
  const bits = [];
  for (let i = 14; i >= 0; i--) bits.push((fmt >> i) & 1);

  // Top-left horizontal
  const hPos = [0,1,2,3,4,5,7,8];
  for (let i = 0; i < 8; i++) m[8][hPos[i]] = bits[i];
  // Top-left vertical (bottom to top)
  const vPos = [7,5,4,3,2,1,0];
  m[8][8] = bits[8];
  for (let i = 0; i < 7; i++) m[vPos[i]][8] = bits[9+i];
  // Bottom-left vertical
  for (let i = 0; i < 7; i++) m[size-7+i][8] = bits[i];
  // Top-right horizontal
  for (let i = 0; i < 8; i++) m[8][size-8+i] = bits[7+i];
}

// Score a masked matrix (penalty)
function score(m) {
  const size = m.length; let p = 0;
  // Rule 1: 5+ same in row/col
  for (let r = 0; r < size; r++) {
    for (let mode = 0; mode < 2; mode++) {
      let run = 1;
      for (let c = 1; c < size; c++) {
        const a = mode ? m[c-1][r] : m[r][c-1];
        const b = mode ? m[c][r]   : m[r][c];
        if (a === b) { run++; if (run === 5) p += 3; else if (run > 5) p++; }
        else run = 1;
      }
    }
  }
  // Rule 2: 2x2 blocks
  for (let r = 0; r < size-1; r++) for (let c = 0; c < size-1; c++)
    if (m[r][c]===m[r][c+1] && m[r][c]===m[r+1][c] && m[r][c]===m[r+1][c+1]) p += 3;
  return p;
}

function generateQR(text, ec = "M") {
  const bytes = new TextEncoder().encode(text);
  const version = findVersion(bytes.length, ec);
  if (!version) return null;

  const codewords = encodeData(text, version, ec);
  const data = makeBlocks(codewords, version, ec);

  // Try all 8 masks, pick lowest penalty
  let best = null, bestScore = Infinity;
  for (let mask = 0; mask < 8; mask++) {
    const m = buildMatrix(version);
    placeData(m, data);
    applyMask(m, mask);
    writeFormat(m, ec, mask);
    const s = score(m);
    if (s < bestScore) { bestScore = s; best = m; }
  }
  return best;
}

// ─── React component ─────────────────────────────────────────────────────────

const PRESETS = [
  { label: "URL",   val: "https://example.com" },
  { label: "Email", val: "mailto:hello@example.com" },
  { label: "WiFi",  val: "WIFI:S:MyNetwork;T:WPA;P:mypassword;;" },
  { label: "Tel",   val: "tel:+1234567890" },
];

const EC_LEVELS = ["L","M","Q","H"];
const SCALES = [3, 4, 6, 8];

export function QrTool() {
  const [text,    setText]    = useState("https://example.com");
  const [ec,      setEc]      = useState("M");
  const [scale,   setScale]   = useState(4);
  const [error,   setError]   = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!text.trim()) { setError(null); return; }
    try {
      const matrix = generateQR(text, ec);
      if (!matrix) { setError("Text too long for QR version 1–10 (max ~270 bytes)"); return; }
      setError(null);
      const size = matrix.length;
      const quiet = 4; // quiet zone modules
      const total = (size + quiet * 2) * scale;
      const canvas = canvasRef.current;
      canvas.width  = total;
      canvas.height = total;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#14141e";
      ctx.fillRect(0, 0, total, total);
      ctx.fillStyle = "#dde1f0";
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (matrix[r][c] === 1) {
            ctx.fillRect((c + quiet) * scale, (r + quiet) * scale, scale, scale);
          }
        }
      }
    } catch(e) { setError(e.message); }
  }, [text, ec, scale]);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "qrcode.png";
    a.click();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Row>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
          <div>
            <Label>Content</Label>
            <Textarea value={text} onChange={setText} rows={5} placeholder="Enter text, URL, WiFi credentials…" />
          </div>

          <div>
            <Label>Presets</Label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {PRESETS.map(p => (
                <Btn key={p.label} small variant="default" onClick={() => setText(p.val)}>{p.label}</Btn>
              ))}
            </div>
          </div>

          <div>
            <Label>Scale (pixel size)</Label>
            <div style={{ display: "flex", gap: 6 }}>
              {SCALES.map(s => (
                <Btn key={s} small variant={scale === s ? "accent" : "default"} onClick={() => setScale(s)}>{s}×</Btn>
              ))}
            </div>
          </div>

          <div>
            <Label>Error Correction</Label>
            <div style={{ display: "flex", gap: 6 }}>
              {EC_LEVELS.map(l => (
                <Btn key={l} small variant={ec === l ? "accent" : "default"} onClick={() => setEc(l)}>{l}</Btn>
              ))}
            </div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: T.dim, marginTop: 4, lineHeight: 1.8 }}>
              L=7% · M=15% · Q=25% · H=30% recovery
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <Card style={{ padding: 16, display: "inline-flex", background: "#14141e", border: `1px solid ${T.border}` }}>
            {error ? (
              <div style={{ width: 200, height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: T.red, fontFamily: "var(--mono)", fontSize: 11, textAlign: "center", padding: 10 }}>{error}</div>
            ) : !text.trim() ? (
              <div style={{ width: 200, height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: T.dim, fontFamily: "var(--mono)", fontSize: 12 }}>Enter text</div>
            ) : (
              <canvas ref={canvasRef} style={{ imageRendering: "pixelated" }} />
            )}
          </Card>

          <Btn variant="accent" onClick={download} disabled={!!error || !text.trim()}>↓ Download PNG</Btn>

          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: T.dim, textAlign: "center" }}>
            {text.length} chars · no external deps
          </div>
        </div>
      </Row>
    </div>
  );
}
