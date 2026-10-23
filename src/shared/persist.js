// ─── Remembered tool inputs — pure localStorage, no React, no deps ───────────
// Keys look like "devkit:input:<toolId>:<key>". Values are stored as JSON.

const PREFIX = "devkit:input:";

// Anything bigger is not worth keeping (and could crowd out snippets).
export const MAX_CHARS = 100 * 1024;

export function storageKey(toolId, key) {
  return `${PREFIX}${toolId}:${key}`;
}

function defaultStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null; // access can throw when storage is blocked
  }
}

// Returns the saved value, or undefined when there is none (or it is unreadable).
export function loadInput(toolId, key, storage = defaultStorage()) {
  try {
    const raw = storage?.getItem(storageKey(toolId, key));
    return raw == null ? undefined : JSON.parse(raw);
  } catch {
    return undefined;
  }
}

// Saves a value. Values equal to the default, or too large, are removed instead.
// Returns true when something was written.
export function saveInput(toolId, key, value, initial, storage = defaultStorage()) {
  if (!storage) return false;
  const k = storageKey(toolId, key);
  try {
    const raw = JSON.stringify(value);
    if (raw === undefined || raw === JSON.stringify(initial) || raw.length > MAX_CHARS) {
      storage.removeItem(k);
      return false;
    }
    storage.setItem(k, raw);
    return true;
  } catch {
    return false; // quota exceeded, circular value, ...
  }
}

// Removes every remembered input. Returns how many entries were dropped.
export function clearInputs(storage = defaultStorage()) {
  if (!storage) return 0;
  try {
    const keys = [];
    for (let i = 0; i < storage.length; i++) {
      const k = storage.key(i);
      if (k && k.startsWith(PREFIX)) keys.push(k);
    }
    keys.forEach(k => storage.removeItem(k));
    return keys.length;
  } catch {
    return 0;
  }
}
