// ─── Fuzzy matching for the command palette — pure, no React, no deps ────────

// A word starts at index i: start of text, after a separator, or a camelCase hump.
function isBoundary(text, i) {
  if (i === 0) return true;
  const prev = text[i - 1];
  const cur  = text[i];
  if (!/[a-z0-9]/i.test(prev)) return true;
  return prev === prev.toLowerCase() && cur !== cur.toLowerCase();
}

// Score how well `query` matches `text`. Higher is better, null means no match.
// Substrings beat scattered subsequences; prefixes and word starts get a bonus.
export function fuzzyScore(query, text) {
  const q = query.toLowerCase();
  const t = String(text).toLowerCase();
  if (!q) return 0;
  if (!t) return null;

  const idx = t.indexOf(q);
  if (idx !== -1) {
    const end = idx + q.length;
    let score = 100 + q.length * 10 - Math.min(idx, 20) / 2;
    if (idx === 0)                    score += 40;
    else if (isBoundary(text, idx))   score += 30;
    // A whole word ("sha" in "SHA-256") beats the start of a longer one ("Shades").
    if (end === t.length || !/[a-z0-9]/.test(t[end])) score += 25;
    if (q.length === t.length)        score += 50;
    return score;
  }

  // Subsequence: every query char must appear in order.
  let score = 0, from = 0, prev = -2;
  for (const ch of q) {
    const found = t.indexOf(ch, from);
    if (found === -1) return null;
    score += 2;
    if (found === prev + 1)       score += 6;
    if (isBoundary(text, found))  score += 8;
    score -= Math.min(found - from, 4);
    prev = found;
    from = found + 1;
  }
  return Math.max(score, 1);
}

// Rank `items` by `query` across weighted `fields` ({ key, weight }).
// `key` is a property name or a function returning the text.
// Every whitespace-separated token must match some field; order is kept on ties.
export function rankItems(query, items, fields) {
  const tokens = String(query).trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return items.slice();

  const scored = [];
  items.forEach((item, i) => {
    let total = 0;
    for (const tok of tokens) {
      let best = null;
      for (const { key, weight = 1 } of fields) {
        const value = typeof key === "function" ? key(item) : item[key];
        if (value == null || value === "") continue;
        const s = fuzzyScore(tok, value);
        if (s !== null && (best === null || s * weight > best)) best = s * weight;
      }
      if (best === null) return;
      total += best;
    }
    scored.push({ item, total, i });
  });

  return scored
    .sort((a, b) => b.total - a.total || a.i - b.i)
    .map(s => s.item);
}

// Fields used to search the tool registry.
export const TOOL_FIELDS = [
  { key: "label", weight: 3 },
  { key: "id",    weight: 2.5 },
  { key: "sub",   weight: 1.5 },
];
