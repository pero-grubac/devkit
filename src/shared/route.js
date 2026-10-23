// ─── Hash routing — #/<tool-id>, works on static hosting with no rewrites ────

export const DEFAULT_TOOL = "json";

// "#/jwt" → "jwt". Anything unknown (or empty) falls back to the default tool.
export function toolFromHash(hash, ids, fallback = DEFAULT_TOOL) {
  let id;
  try {
    id = decodeURIComponent(String(hash || "").replace(/^#\/?/, "")).split(/[/?#]/)[0];
  } catch {
    return fallback;
  }
  return ids.includes(id) ? id : fallback;
}

export function hashFor(id) {
  return "#/" + id;
}
