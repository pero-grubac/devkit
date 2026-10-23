import { T } from "../shared/theme";
import { TABS, GROUPS } from "../shared/registry";

const IS_MAC = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
const SHORTCUT = IS_MAC ? "⌘K" : "Ctrl K";

export function TopBar({ tab, setTab, onOpenPalette }) {
  const active = TABS.find(t => t.id === tab);

  return (
    <header style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 24px",
      height: 50,
      borderBottom: `1px solid ${T.border}`,
      background: T.s1,
      flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{
          fontFamily: "var(--sans)",
          fontSize: 14,
          fontWeight: 600,
          color: T.text,
          letterSpacing: "-0.01em",
        }}>
          {active?.label}
        </span>
        <span className="topbar-sub" style={{ fontFamily: "var(--mono)", fontSize: 10, color: T.dim }}>
          — {active?.sub}
        </span>
      </div>

      <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
        {/* Dot nav */}
        <div className="topbar-dots" style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {GROUPS.map(group => (
            <div key={group.label} style={{ display: "flex", gap: 5, alignItems: "center" }}>
              {group.ids.map(id => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  title={TABS.find(t => t.id === id)?.label}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    background: tab === id ? T.acc : T.border2,
                    boxShadow: tab === id ? `0 0 5px ${T.acc}88` : "none",
                    transition: "all 0.15s",
                  }}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Command palette hint */}
        <button
          onClick={onOpenPalette}
          aria-label={`Search tools (${IS_MAC ? "Cmd" : "Ctrl"}+K)`}
          aria-haspopup="dialog"
          title="Search tools"
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: T.s2, border: `1px solid ${T.border}`, borderRadius: 6,
            color: T.dim, cursor: "pointer", padding: "5px 8px 5px 10px",
            fontFamily: "var(--mono)", fontSize: 10,
            transition: "border-color 0.15s, color 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = T.border2; e.currentTarget.style.color = T.mid; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.dim; }}
        >
          <span aria-hidden="true" style={{ fontSize: 12 }}>⌕</span>
          <span className="topbar-search-label">Search</span>
          <kbd className="topbar-kbd" style={{
            fontFamily: "var(--mono)", fontSize: 9, color: T.mid,
            background: T.s3, border: `1px solid ${T.border2}`,
            borderRadius: 4, padding: "1px 5px",
          }}>
            {SHORTCUT}
          </kbd>
        </button>
      </div>
    </header>
  );
}
