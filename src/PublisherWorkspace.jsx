import { useEffect, useMemo, useState } from "react";
import WalletWorkspace from "./WalletWorkspace";
import WebsiteDetailPage from "./WebsiteDetailPage";
import { useNotifications } from "./NotificationSystem";

function MiniIcon({ name, size = 17 }) {
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" };
  const paths = {
    plus: <><path d="M12 5v14M5 12h14" /></>, globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18" /></>,
    code: <><path d="m8 9-4 3 4 3M16 9l4 3-4 3M14 5l-4 14" /></>, link: <><path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1" /><path d="M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 7 20l1.1-1.1" /></>,
    copy: <><rect x="8" y="8" width="11" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h2" /></>, check: <path d="m5 12 4 4L19 6" />, arrow: <path d="m9 18 6-6-6-6" />, eye: <><path d="M2.5 12s3.5-5 9.5-5 9.5 5 9.5 5-3.5 5-9.5 5-9.5-5-9.5-5Z" /><circle cx="12" cy="12" r="2.2" /></>, wallet: <><path d="M4 6h15a2 2 0 0 1 2 2v11H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14" /><path d="M16 13h5" /><circle cx="16" cy="13" r=".5" /></>, clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>, trend: <><path d="M3 17 9 11l4 4 8-9" /><path d="M16 6h5v5" /></>,
  };
  return <svg {...props}>{paths[name] || paths.plus}</svg>;
}
function PageHeader({ title, description, action, onAction, icon = "plus", eyebrow = "PUBLISHER / INVENTORY", aside }) { return <div className="workspace-page-header"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{aside || action && <button className="primary-button" type="button" onClick={onAction}><MiniIcon name={icon} size={17} />{action}</button>}</div>; }
function EmptyState({ icon = "globe", title, description, action, onAction }) { return <div className="empty-state"><span className="empty-state-icon"><MiniIcon name={icon} size={25} /></span><h2>{title}</h2><p>{description}</p>{action && <button className="secondary-button" type="button" onClick={onAction}><MiniIcon name="plus" size={16} />{action}</button>}</div>; }
function Field({ label, hint, error, children }) { return <label className="field"><span>{label}</span>{children}{hint && !error && <small>{hint}</small>}{error && <small className="field-error">{error}</small>}</label>; }
const blankWebsite = { name: "", url: "" };
function WebsiteForm({ form, setForm, errors, onCancel, onSubmit }) { const update = (key, value) => setForm(previous => ({ ...previous, [key]: value })); return <section className="form-panel light-panel"><div className="panel-heading"><div><span className="eyebrow">PUBLISHER / WEBSITE</span><h2>Add website</h2></div><button className="link-button" type="button" onClick={onCancel}>Cancel</button></div><p className="form-intro">أدخل Website Name وWebsite URL فقط. لا يختار الناشر نوع الإعلان أو الـCreative أو الحجم.</p><div className="form-grid"><Field label="Website Name" error={errors.name}><input className="input" value={form.name} onChange={event => update("name", event.target.value)} placeholder="My website" /></Field><Field label="Website URL" hint="Use a full HTTPS address" error={errors.url}><input className="input" type="url" value={form.url} onChange={event => update("url", event.target.value)} placeholder="https://example.com" /></Field></div><div className="form-actions"><button className="primary-button" type="button" onClick={onSubmit}><MiniIcon name="check" size={16} />Add website</button><button className="ghost-button" type="button" onClick={onCancel}>Cancel</button></div></section>; }

