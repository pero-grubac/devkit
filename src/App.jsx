import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { TopBar }  from "./components/TopBar";

import { JsonFormatter }  from "./features/json-formatter";
import { YamlTool }       from "./features/yaml";
import { Base64Tool }     from "./features/base64";
import { JwtTool }        from "./features/jwt";
import { HashTool }       from "./features/hash";
import { RegexTool }      from "./features/regex";
import { ColorTool }      from "./features/color";
import { TimestampTool }  from "./features/timestamp";
import { UuidTool }       from "./features/uuid";
import { StringTool }     from "./features/string-utils";
import { NumberTool }     from "./features/number";
import { DiffTool }       from "./features/diff";
import { MarkdownTool }   from "./features/markdown";
import { LoremTool }      from "./features/lorem";
import { CommitTool }     from "./features/commit";
import { GitignoreTool }  from "./features/gitignore";
import { PasswordTool }   from "./features/password";
import { TotpTool }       from "./features/totp";
import { CronTool }       from "./features/cron";
import { HttpStatusTool } from "./features/http-status";
import { SemverTool }     from "./features/semver";
import { SqlTool }        from "./features/sql";
import { IpTool }         from "./features/ip-cidr";
import { QrTool }         from "./features/qr-code";

const TOOLS = {
  json:      JsonFormatter,
  yaml:      YamlTool,
  base64:    Base64Tool,
  jwt:       JwtTool,
  hash:      HashTool,
  regex:     RegexTool,
  color:     ColorTool,
  time:      TimestampTool,
  uuid:      UuidTool,
  string:    StringTool,
  number:    NumberTool,
  diff:      DiffTool,
  markdown:  MarkdownTool,
  lorem:     LoremTool,
  commit:    CommitTool,
  gitignore: GitignoreTool,
  password:  PasswordTool,
  totp:      TotpTool,
  cron:      CronTool,
  http:      HttpStatusTool,
  semver:    SemverTool,
  sql:       SqlTool,
  ip:        IpTool,
  qr:        QrTool,
};

export default function App() {
  const [tab,       setTab]       = useState("json");
  const [collapsed, setCollapsed] = useState(false);
  const ActiveTool = TOOLS[tab];

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar tab={tab} setTab={setTab} collapsed={collapsed} setCollapsed={setCollapsed} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <TopBar tab={tab} setTab={setTab} />

        <main
          key={tab}
          className="tool-page"
          style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}
        >
          <ActiveTool />
        </main>
      </div>
    </div>
  );
}
