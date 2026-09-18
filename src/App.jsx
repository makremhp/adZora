import { useEffect, useMemo, useState } from "react";
import { AD_FORMATS, ROLE_CONFIG, WITHDRAWAL_CONFIG } from "./config";
import PublisherWorkspace from "./PublisherWorkspace";
import AdvertiserWorkspace from "./AdvertiserWorkspace";
import adzoraLogo from "../images/adzora-logo.png";
import ProfilePage from "./ProfilePage";
import SettingsPage from "./SettingsPage";
import { NotificationProvider, useNotifications } from "./NotificationSystem";

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
     check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
  };
  return <svg {...common}>{paths[name] || paths.grid}</svg>;
}

function Brand() {
  return <div className="brand"><img className="brand-logo" src={adzoraLogo} alt="AdZora" /></div>;
}

const landingFormatIcons = {
  banner: "layout",
  native: "grid",
  social: "image",
  video: "chart",
};

function LandingPage({ onLogin, onStart }) {
   const navigate = (target, event) => {
     event?.preventDefault();
     const section = document.getElementById(target.replace(/^#/, ""));
     if (!section) return;
     window.history.replaceState(null, "", target);
     section.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return <div className="landing-page" dir="rtl">
    <header className="landing-header">
       <a className="landing-brand landing-logo-image" href="#home" onClick={(event) => navigate("#home", event)} aria-label="AdZora home"><img src={adzoraLogo} alt="AdZora Advertising Platform" /></a>
      <div className="landing-actions">
        <button className="landing-login" type="button" onClick={onLogin}>تسجيل الدخول</button>
        <button className="landing-cta small" type="button" onClick={() => onStart("publisher")}>ابدأ الآن <Icon name="chevron" size={15} /></button>
      </div>
    </header>

    <main>
      <section className="landing-hero" id="home">
        <div className="landing-hero-copy">
          <span className="landing-kicker"><i /> شبكة إعلانية تجمع الطرفين</span>
          <h1>إعلانات تصل إلى جمهورك.<br /><em>ومواقع تكسب من محتواها.</em></h1>
          <p>AdZora تربط المعلنين بالناشرين في تجربة واضحة لإطلاق الحملات، اختيار الصيغ المناسبة، وتحويل الزيارات إلى قيمة.</p>
          <div className="landing-hero-actions">
            <button className="landing-cta" type="button" onClick={() => onStart("advertiser")}>أعلن مع AdZora <Icon name="chevron" size={16} /></button>
            <button className="landing-outline" type="button" onClick={() => onStart("publisher")}>حقق الدخل من موقعك <Icon name="chevron" size={16} /></button>
          </div>
          <div className="landing-proof"><span className="proof-mark"><Icon name="check" size={13} /></span><span>تجربة منظمة للمعلن والناشر</span><span className="proof-divider" /><span>صيغ إعلانية متعددة</span></div>
        </div>
        <div className="network-visual" aria-label="مسار الإعلان من المعلن إلى الجمهور">
          <div className="network-orbit orbit-one" /><div className="network-orbit orbit-two" />
          <div className="network-line line-one" /><div className="network-line line-two" /><div className="network-line line-three" /><div className="network-line line-four" />
          <div className="network-node node-advertiser"><span className="network-node-icon"><Icon name="megaphone" size={20} /></span><small>المعلن</small><strong>حملة جديدة</strong></div>
          <div className="network-node node-campaign"><span className="network-node-icon"><Icon name="chart" size={20} /></span><small>AdZora</small><strong>توزيع ذكي</strong></div>
          <div className="network-node node-publisher"><span className="network-node-icon"><Icon name="globe" size={20} /></span><small>موقع الناشر</small><strong>مساحة مناسبة</strong></div>
          <div className="network-audience"><span className="audience-dots"><i /><i /><i /></span><span><small>الجمهور</small><strong>تفاعل حقيقي</strong></span></div>
        </div>
      </section>

      <section className="landing-roles" id="advertisers">
        <div className="landing-section-heading"><span className="landing-kicker">مساران واضحان</span><h2>كل طرف يعرف خطوته التالية</h2><p>من أول نقرة حتى ظهور النتائج، صممنا التجربة لتبقى عملية ومباشرة.</p></div>
        <div className="role-cards">
          <article className="role-card advertiser-card"><div className="role-card-top"><span className="role-symbol"><Icon name="megaphone" size={22} /></span><span className="role-tag">للمعلنين</span></div><h3>حوّل ميزانيتك إلى حملات تصل</h3><p>أنشئ حملتك، اختر الصيغة المناسبة، حدد الميزانية وتابع الأداء من مساحة واحدة.</p><ul><li>إنشاء حملات منظمة</li><li>اختيار صيغ إعلانية متعددة</li><li>متابعة الأداء والإنفاق</li></ul><button className="role-link" type="button" onClick={() => onStart("advertiser")}>ابدأ الإعلان <Icon name="chevron" size={15} /></button></article>
          <article className="role-card publisher-card" id="publishers"><div className="role-card-top"><span className="role-symbol"><Icon name="globe" size={22} /></span><span className="role-tag">للناشرين</span></div><h3>اجعل موقعك مساحة إعلانية أفضل</h3><p>أضف موقعك، احصل على Universal AdZora Code، ودع AdZora يختار الإعلان المناسب تلقائيًا.</p><ul><li>إضافة المواقع بسهولة</li><li>Universal AdZora Code واحد</li><li>مطابقة تلقائية مع الحملات المؤهلة</li></ul><button className="role-link" type="button" onClick={() => onStart("publisher")}>ابدأ تحقيق الدخل <Icon name="chevron" size={15} /></button></article>
        </div>
      </section>

      <section className="landing-formats" id="formats">
        <div className="landing-section-heading split"><div><span className="landing-kicker">صيغ مصممة للاستخدام</span><h2>اختر الطريقة التي تناسب رسالتك</h2></div><p>من الوحدات المرئية إلى الروابط المباشرة، لكل صيغة وظيفة واضحة داخل رحلة المستخدم.</p></div>
        <div className="landing-format-grid">{AD_FORMATS.map((format) => <article className="landing-format-card" key={format.id}><div className={"format-preview format-preview-" + format.id}><Icon name={landingFormatIcons[format.id]} size={21} /><span>{format.name}</span></div><div className="landing-format-copy"><h3>{format.name}</h3><p>{format.description}</p><small>{format.id === "video" ? "للمحتوى المتحرك" : format.id === "native" ? "للمحتوى المتكامل" : "لظهور واضح ومباشر"}</small></div></article>)}</div>
      </section>

      <section className="landing-how" id="how-it-works">
        <div className="landing-section-heading"><span className="landing-kicker">كيف تعمل</span><h2>طريق قصير من الفكرة إلى الظهور</h2><p>لا تحتاج إلى فهم إعدادات تقنية معقدة كي تبدأ.</p></div>
        <div className="workflow-columns"><div className="workflow-column"><div className="workflow-title"><span className="role-symbol"><Icon name="megaphone" size={18} /></span><h3>رحلة المعلن</h3></div>{["أنشئ الحملة", "اختر الصيغة", "حدد الميزانية", "أطلق الحملة", "تابع الأداء"].map((step, index) => <div className="workflow-step" key={step}><b>{String(index + 1).padStart(2, "0")}</b><span>{step}</span></div>)}</div><div className="workflow-column"><div className="workflow-title"><span className="role-symbol"><Icon name="globe" size={18} /></span><h3>رحلة الناشر</h3></div>{["أضف Website Name وURL", "احصل على Universal Code", "الصق الكود في موقعك", "دع AdZora يطابق الإعلان", "حقق الدخل"].map((step, index) => <div className="workflow-step" key={step}><b>{String(index + 1).padStart(2, "0")}</b><span>{step}</span></div>)}</div></div>
      </section>

      <section className="landing-capabilities"><div className="landing-section-heading split"><div><span className="landing-kicker">ما تحصل عليه</span><h2>أدوات أساسية، دون وعود مبالغ فيها</h2></div><p>كل ما تحتاجه لبناء عملية إعلانية مرتبة، مع مساحة للتوسع عندما تصبح البيانات جاهزة.</p></div><div className="capability-grid">{["صيغ إعلانية متعددة", "تحقيق دخل للناشرين", "إدارة الحملات", "تحليلات الأداء", "مخزون متجاوب", "كود إعلان بسيط"].map((item, index) => <div className="capability" key={item}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item}</strong><Icon name="check" size={16} /></div>)}</div></section>
    </main>

     <footer className="landing-footer"><div className="landing-footer-brand"><Brand /><p>شبكة إعلانية تربط الرسالة بالجمهور، والموقع بالقيمة.</p></div><div><strong>AdZora</strong><button type="button" onClick={() => navigate("#home")}>عن AdZora</button><button type="button" onClick={() => navigate("#advertisers")}>للمعلنين</button><button type="button" onClick={() => navigate("#publishers")}>للناشرين</button></div><div><strong>الدعم</strong><button type="button" onClick={() => navigate("#how-it-works")}>كيف تعمل</button><button type="button" onClick={() => navigate("#formats")}>صيغ الإعلانات</button><button type="button" onClick={onLogin}>تسجيل الدخول</button></div><div className="footer-account"><strong>جاهز للخطوة الأولى؟</strong><button className="landing-cta small" type="button" onClick={() => onStart("publisher")}>ابدأ الآن <Icon name="chevron" size={15} /></button></div></footer>
  </div>;
}

function Sidebar({ workspace, setWorkspace, activePage, onNavigate, drawerOpen, closeDrawer }) {
  const config = ROLE_CONFIG[workspace];
  let lastGroup = undefined;
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
      <nav className="side-nav">
        {config.nav.map(item => {
          const showGroupLabel = item.group !== lastGroup;
          lastGroup = item.group;
          return <div className="nav-item-wrap" key={item.id}>
            {showGroupLabel && item.group && <span className="nav-group-label">{item.group}</span>}
            <button className={activePage === item.id ? "nav-item active" : "nav-item"} onClick={() => onNavigate(item.id)}>
              <Icon name={item.icon} /><span>{item.arabic}</span><small>{item.label}</small>{activePage === item.id && <span className="nav-active-line" />}
            </button>
          </div>;
        })}
      </nav>
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
    <div className="empty-panel"><div className="empty-icon"><Icon name={publisher ? "trend" : "megaphone"} size={24} /></div><h3>{publisher ? "No earnings yet" : "No campaigns yet"}</h3><p>{publisher ? "Add a website to receive a universal code and start receiving eligible activity." : "Create your first campaign to start reaching relevant audiences."}</p><button className="secondary-button" onClick={() => onNavigate(publisher ? "websites" : "create-campaign")}><Icon name="plus" size={16} />{publisher ? "Add Website" : "Create Campaign"}</button></div>
  </section>;
}

function MetricHero({ metric, action, onNavigate }) {
  return <article className="metric-hero">
    <div className="metric-hero-top"><span className="metric-icon"><Icon name={metric.icon} size={18} /></span><span className="metric-label">{metric.label}</span></div>
    <strong className="metric-hero-value">{metric.value}</strong>
    <span className="metric-hero-hint">{metric.hint}</span>
    {action && <button className="primary-button metric-hero-action" onClick={() => onNavigate(action.id)}><Icon name="arrow-up" size={16} />{action.label}</button>}
  </article>;
}

const PERIODS = ["24H", "7D", "30D"];

function Overview({ workspace, onNavigate }) {
  const config = ROLE_CONFIG[workspace];
  const [period, setPeriod] = useState("30D");
  const [hero, ...secondaryMetrics] = config.metrics;
  return <>
    <section className="welcome-row compact">
      <div><span className="eyebrow">{config.label.toUpperCase()} WORKSPACE</span><h1>{config.overviewTitle}</h1><p>{config.identity}</p></div>
      <div className="welcome-actions"><button className="primary-button" onClick={() => onNavigate(config.quickActions[0].id)}><Icon name={config.quickActions[0].icon} size={17} />{config.quickActions[0].arabic}</button><button className="ghost-button" onClick={() => onNavigate("analytics")}><Icon name="chart" size={17} />التحليلات</button></div>
    </section>
    <section className="hero-metric-row">
      <MetricHero metric={hero} action={config.heroAction} onNavigate={onNavigate} />
      <div className="metric-secondary-grid">{secondaryMetrics.map(metric => <MetricCard key={metric.label} metric={metric} />)}</div>
    </section>
    <section className="section-heading"><div><span className="eyebrow">AT A GLANCE</span><h2>Performance overview</h2></div><div className="analytics-period-control" aria-label="Performance period">{PERIODS.map(option => <button type="button" key={option} className={period === option ? "is-active" : ""} onClick={() => setPeriod(option)}>{option}</button>)}</div></section>
    <section className="performance-grid">{config.performance.map(item => <div className="performance-item" key={item.label}><span>{item.label}</span><strong>{item.value}</strong>{item.value === "--" && <small>Not enough data</small>}</div>)}</section>
    <section className="dashboard-grid"><section className="panel quick-panel"><div className="panel-heading"><div><span className="eyebrow">NEXT STEPS</span><h2>Quick actions</h2></div></div><div className="quick-list">{config.quickActions.map((action, index) => <button className={index === 0 ? "quick-action primary" : "quick-action"} key={action.id} onClick={() => onNavigate(action.id)}><span className="quick-action-icon"><Icon name={action.icon} size={18} /></span><span><strong>{action.arabic}</strong><small>{action.label}</small></span><Icon name="chevron" size={16} /></button>)}</div></section><EmptyPanel workspace={workspace} onNavigate={onNavigate} /></section>
    {workspace === "advertiser" && <section className="formats-panel panel subtle-panel"><div className="panel-heading"><div><span className="eyebrow">AD FORMATS</span><h2>Available formats</h2></div><button className="text-button" onClick={() => onNavigate("create-campaign")}>Create campaign <Icon name="chevron" size={14} /></button></div><div className="format-list">{AD_FORMATS.map(format => <span className="format-chip" key={format.id}>{format.name}<small>{format.pricing.join(" · ")}</small></span>)}</div></section>}
  </>;
}

function ComingSoon({ workspace, page, onNavigate }) {
  const config = ROLE_CONFIG[workspace];
  const item = config.nav.find(navItem => navItem.id === page) || config.nav[0];
  return <section className="coming-page"><div className="coming-orbit"><span /><span /><span /><Icon name={item.icon} size={32} /></div><span className="eyebrow">{config.label.toUpperCase()} WORKSPACE</span><h1>{item.arabic}</h1><p>هذا القسم قيد الإعداد حاليًا وسيتوفر قريبًا بكامل إمكانياته.</p><div className="coming-meta"><span><b>Section</b>{item.label}</span><span><b>Status</b>Coming soon</span></div><button className="secondary-button" onClick={() => onNavigate("overview")}><Icon name="grid" size={16} />العودة إلى النظرة العامة</button></section>;
}

function getPasswordStrength(password) {
  if (!password) return 0;
  let strength = password.length >= 8 ? 60 : Math.min(50, password.length * 6);
  if (/[A-Z]/.test(password)) strength += 15;
  if (/[0-9]/.test(password)) strength += 15;
  if (/[^A-Za-z0-9]/.test(password)) strength += 10;
  return Math.min(strength, 100);
}

function AccountAccess({ onClose, onSuccess, initialMode = "signup" }) {
  const { notify } = useNotifications();
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({ email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const passwordStrength = getPasswordStrength(form.password);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!form.email.includes("@")) {
      setError("اكتب بريدًا إلكترونيًا صحيحًا.");
      return;
    }
    if (form.password.length < 8) {
      setError("يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.");
      return;
    }
    if (mode === "signup" && form.password !== form.confirmPassword) {
      setError("كلمتا المرور غير متطابقتين. أعد كتابة كلمة المرور نفسها.");
      return;
    }
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 350));
    setLoading(false);
    notify(
      mode === "signup" ? "تم إنشاء حسابك التجريبي بنجاح." : "تم تسجيل الدخول التجريبي بنجاح.",
      "success",
    );
    if (mode === "login" || mode === "signup") onSuccess();
  };

  const isSignup = mode === "signup";
  const title = isSignup ? "أنشئ حسابك في AdZora" : "مرحبًا بعودتك";

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={`access-modal light-panel ${isSignup ? "signup-modal" : ""}`} role="dialog" aria-modal="true" aria-labelledby="access-title" dir="rtl">
        <div className="access-header">
          <div className="access-heading">
            <span className="eyebrow">ADZORA ACCOUNT</span>
            <h2 id="access-title">{title}</h2>
            <p>{isSignup ? "ابدأ بإدارة حملاتك ومساحاتك الإعلانية من مكان واحد." : "أدخل بياناتك للمتابعة إلى مساحة العمل."}</p>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="إغلاق نافذة التسجيل"><Icon name="close" /></button>
        </div>

        {(mode === "login" || mode === "signup") && (
          <div className="access-tabs" role="tablist" aria-label="نوع الحساب">
            <button className={mode === "signup" ? "access-tab active" : "access-tab"} type="button" onClick={() => { setMode("signup"); setError(""); }}>إنشاء حساب</button>
            <button className={mode === "login" ? "access-tab active" : "access-tab"} type="button" onClick={() => { setMode("login"); setError(""); }}>تسجيل الدخول</button>
          </div>
        )}

        <form className="access-form" onSubmit={submit}>
          <label className="field">
            <span>البريد الإلكتروني</span>
            <input className="input" type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} placeholder="you@example.com" autoComplete="email" dir="ltr" />
          </label>
          <label className="field">
            <span>كلمة المرور</span>
            <input className="input" type="password" value={form.password} onChange={(event) => updateField("password", event.target.value)} placeholder="8 أحرف على الأقل" autoComplete={mode === "login" ? "current-password" : "new-password"} dir="ltr" />
            {isSignup && (
              <span className="password-requirement">
                كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل
              </span>
            )}
          </label>
          {isSignup && (
            <label className="field">
              <span>إعادة كتابة كلمة المرور</span>
              <input className="input" type="password" value={form.confirmPassword} onChange={(event) => updateField("confirmPassword", event.target.value)} placeholder="اكتب كلمة المرور مرة أخرى" autoComplete="new-password" dir="ltr" />
            </label>
          )}
          {isSignup && (
            <div className="password-strength" aria-live="polite">
              <div className="password-strength-heading"><span>قوة كلمة المرور</span><strong>{passwordStrength}%</strong></div>
              <div className="password-strength-track"><span style={{ width: `${passwordStrength}%` }} /></div>
              <small>{passwordStrength >= 80 ? "كلمة مرور قوية" : passwordStrength >= 60 ? "مقبولة ويمكن تحسينها" : "أضف 8 أحرف على الأقل"}</small>
            </div>
          )}
          {error && <small className="field-error access-error" role="alert">{error}</small>}
          <button className="primary-button access-submit" type="submit" disabled={loading}>
            {loading ? "جارٍ المعالجة…" : isSignup ? "إنشاء الحساب" : "تسجيل الدخول"}
          </button>
        </form>

      </section>
    </div>
  );
}

