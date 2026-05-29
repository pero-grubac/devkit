import { T } from "../shared/theme";
import { TABS, GROUPS } from "../shared/registry";

export function Sidebar({ tab, setTab, collapsed, setCollapsed }) {
  return (
    <aside style={{
      width: collapsed ? 48 : 196,
      flexShrink: 0,
      background: T.s1,
      borderRight: `1px solid ${T.border}`,
      display: "flex",
      flexDirection: "column",
      transition: "width 0.22s cubic-bezier(.16,1,.3,1)",
      overflow: "hidden",
    }}>

      {/* Logo row */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "15px 12px 13px",
        borderBottom: `1px solid ${T.border}`,
        flexShrink: 0,
      }}>
        <div style={{
          width: 26,
          height: 26,
          borderRadius: 6,
          flexShrink: 0,
          background: `linear-gradient(135deg, ${T.acc}, ${T.acc2})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <span style={{ fontFamily: "var(--sans)", fontSize: 13, fontWeight: 700, color: "#fff" }}>D</span>
        </div>

        {!collapsed && (
          <span style={{
            fontFamily: "var(--sans)",
            fontSize: 14,
            fontWeight: 600,
            color: T.text,
            letterSpacing: "-0.02em",
            whiteSpace: "nowrap",
          }}>
            DevKit
          </span>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand" : "Collapse"}
          style={{
            marginLeft: "auto",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: T.dim,
            padding: 2,
            borderRadius: 3,
            display: "flex",
            flexShrink: 0,
            opacity: 0.6,
          }}
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            {collapsed
              ? <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              : <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            }
          </svg>
        </button>
      </div>

      {/* Nav groups */}
      <nav style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "4px 8px 12px" }}>
        {GROUPS.map(group => (
          <div key={group.label}>
            {!collapsed && <div className="group-label">{group.label}</div>}
            {collapsed  && <div style={{ height: 8 }} />}
            {group.ids.map(id => {
              const t = TABS.find(t => t.id === id);
              if (!t) return null;
              return (
                <button
                  key={id}
                  className={`nav-btn ${tab === id ? "active" : ""}`}
                  onClick={() => setTab(id)}
                  title={collapsed ? t.label : undefined}
                >
                  <span className="nav-icon">{t.icon}</span>
                  {!collapsed && <span className="nav-label">{t.label}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div style={{
          padding: "10px 13px",
          borderTop: `1px solid ${T.border}`,
          fontFamily: "var(--mono)",
          fontSize: 9,
          color: T.dim,
          letterSpacing: "0.15em",
          flexShrink: 0,
        }}>
          {TABS.length} TOOLS
        </div>
      )}
    </aside>
  );
}
