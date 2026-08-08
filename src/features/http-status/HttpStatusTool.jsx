import { useState, useMemo } from "react";
import { T } from "../../shared/theme";
import { Input, Card, Label } from "../../shared/ui";

const CODES = [
  // 1xx
  {
    code: 100,
    name: "Continue",
    desc: "The server has received the request headers and the client should proceed to send the request body.",
  },
  {
    code: 101,
    name: "Switching Protocols",
    desc: "The server is switching protocols as requested by the client (e.g. HTTP to WebSocket).",
  },
  {
    code: 102,
    name: "Processing",
    desc: "The server has received and is processing the request, no response is available yet.",
  },
  // 2xx
  {
    code: 200,
    name: "OK",
    desc: "Standard success response. The request has succeeded.",
  },
  {
    code: 201,
    name: "Created",
    desc: "The request has been fulfilled and a new resource has been created.",
  },
  {
    code: 202,
    name: "Accepted",
    desc: "The request has been accepted for processing, but processing has not been completed.",
  },
  {
    code: 203,
    name: "Non-Authoritative Information",
    desc: "The returned metadata is from a local or third-party copy, not the origin server.",
  },
  {
    code: 204,
    name: "No Content",
    desc: "The server successfully processed the request but is not returning any content.",
  },
  {
    code: 205,
    name: "Reset Content",
    desc: "The server processed the request; the client should reset the document view.",
  },
  {
    code: 206,
    name: "Partial Content",
    desc: "The server is delivering only part of the resource due to a range header.",
  },
  {
    code: 207,
    name: "Multi-Status",
    desc: "WebDAV: the response body contains multiple independent status codes.",
  },
  {
    code: 208,
    name: "Already Reported",
    desc: "WebDAV: members of a DAV binding were already enumerated in a previous reply.",
  },
  {
    code: 226,
    name: "IM Used",
    desc: "The server fulfilled a GET request using one or more instance manipulations.",
  },
  // 3xx
  {
    code: 300,
    name: "Multiple Choices",
    desc: "The request has more than one possible response; the client should choose one.",
  },
  {
    code: 301,
    name: "Moved Permanently",
    desc: "The resource has been permanently moved to a new URL. Update your links.",
  },
  {
    code: 302,
    name: "Found",
    desc: "The resource temporarily resides at a different URL. Use original for future requests.",
  },
  {
    code: 303,
    name: "See Other",
    desc: "The response to the request can be found under another URI using GET.",
  },
  {
    code: 304,
    name: "Not Modified",
    desc: "The cached version is still valid. No content is returned.",
  },
  {
    code: 305,
    name: "Use Proxy",
    desc: "Deprecated. The requested resource must be accessed through the given proxy.",
  },
  {
    code: 307,
    name: "Temporary Redirect",
    desc: "The request should be repeated with the same method to the given URI.",
  },
  {
    code: 308,
    name: "Permanent Redirect",
    desc: "The resource has been permanently moved; same method must be used.",
  },
  // 4xx
  {
    code: 400,
    name: "Bad Request",
    desc: "The server cannot process the request due to client error (e.g. malformed syntax).",
  },
  {
    code: 401,
    name: "Unauthorized",
    desc: "Authentication is required and has failed or has not been provided.",
  },
  {
    code: 402,
    name: "Payment Required",
    desc: "Reserved for future use; occasionally used for APIs that require payment or credits.",
  },
  {
    code: 403,
    name: "Forbidden",
    desc: "The server understood the request but refuses to authorize it.",
  },
  {
    code: 404,
    name: "Not Found",
    desc: "The requested resource could not be found on the server.",
  },
  {
    code: 405,
    name: "Method Not Allowed",
    desc: "The HTTP method used is not allowed for the requested resource.",
  },
  {
    code: 406,
    name: "Not Acceptable",
    desc: "No content matching the request's Accept headers is available.",
  },
  {
    code: 407,
    name: "Proxy Authentication Required",
    desc: "The client must first authenticate itself with the proxy.",
  },
  {
    code: 408,
    name: "Request Timeout",
    desc: "The server timed out waiting for the request.",
  },
  {
    code: 409,
    name: "Conflict",
    desc: "The request conflicts with the current state of the server (e.g. duplicate resource).",
  },
  {
    code: 410,
    name: "Gone",
    desc: "The resource requested is no longer available and will not return.",
  },
  {
    code: 411,
    name: "Length Required",
    desc: "The server requires the Content-Length header to be specified.",
  },
  {
    code: 412,
    name: "Precondition Failed",
    desc: "One of the request header preconditions evaluated to false.",
  },
  {
    code: 413,
    name: "Payload Too Large",
    desc: "The request body exceeds the server's limit.",
  },
  {
    code: 414,
    name: "URI Too Long",
    desc: "The URI is too long for the server to process.",
  },
  {
    code: 415,
    name: "Unsupported Media Type",
    desc: "The media type in the request is not supported by the server.",
  },
  {
    code: 416,
    name: "Range Not Satisfiable",
    desc: "The client asked for a range the server cannot supply.",
  },
  {
    code: 417,
    name: "Expectation Failed",
    desc: "The server cannot meet the requirements of the Expect header.",
  },
  {
    code: 418,
    name: "I'm a Teapot",
    desc: "RFC 2324 April Fools' joke — the server refuses to brew coffee because it's a teapot.",
  },
  {
    code: 421,
    name: "Misdirected Request",
    desc: "The request was directed at a server that cannot produce a response.",
  },
  {
    code: 422,
    name: "Unprocessable Entity",
    desc: "The server understands the content type but the request contained semantic errors.",
  },
  { code: 423, name: "Locked", desc: "The resource being accessed is locked." },
  {
    code: 424,
    name: "Failed Dependency",
    desc: "WebDAV: the request failed because it depended on another request that failed.",
  },
  {
    code: 425,
    name: "Too Early",
    desc: "The server is unwilling to process a request that might be replayed.",
  },
  {
    code: 426,
    name: "Upgrade Required",
    desc: "The client should switch to a different protocol given in the Upgrade header.",
  },
  {
    code: 428,
    name: "Precondition Required",
    desc: "The origin server requires the request to be conditional.",
  },
  {
    code: 429,
    name: "Too Many Requests",
    desc: "The user has sent too many requests in a given amount of time (rate limiting).",
  },
  {
    code: 431,
    name: "Request Header Fields Too Large",
    desc: "The server is unwilling to process the request because header fields are too large.",
  },
  {
    code: 451,
    name: "Unavailable For Legal Reasons",
    desc: "The resource is unavailable due to legal demands (e.g. censorship).",
  },
  // 5xx
  {
    code: 500,
    name: "Internal Server Error",
    desc: "A generic error occurred on the server.",
  },
  {
    code: 501,
    name: "Not Implemented",
    desc: "The server does not support the functionality required to fulfill the request.",
  },
  {
    code: 502,
    name: "Bad Gateway",
    desc: "The server received an invalid response from an upstream server.",
  },
  {
    code: 503,
    name: "Service Unavailable",
    desc: "The server is not ready to handle the request (overloaded or down for maintenance).",
  },
  {
    code: 504,
    name: "Gateway Timeout",
    desc: "The server did not receive a timely response from an upstream server.",
  },
  {
    code: 505,
    name: "HTTP Version Not Supported",
    desc: "The HTTP version used in the request is not supported by the server.",
  },
  {
    code: 506,
    name: "Variant Also Negotiates",
    desc: "Transparent content negotiation resulted in a circular reference.",
  },
  {
    code: 507,
    name: "Insufficient Storage",
    desc: "WebDAV: the server is unable to store the representation needed to complete the request.",
  },
  {
    code: 508,
    name: "Loop Detected",
    desc: "WebDAV: the server detected an infinite loop while processing the request.",
  },
  {
    code: 510,
    name: "Not Extended",
    desc: "Further extensions to the request are required for the server to fulfill it.",
  },
  {
    code: 511,
    name: "Network Authentication Required",
    desc: "The client needs to authenticate to gain network access (e.g. captive portal).",
  },
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
    return CODES.filter(
      (c) =>
        String(c.code).includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.desc.toLowerCase().includes(q),
    );
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
        <Input
          value={query}
          onChange={setQuery}
          placeholder="404, not found, redirect…"
        />
      </div>

      {groups.length === 0 && (
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: 12,
            color: T.dim,
            textAlign: "center",
            padding: 24,
          }}
        >
          No results for "{query}"
        </div>
      )}

      {groups.map(([group, codes]) => (
        <div key={group}>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.2em",
              color: T.dim,
              marginBottom: 6,
              textTransform: "uppercase",
            }}
          >
            {group}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {codes.map((c) => (
              <div
                key={c.code}
                style={{
                  display: "flex",
                  gap: 14,
                  background: T.s2,
                  border: `1px solid ${T.border}`,
                  borderRadius: 6,
                  padding: "10px 14px",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 16,
                    fontWeight: 700,
                    color: codeColor(c.code),
                    minWidth: 44,
                    lineHeight: 1.4,
                  }}
                >
                  {c.code}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: 11,
                      fontWeight: 700,
                      color: T.text,
                      marginBottom: 2,
                    }}
                  >
                    {c.name}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--sans)",
                      fontSize: 12,
                      color: T.mid,
                      lineHeight: 1.6,
                    }}
                  >
                    {c.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
