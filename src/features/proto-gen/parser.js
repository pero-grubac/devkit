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

const CPP_TO_PROTO = {
  int32_t: "int32",
  int64_t: "int64",
  int: "int32",
  long: "int64",
  float: "float",
  double: "double",
  bool: "bool",
  "std::string": "string",
  string: "string",
  "std::vector": "repeated",
  "std::map": "map",
  "std::unordered_map": "map",
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

const GO_TO_PROTO = {
  int: "int32",
  int32: "int32",
  int64: "int64",
  uint32: "uint32",
  uint64: "uint64",
  float32: "float",
  float64: "double",
  string: "string",
  bool: "bool",
  "[]byte": "bytes",
  error: "string",
  "time.Time": "google.protobuf.Timestamp",
};

const RUBY_TO_PROTO = {
  Integer: "int32",
  Float: "float",
  String: "string",
  TrueClass: "bool",
  FalseClass: "bool",
  Symbol: "string",
  Array: "repeated",
  Hash: "map",
  NilClass: "google.protobuf.Empty",
};

const RUST_TO_PROTO = {
  i32: "int32",
  i64: "int64",
  u32: "uint32",
  u64: "uint64",
  f32: "float",
  f64: "double",
  bool: "bool",
  String: "string",
  "&str": "string",
  "Vec<u8>": "bytes",
  Vec: "repeated",
  HashMap: "map",
  Option: "optional",
  "()": "google.protobuf.Empty",
};

const SWIFT_TO_PROTO = {
  Int: "int32",
  Int32: "int32",
  Int64: "int64",
  Float: "float",
  Double: "double",
  String: "string",
  Bool: "bool",
  Data: "bytes",
  Array: "repeated",
  Dictionary: "map",
  Void: "google.protobuf.Empty",
  Date: "google.protobuf.Timestamp",
};

const KOTLIN_TO_PROTO = {
  Int: "int32",
  Long: "int64",
  Float: "float",
  Double: "double",
  String: "string",
  Boolean: "bool",
  ByteArray: "bytes",
  List: "repeated",
  MutableList: "repeated",
  Map: "map",
  MutableMap: "map",
  Unit: "google.protobuf.Empty",
  LocalDateTime: "google.protobuf.Timestamp",
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

const CPP_SAMPLE = `struct Address {
    std::string street;
    std::string city;
    std::string zip_code;
    std::string country;
};

struct User {
    int32_t id;
    std::string name;
    std::string email;
    int32_t age;
    bool active;
    double score;
    Address address;
    std::vector<std::string> tags;
};`;

const JS_SAMPLE = `class Address {
  constructor() {
    this.street = '';
    this.city = '';
    this.zipCode = '';
    this.country = '';
  }
}

class User {
  constructor() {
    this.id = 0;
    this.name = '';
    this.email = '';
    this.age = 0;
    this.active = false;
    this.score = 0.0;
    this.address = new Address();
    this.tags = [];
  }
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

const GO_SAMPLE = `type Address struct {
    Street  string \`json:"street"\`
    City    string \`json:"city"\`
    ZipCode string \`json:"zip_code"\`
    Country string \`json:"country"\`
}

type User struct {
    ID        int32       \`json:"id"\`
    Name      string      \`json:"name"\`
    Email     string      \`json:"email"\`
    Age       int32       \`json:"age"\`
    Active    bool        \`json:"active"\`
    Score     float64     \`json:"score"\`
    Address   Address     \`json:"address"\`
    Tags      []string    \`json:"tags"\`
    CreatedAt time.Time   \`json:"created_at"\`
}`;

const RUBY_SAMPLE = `class Address
  attr_accessor :street, :city, :zip_code, :country

  def initialize(street, city, zip_code, country)
    @street = street
    @city = city
    @zip_code = zip_code
    @country = country
  end
end

class User
  attr_accessor :id, :name, :email, :age, :active, :score, :address, :tags

  def initialize(id, name, email, age, active, score, address, tags)
    @id = id
    @name = name
    @email = email
    @age = age
    @active = active
    @score = score
    @address = address
    @tags = tags
  end
end`;

const RUST_SAMPLE = `#[derive(Debug, Serialize, Deserialize)]
pub struct Address {
    pub street: String,
    pub city: String,
    pub zip_code: String,
    pub country: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct User {
    pub id: i32,
    pub name: String,
    pub email: String,
    pub age: i32,
    pub active: bool,
    pub score: f64,
    pub address: Address,
    pub tags: Vec<String>,
    pub nickname: Option<String>,
}`;

const SWIFT_SAMPLE = `struct Address {
    var street: String
    var city: String
    var zipCode: String
    var country: String
}

struct User {
    var id: Int
    var name: String
    var email: String
    var age: Int
    var active: Bool
    var score: Double
    var address: Address
    var tags: [String]
    var createdAt: Date
    var nickname: String?
}`;

const KOTLIN_SAMPLE = `data class Address(
    val street: String,
    val city: String,
    val zipCode: String,
    val country: String
)

data class User(
    val id: Int,
    val name: String,
    val email: String,
    val age: Int,
    val active: Boolean,
    val score: Double,
    val address: Address,
    val tags: List<String>,
    val createdAt: LocalDateTime,
    val nickname: String?
)`;

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

function isPrimitive(t) {
  return [
    "int32",
    "int64",
    "uint32",
    "uint64",
    "sint32",
    "sint64",
    "fixed32",
    "fixed64",
    "sfixed32",
    "sfixed64",
    "float",
    "double",
    "bool",
    "string",
    "bytes",
  ].includes(t);
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
    .replace(/[<\[\]>?!]/g, "")
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
  const propRe = /(?:public\s+)?([\w<>\[\]?]+)\s+(\w+)\s*\{/g;
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

// ── C++ struct ──────────────────────────────────────────────────────────────
function parseCpp(src) {
  const messages = [];
  const structRe = /struct\s+(\w+)\s*\{([^}]+)\}/g;
  const fieldRe = /^\s*([\w:<>]+(?:\s*<[^>]+>)?)\s+(\w+)\s*;/gm;
  let sm;
  while ((sm = structRe.exec(src)) !== null) {
    const name = sm[1];
    const fields = [];
    let fm;
    while ((fm = fieldRe.exec(sm[2])) !== null) {
      fields.push({ name: fm[2], rawType: fm[1].trim() });
    }
    messages.push({ name, fields });
  }
  return messages;
}

// ── JavaScript class (constructor assignments) ───────────────────────────────
function parseJs(src) {
  const messages = [];
  const classRe = /class\s+(\w+)[^{]*\{/g;
  const assignRe = /this\.(\w+)\s*=\s*([^;]+);/g;
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
    assignRe.lastIndex = 0;
    let am;
    while ((am = assignRe.exec(block)) !== null) {
      const val = am[2].trim();
      let rawType = "string";
      if (val === "0" || val === "0.0") rawType = "number";
      else if (val === "false" || val === "true") rawType = "boolean";
      else if (val === "[]") rawType = "Array";
      else if (val.startsWith("new "))
        rawType = val
          .slice(4)
          .replace(/\(\).*/, "")
          .trim();
      else if (val === "''") rawType = "string";
      fields.push({ name: am[1], rawType });
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

// ── Go struct ────────────────────────────────────────────────────────────────
function parseGo(src) {
  const messages = [];
  const structRe = /type\s+(\w+)\s+struct\s*\{([^}]+)\}/g;
  const fieldRe = /^\s+(\w+)\s+([\w\[\]*./]+)/gm;
  let sm;
  while ((sm = structRe.exec(src)) !== null) {
    const name = sm[1];
    const fields = [];
    let fm;
    while ((fm = fieldRe.exec(sm[2])) !== null) {
      fields.push({ name: fm[1], rawType: fm[2].replace(/\[\]/, "[]") });
    }
    messages.push({ name, fields });
  }
  return messages;
}

// ── Ruby class (attr_accessor) ───────────────────────────────────────────────
function parseRuby(src) {
  const messages = [];
  const classRe = /class\s+(\w+)(.*?)(?=\nclass\s|\z)/gs;
  const attrRe = /attr_accessor\s+(.+)/g;
  let cm;
  while ((cm = classRe.exec(src)) !== null) {
    const name = cm[1];
    const block = cm[2];
    const fields = [];
    let am;
    while ((am = attrRe.exec(block)) !== null) {
      const attrs = am[1].split(",").map((a) => a.trim().replace(/^:/, ""));
      attrs.forEach((a) => fields.push({ name: a, rawType: "string" }));
    }
    // Try to guess types from initialize param names
    const initRe = /@(\w+)\s*=\s*(\w+)/g;
    let im;
    while ((im = initRe.exec(block)) !== null) {
      const f = fields.find((f) => f.name === im[1]);
      const v = im[2];
      if (f) {
        if (v === "id" || v.endsWith("_id") || v === "age")
          f.rawType = "Integer";
        else if (v === "active" || v === "enabled") f.rawType = "bool";
        else if (v === "score") f.rawType = "Float";
        else if (v === "tags") f.rawType = "Array";
      }
    }
    messages.push({ name, fields });
  }
  return messages;
}

// ── Rust struct ──────────────────────────────────────────────────────────────
function parseRust(src) {
  const messages = [];
  const structRe = /(?:pub\s+)?struct\s+(\w+)\s*\{([^}]+)\}/g;
  const fieldRe = /(?:pub\s+)?(\w+)\s*:\s*([\w<>: &\[\]]+)/gm;
  let sm;
  while ((sm = structRe.exec(src)) !== null) {
    const name = sm[1];
    const fields = [];
    let fm;
    while ((fm = fieldRe.exec(sm[2])) !== null) {
      let rawType = fm[2].trim();
      const optMatch = rawType.match(/^Option<(.+)>$/);
      if (optMatch) rawType = optMatch[1];
      const vecMatch = rawType.match(/^Vec<(.+)>$/);
      if (vecMatch) rawType = "Vec:" + vecMatch[1];
      fields.push({ name: fm[1], rawType });
    }
    messages.push({ name, fields });
  }
  return messages;
}

// ── Swift struct ─────────────────────────────────────────────────────────────
function parseSwift(src) {
  const messages = [];
  const structRe = /(?:struct|class)\s+(\w+)[^{]*\{/g;
  const fieldRe = /(?:var|let)\s+(\w+)\s*:\s*([\w<>\[\]?]+)/gm;
  let sm;
  while ((sm = structRe.exec(src)) !== null) {
    const name = sm[1];
    const start = sm.index + sm[0].length;
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
      const isOpt = fm[2].endsWith("?");
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

// ── Kotlin data class ────────────────────────────────────────────────────────
function parseKotlin(src) {
  const messages = [];
  const classRe = /(?:data\s+)?class\s+(\w+)\s*\(([^)]+)\)/g;
  const fieldRe = /(?:val|var)\s+(\w+)\s*:\s*([\w<>?]+)/g;
  let cm;
  while ((cm = classRe.exec(src)) !== null) {
    const name = cm[1];
    const params = cm[2];
    const fields = [];
    fieldRe.lastIndex = 0;
    let fm;
    while ((fm = fieldRe.exec(params)) !== null) {
      const isOpt = fm[2].endsWith("?");
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
    proto3 = true,
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
          .replace(/[\]>)\[\]]+$/, "")
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
