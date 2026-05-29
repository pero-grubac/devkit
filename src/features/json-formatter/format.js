export function syntaxHL(json) {
  return json.replace(
    /(\"(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*\"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    m => {
      let cls = "jn";
      if (/^"/.test(m)) cls = /:$/.test(m) ? "jk" : "js";
      else if (/true|false/.test(m)) cls = "jb";
      else if (/null/.test(m)) cls = "jnull";
      return `<span class="${cls}">${m}</span>`;
    }
  );
}

export function parseJson(input) {
  if (!input.trim()) return { ok: false, parsed: null, error: null };
  try {
    return { ok: true, parsed: JSON.parse(input), error: null };
  } catch (e) {
    return { ok: false, parsed: null, error: e.message };
  }
}

export function jsonStats(parsed, depth = 0) {
  if (typeof parsed !== "object" || parsed === null)
    return { keys: 0, depth };
  const children = Object.values(parsed).map(v => jsonStats(v, depth + 1));
  return {
    keys: Object.keys(parsed).length + children.reduce((s, c) => s + c.keys, 0),
    depth: Math.max(depth, ...children.map(c => c.depth)),
  };
}
