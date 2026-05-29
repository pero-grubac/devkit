import { useState, useEffect, useRef } from "react";
import { T } from "../../shared/theme";
import { Input, Card, Label, Btn, CopyBtn } from "../../shared/ui";

// Base32 decode
function base32Decode(s) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  s = s.toUpperCase().replace(/=+$/, "").replace(/\s/g, "");
  let bits = 0, value = 0;
  const output = [];
  for (const c of s) {
    const idx = alphabet.indexOf(c);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) { bits -= 8; output.push((value >>> bits) & 0xff); }
  }
  return new Uint8Array(output);
}

async function hotp(key, counter) {
  const keyBytes = base32Decode(key);
  const cryptoKey = await crypto.subtle.importKey("raw", keyBytes, { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
  const buf = new ArrayBuffer(8);
  const view = new DataView(buf);
  view.setUint32(0, Math.floor(counter / 2 ** 32), false);
  view.setUint32(4, counter >>> 0, false);
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, buf);
  const arr = new Uint8Array(sig);
  const offset = arr[19] & 0xf;
  const code = ((arr[offset] & 0x7f) << 24 | arr[offset+1] << 16 | arr[offset+2] << 8 | arr[offset+3]) % 1_000_000;
  return String(code).padStart(6, "0");
}

export function TotpTool() {
  const [secret, setSecret] = useState("");
  const [code,   setCode]   = useState("------");
  const [next,   setNext]   = useState("------");
  const [timeLeft, setTimeLeft] = useState(30);
  const [error,  setError]  = useState(null);
  const timerRef = useRef(null);

  const update = async (sec) => {
    if (!sec.trim()) { setCode("------"); setNext("------"); setError(null); return; }
    try {
      const epoch = Math.floor(Date.now() / 1000);
      const counter = Math.floor(epoch / 30);
      const [c, n] = await Promise.all([hotp(sec, counter), hotp(sec, counter + 1)]);
      setCode(c);
      setNext(n);
      setError(null);
    } catch(e) {
      setError("Invalid secret — use Base32 (A–Z, 2–7)");
      setCode("------"); setNext("------");
    }
  };

  useEffect(() => {
    const tick = () => {
      const epoch = Math.floor(Date.now() / 1000);
      const remaining = 30 - (epoch % 30);
      setTimeLeft(remaining);
      if (remaining === 30) update(secret);
    };
    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => clearInterval(timerRef.current);
  }, [secret]);

  useEffect(() => { update(secret); }, [secret]);

  const progress = (timeLeft / 30) * 100;
  const danger   = timeLeft <= 5;
  const barColor = danger ? T.red : timeLeft <= 10 ? T.orange : T.green;

  const CodeCard = ({ label, value, dim }) => (
    <Card style={{ flex: 1, textAlign: "center", opacity: dim ? 0.5 : 1 }}>
      <Label>{label}</Label>
      <div style={{ fontFamily: "var(--mono)", fontSize: 38, fontWeight: 700, letterSpacing: "0.2em", color: dim ? T.mid : barColor, margin: "8px 0" }}>
        {value.slice(0,3)} {value.slice(3)}
      </div>
      {!dim && <CopyBtn text={value} />}
    </Card>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <Label>Base32 Secret (from your authenticator setup)</Label>
        <Input value={secret} onChange={setSecret} placeholder="JBSWY3DPEHPK3PXP" />
      </div>

      {error && (
        <div style={{ background: T.red + "12", border: `1px solid ${T.red}44`, borderRadius: 6, padding: "10px 14px", color: "#fca5a5", fontSize: 12 }}>
          {error}
        </div>
      )}

      {/* Timer bar */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <Label>Time Remaining</Label>
          <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: barColor, fontWeight: 700 }}>{timeLeft}s</div>
        </div>
        <div style={{ height: 4, background: T.s3, borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progress}%`, background: barColor, borderRadius: 2, transition: "width 1s linear, background 0.3s" }} />
        </div>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <CodeCard label="Current Code" value={code} dim={false} />
        <CodeCard label="Next Code"    value={next} dim={true}  />
      </div>

      <Card>
        <Label>How to use</Label>
        <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: T.dim, lineHeight: 1.8 }}>
          Paste the Base32 secret from any TOTP QR code (Google Authenticator, Authy, 1Password, etc).<br/>
          Codes refresh every 30 seconds. Compatible with RFC 6238 / otpauth:// URIs.
        </div>
      </Card>
    </div>
  );
}
