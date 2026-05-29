export async function digest(algo, text) {
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest(algo, enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export const ALGOS = [
  { id: "md5",     label: "MD5",     bits: 128, note: "Legacy — avoid for security" },
  { id: "SHA-1",   label: "SHA-1",   bits: 160, note: "Deprecated — avoid for security" },
  { id: "SHA-256", label: "SHA-256", bits: 256, note: "Recommended" },
  { id: "SHA-512", label: "SHA-512", bits: 512, note: "High security" },
];