function WebsitesPage({ data, setData, onNavigate, onDetails }) {
  const { notify } = useNotifications();
  const [showForm, setShowForm] = useState(data.websites.length === 0); const [form, setForm] = useState(blankWebsite); const [errors, setErrors] = useState({});
  const addWebsite = () => { const next = {}; if (!form.name.trim()) next.name = "Enter a website name."; const normalized = form.url.trim().startsWith("http") ? form.url.trim() : "https://" + form.url.trim(); try { const parsed = new URL(normalized); if (parsed.protocol !== "https:" || !parsed.hostname.includes(".")) next.url = "Enter a valid HTTPS website address."; } catch { next.url = "Enter a valid HTTPS website address."; } setErrors(next); if (Object.keys(next).length) return; const website = { id: "website-" + Date.now(), name: form.name.trim(), url: new URL(normalized).toString(), status: "Pending", dateAdded: new Date().toLocaleDateString("en-US"), impressions: 0, clicks: 0 }; setData(previous => ({ ...previous, websites: [...previous.websites, website] })); setForm(blankWebsite); setErrors({}); setShowForm(false); notify("Website added. Your Universal AdZora Code is ready.", "success"); onNavigate("websites"); };
  return <div className="workspace-page"><PageHeader title="My Websites" description="أضف Website Name وWebsite URL فقط. احصل على Universal AdZora Code ثم راقب أداء موقعك من Analytics." action="Add Website" onAction={() => setShowForm(true)} />{showForm && <WebsiteForm form={form} setForm={setForm} errors={errors} onCancel={() => { setShowForm(false); setErrors({}); }} onSubmit={addWebsite} />}{!data.websites.length && !showForm ? <section className="light-panel"><EmptyState title="No websites yet" description="أضف موقعك للحصول على Universal AdZora Code ومتابعة التحليلات." action="Add Website" onAction={() => setShowForm(true)} /></section> : data.websites.length > 0 && <section className="light-panel data-panel"><div className="panel-heading"><div><span className="eyebrow">PUBLISHER WEBSITES</span><h2>{data.websites.length} website{data.websites.length === 1 ? "" : "s"}</h2></div><span className="result-count">Universal code ready</span></div><div className="publisher-site-grid">{data.websites.map(website => <article className="publisher-site-card" key={website.id}><div className="publisher-site-heading"><div className="publisher-site-identity"><strong>{website.name}</strong><span>{website.url}</span></div><span className="status-badge pending">{website.status}</span></div><div className="publisher-website-actions"><button className="primary-button universal-code-button" type="button" onClick={() => onNavigate("ad-codes")}><MiniIcon name="code" size={16} />Get Universal Code</button><button className="secondary-button" type="button" onClick={() => onNavigate("analytics", website.id)}><MiniIcon name="trend" size={16} />Analytics</button><button className="ghost-button website-view-details" type="button" onClick={() => onDetails(website.id)}><MiniIcon name="eye" size={16} />View Details</button></div></article>)}</div></section>}</div>;
}

function AdCodesPage({ data, onNavigate }) {
  const { notify } = useNotifications();
  const [copiedId, setCopiedId] = useState(""); const codeFor = website => "<!-- AdZora Universal Code -->" + String.fromCharCode(10) + "<script src=\"https://ad-zora.vercel.app/ad.js\" data-adzora-website=\"" + website.id + "\" async></script>";
  const copyCode = async website => { try { await navigator.clipboard.writeText(codeFor(website)); setCopiedId(website.id); notify("Universal AdZora Code copied.", "success"); setTimeout(() => setCopiedId(""), 1800); } catch { notify("Copy is unavailable in this browser.", "error"); } };
  return <div className="workspace-page"><PageHeader title="Universal AdZora Code" description="انسخ كودًا واحدًا إلى موقعك. الناشر لا يختار Campaign أو Creative أو Image أو Video أو Ad Size." action="Add Website" onAction={() => onNavigate("websites")} />{!data.websites.length ? <section className="light-panel"><EmptyState icon="code" title="Add a website first" description="بعد إضافة Website Name وWebsite URL سيظهر Universal AdZora Code هنا." action="Add Website" onAction={() => onNavigate("websites")} /></section> : <div className="code-list">{data.websites.map(website => <section className="light-panel code-card" key={website.id}><div className="code-card-heading"><div className="row-main"><span className="row-icon"><MiniIcon name="code" /></span><div><strong>{website.name}</strong><small>{website.url}</small></div></div><span className="status-badge ready">Universal</span></div><div className="code-note"><strong>One universal code for this website</strong><span>Ad Server will choose an eligible campaign and Creative later. Publisher settings do not include ad type, size, or Creative.</span></div><pre className="code-box"><code>{codeFor(website)}</code></pre><div className="code-actions"><button className="primary-button universal-code-button" type="button" onClick={() => copyCode(website)}><MiniIcon name={copiedId === website.id ? "check" : "copy"} size={16} />{copiedId === website.id ? "Copied" : "Copy Universal Code"}</button><button className="ghost-button" type="button" onClick={() => onNavigate("websites")}><MiniIcon name="globe" size={16} />Manage website</button></div><div className="code-install-note" role="note"><strong>ملاحظة</strong><span>ضع هذا الكود داخل وسم <code>&lt;head&gt;</code> في موقعك لتفعيل خدمة الإعلانات.</span></div><div className="frontend-only-note"><strong>Frontend-only boundary</strong><span>The ad endpoint, event tracking, and server-side attribution require a backend and are not active in this UI build.</span></div></section>)}</div>}</div>;
}

