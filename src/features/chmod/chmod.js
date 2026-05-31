export const PERMS = [
  { label: "Owner", key: "owner" },
  { label: "Group", key: "group" },
  { label: "Other", key: "other" },
];

export const BITS = [
  { label: "Read",    key: "r", value: 4 },
  { label: "Write",   key: "w", value: 2 },
  { label: "Execute", key: "x", value: 1 },
];

export const DEFAULT_STATE = {
  owner: { r: true,  w: true,  x: true  },
  group: { r: true,  w: false, x: true  },
  other: { r: true,  w: false, x: true  },
};

export function stateToOctal(state) {
  return PERMS.map(({ key }) =>
    BITS.reduce((sum, b) => sum + (state[key][b.key] ? b.value : 0), 0)
  ).join("");
}

export function stateToSymbolic(state) {
  return PERMS.map(({ key }) =>
    BITS.map(b => state[key][b.key] ? b.key : "-").join("")
  ).join("");
}

export function octalToState(octal) {
  const digits = String(octal).padStart(3, "0").slice(-3).split("").map(Number);
  if (digits.some(isNaN) || digits.some(d => d < 0 || d > 7)) return null;
  const state = {};
  PERMS.forEach(({ key }, i) => {
    const d = digits[i];
    state[key] = { r: !!(d & 4), w: !!(d & 2), x: !!(d & 1) };
  });
  return state;
}

export function symbolicToState(sym) {
  const clean = sym.replace(/^[-d]/, "");
  if (clean.length !== 9) return null;
  const state = {};
  PERMS.forEach(({ key }, i) => {
    const chunk = clean.slice(i * 3, i * 3 + 3);
    state[key] = {
      r: chunk[0] === "r",
      w: chunk[1] === "w",
      x: chunk[2] === "x" || chunk[2] === "s" || chunk[2] === "t",
    };
  });
  return state;
}

export const PRESETS = [
  { label: "777 — rwxrwxrwx", octal: "777", desc: "Full access for everyone" },
  { label: "755 — rwxr-xr-x", octal: "755", desc: "Owner full, others read+exec" },
  { label: "644 — rw-r--r--", octal: "644", desc: "Owner read+write, others read" },
  { label: "600 — rw-------", octal: "600", desc: "Owner only, no others" },
  { label: "700 — rwx------", octal: "700", desc: "Owner full, no others" },
  { label: "664 — rw-rw-r--", octal: "664", desc: "Owner+group write, others read" },
  { label: "444 — r--r--r--", octal: "444", desc: "Read-only for all" },
  { label: "000 — ---------", octal: "000", desc: "No permissions" },
];
