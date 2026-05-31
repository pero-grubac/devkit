// Pure browser JWT signing using Web Crypto API
// Supports HS256, HS384, HS512

const ALG_MAP = {
  HS256: { name: "HMAC", hash: "SHA-256" },
  HS384: { name: "HMAC", hash: "SHA-384" },
  HS512: { name: "HMAC", hash: "SHA-512" },
};

function b64url(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function encodeJson(obj) {
  return b64url(new TextEncoder().encode(JSON.stringify(obj)));
}

export async function signJwt(payload, secret, alg = "HS256") {
  const algInfo = ALG_MAP[alg];
  if (!algInfo) throw new Error(`Unsupported algorithm: ${alg}`);

  const header  = { alg, typ: "JWT" };
  const hPart   = encodeJson(header);
  const pPart   = encodeJson(payload);
  const message = `${hPart}.${pPart}`;

  const keyBytes = new TextEncoder().encode(secret);
  const cryptoKey = await crypto.subtle.importKey(
    "raw", keyBytes, algInfo, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(message));

  return `${message}.${b64url(sig)}`;
}

export function nowSec()  { return Math.floor(Date.now() / 1000); }
export function expSec(h) { return nowSec() + h * 3600; }