function FinanceMetrics({ finance }) { const metrics = [["Available Earnings", finance.available, "wallet"], ["Pending Earnings", finance.pending, "clock"], ["Total Earned", finance.earned, "trend"], ["Withdrawn", finance.withdrawn, "trend"]]; return <section className="metric-grid financial-metrics">{metrics.map(([label, value, icon]) => <article className="metric-card" key={label}><div className="metric-top"><span className="metric-icon"><MiniIcon name={icon} size={16} /></span><span className="metric-label">{label}</span></div><strong className="metric-value">{"$"}{value.toFixed(2)}</strong><span className="metric-hint">Frontend demo value</span></article>)}</section>; }
function EarningsPage({ finance, onNavigate }) { return <div className="workspace-page"><PageHeader title="Publisher Earnings" description="تابع أرباح الناشر منفصلة عن Advertiser Spend. هذه الأرقام تجريبية وليست محاسبة فعلية." action="Withdraw earnings" onAction={() => onNavigate("withdrawals")} icon="arrow" /><FinanceMetrics finance={finance} /><section className="light-panel"><div className="panel-heading"><div><span className="eyebrow">TRACKING ROADMAP</span><h2>Publisher revenue events</h2></div></div><div className="event-chip-list"><span>Impression</span><span>Click</span><span>Video View</span></div><p className="muted-copy">الأحداث جاهزة كنموذج بيانات، لكن لا تعتمد الأرباح أو الإحصائيات على localStorage ولا توجد خدمة Tracking متصلة بعد.</p></section></div>; }
function WithdrawalsPage({ finance, withdrawals, setFinance, setWithdrawals }) { const { notify } = useNotifications(); const [amount, setAmount] = useState(""); const [error, setError] = useState(""); const submit = () => { const value = Number(amount); if (!value || value < finance.minimum) { setError("The amount is below the minimum withdrawal."); return; } if (value > finance.available) { setError("The amount exceeds available earnings."); return; } const item = { id: "withdrawal-" + Date.now(), amount: value, status: "Pending", date: new Date().toLocaleDateString("en-US") }; setFinance(previous => ({ ...previous, available: previous.available - value })); setWithdrawals(previous => [...previous, item]); setAmount(""); setError(""); notify("Withdrawal saved as a demo Pending request. No money was moved.", "success"); }; return <div className="workspace-page"><PageHeader title="Withdrawals" description="طلب سحب منفصل عن إنفاق المعلن. لا يوجد Payment Provider متصل." /><section className="form-panel light-panel"><div className="withdraw-balance"><span>Available Earnings</span><strong>{"$"}{finance.available.toFixed(2)}</strong><small>Minimum: {"$"}{finance.minimum.toFixed(2)}</small></div><div className="form-grid"><Field label="Amount" error={error}><input className="input" type="number" value={amount} min={finance.minimum} onChange={event => { setAmount(event.target.value); setError(""); }} placeholder="50" /></Field><Field label="Payment method"><select className="input select"><option>Bank transfer (demo)</option><option>Manual review (demo)</option></select></Field></div><button className="primary-button" type="button" onClick={submit}><MiniIcon name="check" size={16} />Create demo request</button></section><section className="light-panel"><div className="panel-heading"><div><span className="eyebrow">WITHDRAWAL STATUS</span><h2>Recent requests</h2></div><span className="result-count">{withdrawals.length} records</span></div>{!withdrawals.length ? <EmptyState icon="trend" title="No withdrawals yet" description="سيظهر طلب السحب التجريبي هنا بحالة Pending." /> : <div className="data-list">{withdrawals.map(item => <div className="data-row compact-finance-row" key={item.id}><div className="row-main"><span className="row-icon"><MiniIcon name="trend" /></span><div><strong>{"$"}{item.amount.toFixed(2)}</strong><small>{item.date}</small></div></div><span className="status-badge pending">{item.status}</span></div>)}</div>}</section></div>; }

