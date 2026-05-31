export function parseUrl(raw) {
  try {
    const u = new URL(raw.trim());
    const params = [];
    u.searchParams.forEach((v, k) => params.push({ key: k, value: v }));
    return {
      ok:       true,
      protocol: u.protocol.replace(":", ""),
      host:     u.hostname,
      port:     u.port,
      path:     u.pathname,
      params,
      hash:     u.hash.replace("#", ""),
      origin:   u.origin,
      href:     u.href,
    };
  } catch {
    return { ok: false };
  }
}

export function buildUrl({ protocol, host, port, path, params, hash }) {
  try {
    const portStr = port ? `:${port}` : "";
    const base    = `${protocol}://${host}${portStr}${path || "/"}`;
    const u       = new URL(base);
    params.forEach(({ key, value }) => {
      if (key.trim()) u.searchParams.set(key.trim(), value);
    });
    if (hash.trim()) u.hash = hash.trim();
    return u.href;
  } catch {
    return "";
  }
}

export function encodeParam(s)  { try { return encodeURIComponent(s); } catch { return ""; } }
export function decodeParam(s)  { try { return decodeURIComponent(s); } catch { return ""; } }
