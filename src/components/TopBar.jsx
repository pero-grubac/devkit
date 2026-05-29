import { T } from "../shared/theme";
import { TABS, GROUPS } from "../shared/registry";

export function TopBar({ tab, setTab }) {
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
        <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: T.dim }}>
          — {active?.sub}
        </span>
      </div>

      {/* Dot nav */}
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
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
    </header>
  );
}