function WebsiteAnalyticsPage({ data, onNavigate }) {
  const websites = data.websites || []; const [selectedId, setSelectedId] = useState(websites[0]?.id || ""); const selectedWebsite = websites.find(item => item.id === selectedId) || websites[0];
  const metrics = [["Impressions", selectedWebsite?.impressions || 0, "eye"], ["Clicks", selectedWebsite?.clicks || 0, "trend"], ["CTR", "--", "trend"], ["Earnings", 0, "wallet"]];
  return <div className="workspace-page"><PageHeader title="Website Analytics" description="تابع مؤشرات العرض والنقرات والأرباح لكل Publisher Website في مساحة واحدة." />{!selectedWebsite ? <section className="light-panel"><EmptyState icon="trend" title="No analytics scope yet" description="بعد إضافة Website سيظهر نطاق التحليلات وحالات التتبع المناسبة." action="Add Website" onAction={() => onNavigate("websites")} /></section> : <><section className="light-panel analytics-toolbar"><div><span className="eyebrow">TRACKING SCOPE</span><h2>{selectedWebsite.name}</h2><p>{selectedWebsite.url}</p></div><label className="field analytics-select"><span>Select Website</span><select className="input select" value={selectedId} onChange={event => setSelectedId(event.target.value)}>{websites.map(website => <option key={website.id} value={website.id}>{website.name}</option>)}</select></label></section><section className="analytics-metric-grid">{metrics.map(([label, value, icon]) => <article className="metric-card analytics-metric" key={label}><div className="metric-top"><span className="metric-icon"><MiniIcon name={icon} size={16} /></span><span className="metric-label">{label}</span></div><strong className="metric-value">{value === "--" ? value : value}</strong><span className="metric-hint">No live events connected</span></article>)}</section><section className="analytics-grid"><section className="light-panel analytics-chart-card"><div className="panel-heading"><div><span className="eyebrow">LAST 30 DAYS</span><h2>Website performance</h2></div><span className="phase-chip">Frontend demo</span></div><div className="analytics-chart"><svg viewBox="0 0 760 220" role="img" aria-label="Website analytics chart"><path d="M20 180H740M20 125H740M20 70H740" className="chart-grid-line" /><path d="M20 180 C130 180 170 180 250 180 S390 180 470 180 S620 180 740 180 L740 210 L20 210 Z" className="chart-fill" /><path d="M20 180 C130 180 170 180 250 180 S390 180 470 180 S620 180 740 180" className="chart-line" /><circle cx="740" cy="180" r="5" className="chart-point" /></svg><div className="chart-empty-state"><span className="chart-empty-icon"><MiniIcon name="trend" size={18} /></span><strong>Waiting for tracked events</strong><span>The chart will populate after a real tracking endpoint is connected.</span></div></div></section><section className="light-panel analytics-detail-card"><div className="panel-heading"><div><span className="eyebrow">SELECTED WEBSITE</span><h2>Tracking details</h2></div></div><div className="analytics-detail-list"><div><span>Name</span><strong>{selectedWebsite.name}</strong></div><div><span>Website URL</span><strong>{selectedWebsite.url}</strong></div><div><span>Tracking status</span><strong className="status-text-pending">Frontend only</strong></div><div><span>Events</span><strong>Impression · Click · Earnings</strong></div></div><div className="frontend-only-note"><strong>Backend boundary</strong><span>Impressions, clicks, user/session limits, redirects, and earnings require a trusted server. This page does not fabricate live statistics.</span></div></section></section></>}</div>;
}

