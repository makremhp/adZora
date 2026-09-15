import { useEffect, useMemo, useState } from "react";
import { AD_FORMATS, RECENT_ITEMS, ROLE_CONFIG } from "./config";

function Icon({ name, size = 18 }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" };
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>,
    layout: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M9 9v11" /></>,
    code: <><path d="m8 9-4 3 4 3M16 9l4 3-4 3M14 5l-4 14" /></>,
    trend: <><path d="M3 17 9 11l4 4 8-9" /><path d="M16 6h5v5" /></>,
    receipt: <><path d="M5 3h14v18l-3-2-4 2-4-2-3 2z" /><path d="M8 8h8M8 12h8M8 16h4" /></>,
    "arrow-up": <><path d="M12 19V5M6 11l6-6 6 6" /></>,
    "arrow-down": <><path d="M12 5v14M6 13l6 6 6-6" /></>,
    chart: <><path d="M4 19V5M4 19h17" /><path d="m7 15 3-4 3 2 5-7" /></>,
    user: <><circle cx="12" cy="8" r="3" /><path d="M5 20a7 7 0 0 1 14 0" /></>,
    settings: <><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" /><path d="m19.4 15 .1.1a2 2 0 1 1-2.8 2.8l-.1-.1a2 2 0 0 0-3.4 1.4v.3a2 2 0 1 1-4 0v-.2A2 2 0 0 0 5.8 18l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A2 2 0 0 0 1.6 12a2 2 0 1 1 4 0 2 2 0 0 0 3.4-1.4v-.2a2 2 0 1 1 4 0v.2A2 2 0 0 0 16.4 12a2 2 0 1 1 2.8 2.8l-.1.1a2 2 0 0 0 .3.1Z" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    megaphone: <><path d="m3 11 18-5v12L3 14z" /><path d="M11 15v5M6 16l1.5 4" /></>,
    image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9" r="1.5" /><path d="m21 15-5-5L5 20" /></>,
    file: <><path d="M6 3h9l4 4v14H6z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></>,
    wallet: <><path d="M4 6h15a2 2 0 0 1 2 2v11H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14" /><path d="M16 13h5" /><circle cx="16" cy="13" r=".5" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    lock: <><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    card: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h3" /></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
  };
  return <svg {...common}>{paths[name] || paths.grid}</svg>;
}

function Brand() {
  return <div className="brand"><span className="brand-mark">A</span><span>AdZora</span></div>;
}

function Sidebar({ workspace, setWorkspace, activePage, onNavigate, drawerOpen, closeDrawer }) {
  const config = ROLE_CONFIG[workspace];
  return <>
    <div className={drawerOpen ? "drawer-overlay is-open" : "drawer-overlay"} onClick={closeDrawer} />
    <aside className={drawerOpen ? "sidebar is-open" : "sidebar"} aria-label="Workspace navigation">
      <div className="sidebar-top"><Brand /><button className="icon-button drawer-close" onClick={closeDrawer} aria-label="Close menu"><Icon name="close" /></button></div>
      <div className="workspace-switcher" aria-label="Workspace switcher">
        {Object.entries(ROLE_CONFIG).map(([id, role]) => <button key={id} className={workspace === id ? "workspace-option active" : "workspace-option"} onClick={() => { setWorkspace(id); onNavigate("overview"); }}>
          <span className={id === "publisher" ? "role-dot publisher-dot" : "role-dot advertiser-dot"} />
          <span><strong>{role.label}</strong><small>{role.arabicLabel}</small></span>
          {workspace === id && <span className="active-check">✓</span>}
        </button>)}
      </div>
      <div className="nav-caption">المساحة الحالية · {config.arabicLabel}</div>
      <nav className="side-nav">
        {config.nav.map(item => <button key={item.id} className={activePage === item.id ? "nav-item active" : "nav-item"} onClick={() => onNavigate(item.id)}>
          <Icon name={item.icon} /><span>{item.arabic}</span><small>{item.label}</small>{activePage === item.id && <span className="nav-active-line" />}
        </button>)}
      </nav>
      <div className="sidebar-footer"><div className="footer-status"><span className="status-dot" />Demo workspace</div><span>Phase 1</span></div>
    </aside>
  </>;
}

function MetricCard({ metric }) {
  return <article className={"metric-card tone-" + metric.tone}>
    <div className="metric-top"><span className="metric-icon"><Icon name={metric.icon} size={17} /></span><span className="metric-label">{metric.label}</span></div>
    <strong className="metric-value">{metric.value}</strong>
    <span className="metric-hint">{metric.hint}</span>
  </article>;
}

function EmptyPanel({ workspace, onNavigate }) {
  const publisher = workspace === "publisher";
  return <section className="panel recent-panel">
    <div className="panel-heading"><div><span className="eyebrow">ACTIVITY</span><h2>{publisher ? "Recent earnings" : "Campaign activity"}</h2></div><button className="text-button" onClick={() => onNavigate(publisher ? "earnings" : "campaigns")}>View all <Icon name="chevron" size={14} /></button></div>
    <div className="empty-panel"><div className="empty-icon"><Icon name={publisher ? "trend" : "megaphone"} size={24} /></div><h3>{publisher ? "No earnings yet" : "No campaigns yet"}</h3><p>{publisher ? "Add a website and create an ad zone to start receiving eligible activity." : "Create your first campaign to start reaching relevant audiences."}</p><button className="secondary-button" onClick={() => onNavigate(publisher ? "websites" : "create-campaign")}><Icon name="plus" size={16} />{publisher ? "Add Website" : "Create Campaign"}</button></div>
  </section>;
}

