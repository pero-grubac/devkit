export function pythonDictToJson(input) {
  let s = input.trim()
    .replace(/\bTrue\b/g,  "__TRUE__")
    .replace(/\bFalse\b/g, "__FALSE__")
    .replace(/\bNone\b/g,  "__NULL__");

  s = convertSingleToDoubleQuotes(s);

  s = s
    .replace(/"__TRUE__"/g,  "true")
    .replace(/"__FALSE__"/g, "false")
    .replace(/"__NULL__"/g,  "null")
    .replace(/__TRUE__/g,    "true")
    .replace(/__FALSE__/g,   "false")
    .replace(/__NULL__/g,    "null");

  s = s.replace(/,(\s*[}\]])/g, "$1");
  s = s.replace(/(?<![a-zA-Z0-9_])\(([^()]*)\)/g, "[$1]");

  JSON.parse(s);
  return s;
}

function convertSingleToDoubleQuotes(s) {
  let result = "";
  let i = 0;
  while (i < s.length) {
    if (s[i] === '"') {
      result += '"';
      i++;
      while (i < s.length) {
        if (s[i] === "\\" && i + 1 < s.length) { result += s[i] + s[i + 1]; i += 2; }
        else if (s[i] === '"') { result += '"'; i++; break; }
        else { result += s[i++]; }
      }
      continue;
    }
    if (s[i] === "'") {
      result += '"';
      i++;
      while (i < s.length) {
        if (s[i] === "\\" && i + 1 < s.length) {
          if (s[i + 1] === "'") { result += "'"; i += 2; }
          else { result += s[i] + s[i + 1]; i += 2; }
        } else if (s[i] === '"') { result += '\\"'; i++; }
        else if (s[i] === "'") { result += '"'; i++; break; }
        else { result += s[i++]; }
      }
      continue;
    }
    result += s[i++];
  }
  return result;
}
