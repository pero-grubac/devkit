import { test } from "node:test";
import assert from "node:assert/strict";

import { md5 } from "../src/features/hash/md5.js";
import { stateToOctal, stateToSymbolic, octalToState, symbolicToState, DEFAULT_STATE } from "../src/features/chmod/chmod.js";
import { analyzeFloat32, analyzeFloat64, floatFromBits32 } from "../src/features/ieee754/ieee754.js";
import { syntaxHL, parseJson, jsonStats } from "../src/features/json-formatter/format.js";
import { buildCurl, buildFetch } from "../src/features/http-builder/codegen.js";
import { hexToHsl, hslToHex, toCssVars } from "../src/features/color-palette/palette.js";
import { signJwt } from "../src/features/jwt-generator/sign.js";
import { PARSERS, LANG_MAP, toProto } from "../src/features/proto-gen/parser.js";

test("md5 matches the RFC 1321 test vectors", () => {
  assert.equal(md5(""), "d41d8cd98f00b204e9800998ecf8427e");
  assert.equal(md5("abc"), "900150983cd24fb0d6963f7d28e17f72");
  assert.equal(md5("message digest"), "f96b697d7cb7938d525a2f31aaf161d0");
});

test("chmod converts between octal, symbolic and checkbox state", () => {
  assert.equal(stateToOctal(DEFAULT_STATE), "755");
  assert.equal(stateToSymbolic(DEFAULT_STATE), "rwxr-xr-x");
  assert.equal(stateToOctal(octalToState("640")), "640");
  assert.equal(stateToOctal(symbolicToState("-rw-r--r--")), "644");
  assert.equal(octalToState("8a9"), null);
  assert.equal(symbolicToState("rwx"), null);
});

test("IEEE 754 analysis", () => {
  const one = analyzeFloat32(1);
  assert.equal(one.hexStr, "3F800000");
  assert.equal(one.category, "Normal");
  assert.equal(analyzeFloat32(-0).category, "-Zero");
  assert.equal(analyzeFloat32(Infinity).category, "+Infinity");
  assert.equal(analyzeFloat32(NaN).category, "NaN");
  assert.equal(analyzeFloat64(1).sign, 0);
  assert.equal(floatFromBits32(one.bits), 1);
});

test("JSON parsing and stats", () => {
  assert.deepEqual(parseJson("  "), { ok: false, parsed: null, error: null });
  assert.equal(parseJson("{bad").ok, false);
  const { parsed } = parseJson('{"a":{"b":[1,2]},"c":true}');
  assert.deepEqual(jsonStats(parsed), { keys: 5, depth: 3 });
});

test("JSON highlighting escapes markup inside strings", () => {
  const html = syntaxHL(JSON.stringify({ x: '<img src=x onerror="alert(1)">' }));
  assert.ok(!html.includes("<img"));
  assert.ok(html.includes("&lt;img"));
  assert.match(html, /<span class="jk">"x":<\/span>/);
});

test("curl output survives single quotes", () => {
  const curl = buildCurl({
    method: "POST",
    url: "https://api.test/a",
    headers: [{ key: "X-Note", value: "it's" }, { key: " ", value: "ignored" }],
    body: '{"a":"b\'c"}',
    bodyType: "json",
  });
  assert.equal(
    curl,
    [
      "curl -X POST 'https://api.test/a'",
      "  -H 'X-Note: it'\\''s'",
      "  -H 'Content-Type: application/json'",
      "  -d '{\"a\":\"b'\\''c\"}'",
    ].join(" \\\n"),
  );
  assert.equal(buildCurl({ method: "GET", url: "", headers: [], body: "", bodyType: "none" }), "");
});

test("fetch snippet has no body for GET", () => {
  const code = buildFetch({ method: "GET", url: "https://api.test", headers: [], body: "{}", bodyType: "json" });
  assert.ok(!code.includes("body:"));
});

test("colour conversions round-trip", () => {
  assert.deepEqual(hexToHsl("#ff0000"), { h: 0, s: 100, l: 50 });
  assert.equal(hslToHex(0, 100, 50), "#ff0000");
  assert.equal(hexToHsl("nope"), null);
  assert.equal(toCssVars([{ name: "500", hex: "#123456" }], "brand"), "  --brand-500: #123456;");
});

test("JWT HS256 signature matches a known token", async () => {
  // Header/payload/secret from the jwt.io example.
  const token = await signJwt({ sub: "1234567890", name: "John Doe", iat: 1516239022 }, "your-256-bit-secret");
  assert.equal(
    token,
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
  );
  await assert.rejects(signJwt({}, "s", "RS256"));
});

test("Python dataclass to proto3", () => {
  const src = [
    "@dataclass",
    "class User:",
    "    user_id: int",
    "    displayName: str",
    "    tags: List[str]",
    "",
  ].join("\n");
  const proto = toProto(PARSERS.python(src), LANG_MAP.python.map, { packageName: "demo" });
  assert.match(proto, /^syntax = "proto3";/);
  assert.match(proto, /package demo;/);
  assert.match(proto, /int32 user_id = 1;/);
  assert.match(proto, /string display_name = 2;/);
  assert.match(proto, /repeated string tags = 3;/);
});
