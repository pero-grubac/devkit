import { useState, useEffect } from "react";
import { T } from "../../shared/theme";
import { Btn, Label, Card } from "../../shared/ui";
import { SaveBtn } from "../../shared/SaveBtn";

// ─── Templates ───────────────────────────────────────────────────────────────

const TEMPLATES = {

  // ── Languages ──────────────────────────────────────────────────────────────

  Python: {
    icon: "🐍", group: "Language",
    content: `# Python
__pycache__/
*.py[cod]
*$py.class
*.so
*.egg
*.egg-info/
dist/
build/
eggs/
parts/
var/
sdist/
develop-eggs/
.installed.cfg
lib/
lib64/
.eggs/
*.egg-link

# Virtual environments
.env
.venv
env/
venv/
ENV/
env.bak/
venv.bak/
.python-version

# Distribution / packaging
.Python
pip-log.txt
pip-delete-this-directory.txt
.tox/
.nox/
.coverage
.coverage.*
.cache
nosetests.xml
coverage.xml
*.cover
*.py,cover
.hypothesis/
.pytest_cache/
pytestdebug.log

# Type checking
.mypy_cache/
.dmypy.json
dmypy.json
.pyre/
.pytype/

# Jupyter
.ipynb_checkpoints
*/.ipynb_checkpoints/*
profile_default/
ipython_config.py

# pyenv
.python-version

# Celery
celerybeat-schedule
celerybeat.pid

# SageMath
*.sage.py

# Spyder
.spyderproject.db
.spyproject

# Rope
.ropeproject

# mkdocs
/site

# PyInstaller
*.manifest
*.spec

# Translations
*.mo
*.pot`,
  },

  Java: {
    icon: "☕", group: "Language",
    content: `# Java
*.class
*.log
*.ctxt
.mtj.tmp/
*.jar
*.war
*.nar
*.ear
*.zip
*.tar.gz
*.rar
hs_err_pid*
replay_pid*

# Compiled output
/out/
/target/
/build/
/bin/

# BlueJ
*.bjava

# Mobile Tools for Java (J2ME)
.mtj.tmp/

# Package Files
*.jar
*.war
*.nar
*.ear
*.zip
*.tar.gz
*.rar`,
  },

  "C#": {
    icon: "🔷", group: "Language",
    content: `# C#
*.rsuser
*.suo
*.user
*.userosscache
*.sln.docstates
*.userprefs
[Dd]ebug/
[Dd]ebugPublic/
[Rr]elease/
[Rr]eleases/
x64/
x86/
[Ww][Ii][Nn]32/
[Aa][Rr][Mm]/
[Aa][Rr][Mm]64/
bld/
[Bb]in/
[Oo]bj/
[Ll]og/
[Ll]ogs/
.vs/
Generated\\ Files/
*.pidb
*.svclog
*.scc
_TeamCity*
.dotCover
.axoCover/
.coverage
*.coveragexml
_NCrunch_*
.*crunch*.local.xml
nCrunchTemp_*
*.ncrunchsolution
*.ncrunchproject
.nunit/
.stryker-tmp
TestResult.xml
[Dd]ump/
*.aps
*.ncb
*.opendb
*.opensdf
*.sdf
*.cachefile
*.VC.db
*.VC.VC.opendb
*.psess
*.vsp
*.vspx
*.sap
*.e2e
$tf/
*.gpState
_ReSharper*/
*.[Rr]e[Ss]harper
*.DotSettings.user
.JustCode
_TeamCity*
.teamcity/
.axoCover/
TeamCityDiagnostics.log
[Ee]xpress/
DocProject/buildhelp/
DocProject/Help/*.HxT
DocProject/Help/*.HxC
DocProject/Help/*.hhc
DocProject/Help/*.hhk
DocProject/Help/*.hhp
DocProject/Help/Html2
DocProject/Help/html
*.publish.xml
*.azurePubxml
*.pubxml
*.publishproj
PublishScripts/
*.pfx
*.publishsettings
orleans.codegen.cs
*Generated*.cs
_UpgradeReport_Files/
Backup*/
UpgradeLog*.XML
UpgradeLog*.htm
ServiceFabricBackup/
*.rptproj.bak
*.mdf
*.ldf
*.ndf
*.rdl.data
*.bim.layout
*.bim_*.settings
*.rptproj.rsuser
*- [Bb]ackup.rdl
*- [Bb]ackup ([0-9]).rdl
*- [Bb]ackup ([0-9][0-9]).rdl
FakesAssemblies/
*.GhostDoc.xml
.ntvs_analysis.dat
*.plg
*.opt
*.vbw
**/*.HTMLClient/GeneratedArtifacts
**/*.DesktopClient/GeneratedArtifacts
**/*.DesktopClient/ModelManifest.xml
**/*.Server/GeneratedArtifacts
**/*.Server/ModelManifest.xml
_Pvt_Extensions
.paket/paket.exe
paket-files/
.fake/
CoreTempSen.db
*.tss
ScaffoldingReadMe.txt
StyleCopReport.xml
*.[Cc]ache
!?*.[Cc]ache/
ClientBin/
~$*
*~
*.dbmdl
*.dbproj.schemaview
*.jfm
*.pfx
*.publishsettings
orleans.codegen.cs
node_modules/
bower_components/
package-lock.json`,
  },

  "C/C++": {
    icon: "⚙️", group: "Language",
    content: `# C / C++
# Prerequisites
*.d

# Compiled Object files
*.slo
*.lo
*.o
*.obj

# Precompiled Headers
*.gch
*.pch

# Compiled Dynamic libraries
*.so
*.dylib
*.dll

# Fortran module files
*.mod
*.smod

# Compiled Static libraries
*.lai
*.la
*.a
*.lib

# Executables
*.exe
*.out
*.app

# CMake
CMakeCache.txt
CMakeFiles/
CMakeScripts/
Testing/
cmake_install.cmake
install_manifest.txt
compile_commands.json
CTestTestfile.cmake
_deps/
build/

# Makefile
*.make

# CLion
.idea/
cmake-build-*/

# VSCode
.vscode/`,
  },

  Go: {
    icon: "🐹", group: "Language",
    content: `# Go
*.exe
*.exe~
*.dll
*.so
*.dylib
*.test
*.out
go.work
go.work.sum
/vendor/

# Build output
/dist/
/bin/

# Test coverage
coverage.out
coverage.html
*.coverprofile

# Air (hot reload)
tmp/`,
  },

  Rust: {
    icon: "🦀", group: "Language",
    content: `# Rust
/target/
**/*.rs.bk
Cargo.lock

# macOS
.DS_Store

# Editor
.idea/
.vscode/

# Coverage
tarpaulin-report.html
lcov.info`,
  },

  Ruby: {
    icon: "💎", group: "Language",
    content: `# Ruby
*.gem
*.rbc
/.config
/coverage/
/InstalledFiles
/pkg/
/spec/reports/
/spec/examples.txt
/test/tmp/
/test/version_tmp/
/tmp/
.bundle/
.yardoc/
_yardoc/
doc/
lib/bundler/man/
pkg/
rdoc/
spec/reports/
test/tmp/
test/version_tmp/
.rvmrc
.ruby-version
.ruby-gemset`,
  },

  PHP: {
    icon: "🐘", group: "Language",
    content: `# PHP
/vendor/
composer.phar
/nbproject/
*.log
.env
.env.backup
.env.production
.phpunit.result.cache
.phpunit.cache/
Homestead.json
Homestead.yaml
npm-debug.log
yarn-error.log
/.idea
/.vscode`,
  },

  Swift: {
    icon: "🕊️", group: "Language",
    content: `# Swift / Xcode
.DS_Store
.build/
/Packages/
/*.xcodeproj
xcuserdata/
DerivedData/
.swiftpm/xcode/package.xcworkspace/contents.xcworkspacedata
.netrc
*.resolved
/build/`,
  },

  Kotlin: {
    icon: "🎯", group: "Language",
    content: `# Kotlin
*.class
*.log
.gradle/
/local.properties
/.idea/caches
/.idea/libraries
/.idea/modules.xml
/.idea/workspace.xml
/.idea/navEditor.xml
/.idea/assetWizardSettings.xml
.DS_Store
/build
/captures
.externalNativeBuild
.cxx
local.properties`,
  },

  TypeScript: {
    icon: "🔵", group: "Language",
    content: `# TypeScript / JavaScript
node_modules/
dist/
build/
out/
.next/
.nuxt/
.cache/
.parcel-cache/
*.tsbuildinfo
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
.pnpm-debug.log*
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
coverage/
.nyc_output/
.eslintcache
*.js.map
*.d.ts.map`,
  },

  // ── Frameworks ─────────────────────────────────────────────────────────────

  Django: {
    icon: "🟢", group: "Framework",
    content: `# Django
*.log
*.pot
*.pyc
__pycache__/
local_settings.py
db.sqlite3
db.sqlite3-journal
media/
staticfiles/
.env
.venv
venv/
ENV/
*.egg-info/
dist/
build/
.mypy_cache/
.pytest_cache/`,
  },

  Flask: {
    icon: "🌶️", group: "Framework",
    content: `# Flask
instance/
.webassets-cache
*.pyc
__pycache__/
.env
.venv
venv/
*.egg-info/
dist/
build/
.pytest_cache/
.coverage
htmlcov/`,
  },

  FastAPI: {
    icon: "⚡", group: "Framework",
    content: `# FastAPI
__pycache__/
*.pyc
*.pyo
*.pyd
.env
.venv
venv/
ENV/
*.egg-info/
dist/
build/
.pytest_cache/
.mypy_cache/
.coverage
htmlcov/
*.db
*.sqlite`,
  },

  Spring: {
    icon: "🌱", group: "Framework",
    content: `# Spring Boot
HELP.md
target/
!.mvn/wrapper/maven-wrapper.jar
!**/src/main/**/target/
!**/src/test/**/target/
.idea/
*.iws
*.iml
*.ipr
.classpath
.project
.settings/
spring-shell.log
*.log`,
  },

  "ASP.NET": {
    icon: "🔷", group: "Framework",
    content: `# ASP.NET Core
[Bb]in/
[Oo]bj/
.vs/
*.user
*.suo
appsettings.Development.json
appsettings.Staging.json
*.pfx
*.pubxml
publish/
*.publish.xml
wwwroot/lib/
node_modules/
.env
Logs/
*.log`,
  },

  React: {
    icon: "⚛️", group: "Framework",
    content: `# React
node_modules/
/.pnp
.pnp.js
.yarn/install-state.gz
/build
/dist
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.eslintcache
coverage/`,
  },

  "Next.js": {
    icon: "▲", group: "Framework",
    content: `# Next.js
/node_modules
/.pnp
.pnp.js
.yarn/install-state.gz
/.next/
/out/
/build
.env*.local
.env
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.eslintcache
*.tsbuildinfo
next-env.d.ts
coverage/`,
  },

  "Vue.js": {
    icon: "💚", group: "Framework",
    content: `# Vue.js
node_modules/
dist/
.env
.env.local
.env.*.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
.DS_Store
.idea/
.vscode/
*.local
coverage/`,
  },

  Angular: {
    icon: "🔴", group: "Framework",
    content: `# Angular
dist/
tmp/
/out-tsc
/bazel-out
node_modules/
npm-debug.log
yarn-error.log
/.idea
.project
.classpath
.c9/
*.launch
.settings/
*.sublime-workspace
.vscode/
.history/*
.angular/cache`,
  },

  Laravel: {
    icon: "🔴", group: "Framework",
    content: `# Laravel
/node_modules
/public/hot
/public/storage
/storage/*.key
/vendor
.env
.env.backup
.env.production
.phpunit.result.cache
.phpunit.cache/
Homestead.json
Homestead.yaml
npm-debug.log
yarn-error.log
/.idea
/.vscode
*.lock`,
  },

  Rails: {
    icon: "🚂", group: "Framework",
    content: `# Ruby on Rails
*.rbc
capybara-*.html
.rspec
/db/*.sqlite3
/db/*.sqlite3-journal
/db/*.sqlite3-shm
/db/*.sqlite3-wal
/log/*
/tmp/*
!/log/.keep
!/tmp/.keep
/storage/*
!/storage/.keep
/public/assets
.byebug_history
/node_modules
/yarn-error.log
yarn-debug.log
.yarn-integrity
.env
/config/master.key`,
  },

  // ── Tools / Environments ───────────────────────────────────────────────────

  Node: {
    icon: "🟩", group: "Tool",
    content: `# Node.js
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
.pnpm-debug.log*
lerna-debug.log*
.npm
.eslintcache
.node_repl_history
*.tgz
.yarn-integrity
.env
.env.development.local
.env.test.local
.env.production.local
.env.local
dist/
build/
.cache/`,
  },

  Docker: {
    icon: "🐳", group: "Tool",
    content: `# Docker
.dockerignore
docker-compose.override.yml
docker-compose.local.yml
.env
.env.*
!.env.example
*.log`,
  },

  Terraform: {
    icon: "🏗️", group: "Tool",
    content: `# Terraform
.terraform/
.terraform.lock.hcl
*.tfstate
*.tfstate.*
*.tfvars
*.tfvars.json
crash.log
crash.*.log
override.tf
override.tf.json
*_override.tf
*_override.tf.json
.terraformrc
terraform.rc`,
  },

  Gradle: {
    icon: "🐘", group: "Tool",
    content: `# Gradle
.gradle/
/build/
!gradle/wrapper/gradle-wrapper.jar
!**/src/main/**/build/
!**/src/test/**/build/
local.properties`,
  },

  Maven: {
    icon: "📦", group: "Tool",
    content: `# Maven
target/
pom.xml.tag
pom.xml.releaseBackup
pom.xml.versionsBackup
pom.xml.next
release.properties
dependency-reduced-pom.xml
buildNumber.properties
.mvn/timing.properties
.mvn/wrapper/maven-wrapper.jar`,
  },

  Unity: {
    icon: "🎮", group: "Tool",
    content: `# Unity
/[Ll]ibrary/
/[Tt]emp/
/[Oo]bj/
/[Bb]uild/
/[Bb]uilds/
/[Ll]ogs/
/[Uu]ser[Ss]ettings/
/[Mm]emoryCaptures/
/[Aa]ssets/Plugins/Editor/JetBrains*
.DS_Store
*.pidb.meta
*.pdb.meta
*.mdb.meta
sysinfo.txt
*.apk
*.aab
*.unitypackage
*.app
crashlytics-build.properties
/Assets/StreamingAssets/aa.meta
/Assets/StreamingAssets/aa/`,
  },

  // ── IDEs / Editors ─────────────────────────────────────────────────────────

  VSCode: {
    icon: "📝", group: "Editor",
    content: `# VS Code
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json
!.vscode/*.code-snippets
.history/
*.vsix`,
  },

  JetBrains: {
    icon: "🧠", group: "Editor",
    content: `# JetBrains IDEs (IntelliJ, WebStorm, PyCharm, etc.)
.idea/
*.iws
*.iml
*.ipr
out/
!**/src/main/**/out/
!**/src/test/**/out/`,
  },

  VisualStudio: {
    icon: "💜", group: "Editor",
    content: `# Visual Studio
.vs/
*.rsuser
*.suo
*.user
*.userosscache
*.sln.docstates
[Dd]ebug/
[Rr]elease/
x64/
x86/
[Aa][Rr][Mm]/
[Aa][Rr][Mm]64/
[Ww][Ii][Nn]32/
bld/
[Bb]in/
[Oo]bj/
[Ll]og/`,
  },

  Vim: {
    icon: "🟩", group: "Editor",
    content: `# Vim
[._]*.s[a-v][a-z]
!*.svg
[._]*.sw[a-p]
[._]s[a-rt-v][a-z]
[._]ss[a-gi-z]
[._]sw[a-p]
Session.vim
Sessionx.vim
.netrwhist
*~
tags
[._]*.un~`,
  },

  // ── OS ─────────────────────────────────────────────────────────────────────

  macOS: {
    icon: "🍎", group: "OS",
    content: `# macOS
.DS_Store
.AppleDouble
.LSOverride
Icon
._*
.DocumentRevisions-V100
.fseventsd
.Spotlight-V100
.TemporaryItems
.Trashes
.VolumeIcon.icns
.com.apple.timemachine.donotpresent
.AppleDB
.AppleDesktop
Network Trash Folder
Temporary Items
.apdisk`,
  },

  Windows: {
    icon: "🪟", group: "OS",
    content: `# Windows
Thumbs.db
Thumbs.db:encryptable
ehthumbs.db
ehthumbs_vista.db
*.stackdump
[Dd]esktop.ini
$RECYCLE.BIN/
*.cab
*.msi
*.msix
*.msm
*.msp
*.lnk`,
  },

  Linux: {
    icon: "🐧", group: "OS",
    content: `# Linux
*~
.fuse_hidden*
.directory
.Trash-*
.nfs*`,
  },
};

