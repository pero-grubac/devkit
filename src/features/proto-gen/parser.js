// ─── Type mapping tables ──────────────────────────────────────────────────────

const PY_TO_PROTO = {
  int: "int32",
  int32: "int32",
  int64: "int64",
  float: "float",
  float32: "float",
  float64: "double",
  double: "double",
  str: "string",
  bool: "bool",
  bytes: "bytes",
  None: "google.protobuf.Empty",
  list: "repeated",
  dict: "map",
  List: "repeated",
  Dict: "map",
  Optional: "optional",
  datetime: "google.protobuf.Timestamp",
  uuid: "string",
  UUID: "string",
};

const CS_TO_PROTO = {
  int: "int32",
  Int32: "int32",
  Int64: "int64",
  long: "int64",
  float: "float",
  double: "double",
  string: "string",
  bool: "bool",
  byte: "bytes",
  "byte[]": "bytes",
  DateTime: "google.protobuf.Timestamp",
  Guid: "string",
  List: "repeated",
  IList: "repeated",
  IEnumerable: "repeated",
  Dictionary: "map",
  void: "google.protobuf.Empty",
};

const JS_TO_PROTO = {
  number: "double",
  string: "string",
  boolean: "bool",
  bool: "bool",
  object: "bytes",
  Array: "repeated",
  Map: "map",
  void: "google.protobuf.Empty",
  any: "bytes",
  unknown: "bytes",
  never: "google.protobuf.Empty",
  // TypeScript extras
  int: "int32",
  float: "float",
  double: "double",
  int32: "int32",
  int64: "int64",
  uint32: "uint32",
  uint64: "uint64",
  "string[]": "repeated string",
  "number[]": "repeated double",
  "boolean[]": "repeated bool",
};

const JAVA_TO_PROTO = {
  int: "int32",
  Integer: "int32",
  long: "int64",
  Long: "int64",
  float: "float",
  Float: "float",
  double: "double",
  Double: "double",
  String: "string",
  boolean: "bool",
  Boolean: "bool",
  "byte[]": "bytes",
  List: "repeated",
  ArrayList: "repeated",
  Map: "map",
  HashMap: "map",
  void: "google.protobuf.Empty",
  LocalDateTime: "google.protobuf.Timestamp",
  UUID: "string",
};

const PYTHON_SAMPLE = `from dataclasses import dataclass
from typing import List, Optional
from datetime import datetime

@dataclass
class Address:
    street: str
    city: str
    zip_code: str
    country: str

@dataclass
class User:
    id: int
    name: str
    email: str
    age: int
    active: bool
    score: float
    address: Address
    tags: List[str]
    created_at: datetime
    nickname: Optional[str]`;

const CSHARP_SAMPLE = `public class Address
{
    public string Street { get; set; }
    public string City { get; set; }
    public string ZipCode { get; set; }
    public string Country { get; set; }
}

public class User
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public int Age { get; set; }
    public bool Active { get; set; }
    public double Score { get; set; }
    public Address Address { get; set; }
    public List<string> Tags { get; set; }
    public DateTime CreatedAt { get; set; }
}`;

const TS_SAMPLE = `interface Address {
  street: string;
  city: string;
  zipCode: string;
  country: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  active: boolean;
  score: number;
  address: Address;
  tags: string[];
  createdAt: Date;
  nickname?: string;
}`;

const JAVA_SAMPLE = `public class Address {
    private String street;
    private String city;
    private String zipCode;
    private String country;
}

public class User {
    private int id;
    private String name;
    private String email;
    private int age;
    private boolean active;
    private double score;
    private Address address;
    private List<String> tags;
    private LocalDateTime createdAt;
}`;

export const LANG_MAP = {
  python: { label: "Python", map: PY_TO_PROTO, placeholder: PYTHON_SAMPLE },
  csharp: { label: "C#", map: CS_TO_PROTO, placeholder: CSHARP_SAMPLE },
  java: { label: "Java", map: JAVA_TO_PROTO, placeholder: JAVA_SAMPLE },
  typescript: { label: "TypeScript", map: JS_TO_PROTO, placeholder: TS_SAMPLE },
};

// ─── Sample inputs ────────────────────────────────────────────────────────────
// ─── Parsers per language ─────────────────────────────────────────────────────

function toSnakeCase(s) {
  return s
    .replace(/([A-Z])/g, (m) => "_" + m.toLowerCase())
    .replace(/^_/, "")
    .replace(/__+/g, "_");
}

export const UNIVERSAL_SCALARS = {
  str: "string",
  String: "string",
  string: "string",
  int: "int32",
  Integer: "int32",
  long: "int64",
  float: "float",
  double: "double",
  Float: "float",
  Double: "double",
  bool: "bool",
  boolean: "bool",
  Boolean: "bool",
  bytes: "bytes",
  byte: "bytes",
  datetime: "google.protobuf.Timestamp",
  DateTime: "google.protobuf.Timestamp",
  Date: "google.protobuf.Timestamp",
  UUID: "string",
  uuid: "string",
  void: "google.protobuf.Empty",
  None: "google.protobuf.Empty",
  any: "bytes",
  object: "bytes",
};

