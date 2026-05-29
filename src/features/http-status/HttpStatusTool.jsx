import { useState, useMemo } from "react";
import { T } from "../../shared/theme";
import { Input, Card, Label } from "../../shared/ui";

const CODES = [
  // 1xx
  { code: 100, name: "Continue",                        desc: "The server has received the request headers and the client should proceed to send the request body." },
  { code: 101, name: "Switching Protocols",             desc: "The server is switching protocols as requested by the client (e.g. HTTP to WebSocket)." },
  { code: 102, name: "Processing",                      desc: "The server has received and is processing the request, no response is available yet." },
  // 2xx
  { code: 200, name: "OK",                              desc: "Standard success response. The request has succeeded." },
  { code: 201, name: "Created",                         desc: "The request has been fulfilled and a new resource has been created." },
  { code: 202, name: "Accepted",                        desc: "The request has been accepted for processing, but processing has not been completed." },
  { code: 204, name: "No Content",                      desc: "The server successfully processed the request but is not returning any content." },
  { code: 206, name: "Partial Content",                 desc: "The server is delivering only part of the resource due to a range header." },
  // 3xx
  { code: 301, name: "Moved Permanently",               desc: "The resource has been permanently moved to a new URL. Update your links." },
  { code: 302, name: "Found",                           desc: "The resource temporarily resides at a different URL. Use original for future requests." },
  { code: 303, name: "See Other",                       desc: "The response to the request can be found under another URI using GET." },
  { code: 304, name: "Not Modified",                    desc: "The cached version is still valid. No content is returned." },
  { code: 307, name: "Temporary Redirect",              desc: "The request should be repeated with the same method to the given URI." },
  { code: 308, name: "Permanent Redirect",              desc: "The resource has been permanently moved; same method must be used." },
  // 4xx
  { code: 400, name: "Bad Request",                     desc: "The server cannot process the request due to client error (e.g. malformed syntax)." },
  { code: 401, name: "Unauthorized",                    desc: "Authentication is required and has failed or has not been provided." },
  { code: 403, name: "Forbidden",                       desc: "The server understood the request but refuses to authorize it." },
  { code: 404, name: "Not Found",                       desc: "The requested resource could not be found on the server." },
  { code: 405, name: "Method Not Allowed",              desc: "The HTTP method used is not allowed for the requested resource." },
  { code: 408, name: "Request Timeout",                 desc: "The server timed out waiting for the request." },
  { code: 409, name: "Conflict",                        desc: "The request conflicts with the current state of the server (e.g. duplicate resource)." },
  { code: 410, name: "Gone",                            desc: "The resource requested is no longer available and will not return." },
  { code: 411, name: "Length Required",                 desc: "The server requires the Content-Length header to be specified." },
  { code: 413, name: "Payload Too Large",               desc: "The request body exceeds the server's limit." },
  { code: 414, name: "URI Too Long",                    desc: "The URI is too long for the server to process." },
  { code: 415, name: "Unsupported Media Type",          desc: "The media type in the request is not supported by the server." },
  { code: 422, name: "Unprocessable Entity",            desc: "The server understands the content type but the request contained semantic errors." },
  { code: 423, name: "Locked",                          desc: "The resource being accessed is locked." },
  { code: 429, name: "Too Many Requests",               desc: "The user has sent too many requests in a given amount of time (rate limiting)." },
  { code: 451, name: "Unavailable For Legal Reasons",   desc: "The resource is unavailable due to legal demands (e.g. censorship)." },
  // 5xx
  { code: 500, name: "Internal Server Error",           desc: "A generic error occurred on the server." },
  { code: 501, name: "Not Implemented",                 desc: "The server does not support the functionality required to fulfill the request." },
  { code: 502, name: "Bad Gateway",                     desc: "The server received an invalid response from an upstream server." },
  { code: 503, name: "Service Unavailable",             desc: "The server is not ready to handle the request (overloaded or down for maintenance)." },
  { code: 504, name: "Gateway Timeout",                 desc: "The server did not receive a timely response from an upstream server." },
  { code: 505, name: "HTTP Version Not Supported",      desc: "The HTTP version used in the request is not supported by the server." },
];

function codeColor(code) {
  if (code < 200) return T.mid;
  if (code < 300) return T.green;
  if (code < 400) return "#60a5fa";
  if (code < 500) return T.orange;
  return T.red;
}

function groupLabel(code) {
  if (code < 200) return "1xx Informational";
  if (code < 300) return "2xx Success";
  if (code < 400) return "3xx Redirection";
  if (code < 500) return "4xx Client Error";
  return "5xx Server Error";
}

export function HttpStatusTool() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return CODES;
    return CODES.filter(c => String(c.code).includes(q) || c.name.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q));
  }, [query]);

  // Group
  const groups = useMemo(() => {
    const map = {};
    for (const c of filtered) {
      const g = groupLabel(c.code);
      if (!map[g]) map[g] = [];
      map[g].push(c);
    }
    return Object.entries(map);
  }, [filtered]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <Label>Search</Label>
        <Input value={query} onChange={setQuery} placeholder="404, not found, redirect…" />
      </div>

      {groups.length === 0 && (
        <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: T.dim, textAlign: "center", padding: 24 }}>No results for "{query}"</div>
      )}

      {groups.map(([group, codes]) => (
        <div key={group}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", color: T.dim, marginBottom: 6, textTransform: "uppercase" }}>{group}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {codes.map(c => (
              <div key={c.code} style={{ display: "flex", gap: 14, background: T.s2, border: `1px solid ${T.border}`, borderRadius: 6, padding: "10px 14px", alignItems: "flex-start" }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 16, fontWeight: 700, color: codeColor(c.code), minWidth: 44, lineHeight: 1.4 }}>{c.code}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700, color: T.text, marginBottom: 2 }}>{c.name}</div>
                  <div style={{ fontFamily: "var(--sans)", fontSize: 12, color: T.mid, lineHeight: 1.6 }}>{c.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