const publisherWebsiteDemoAnalytics = [
  {
    impressions: 12420, clicks: 386, ctr: "3.11%", cpm: "$1.82", cpc: "$0.058", earnings: 22.61,
    formats: {
      native: { impressions: 7420, clicks: 218, ctr: "2.94%", earnings: 13.52 },
      social: { impressions: 3800, clicks: 124, ctr: "3.26%", earnings: 6.81 },
      video: { impressions: 1200, clicks: 44, ctr: "3.67%", earnings: 2.28 },
    },
    series: {
      impressions: [620, 710, 680, 840, 790, 930, 1010, 980, 1100, 1060, 1170, 1240, 1190, 1310, 1280, 1390, 1360, 1450, 1410, 1520, 1490, 1610, 1580, 1690, 1650, 1780, 1740, 1880, 1960, 2040],
      clicks: [18, 21, 20, 25, 23, 29, 31, 30, 34, 33, 36, 39, 38, 41, 40, 44, 43, 46, 45, 49, 48, 52, 50, 55, 53, 57, 56, 60, 64, 68],
      earnings: [2.1, 2.4, 2.3, 2.8, 2.7, 3.1, 3.4, 3.2, 3.7, 3.5, 4.0, 4.3, 4.1, 4.6, 4.4, 4.9, 4.8, 5.2, 5.0, 5.6, 5.4, 5.9, 5.7, 6.2, 6.0, 6.6, 6.4, 7.1, 7.6, 8.2],
    },
  },
  {
    impressions: 8420, clicks: 256, ctr: "3.04%", cpm: "$1.68", cpc: "$0.055", earnings: 42.15,
    formats: {
      native: { impressions: 4860, clicks: 151, ctr: "3.11%", earnings: 24.18 },
      social: { impressions: 2520, clicks: 72, ctr: "2.86%", earnings: 11.04 },
      video: { impressions: 1040, clicks: 33, ctr: "3.17%", earnings: 6.93 },
    },
    series: {
      impressions: [420, 510, 480, 590, 540, 630, 670, 640, 720, 700, 760, 810, 790, 860, 830, 900, 880, 940, 920, 990, 970, 1030, 1010, 1090, 1060, 1140, 1110, 1190, 1230, 1280],
      clicks: [11, 14, 13, 16, 15, 18, 20, 19, 22, 21, 23, 25, 24, 27, 26, 28, 27, 30, 29, 31, 30, 33, 32, 35, 34, 36, 35, 38, 40, 42],
      earnings: [1.4, 1.7, 1.6, 2.0, 1.9, 2.2, 2.4, 2.3, 2.6, 2.5, 2.8, 3.0, 2.9, 3.2, 3.1, 3.4, 3.3, 3.6, 3.5, 3.8, 3.7, 4.0, 3.9, 4.2, 4.1, 4.4, 4.3, 4.6, 4.8, 5.0],
    },
  },
  {
    impressions: 6580, clicks: 168, ctr: "2.55%", cpm: "$1.54", cpc: "$0.061", earnings: 24.45,
    formats: {
      native: { impressions: 3520, clicks: 92, ctr: "2.61%", earnings: 12.74 },
      social: { impressions: 2080, clicks: 53, ctr: "2.55%", earnings: 7.72 },
      video: { impressions: 980, clicks: 23, ctr: "2.35%", earnings: 3.99 },
    },
    series: {
      impressions: [310, 360, 340, 420, 390, 460, 490, 470, 520, 500, 550, 580, 570, 610, 590, 630, 620, 660, 650, 700, 680, 730, 710, 760, 740, 790, 770, 820, 850, 890],
      clicks: [8, 10, 9, 12, 11, 13, 14, 14, 15, 15, 16, 18, 17, 19, 18, 20, 19, 21, 20, 22, 21, 23, 22, 24, 23, 25, 24, 26, 28, 30],
      earnings: [0.9, 1.1, 1.0, 1.3, 1.2, 1.4, 1.5, 1.5, 1.7, 1.6, 1.8, 1.9, 1.9, 2.1, 2.0, 2.2, 2.1, 2.3, 2.2, 2.4, 2.3, 2.5, 2.4, 2.6, 2.5, 2.7, 2.6, 2.8, 2.9, 3.1],
    },
  },
];

const formatLabels = { native: "Native", social: "Social", video: "Video" };
const periodOptions = ["Today", "7 Days", "30 Days", "90 Days"];

function getWebsiteDomain(url) {
  try { return new URL(url).hostname; } catch { return url; }
}

function cloneDemoAnalytics(source) {
  return {
    ...source,
    formats: Object.fromEntries(Object.entries(source.formats).map(([key, value]) => [key, { ...value }])),
    series: Object.fromEntries(Object.entries(source.series).map(([key, value]) => [key, [...value]])),
  };
}

function getDemoAnalytics(index) {
  const source = cloneDemoAnalytics(publisherWebsiteDemoAnalytics[index % publisherWebsiteDemoAnalytics.length]);
  if (index < publisherWebsiteDemoAnalytics.length) return source;
  const multiplier = 1 + (index - publisherWebsiteDemoAnalytics.length + 1) * 0.08;
  return {
    ...source,
    impressions: Math.round(source.impressions * multiplier),
    clicks: Math.round(source.clicks * multiplier),
    earnings: Number((source.earnings * multiplier).toFixed(2)),
    series: Object.fromEntries(Object.entries(source.series).map(([key, values]) => [key, values.map(value => Number((value * multiplier).toFixed(2)))])),
  };
}

function buildWebsiteAnalytics(website, index) {
  return {
    ...website,
    ...getDemoAnalytics(index),
    websiteId: website.id,
    domain: getWebsiteDomain(website.url),
    status: website.status || "Active",
  };
}