function resolveType(rawType, typeMap, knownMessages) {
  if (typeMap[rawType]) return typeMap[rawType];
  if (UNIVERSAL_SCALARS[rawType]) return UNIVERSAL_SCALARS[rawType];
  const clean = rawType
    .replace(/[<[\]>?!]/g, "")
    .trim()
    .split(/[, ]+/)[0];
  if (typeMap[clean]) return typeMap[clean];
  if (UNIVERSAL_SCALARS[clean]) return UNIVERSAL_SCALARS[clean];
  if (knownMessages.has(clean)) return clean;
  if (knownMessages.has(rawType)) return rawType;
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

// ── Python dataclass / plain class ──────────────────────────────────────────
function parsePython(src) {
  const messages = [];
  const lines = src.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Match: class ClassName: or class ClassName(Base):
    // Must start at column 0 (not indented) and be a real class definition
    const classMatch = line.match(/^class\s+(\w+)\s*(?:\([^)]*\))?\s*:/);
    if (!classMatch) continue;

    const name = classMatch[1];
    // Skip obvious non-model names
    if (["Base", "Mixin", "Meta", "Config"].includes(name)) continue;

    // Collect the class body (indented lines after the class line)
    const bodyLines = [];
    let j = i + 1;
    while (j < lines.length) {
      const bl = lines[j];
      // Stop at next top-level class or function (line starting with non-whitespace that is not blank)
      if (bl.length > 0 && bl[0] !== " " && bl[0] !== "\t" && bl[0] !== "#")
        break;
      bodyLines.push(bl);
      j++;
    }
    const block = bodyLines.join("\n");

    // Parse typed fields: "    fieldname: type" or "    fieldname: type = default"
    const fieldRe = /^[ \t]+(\w+)\s*:\s*([^\s#=,)]+)/gm;
    const fields = [];
    let fm;
    while ((fm = fieldRe.exec(block)) !== null) {
      const fname = fm[1];
      // Skip dunder, self, cls, Meta, Config, __tablename__ etc.
      if (
        fname.startsWith("__") ||
        ["self", "cls", "Meta", "Config", "model_config"].includes(fname)
      )
        continue;
      let rawType = fm[2]
        .replace(/Optional\[(.+)\]/, "$1")
        .replace(/list\[(.+)\]/, "List:$1")
        .replace(/List\[(.+)\]/, "List:$1")
        .replace(/dict\[(.+),\s*(.+)\]/, "Dict:$1:$2")
        .replace(/Dict\[(.+),\s*(.+)\]/, "Dict:$1:$2")
        .replace(/\?$/, "");
      fields.push({ name: fname, rawType });
    }

    if (fields.length > 0) messages.push({ name, fields });
  }
  return messages;
}

// ── C# ──────────────────────────────────────────────────────────────────────
function parseCSharp(src) {
  const messages = [];
  const classRe = /(?:public\s+)?class\s+(\w+)[^{]*\{/g;
  const propRe = /(?:public\s+)?([\w<>[\]?]+)\s+(\w+)\s*\{/g;
  let cm;
  while ((cm = classRe.exec(src)) !== null) {
    const name = cm[1];
    const start = cm.index + cm[0].length;
    let depth = 1,
      i = start;
    while (i < src.length && depth > 0) {
      if (src[i] === "{") depth++;
      else if (src[i] === "}") depth--;
      i++;
    }
    const block = src.slice(start, i - 1);
    const fields = [];
    propRe.lastIndex = 0;
    let fm;
    while ((fm = propRe.exec(block)) !== null) {
      const rawType = fm[1].replace(/\?$/, "");
      fields.push({ name: fm[2], rawType });
    }
    messages.push({ name, fields });
  }
  return messages;
}

// ── TypeScript interface / class ─────────────────────────────────────────────
function parseTs(src) {
  const messages = [];
  const ifaceRe = /(?:interface|class|type)\s+(\w+)[^{]*\{/g;
  const fieldRe = /^\s*(\w+)\??\s*:\s*([^\s;,}]+(?:\[\])?)/gm;
  let im;
  while ((im = ifaceRe.exec(src)) !== null) {
    const name = im[1];
    const start = im.index + im[0].length;
    let depth = 1,
      i = start;
    while (i < src.length && depth > 0) {
      if (src[i] === "{") depth++;
      else if (src[i] === "}") depth--;
      i++;
    }
    const block = src.slice(start, i - 1);
    const fields = [];
    fieldRe.lastIndex = 0;
    let fm;
    while ((fm = fieldRe.exec(block)) !== null) {
      const isOpt = fm[0].includes("?");
      fields.push({
        name: fm[1],
        rawType: fm[2].replace(/\?$/, ""),
        optional: isOpt,
      });
    }
    messages.push({ name, fields });
  }
  return messages;
}

// ── Java class ───────────────────────────────────────────────────────────────
function parseJava(src) {
  const messages = [];
  const classRe = /(?:public\s+)?class\s+(\w+)[^{]*\{/g;
  const fieldRe = /(?:private|protected|public|)\s+([\w<>[\]]+)\s+(\w+)\s*;/g;
  let cm;
  while ((cm = classRe.exec(src)) !== null) {
    const name = cm[1];
    const start = cm.index + cm[0].length;
    let depth = 1,
      i = start;
    while (i < src.length && depth > 0) {
      if (src[i] === "{") depth++;
      else if (src[i] === "}") depth--;
      i++;
    }
    const block = src.slice(start, i - 1);
    const fields = [];
    fieldRe.lastIndex = 0;
    let fm;
    while ((fm = fieldRe.exec(block)) !== null) {
      fields.push({ name: fm[2], rawType: fm[1] });
    }
    messages.push({ name, fields });
  }
  return messages;
}

export const PARSERS = {
  python: parsePython,
  csharp: parseCSharp,
  java: parseJava,
  typescript: parseTs,
};

// ─── Proto generator ──────────────────────────────────────────────────────────

export function toProto(messages, typeMap, options = {}) {
  const {
    packageName = "mypackage",
    addService = false,
  } = options;
  const knownMessages = new Set(messages.map((m) => m.name));
  const needsTimestamp = messages.some((m) =>
    m.fields.some(
      (f) =>
        resolveType(f.rawType, typeMap, knownMessages) ===
        "google.protobuf.Timestamp",
    ),
  );
  const needsEmpty = messages.some((m) =>
    m.fields.some(
      (f) =>
        resolveType(f.rawType, typeMap, knownMessages) ===
        "google.protobuf.Empty",
    ),
  );

  const lines = [];
  lines.push(`syntax = "proto3";`);
  lines.push("");
  lines.push(`package ${packageName};`);
  lines.push("");

  if (needsTimestamp) lines.push(`import "google/protobuf/timestamp.proto";`);
  if (needsEmpty) lines.push(`import "google/protobuf/empty.proto";`);
  if (needsTimestamp || needsEmpty) lines.push("");

  // Messages
  for (const msg of messages) {
    lines.push(`message ${msg.name} {`);
    let fieldNum = 1;

    for (const field of msg.fields) {
      const snake = toSnakeCase(field.name);
      const rawType = field.rawType;
      let protoType = resolveType(rawType, typeMap, knownMessages);
      let prefix = "";
      let comment = "";

      // Handle collection types
      // AFTER
      if (
        protoType === "repeated" ||
        rawType.startsWith("List") ||
        rawType.startsWith("repeated") ||
        rawType.startsWith("Vec:") ||
        rawType.startsWith("[]") ||
        rawType.endsWith("[]") ||
        rawType.startsWith("List:") ||
        rawType.startsWith("Array")
      ) {
        prefix = "repeated ";
        const inner = rawType
          .replace(/^(?:List|Vec|Array|repeated)\[?:?<?\[?/, "")
          .replace(/[\]>)[\]]+$/, "")
          .trim();
        const innerResolved = resolveType(inner, typeMap, knownMessages);
        protoType = innerResolved;
      } else if (protoType === "map") {
        // Default key/value
        prefix = "";
        protoType = "map<string, string>";
        comment = " // review key/value types";
      } else if (field.optional) {
        prefix = "optional ";
      }

      lines.push(`  ${prefix}${protoType} ${snake} = ${fieldNum};${comment}`);
      fieldNum++;
    }

    lines.push("}");
    lines.push("");
  }

  // Optional service scaffold
  if (addService && messages.length > 0) {
    const mainMsg = messages[messages.length - 1];
    const svcName = mainMsg.name + "Service";
    lines.push(`service ${svcName} {`);
    lines.push(
      `  rpc Get${mainMsg.name}(Get${mainMsg.name}Request) returns (${mainMsg.name});`,
    );
    lines.push(
      `  rpc Create${mainMsg.name}(${mainMsg.name}) returns (${mainMsg.name});`,
    );
    lines.push(
      `  rpc Update${mainMsg.name}(${mainMsg.name}) returns (${mainMsg.name});`,
    );
    lines.push(
      `  rpc Delete${mainMsg.name}(Delete${mainMsg.name}Request) returns (google.protobuf.Empty);`,
    );
    lines.push(
      `  rpc List${mainMsg.name}s(List${mainMsg.name}sRequest) returns (${mainMsg.name}ListResponse);`,
    );
    lines.push(`}`);
    lines.push("");
    lines.push(`message Get${mainMsg.name}Request {`);
    lines.push(`  string id = 1;`);
    lines.push(`}`);
    lines.push("");
    lines.push(`message Delete${mainMsg.name}Request {`);
    lines.push(`  string id = 1;`);
    lines.push(`}`);
    lines.push("");
    lines.push(`message List${mainMsg.name}sRequest {`);
    lines.push(`  int32 page = 1;`);
    lines.push(`  int32 page_size = 2;`);
    lines.push(`}`);
    lines.push("");
    lines.push(`message ${mainMsg.name}ListResponse {`);
    lines.push(`  repeated ${mainMsg.name} items = 1;`);
    lines.push(`  int32 total = 2;`);
    lines.push(`}`);
  }

  return lines.join("\n").trim();
}