// ─── Group order ─────────────────────────────────────────────────────────────
const GROUP_ORDER = ["Language", "Framework", "Tool", "Editor", "OS"];

// ─── Component ───────────────────────────────────────────────────────────────

export function GitignoreTool() {
  const [selected,  setSelected]  = useState(new Set(["Python", "VSCode", "macOS"]));
  const [generated, setGenerated] = useState("");
  const [edited,    setEdited]    = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [copied,    setCopied]    = useState(false);
  const [search,    setSearch]    = useState("");

  // Build output whenever selection changes
  useEffect(() => {
    if (selected.size === 0) { setGenerated(""); setEdited(""); return; }
    const sections = [];
    for (const name of selected) {
      if (TEMPLATES[name]) {
        sections.push(`# ════════════════════════════════════\n# ${name}\n# ════════════════════════════════════\n${TEMPLATES[name].content}`);
      }
    }
    const out = sections.join("\n\n") + "\n";
    setGenerated(out);
    setEdited(out);
    setIsEditing(false);
  }, [selected]);

  const toggle = (name) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const download = () => {
    const blob = new Blob([edited], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = ".gitignore";
    a.click();
    URL.revokeObjectURL(url);
  };

  const copy = () => {
    navigator.clipboard.writeText(edited);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const resetEdit = () => { setEdited(generated); setIsEditing(false); };

  // Group templates
  const groups = {};
  for (const [name, tpl] of Object.entries(TEMPLATES)) {
    const g = tpl.group;
    if (!groups[g]) groups[g] = [];
    groups[g].push(name);
  }

  const filteredGroups = {};
  const q = search.toLowerCase();
  for (const g of GROUP_ORDER) {
    if (!groups[g]) continue;
    const items = groups[g].filter(n => !q || n.toLowerCase().includes(q));
    if (items.length) filteredGroups[g] = items;
  }

  const lineCount = edited.split("\n").length;
  const hasEdits = edited !== generated;

  // Tag style
  const tagStyle = (active) => ({
    display: "inline-flex", alignItems: "center", gap: 5,
    padding: "5px 10px",
    background: active ? T.acc + "22" : T.s2,
    border: `1px solid ${active ? T.acc + "66" : T.border}`,
    borderRadius: 5,
    cursor: "pointer",
    fontFamily: "var(--sans)", fontSize: 12,
    color: active ? T.acc : T.mid,
    transition: "all .12s",
    userSelect: "none",
    whiteSpace: "nowrap",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Search */}
      <div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
          <Label>Select Templates</Label>
          <div style={{ flex: 1 }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter…"
            spellCheck={false}
            style={{
              background: T.s2, border: `1px solid ${T.border}`, borderRadius: 5,
              color: T.text, fontFamily: "var(--mono)", fontSize: 12,
              padding: "5px 10px", outline: "none", width: 140,
            }}
            onFocus={e => e.target.style.borderColor = T.border2}
            onBlur={e  => e.target.style.borderColor = T.border}
          />
          {selected.size > 0 && (
            <Btn small variant="red" onClick={() => setSelected(new Set())}>Clear all</Btn>
          )}
        </div>

        {/* Template picker */}
        <div style={{ background: T.s1, border: `1px solid ${T.border}`, borderRadius: 8, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
          {Object.entries(filteredGroups).map(([group, names]) => (
            <div key={group}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.22em", color: T.dim, textTransform: "uppercase", marginBottom: 6 }}>{group}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {names.map(name => (
                  <div key={name} style={tagStyle(selected.has(name))} onClick={() => toggle(name)}>
                    <span>{TEMPLATES[name].icon}</span>
                    <span>{name}</span>
                    {selected.has(name) && <span style={{ fontSize: 10, opacity: 0.7 }}>✕</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
          {Object.keys(filteredGroups).length === 0 && (
            <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: T.dim, textAlign: "center", padding: 8 }}>No matches for "{search}"</div>
          )}
        </div>
      </div>

      {/* Selected chips */}
      {selected.size > 0 && (
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", color: T.dim, textTransform: "uppercase", marginRight: 4 }}>Selected ({selected.size})</span>
          {[...selected].map(name => (
            <div key={name} style={{ ...tagStyle(true), padding: "3px 8px", fontSize: 11 }} onClick={() => toggle(name)}>
              {TEMPLATES[name]?.icon} {name} <span style={{ fontSize: 9 }}>✕</span>
            </div>
          ))}
        </div>
      )}

      {/* Editor */}
      {edited && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Label>.gitignore</Label>
              <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: T.dim }}>{lineCount} lines</span>
              {hasEdits && (
                <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: T.orange, letterSpacing: "0.1em" }}>● EDITED</span>
              )}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {hasEdits && (
                <Btn small variant="default" onClick={resetEdit}>↺ Reset</Btn>
              )}
              <Btn small variant={copied ? "green" : "default"} onClick={copy}>
                {copied ? "✓ Copied" : "Copy"}
              </Btn>
              <Btn small variant="accent" onClick={download}>↓ Download .gitignore</Btn><SaveBtn content={edited} toolId="gitignore" toolLabel="Gitignore" defaultTitle=".gitignore" />
            </div>
          </div>

          <textarea
            value={edited}
            onChange={e => { setEdited(e.target.value); setIsEditing(true); }}
            spellCheck={false}
            style={{
              width: "100%",
              minHeight: 420,
              background: T.s2,
              border: `1px solid ${hasEdits ? T.orange + "66" : T.border}`,
              borderRadius: 6,
              color: T.mid,
              fontFamily: "var(--mono)",
              fontSize: 11,
              padding: "14px 16px",
              lineHeight: 1.65,
              resize: "vertical",
              outline: "none",
              transition: "border-color .15s",
            }}
            onFocus={e => e.target.style.borderColor = hasEdits ? T.orange : T.border2}
            onBlur={e  => e.target.style.borderColor = hasEdits ? T.orange + "66" : T.border}
          />

          <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: T.dim, marginTop: 5 }}>
            Edit freely above — your changes are preserved. Click Reset to restore the generated version.
          </div>
        </div>
      )}

      {selected.size === 0 && (
        <div style={{ background: T.s1, border: `1px solid ${T.border}`, borderRadius: 8, padding: "28px", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 13, color: T.dim, marginBottom: 6 }}>Select one or more templates above</div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: T.dim + "99" }}>.gitignore will appear here for editing and download</div>
        </div>
      )}
    </div>
  );
}
