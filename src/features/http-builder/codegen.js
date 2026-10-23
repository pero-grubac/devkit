// Single-quote for the shell; an embedded ' becomes '\'' so the command stays valid.
const sq = s => `'${String(s).replace(/'/g, "'\\''")}'`;

export function buildCurl({ method, url, headers, body, bodyType }) {
  if (!url) return "";
  const lines = [`curl -X ${method} ${sq(url)}`];

  headers.forEach(({ key, value }) => {
    if (key.trim()) lines.push(`  -H ${sq(`${key}: ${value}`)}`);
  });

  if (bodyType === "json" && body.trim()) {
    lines.push(`  -H 'Content-Type: application/json'`);
    lines.push(`  -d ${sq(body.trim())}`);
  } else if (bodyType === "form" && body.trim()) {
    lines.push(`  -H 'Content-Type: application/x-www-form-urlencoded'`);
    lines.push(`  -d ${sq(body.trim())}`);
  } else if (bodyType === "text" && body.trim()) {
    lines.push(`  -d ${sq(body.trim())}`);
  }

  return lines.join(" \\\n");
}

export function buildFetch({ method, url, headers, body, bodyType }) {
  if (!url) return "";
  const hdrs = { ...Object.fromEntries(headers.filter(h => h.key.trim()).map(h => [h.key, h.value])) };
  if (bodyType === "json" && body.trim()) hdrs["Content-Type"] = "application/json";
  if (bodyType === "form" && body.trim()) hdrs["Content-Type"] = "application/x-www-form-urlencoded";

  const hasBody   = body.trim() && method !== "GET" && method !== "HEAD";
  const hdrsStr   = JSON.stringify(hdrs, null, 2);
  const bodyStr   = hasBody ? `\n  body: ${bodyType === "json" ? `JSON.stringify(${body.trim()})` : `'${body.trim()}'`},` : "";

  return `const response = await fetch('${url}', {
  method: '${method}',
  headers: ${hdrsStr},${bodyStr}
});

const data = await response.json();
console.log(data);`;
}

export function buildAxios({ method, url, headers, body, bodyType }) {
  if (!url) return "";
  const hdrs = Object.fromEntries(headers.filter(h => h.key.trim()).map(h => [h.key, h.value]));
  if (bodyType === "json" && body.trim()) hdrs["Content-Type"] = "application/json";

  const hasBody = body.trim() && method !== "GET" && method !== "HEAD";
  const mLow    = method.toLowerCase();

  if (hasBody) {
    const dataStr = bodyType === "json" ? body.trim() : `'${body.trim()}'`;
    return `const { data } = await axios.${mLow}(
  '${url}',
  ${dataStr},
  { headers: ${JSON.stringify(hdrs, null, 4)} }
);
console.log(data);`;
  }

  return `const { data } = await axios.${mLow}('${url}', {
  headers: ${JSON.stringify(hdrs, null, 2)},
});
console.log(data);`;
}