function AppContent() {
  const [view, setView] = useState("landing");
  const [workspace, setWorkspace] = useState("publisher");
  const [activePage, setActivePage] = useState("overview");
  const [selectedWebsiteId, setSelectedWebsiteId] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [publisherData, setPublisherData] = useState({ websites: [], zones: [] });
  const [publisherFinance, setPublisherFinance] = useState({ available: 125, pending: 32.5, earned: 642.5, withdrawn: 485, minimum: WITHDRAWAL_CONFIG.minimumAmount });
  const [publisherWithdrawals, setPublisherWithdrawals] = useState([]);
  const [advertiserDeposits, setAdvertiserDeposits] = useState([]);
  const [campaignData, setCampaignData] = useState([]);
  const [accountOpen, setAccountOpen] = useState(false);
  const config = useMemo(() => ROLE_CONFIG[workspace], [workspace]);
  const { notify } = useNotifications();

  useEffect(() => {
    const onKeyDown = (event) => { if (event.key === "Escape") setDrawerOpen(false); };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.removeEventListener("keydown", onKeyDown); document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const navigate = (page, websiteId = "") => { setActivePage(page); if (websiteId) setSelectedWebsiteId(websiteId); setDrawerOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const openWorkspace = (role, page = "overview") => {
    setWorkspace(role);
    setActivePage(page);
    setSelectedWebsiteId("");
    if (view === "landing") {
      setAccountOpen(true);
      return;
    }
    setView("workspace");
  };
  const logout = () => {
    setView("landing");
    setActivePage("overview");
    setSelectedWebsiteId("");
    setDrawerOpen(false);
    notify("Logged out successfully", "success", 3500, "You have been returned to the AdZora landing screen.");
  };
  const pageTitle = config.nav.find(item => item.id === activePage)?.arabic || (activePage === "website-details" ? "تفاصيل الموقع" : "نظرة عامة");

  if (view === "landing") return <><LandingPage onLogin={() => setAccountOpen(true)} onStart={(role) => openWorkspace(role, role === "publisher" ? "websites" : "create-campaign")} />{accountOpen && <AccountAccess onClose={() => setAccountOpen(false)} onSuccess={() => { setAccountOpen(false); setView("workspace"); }} />}</>;

  return <div className="app-shell">
     <Sidebar workspace={workspace} setWorkspace={(next) => { setWorkspace(next); setActivePage("overview"); setSelectedWebsiteId(""); }} activePage={activePage} onNavigate={navigate} drawerOpen={drawerOpen} closeDrawer={() => setDrawerOpen(false)} />
       <main className="main-content">
        <header className="topbar"><button className="icon-button menu-button" onClick={() => setDrawerOpen(true)} aria-label="Open menu"><Icon name="menu" /></button><div className="breadcrumbs"><span>AdZora</span><Icon name="chevron" size={13} /><strong>{config.label}</strong><Icon name="chevron" size={13} /><span>{pageTitle}</span></div><div className="header-actions"><div className="header-balance" aria-label={config.balanceLabel}><span>{config.balanceLabel}</span><strong>$0.00</strong></div><button className="notification-button" type="button" aria-label="Notifications" onClick={() => notify("You are up to date.", "info")}><span className="notification-dot" /><Icon name="receipt" size={18} /></button></div></header>
         <div className="page-content">{activePage === "overview" ? <Overview workspace={workspace} onNavigate={navigate} /> : activePage === "profile" ? <ProfilePage workspace={workspace} /> : activePage === "settings" ? <SettingsPage workspace={workspace} publisherData={publisherData} setPublisherData={setPublisherData} onNavigate={navigate} onLogout={logout} /> : workspace === "publisher" && ["websites", "website-details", "ad-codes", "earnings", "transactions", "withdrawals", "analytics"].includes(activePage) ? <PublisherWorkspace page={activePage} data={publisherData} setData={setPublisherData} selectedWebsiteId={selectedWebsiteId} finance={publisherFinance} setFinance={setPublisherFinance} withdrawals={publisherWithdrawals} setWithdrawals={setPublisherWithdrawals} onNavigate={navigate} /> : workspace === "advertiser" && ["campaigns", "create-campaign", "balance", "deposits", "transactions", "billing", "analytics", "reports"].includes(activePage) ? <AdvertiserWorkspace page={activePage} data={campaignData} setData={setCampaignData} deposits={advertiserDeposits} setDeposits={setAdvertiserDeposits} onNavigate={navigate} /> : <ComingSoon workspace={workspace} page={activePage} onNavigate={navigate} />}</div>
    </main>
    {accountOpen && <AccountAccess onClose={() => setAccountOpen(false)} onSuccess={() => { setAccountOpen(false); setView("workspace"); }} />}
  </div>;
}

export default function App() {
  return <NotificationProvider><AppContent /></NotificationProvider>;
}
