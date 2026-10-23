import { test } from "node:test";
import assert from "node:assert/strict";

import { fuzzyScore, rankItems, TOOL_FIELDS } from "../src/shared/fuzzy.js";
import { toolFromHash, hashFor, DEFAULT_TOOL } from "../src/shared/route.js";
import { loadInput, saveInput, clearInputs, storageKey, MAX_CHARS } from "../src/shared/persist.js";
import { TABS } from "../src/shared/registry.js";

const top = (q) => rankItems(q, TABS, TOOL_FIELDS)[0]?.id;

test("fuzzyScore prefers prefixes, word starts and substrings", () => {
  assert.equal(fuzzyScore("", "anything"), 0);
  assert.equal(fuzzyScore("xyz", "Hash"), null);
  assert.ok(fuzzyScore("ha", "Hash") > fuzzyScore("as", "Hash"));
  assert.ok(fuzzyScore("sha", "MD5 · SHA-1") > fuzzyScore("sha", "washing"));
  assert.ok(fuzzyScore("hash", "Hash") > fuzzyScore("hsh", "Hash"));
  assert.ok(fuzzyScore("hs", "HttpStatus") > fuzzyScore("hs", "this"));
  assert.ok(fuzzyScore("jsn", "JSON") > 0);
});

test("tool search finds tools by label, id and sub-text", () => {
  assert.equal(top("sha"), "hash");
  assert.equal(top("cidr"), "ip");
  assert.equal(top("proto"), "proto");
  assert.equal(top("jwt"), "jwt");
  assert.equal(top("http-req"), "http-req");
  assert.equal(top("2fa"), "totp");
  assert.equal(top("rgx"), "regex");
  assert.equal(top("json yaml"), "yaml");
  assert.deepEqual(rankItems("qqqzzz", TABS, TOOL_FIELDS), []);
});

test("empty query keeps the original order", () => {
  assert.deepEqual(rankItems("  ", TABS, TOOL_FIELDS).map(t => t.id), TABS.map(t => t.id));
});

test("rankItems accepts function keys", () => {
  const items = [{ s: { t: "alpha" } }, { s: { t: "beta" } }];
  assert.deepEqual(rankItems("bet", items, [{ key: i => i.s.t }]), [items[1]]);
});

test("hash routes map to tool ids with a json fallback", () => {
  const ids = TABS.map(t => t.id);
  assert.equal(toolFromHash("#/jwt", ids), "jwt");
  assert.equal(toolFromHash("#jwt", ids), "jwt");
  assert.equal(toolFromHash("#/http-req", ids), "http-req");
  assert.equal(toolFromHash("#/nope", ids), DEFAULT_TOOL);
  assert.equal(toolFromHash("", ids), "json");
  assert.equal(toolFromHash("#/%E0%A4%A", ids), "json");
  assert.equal(hashFor("ip"), "#/ip");
  for (const id of ids) assert.equal(toolFromHash(hashFor(id), ids), id);
});

function memoryStorage() {
  const map = new Map();
  return {
    get length() { return map.size; },
    key: (i) => [...map.keys()][i] ?? null,
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    map,
  };
}

test("saved inputs round-trip and skip defaults", () => {
  const s = memoryStorage();
  assert.equal(loadInput("json", "input", s), undefined);
  assert.equal(saveInput("json", "input", "{}", "", s), true);
  assert.equal(loadInput("json", "input", s), "{}");
  assert.equal(saveInput("json", "indent", { n: 4 }, { n: 2 }, s), true);
  assert.deepEqual(loadInput("json", "indent", s), { n: 4 });
  // Back to the default removes the entry.
  assert.equal(saveInput("json", "input", "", "", s), false);
  assert.equal(s.map.has(storageKey("json", "input")), false);
});

test("oversized values are not stored", () => {
  const s = memoryStorage();
  saveInput("diff", "left", "small", "", s);
  assert.equal(saveInput("diff", "left", "x".repeat(MAX_CHARS + 1), "", s), false);
  assert.equal(loadInput("diff", "left", s), undefined);
});

test("broken storage never throws", () => {
  const broken = {
    getItem() { throw new Error("denied"); },
    setItem() { throw new Error("quota"); },
    removeItem() { throw new Error("denied"); },
    key() { throw new Error("denied"); },
    get length() { throw new Error("denied"); },
  };
  assert.equal(loadInput("a", "b", broken), undefined);
  assert.equal(saveInput("a", "b", "v", "", broken), false);
  assert.equal(clearInputs(broken), 0);
  const s = memoryStorage();
  s.setItem(storageKey("a", "b"), "{not json");
  assert.equal(loadInput("a", "b", s), undefined);
});

test("clearInputs only removes remembered inputs", () => {
  const s = memoryStorage();
  s.setItem("devkit:snippets", "[]");
  saveInput("hash", "input", "abc", "", s);
  saveInput("regex", "pattern", "[0-9]+", "", s);
  assert.equal(clearInputs(s), 2);
  assert.deepEqual([...s.map.keys()], ["devkit:snippets"]);
});