function buildAnalyticsPath(values, maxValue) {
  const width = 720;
  const height = 142;
  const xOffset = 20;
  const yOffset = 20;
  const points = values.length > 1 ? values : [values[0] || 0, values[0] || 0];
  return points.map((value, index) => {
    const x = xOffset + (index / (points.length - 1)) * width;
    const y = yOffset + height - (value / maxValue) * height;
    return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
}

function getPeriodSeries(values, period) {
  if (period === "Today") {
    const value = values[values.length - 1] || 0;
    return [value * 0.94, value];
  }
  if (period === "7 Days") return values.slice(-7);
  if (period === "90 Days") return values.flatMap(value => [value * 0.82, value * 0.91, value]);
  return values;
}

function formatAnalyticsNumber(value) {
  return Number(value).toLocaleString("en-US");
}

function formatAnalyticsMoney(value) {
  return "$" + Number(value).toFixed(2);
}

function AnalyticsMetric({ label, value, icon }) {
  return <article className="metric-card analytics-metric"><div className="metric-top"><span className="metric-icon"><MiniIcon name={icon} size={16} /></span><span className="metric-label">{label}</span></div><strong className="metric-value">{value}</strong><span className="metric-hint">Demo data</span></article>;
}

function WebsitePerformanceCard({ website, onDetails }) {
  const metrics = [["Impressions", formatAnalyticsNumber(website.impressions)], ["Clicks", formatAnalyticsNumber(website.clicks)], ["CTR", website.ctr], ["CPM", website.cpm], ["CPC", website.cpc], ["Earnings", formatAnalyticsMoney(website.earnings)]];
  return <article className="website-analytics-card"><div className="website-analytics-card-header"><div className="website-analytics-identity"><strong>{website.name}</strong><span>{website.domain}</span></div><span className={"status-badge " + (website.status === "Active" ? "ready" : "pending")}>{website.status}</span></div><div className="website-analytics-metrics">{metrics.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div><button className="secondary-button website-details-button" type="button" onClick={() => onDetails(website.websiteId)}><MiniIcon name="eye" size={15} />View Details</button></article>;
}

function WebsiteAnalyticsChart({ website, period }) {
  const series = Object.fromEntries(Object.entries(website.series).map(([key, values]) => [key, getPeriodSeries(values, period)]));
  const maxes = Object.fromEntries(Object.entries(series).map(([key, values]) => [key, Math.max(...values, 1) * 1.12]));
  const axisLabels = period === "Today" ? ["Start", "Now"] : period === "7 Days" ? ["-6d", "-3d", "Today"] : period === "90 Days" ? ["-90d", "-60d", "-30d", "Today"] : ["01", "08", "15", "22", "30"];
  return <div className="publisher-chart website-detail-chart"><svg viewBox="0 0 760 190" role="img" aria-label={`${website.name} ${period} performance chart`} preserveAspectRatio="none"><path d="M20 162H740M20 115H740M20 68H740M20 20H740" className="chart-grid-line" /><path d={buildAnalyticsPath(series.impressions, maxes.impressions)} className="publisher-chart-line impressions-line" /><path d={buildAnalyticsPath(series.clicks, maxes.clicks)} className="publisher-chart-line clicks-line" /><path d={buildAnalyticsPath(series.earnings, maxes.earnings)} className="publisher-chart-line earnings-line" /></svg><div className="chart-axis">{axisLabels.map(label => <span key={label}>{label}</span>)}</div></div>;
}

function WebsiteAnalyticsDetail({ website, websites, period, setPeriod, onSelectWebsite, onBack }) {
  return <section className="website-analytics-detail"><div className="detail-header"><button className="link-button" type="button" onClick={onBack}><MiniIcon name="arrow" size={15} />Back to Analytics</button><label className="field analytics-select"><span>Website</span><select className="input select" value={website.websiteId} onChange={event => onSelectWebsite(event.target.value)}><option value="all">All Websites</option>{websites.map(item => <option key={item.websiteId} value={item.websiteId}>{item.name}</option>)}</select></label></div><section className="light-panel selected-website-summary"><div><span className="eyebrow">WEBSITE DETAILS</span><h2>{website.name}</h2><p>{website.domain} · <span className="status-text-active">{website.status}</span></p></div><span className="phase-chip">Demo data</span></section><section className="analytics-metric-grid detail-metrics">{[["Impressions", formatAnalyticsNumber(website.impressions), "eye"], ["Clicks", formatAnalyticsNumber(website.clicks), "trend"], ["CTR", website.ctr, "chart"], ["CPM", website.cpm, "wallet"], ["CPC", website.cpc, "trend"], ["Earnings", formatAnalyticsMoney(website.earnings), "wallet"]].map(([label, value, icon]) => <AnalyticsMetric key={label} label={label} value={value} icon={icon} />)}</section><section className="light-panel publisher-performance-panel"><div className="panel-heading"><div><span className="eyebrow">PERFORMANCE CHART</span><h2>{website.name} performance</h2></div><div className="analytics-period-control" aria-label="Analytics period">{periodOptions.map(option => <button type="button" key={option} className={period === option ? "is-active" : ""} onClick={() => setPeriod(option)}>{option}</button>)}</div></div><div className="chart-legend"><span><i className="legend-impressions" />Impressions</span><span><i className="legend-clicks" />Clicks</span><span><i className="legend-earnings" />Earnings</span></div><WebsiteAnalyticsChart website={website} period={period} /></section><section className="light-panel ad-format-panel"><div className="panel-heading"><div><span className="eyebrow">FORMAT BREAKDOWN</span><h2>Ad Format Performance</h2></div><span className="phase-chip">Native · Social · Video</span></div><div className="format-performance-grid">{Object.entries(website.formats).map(([key, format]) => <article className={"format-performance-card format-" + key} key={key}><div className="format-card-heading"><span className="format-card-mark">{formatLabels[key].slice(0, 1)}</span><div><strong>{formatLabels[key]}</strong><small>Demo performance</small></div></div><div className="format-card-metrics"><div><span>Impressions</span><strong>{formatAnalyticsNumber(format.impressions)}</strong></div><div><span>Clicks</span><strong>{formatAnalyticsNumber(format.clicks)}</strong></div><div><span>CTR</span><strong>{format.ctr}</strong></div><div><span>Earnings</span><strong>{formatAnalyticsMoney(format.earnings)}</strong></div></div></article>)}</div></section></section>;
}

function PublisherAnalyticsPage({ data, onNavigate, selectedWebsiteId = "" }) {
  const [period, setPeriod] = useState("30 Days");
  const [selectedId, setSelectedId] = useState(selectedWebsiteId);
  const websites = data.websites || [];
  useEffect(() => { if (selectedWebsiteId) setSelectedId(selectedWebsiteId); }, [selectedWebsiteId]);
  const websiteAnalytics = websites.map(buildWebsiteAnalytics);
  const selectedWebsite = websiteAnalytics.find(website => website.websiteId === selectedId);
  const summaryMetrics = [["Impressions", "24,860", "eye"], ["Clicks", "742", "trend"], ["CTR", "2.98%", "chart"], ["Earnings", "$125.00", "wallet"], ["CPM", "$1.84", "wallet"], ["CPC", "$0.058", "trend"]];
  const periodControl = <div className="analytics-period-control" aria-label="Analytics period">{periodOptions.map(option => <button type="button" key={option} className={period === option ? "is-active" : ""} onClick={() => setPeriod(option)}>{option}</button>)}</div>;
  if (selectedWebsite) return <div className="workspace-page publisher-analytics"><PageHeader eyebrow="PUBLISHER / ANALYTICS" title="Analytics" description="Track your websites, ad performance, and earnings." aside={<div className="analytics-header-controls"><span className="phase-chip">Demo data</span>{periodControl}</div>} /><WebsiteAnalyticsDetail website={selectedWebsite} websites={websiteAnalytics} period={period} setPeriod={setPeriod} onSelectWebsite={id => id === "all" ? setSelectedId("") : setSelectedId(id)} onBack={() => setSelectedId("")} /></div>;
  const activitySites = websiteAnalytics.length ? [0, 1, 2].map(index => websiteAnalytics[index % websiteAnalytics.length]) : [{ name: "My Website" }, { name: "Store Website" }, { name: "Blog Website" }];
  return <div className="workspace-page publisher-analytics">
    <PageHeader eyebrow="PUBLISHER / ANALYTICS" title="Analytics" description="Track your websites, ad performance, and earnings." aside={<div className="analytics-header-controls"><span className="phase-chip">Demo data</span>{periodControl}</div>} />
    <section className="analytics-metric-grid publisher-analytics-metrics">{summaryMetrics.map(([label, value, icon]) => <AnalyticsMetric key={label} label={label} value={value} icon={icon} />)}</section>
    <section className="light-panel earnings-summary-panel"><div className="panel-heading"><div><span className="eyebrow">OVERVIEW</span><h2>Overview</h2></div><span className="phase-chip">All websites · Demo data</span></div><p className="analytics-demo-note">These figures are demo data and are not connected to a live server.</p><div className="earnings-summary-grid"><div><span>Available Earnings</span><strong>$125.00</strong></div><div><span>Pending Earnings</span><strong>$32.50</strong></div><div><span>Total Earned</span><strong>$642.50</strong></div><div><span>Total Withdrawn</span><strong>$485.00</strong></div></div></section>
    <section className="light-panel website-performance-panel"><div className="panel-heading"><div><span className="eyebrow">PUBLISHER INVENTORY</span><h2>Websites Performance</h2></div><button className="text-button" type="button" onClick={() => onNavigate("websites")}>Manage websites <MiniIcon name="arrow" size={14} /></button></div>{!websiteAnalytics.length ? <EmptyState icon="globe" title="No websites yet" description="Add a website to start receiving AdZora ads and analytics." action="Add Website" onAction={() => onNavigate("websites")} /> : <div className="website-analytics-grid">{websiteAnalytics.map(website => <WebsitePerformanceCard website={website} key={website.websiteId} onDetails={setSelectedId} />)}</div>}</section>
    <section className="light-panel activity-panel"><div className="panel-heading"><div><span className="eyebrow">DEMO FEED</span><h2>Recent Activity</h2></div><span className="phase-chip">Demo events</span></div><div className="activity-list"><div><span className="activity-icon"><MiniIcon name="eye" size={15} /></span><span><strong>Ad impression</strong><small>{activitySites[0].name} · Today, 14:32</small></span><b>+1,240</b></div><div><span className="activity-icon"><MiniIcon name="trend" size={15} /></span><span><strong>Ad click</strong><small>{activitySites[1].name} · Today, 13:48</small></span><b>+42</b></div><div><span className="activity-icon"><MiniIcon name="wallet" size={15} /></span><span><strong>Earnings update</strong><small>{activitySites[2].name} · Today, 12:15</small></span><b>$8.20</b></div></div></section>
  </div>;
}

function PublisherTransactions({ withdrawals }) { return <div className="workspace-page"><PageHeader title="Publisher Transactions" description="سجل منفصل لأرباح الناشر والتعديلات والسحوبات، دون خلطه بإنفاق المعلن." /><section className="light-panel data-panel"><div className="panel-heading"><div><span className="eyebrow">TRANSACTION HISTORY</span><h2>{withdrawals.length} records</h2></div></div>{!withdrawals.length ? <EmptyState icon="code" title="No transactions yet" description="ستظهر Earnings وAdjustments وWithdrawals هنا عند وجود بيانات." /> : <div className="data-list">{withdrawals.map(item => <div className="data-row" key={item.id}><div className="row-main"><span className="row-icon"><MiniIcon name="trend" /></span><div><strong>Withdrawal · {"$"}{item.amount.toFixed(2)}</strong><small>{item.date}</small></div></div><span className="status-badge pending">{item.status}</span></div>)}</div>}</section></div>; }
export default function PublisherWorkspace({ page, data, setData, onNavigate, selectedWebsiteId = "", finance = { available: 125, pending: 32.5, earned: 642.5, withdrawn: 485, minimum: 50 }, setFinance = () => {}, withdrawals = [], setWithdrawals = () => {} }) { const content = useMemo(() => page, [page]); const selectedWebsite = data.websites?.find(website => website.id === selectedWebsiteId); const selectedIndex = data.websites?.findIndex(website => website.id === selectedWebsiteId) ?? 0; return <div className="publisher-workspace">{content === "websites" && <WebsitesPage data={data} setData={setData} onNavigate={onNavigate} onDetails={id => onNavigate("website-details", id)} />}{content === "website-details" && <WebsiteDetailPage website={selectedWebsite} websiteIndex={selectedIndex < 0 ? 0 : selectedIndex} onBack={() => onNavigate("websites")} onAnalytics={id => onNavigate("analytics", id)} />}{content === "ad-codes" && <AdCodesPage data={data} onNavigate={onNavigate} />}{content === "earnings" && <EarningsPage finance={finance} onNavigate={onNavigate} />}{content === "withdrawals" && <WalletWorkspace mode="withdrawal" requests={withdrawals} setRequests={setWithdrawals} available={finance.available} />}{content === "transactions" && <PublisherTransactions withdrawals={withdrawals} />}{content === "analytics" && <PublisherAnalyticsPage data={data} onNavigate={onNavigate} selectedWebsiteId={selectedWebsiteId} />}</div>; }
