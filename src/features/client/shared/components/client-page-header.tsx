// @ts-nocheck

export function ClientPageHeader({ title, subtitle, actions, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: 0, margin: 0 }}>{title}</h1>
          {subtitle && <p style={{ color: "var(--text-2)", fontSize: 14.5, margin: "6px 0 0" }}>{subtitle}</p>}
        </div>
        {actions && <div className="row gap-3">{actions}</div>}
      </div>
      {children}
    </div>
  );
}