function Overview({ workspace, onNavigate }) {
  const config = ROLE_CONFIG[workspace];
  const recent = RECENT_ITEMS[workspace][0];
  return <>
    <section className="welcome-row"><div><span className="eyebrow">{config.label.toUpperCase()} WORKSPACE</span><h1>{config.overviewTitle}</h1><p>{config.overviewDescription}</p></div><div className="welcome-actions"><button className="primary-button" onClick={() => onNavigate(config.quickActions[0].id)}><Icon name={config.quickActions[0].icon} size={17} />{config.quickActions[0].arabic}</button><button className="ghost-button" onClick={() => onNavigate("analytics")}><Icon name="chart" size={17} />التحليلات</button></div></section>
    <section className="identity-strip"><span className="identity-mark">{workspace === "publisher" ? "P" : "A"}</span><span><strong>{config.label} workflow</strong><small>{config.identity}</small></span><span className="identity-pill">Demo data · Ready for API</span></section>
    <section className="metric-grid">{config.metrics.map(metric => <MetricCard key={metric.label} metric={metric} />)}</section>
    <section className="section-heading"><div><span className="eyebrow">AT A GLANCE</span><h2>Performance overview</h2></div><button className="filter-button">Last 30 days <Icon name="chevron" size={14} /></button></section>
    <section className="performance-grid">{config.performance.map(item => <div className="performance-item" key={item.label}><span>{item.label}</span><strong>{item.value}</strong><small>{item.value === "--" ? "Not enough data" : "Demo snapshot"}</small></div>)}</section>
    <section className="dashboard-grid"><section className="panel quick-panel"><div className="panel-heading"><div><span className="eyebrow">NEXT STEPS</span><h2>Quick actions</h2></div></div><div className="quick-list">{config.quickActions.map((action, index) => <button className={index === 0 ? "quick-action primary" : "quick-action"} key={action.id} onClick={() => onNavigate(action.id)}><span className="quick-action-icon"><Icon name={action.icon} size={18} /></span><span><strong>{action.arabic}</strong><small>{action.label}</small></span><Icon name="chevron" size={16} /></button>)}</div></section><EmptyPanel workspace={workspace} onNavigate={onNavigate} /></section>
    <section className="formats-panel panel"><div className="panel-heading"><div><span className="eyebrow">AD FORMAT SYSTEM</span><h2>Built for a real advertising network</h2></div><button className="text-button" onClick={() => onNavigate(workspace === "advertiser" ? "create-campaign" : "ad-zones")}>Explore workflow <Icon name="chevron" size={14} /></button></div><div className="format-list">{AD_FORMATS.map(format => <span className="format-chip" key={format.id}>{format.name}<small>{format.pricing.join(" · ")}</small></span>)}</div></section>
  </>;
}

function ComingSoon({ workspace, page, onNavigate }) {
  const config = ROLE_CONFIG[workspace];
  const item = config.nav.find(navItem => navItem.id === page) || config.nav[0];
  return <section className="coming-page"><div className="coming-orbit"><span /><span /><span /><Icon name={item.icon} size={32} /></div><span className="eyebrow">{config.label.toUpperCase()} WORKSPACE</span><h1>{item.arabic}</h1><p>هذه الشاشة موجودة في بنية المنتج وستُبنى في المرحلة التالية. لن تكون رابطًا ميتًا؛ سنضيف إليها حالات التحميل والفراغ والخطأ والنجاح مع منطقها الفعلي.</p><div className="coming-meta"><span><b>Section</b>{item.label}</span><span><b>Next phase</b>Functional workflow</span></div><button className="secondary-button" onClick={() => onNavigate("overview")}><Icon name="grid" size={16} />العودة إلى النظرة العامة</button></section>;
}

export default function App() {
  const [workspace, setWorkspace] = useState("publisher");
  const [activePage, setActivePage] = useState("overview");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const config = useMemo(() => ROLE_CONFIG[workspace], [workspace]);

  useEffect(() => {
    const onKeyDown = (event) => { if (event.key === "Escape") setDrawerOpen(false); };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.removeEventListener("keydown", onKeyDown); document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const navigate = (page) => { setActivePage(page); setDrawerOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const pageTitle = config.nav.find(item => item.id === activePage)?.arabic || "نظرة عامة";

  return <div className="app-shell">
    <Sidebar workspace={workspace} setWorkspace={(next) => { setWorkspace(next); setActivePage("overview"); }} activePage={activePage} onNavigate={navigate} drawerOpen={drawerOpen} closeDrawer={() => setDrawerOpen(false)} />
    <main className="main-content">
      <header className="topbar"><button className="icon-button menu-button" onClick={() => setDrawerOpen(true)} aria-label="Open menu"><Icon name="menu" /></button><div className="breadcrumbs"><span>AdZora</span><Icon name="chevron" size={13} /><strong>{config.label}</strong><Icon name="chevron" size={13} /><span>{pageTitle}</span></div><div className="header-actions"><div className="header-balance"><span>{config.balanceLabel}</span><strong>$0.00</strong></div><button className="notification-button" aria-label="Notifications"><span className="notification-dot" /><Icon name="receipt" size={18} /></button><div className="avatar" aria-label="Demo account">M</div></div></header>
      <div className="page-content">{activePage === "overview" ? <Overview workspace={workspace} onNavigate={navigate} /> : <ComingSoon workspace={workspace} page={activePage} onNavigate={navigate} />}</div>
    </main>
  </div>;
}
