// ─── ORM / Schema model parsers ───────────────────────────────────────────────
// Each parser returns the same shape as the plain-class parsers:
// [{ name: string, fields: [{ name, rawType, optional? }] }]

function toProtoType(raw) {
  const t = raw.toLowerCase();
  if (t.includes("biginteger") || t.includes("bigint"))     return "int64";
  if (t.includes("integer") || t.includes("int"))           return "int32";
  if (t.includes("smallinteger") || t.includes("smallint")) return "int32";
  if (t.includes("float") || t.includes("numeric") || t.includes("decimal")) return "float";
  if (t.includes("double"))    return "double";
  if (t.includes("boolean") || t.includes("bool")) return "bool";
  if (t.includes("datetime") || t.includes("timestamp") || t.includes("date")) return "google.protobuf.Timestamp";
  if (t.includes("json") || t.includes("jsonb")) return "bytes";
  if (t.includes("uuid"))   return "string";
  if (t.includes("string") || t.includes("text") || t.includes("varchar") || t.includes("char")) return "string";
  if (t.includes("bytes") || t.includes("blob") || t.includes("binary")) return "bytes";
  if (t.includes("enum"))   return "string"; // note: should be an enum type
  return null; // unknown — caller will treat as message type
}

// ── SQLAlchemy ────────────────────────────────────────────────────────────────
export function parseSqlAlchemy(src) {
  const messages = [];
  // Match class definitions that extend Base / db.Model / DeclarativeBase etc.
  const classRe  = /class\s+(\w+)\s*\([^)]*\)\s*:/g;
  let cm;
  while ((cm = classRe.exec(src)) !== null) {
    const name   = cm[1];
    if (["Base", "TimestampMixin", "Mixin"].includes(name)) continue;
    const start  = cm.index + cm[0].length;
    const nextCm = src.slice(start).search(/\nclass\s/);
    const block  = nextCm > 0 ? src.slice(start, start + nextCm) : src.slice(start);
    const fields = [];

    // Column fields:  name = Column(Type, ...)
    const colRe = /(\w+)\s*=\s*Column\s*\(\s*([^,)]+)/g;
    let fr;
    while ((fr = colRe.exec(block)) !== null) {
      const fieldName = fr[1];
      if (fieldName.startsWith("__")) continue;
      const rawCol = fr[2].trim();
      // Extract inner type from String(64) → String, BigInteger → BigInteger
      const innerType = rawCol.replace(/\s*\(.*$/, "").trim();
      const protoType = toProtoType(innerType) || innerType;
      // nullable → optional
      const isOpt = fr[0].includes("nullable=True");
      fields.push({ name: fieldName, rawType: protoType, optional: isOpt });
    }

    // relationship fields:  name = relationship("ModelName", ...)
    const relRe = /(\w+)\s*=\s*relationship\s*\(\s*["'](\w+)["']/g;
    let rr;
    while ((rr = relRe.exec(block)) !== null) {
      fields.push({ name: rr[1], rawType: rr[2], modifier: "repeated" });
    }

    if (fields.length > 0) messages.push({ name, fields });
  }
  return messages;
}

// ── Django ORM ────────────────────────────────────────────────────────────────
export function parseDjangoOrm(src) {
  const messages = [];
  const classRe  = /class\s+(\w+)\s*\(models\.Model[^)]*\)\s*:/g;
  let cm;
  while ((cm = classRe.exec(src)) !== null) {
    const name   = cm[1];
    const start  = cm.index + cm[0].length;
    const nextCm = src.slice(start).search(/\nclass\s/);
    const block  = nextCm > 0 ? src.slice(start, start + nextCm) : src.slice(start);
    const fields = [];

    // field = models.FieldType(...)
    const fieldRe = /(\w+)\s*=\s*models\.(\w+)\s*\(/g;
    let fr;
    while ((fr = fieldRe.exec(block)) !== null) {
      const fieldName  = fr[1];
      if (fieldName === "Meta" || fieldName.startsWith("__")) continue;
      const djangoType = fr[2];
      let protoType;
      const isOpt = fr[0].includes("null=True") || fr[0].includes("blank=True");

      const DJMap = {
        AutoField: "int32", BigAutoField: "int64", SmallAutoField: "int32",
        IntegerField: "int32", BigIntegerField: "int64", SmallIntegerField: "int32",
        PositiveIntegerField: "uint32", PositiveSmallIntegerField: "uint32",
        FloatField: "float", DecimalField: "double",
        BooleanField: "bool", NullBooleanField: "bool",
        CharField: "string", TextField: "string", EmailField: "string",
        URLField: "string", SlugField: "string", UUIDField: "string",
        IPAddressField: "string", GenericIPAddressField: "string",
        DateTimeField: "google.protobuf.Timestamp",
        DateField: "google.protobuf.Timestamp",
        TimeField: "google.protobuf.Timestamp",
        BinaryField: "bytes", JSONField: "bytes",
        FileField: "string", ImageField: "string",
        ForeignKey: null, OneToOneField: null,
        ManyToManyField: null,
      };

      if (djangoType === "ForeignKey" || djangoType === "OneToOneField") {
        // Extract the referenced model name
        const toMatch = fr[0].match(/\(["']?(\w+)["']?/);
        protoType = toMatch ? toMatch[1] : "string";
        fields.push({ name: fieldName + "_id", rawType: "int64", optional: isOpt });
        continue;
      }
      if (djangoType === "ManyToManyField") {
        const toMatch = fr[0].match(/\(["']?(\w+)["']?/);
        protoType = toMatch ? toMatch[1] : "string";
        fields.push({ name: fieldName, rawType: protoType, modifier: "repeated" });
        continue;
      }

      protoType = DJMap[djangoType] ?? toProtoType(djangoType) ?? djangoType;
      fields.push({ name: fieldName, rawType: protoType, optional: isOpt });
    }

    if (fields.length > 0) messages.push({ name, fields });
  }
  return messages;
}

// ── Pydantic ──────────────────────────────────────────────────────────────────
export function parsePydantic(src) {
  const messages = [];
  // BaseModel, BaseSettings, RootModel, etc.
  const classRe = /class\s+(\w+)\s*\((?:BaseModel|BaseSettings|RootModel|SQLModel)[^)]*\)\s*:/g;
  const fieldRe = /^\s{4}(\w+)\s*:\s*([^\s=#\n]+)(?:\s*=\s*(?:Field|field)?\s*[^#\n]*)?/gm;
  let cm;
  while ((cm = classRe.exec(src)) !== null) {
    const name   = cm[1];
    const start  = cm.index + cm[0].length;
    const nextCm = src.slice(start).search(/\nclass\s/);
    const block  = nextCm > 0 ? src.slice(start, start + nextCm) : src.slice(start);
    const fields = [];
    fieldRe.lastIndex = 0;
    let fr;
    while ((fr = fieldRe.exec(block)) !== null) {
      let rawType = fr[2];
      const isOpt = rawType.startsWith("Optional[") || rawType.includes("| None");
      rawType = rawType
        .replace(/Optional\[(.+)\]/, "$1")
        .replace(/\s*\|\s*None/, "")
        .replace(/List\[(.+)\]/, "List:$1")
        .replace(/list\[(.+)\]/, "List:$1")
        .trim();

      const PydMap = {
        int: "int32", float: "float", str: "string",
        bool: "bool", bytes: "bytes", "datetime": "google.protobuf.Timestamp",
        "date": "google.protobuf.Timestamp", "UUID": "string",
        "EmailStr": "string", "AnyUrl": "string", "HttpUrl": "string",
        "PositiveInt": "int32", "NegativeInt": "int32",
        "PositiveFloat": "float", "condecimal": "double",
      };

      let protoType = PydMap[rawType];
      if (!protoType) {
        // List[X] pattern
        if (rawType.startsWith("List:")) {
          const inner = rawType.slice(5);
          const innerProto = PydMap[inner] || inner;
          fields.push({ name: fr[1], rawType: innerProto, modifier: "repeated", optional: isOpt });
          continue;
        }
        protoType = toProtoType(rawType) || rawType;
      }
      fields.push({ name: fr[1], rawType: protoType, optional: isOpt });
    }
    if (fields.length > 0) messages.push({ name, fields });
  }
  return messages;
}

// ── Entity Framework (C#) ─────────────────────────────────────────────────────
export function parseEntityFramework(src) {
  const messages = [];
  const classRe  = /public\s+class\s+(\w+)\s*(?::\s*[\w<>, ]+)?\s*\{/g;
  const propRe   = /\[.*?\]\s*public\s+([\w<>?\[\]]+)\s+(\w+)\s*\{\s*get/g;
  const plainRe  = /public\s+([\w<>?\[\]]+)\s+(\w+)\s*\{\s*get/g;
  let cm;
  while ((cm = classRe.exec(src)) !== null) {
    const name  = cm[1];
    if (["DbContext", "ApplicationDbContext", "IdentityUser"].some(s => name.includes(s))) continue;
    const start = cm.index + cm[0].length;
    let depth = 1, i = start;
    while (i < src.length && depth > 0) {
      if (src[i] === "{") depth++;
      else if (src[i] === "}") depth--;
      i++;
    }
    const block  = src.slice(start, i - 1);
    const fields = [];

    const EFMap = {
      int: "int32", "int?": "int32", Int32: "int32",
      long: "int64", "long?": "int64", Int64: "int64",
      float: "float", "float?": "float",
      double: "double", "double?": "double",
      decimal: "double", "decimal?": "double",
      string: "string", bool: "bool", "bool?": "bool",
      "DateTime": "google.protobuf.Timestamp",
      "DateTime?": "google.protobuf.Timestamp",
      "DateTimeOffset": "google.protobuf.Timestamp",
      "Guid": "string", "Guid?": "string",
      "byte[]": "bytes",
    };

    const processProps = (re) => {
      re.lastIndex = 0;
      let fr;
      while ((fr = re.exec(block)) !== null) {
        let rawType = fr[1].replace(/\?$/, "");
        const isOpt = fr[1].endsWith("?");
        const fieldName = fr[2];

        // ICollection<T>, List<T>, IEnumerable<T> → repeated
        const collMatch = rawType.match(/^(?:ICollection|List|IEnumerable|IList|HashSet)<(\w+)>$/);
        if (collMatch) {
          fields.push({ name: fieldName, rawType: collMatch[1], modifier: "repeated" });
          continue;
        }

        const protoType = EFMap[rawType] ?? toProtoType(rawType) ?? rawType;
        if (fieldName !== "Id" || fields.length === 0) // avoid duplicate Id
          fields.push({ name: fieldName, rawType: protoType, optional: isOpt });
      }
    };

    processProps(propRe);
    if (fields.length === 0) processProps(plainRe);
    if (fields.length > 0) messages.push({ name, fields });
  }
  return messages;
}

// ── JPA / Hibernate (Java) ────────────────────────────────────────────────────
export function parseJpa(src) {
  const messages = [];
  // Match @Entity classes
  const classRe = /@Entity[\s\S]*?class\s+(\w+)(?:\s+extends\s+\w+)?\s*\{/g;
  let cm;
  while ((cm = classRe.exec(src)) !== null) {
    const name  = cm[1];
    const start = cm.index + cm[0].length;
    let depth = 1, i = start;
    while (i < src.length && depth > 0) {
      if (src[i] === "{") depth++;
      else if (src[i] === "}") depth--;
      i++;
    }
    const block  = src.slice(start, i - 1);
    const fields = [];

    const JPAMap = {
      int: "int32", Integer: "int32", long: "int64", Long: "int64",
      short: "int32", Short: "int32",
      float: "float", Float: "float", double: "double", Double: "double",
      BigDecimal: "double", BigInteger: "int64",
      String: "string", boolean: "bool", Boolean: "bool",
      "byte[]": "bytes", "Byte[]": "bytes",
      LocalDateTime: "google.protobuf.Timestamp",
      LocalDate: "google.protobuf.Timestamp",
      ZonedDateTime: "google.protobuf.Timestamp",
      Date: "google.protobuf.Timestamp",
      UUID: "string",
    };

    // private Type name;  or  private Type name = ...;
    const fieldRe = /(?:private|protected|public)\s+([\w<>[\]]+)\s+(\w+)\s*[;=]/g;
    let fr;
    while ((fr = fieldRe.exec(block)) !== null) {
      let rawType   = fr[1];
      const fName   = fr[2];

      // List<T>, Set<T>, Collection<T> → repeated
      const collMatch = rawType.match(/^(?:List|Set|Collection|ArrayList|LinkedList)<(\w+)>$/);
      if (collMatch) {
        const inner = JPAMap[collMatch[1]] ?? collMatch[1];
        fields.push({ name: fName, rawType: inner, modifier: "repeated" });
        continue;
      }

      const protoType = JPAMap[rawType] ?? toProtoType(rawType) ?? rawType;
      fields.push({ name: fName, rawType: protoType });
    }

    if (fields.length > 0) messages.push({ name, fields });
  }
  return messages;
}

// ── TypeORM (TypeScript) ──────────────────────────────────────────────────────
export function parseTypeOrm(src) {
  const messages = [];
  const classRe  = /@Entity[\s\S]*?class\s+(\w+)(?:\s+extends\s+[\w<>]+)?\s*\{/g;
  let cm;
  while ((cm = classRe.exec(src)) !== null) {
    const name  = cm[1];
    const start = cm.index + cm[0].length;
    let depth = 1, i = start;
    while (i < src.length && depth > 0) {
      if (src[i] === "{") depth++;
      else if (src[i] === "}") depth--;
      i++;
    }
    const block  = src.slice(start, i - 1);
    const fields = [];

    const TSMap = {
      number: "double", string: "string", boolean: "bool",
      Date: "google.protobuf.Timestamp",
      Buffer: "bytes",
    };

    // @Column() / @PrimaryGeneratedColumn() / @CreateDateColumn() etc.
    // followed by fieldName: type
    const colRe = /(?:@(?:PrimaryGeneratedColumn|PrimaryColumn|Column|CreateDateColumn|UpdateDateColumn|DeleteDateColumn)\([^)]*\)\s*)+(\w+)\s*[?!]?\s*:\s*([\w<>|\[\] ]+)/g;
    let fr;
    while ((fr = colRe.exec(block)) !== null) {
      const fName   = fr[1];
      let rawType   = fr[2].trim().replace(/\s*\|\s*null/, "").replace(/\s*\|\s*undefined/, "");
      const isOpt   = fr[0].includes("?");

      // Array type: string[] or Array<string>
      const arrMatch = rawType.match(/^(\w+)\[\]$/) || rawType.match(/^Array<(\w+)>$/);
      if (arrMatch) {
        const inner = TSMap[arrMatch[1]] ?? arrMatch[1];
        fields.push({ name: fName, rawType: inner, modifier: "repeated", optional: isOpt });
        continue;
      }

      const protoType = TSMap[rawType] ?? toProtoType(rawType) ?? rawType;
      fields.push({ name: fName, rawType: protoType, optional: isOpt });
    }

    // @OneToMany / @ManyToMany → repeated
    const relRe = /@(?:OneToMany|ManyToMany)\([^)]*\)\s+(\w+)\s*[?!]?\s*:\s*([\w<>]+)/g;
    let rr;
    while ((rr = relRe.exec(block)) !== null) {
      const inner = rr[2].replace(/^(?:Promise|Relation)<(.+)>$/, "$1")
                         .replace(/\[\]$/, "");
      fields.push({ name: rr[1], rawType: inner, modifier: "repeated" });
    }

    // @ManyToOne / @OneToOne → single ref
    const relOneRe = /@(?:ManyToOne|OneToOne)\([^)]*\)\s+(\w+)\s*[?!]?\s*:\s*(\w+)/g;
    let ro;
    while ((ro = relOneRe.exec(block)) !== null) {
      fields.push({ name: ro[1], rawType: ro[2] });
    }

    if (fields.length > 0) messages.push({ name, fields });
  }
  return messages;
}

// ── Prisma Schema ─────────────────────────────────────────────────────────────
export function parsePrisma(src) {
  const messages = [];
  const modelRe  = /model\s+(\w+)\s*\{([^}]+)\}/g;
  let mm;
  while ((mm = modelRe.exec(src)) !== null) {
    const name   = mm[1];
    const block  = mm[2];
    const fields = [];

    const PrismaMap = {
      Int: "int32", BigInt: "int64", Float: "float",
      Decimal: "double", Boolean: "bool",
      String: "string", Bytes: "bytes",
      DateTime: "google.protobuf.Timestamp",
      Json: "bytes",
    };

    // fieldName  FieldType  @directives
    const fieldRe = /^\s+(\w+)\s+([\w]+)(\[\])?\s*(\?)?/gm;
    let fr;
    while ((fr = fieldRe.exec(block)) !== null) {
      const fName    = fr[1];
      const rawType  = fr[2];
      const isArr    = !!fr[3];
      const isOpt    = !!fr[4];

      if (fName.startsWith("@@") || fName.startsWith("//")) continue;

      const protoType = PrismaMap[rawType] ?? toProtoType(rawType) ?? rawType;

      if (isArr) {
        fields.push({ name: fName, rawType: protoType, modifier: "repeated" });
      } else {
        fields.push({ name: fName, rawType: protoType, optional: isOpt });
      }
    }

    if (fields.length > 0) messages.push({ name, fields });
  }
  return messages;
}

// ─── ORM config map (mirrors LANG_MAP shape) ──────────────────────────────────

const SQLALCHEMY_SAMPLE = `from sqlalchemy import Column, BigInteger, Integer, String, Float, DateTime, Boolean, Enum as ENUM
from sqlalchemy.orm import relationship
from app.database import Base

class Condition(Base):
    __tablename__ = "conditions"
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    name = Column(String(64), nullable=False)
    condition_type = Column(ENUM(ConditionType), nullable=False)
    event_number = Column(Integer)
    min_quota = Column(Float)
    user_created = Column(String(128), nullable=False)
    dt_created = Column(DateTime, nullable=False)
    user_updated = Column(String(128), nullable=True)
    dt_updated = Column(DateTime, nullable=True)
    oddtypes = relationship("ConditionsCustomOddType", cascade="all, delete-orphan", back_populates="condition")`;

const DJANGO_SAMPLE = `from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Article(models.Model):
    title = models.CharField(max_length=200)
    body = models.TextField()
    author = models.ForeignKey('User', on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    tags = models.ManyToManyField('Tag')
    published = models.BooleanField(default=False)
    views = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)`;

const PYDANTIC_SAMPLE = `from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from uuid import UUID

class AddressSchema(BaseModel):
    street: str
    city: str
    zip_code: str
    country: str

class UserSchema(BaseModel):
    id: int
    name: str
    email: EmailStr
    age: int
    active: bool
    score: float
    address: AddressSchema
    tags: List[str]
    created_at: datetime
    nickname: Optional[str] = None`;

const EF_SAMPLE = `using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

[Table("Orders")]
public class Order
{
    [Key]
    public int Id { get; set; }
    [Required]
    public string CustomerName { get; set; }
    public decimal TotalAmount { get; set; }
    public DateTime OrderDate { get; set; }
    public bool IsPaid { get; set; }
    public Guid TrackingId { get; set; }
    public ICollection<OrderItem> Items { get; set; }
}

public class OrderItem
{
    public int Id { get; set; }
    public string ProductName { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}`;

const JPA_SAMPLE = `import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;
    private Double price;
    private Integer stock;
    private Boolean active;
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    private List<Review> reviews;
}`;

const TYPEORM_SAMPLE = `import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, ManyToOne } from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column({ default: true })
    active: boolean;

    @Column({ type: 'float', nullable: true })
    score?: number;

    @CreateDateColumn()
    createdAt: Date;

    @OneToMany(() => Post, post => post.author)
    posts: Post[];
}`;

const PRISMA_SAMPLE = `model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  active    Boolean  @default(true)
  score     Float?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  posts     Post[]
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  createdAt DateTime @default(now())
  authorId  Int
}`;

export const ORM_MAP = {
  sqlalchemy: { label: "SQLAlchemy",       group: "Python",     parser: parseSqlAlchemy,    placeholder: SQLALCHEMY_SAMPLE },
  django:     { label: "Django ORM",       group: "Python",     parser: parseDjangoOrm,     placeholder: DJANGO_SAMPLE     },
  pydantic:   { label: "Pydantic",         group: "Python",     parser: parsePydantic,      placeholder: PYDANTIC_SAMPLE   },
  ef:         { label: "Entity Framework", group: "C#",         parser: parseEntityFramework,placeholder: EF_SAMPLE        },
  jpa:        { label: "JPA/Hibernate",    group: "Java",       parser: parseJpa,           placeholder: JPA_SAMPLE        },
  typeorm:    { label: "TypeORM",          group: "TypeScript", parser: parseTypeOrm,       placeholder: TYPEORM_SAMPLE    },
  prisma:     { label: "Prisma",           group: "TypeScript", parser: parsePrisma,        placeholder: PRISMA_SAMPLE     },
};
