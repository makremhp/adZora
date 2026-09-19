import { useEffect, useMemo, useState } from "react";
import WalletWorkspace from "./WalletWorkspace";
import WebsiteDetailPage from "./WebsiteDetailPage";
import { useNotifications } from "./NotificationSystem";
import { api } from "./api";

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
function WebsiteForm({ form, setForm, errors, onCancel, onSubmit, submitting = false }) { const update = (key, value) => setForm(previous => ({ ...previous, [key]: value })); return <section className="form-panel light-panel"><div className="panel-heading"><div><span className="eyebrow">PUBLISHER / WEBSITE</span><h2>Add website</h2></div><button className="link-button" type="button" onClick={onCancel}>Cancel</button></div><p className="form-intro">أدخل Website Name وWebsite URL فقط. لا يختار الناشر نوع الإعلان أو الـCreative أو الحجم.</p><div className="form-grid"><Field label="Website Name" error={errors.name}><input className="input" value={form.name} onChange={event => update("name", event.target.value)} placeholder="My website" /></Field><Field label="Website URL" hint="Use a full HTTPS address" error={errors.url}><input className="input" type="url" value={form.url} onChange={event => update("url", event.target.value)} placeholder="https://example.com" /></Field></div><div className="form-actions"><button className="primary-button" type="button" onClick={onSubmit} disabled={submitting}><MiniIcon name="check" size={16} />{submitting ? "Adding…" : "Add website"}</button><button className="ghost-button" type="button" onClick={onCancel}>Cancel</button></div></section>; }

function WebsitesPage({ data, onNavigate, onDetails, onCreateWebsite }) {
  const { notify } = useNotifications();
  const [showForm, setShowForm] = useState(data.websites.length === 0); const [form, setForm] = useState(blankWebsite); const [errors, setErrors] = useState({}); const [submitting, setSubmitting] = useState(false);
  const addWebsite = async () => {
    const next = {}; if (!form.name.trim()) next.name = "Enter a website name.";
    const normalized = form.url.trim().startsWith("http") ? form.url.trim() : "https://" + form.url.trim();
    try { const parsed = new URL(normalized); if (parsed.protocol !== "https:" || !parsed.hostname.includes(".")) next.url = "Enter a valid HTTPS website address."; } catch { next.url = "Enter a valid HTTPS website address."; }
    setErrors(next);
    if (Object.keys(next).length) return;
    setSubmitting(true);
    try {
      await onCreateWebsite(form.name.trim(), new URL(normalized).toString());
      setForm(blankWebsite); setErrors({}); setShowForm(false);
      notify("Website added. Your Universal AdZora Code is ready.", "success");
      onNavigate("websites");
    } catch (error) {
      notify(error.message || "Could not add the website.", "error");
    } finally {
      setSubmitting(false);
    }
  };
  return <div className="workspace-page"><PageHeader title="My Websites" description="أضف Website Name وWebsite URL فقط. احصل على Universal AdZora Code ثم راقب أداء موقعك من Analytics." action="Add Website" onAction={() => setShowForm(true)} />{showForm && <WebsiteForm form={form} setForm={setForm} errors={errors} onCancel={() => { setShowForm(false); setErrors({}); }} onSubmit={addWebsite} submitting={submitting} />}{!data.websites.length && !showForm ? <section className="light-panel"><EmptyState title="No websites yet" description="أضف موقعك للحصول على Universal AdZora Code ومتابعة التحليلات." action="Add Website" onAction={() => setShowForm(true)} /></section> : data.websites.length > 0 && <section className="light-panel data-panel"><div className="panel-heading"><div><span className="eyebrow">PUBLISHER WEBSITES</span><h2>{data.websites.length} website{data.websites.length === 1 ? "" : "s"}</h2></div><span className="result-count">Universal code ready</span></div><div className="publisher-site-grid">{data.websites.map(website => <article className="publisher-site-card" key={website.id}><button className="publisher-site-open" type="button" onClick={() => onDetails(website.id)} aria-label={`Open ${website.name} details`}><div className="publisher-site-heading"><div className="publisher-site-identity"><strong>{website.name}</strong><span>{website.url}</span></div><span className="status-badge pending">{website.status}</span></div></button><div className="publisher-website-actions"><button className="primary-button universal-code-button" type="button" onClick={() => onNavigate("ad-codes")}><MiniIcon name="code" size={16} />Universal Code</button><button className="secondary-button" type="button" onClick={() => onNavigate("analytics", website.id)}><MiniIcon name="trend" size={16} />Analytics</button><button className="icon-button website-view-details" type="button" onClick={() => onDetails(website.id)} aria-label={`View details for ${website.name}`}><MiniIcon name="arrow" size={16} /></button></div></article>)}</div></section>}</div>;
}

function AdCodesPage({ data, onNavigate }) {
  const { notify } = useNotifications();
  const [copiedId, setCopiedId] = useState(""); const codeFor = website => "<!-- AdZora Universal Code -->" + String.fromCharCode(10) + "<script src=\"https://ad-zora.vercel.app/ad.js\" data-adzora-website=\"" + website.id + "\" async></script>";
  const copyCode = async website => { try { await navigator.clipboard.writeText(codeFor(website)); setCopiedId(website.id); notify("Universal AdZora Code copied.", "success"); setTimeout(() => setCopiedId(""), 1800); } catch { notify("Copy is unavailable in this browser.", "error"); } };
  return <div className="workspace-page"><PageHeader title="Universal AdZora Code" description="انسخ كودًا واحدًا إلى موقعك. الناشر لا يختار Campaign أو Creative أو Image أو Video أو Ad Size." action="Add Website" onAction={() => onNavigate("websites")} />{!data.websites.length ? <section className="light-panel"><EmptyState icon="code" title="Add a website first" description="بعد إضافة Website Name وWebsite URL سيظهر Universal AdZora Code هنا." action="Add Website" onAction={() => onNavigate("websites")} /></section> : <div className="code-list">{data.websites.map(website => <section className="light-panel code-card" key={website.id}><div className="code-card-heading"><div className="row-main"><span className="row-icon"><MiniIcon name="code" /></span><div><strong>{website.name}</strong><small>{website.url}</small></div></div><span className="status-badge ready">Universal</span></div><div className="code-note"><strong>One universal code for this website</strong><span>Ad Server will choose an eligible campaign and Creative later. Publisher settings do not include ad type, size, or Creative.</span></div><pre className="code-box"><code>{codeFor(website)}</code></pre><div className="code-actions"><button className="primary-button universal-code-button" type="button" onClick={() => copyCode(website)}><MiniIcon name={copiedId === website.id ? "check" : "copy"} size={16} />{copiedId === website.id ? "Copied" : "Copy Universal Code"}</button><button className="ghost-button" type="button" onClick={() => onNavigate("websites")}><MiniIcon name="globe" size={16} />Manage website</button></div><div className="code-install-note" role="note"><strong>ملاحظة</strong><span>ضع هذا الكود داخل وسم <code>&lt;head&gt;</code> في موقعك لتفعيل خدمة الإعلانات.</span></div></section>)}</div>}</div>;
}

function FinanceMetrics({ finance }) { const metrics = [["Available Earnings", finance.available, "wallet"], ["Pending Earnings", finance.pending, "clock"], ["Total Earned", finance.earned, "trend"], ["Withdrawn", finance.withdrawn, "trend"]]; return <section className="metric-grid financial-metrics">{metrics.map(([label, value, icon]) => <article className="metric-card" key={label}><div className="metric-top"><span className="metric-icon"><MiniIcon name={icon} size={16} /></span><span className="metric-label">{label}</span></div><strong className="metric-value">{"$"}{value.toFixed(2)}</strong></article>)}</section>; }
function EarningsPage({ finance, onNavigate }) { return <div className="workspace-page"><PageHeader title="Publisher Earnings" description="تابع أرباح الناشر منفصلة عن Advertiser Spend من مكان واحد." action="Withdraw earnings" onAction={() => onNavigate("withdrawals")} icon="arrow" /><FinanceMetrics finance={finance} /><section className="light-panel"><div className="panel-heading"><div><span className="eyebrow">TRACKING</span><h2>Publisher revenue events</h2></div></div><div className="event-chip-list"><span>Impression</span><span>Click</span><span>Video View</span></div><p className="muted-copy">تُستخدم هذه الأحداث لاحتساب أرباحك تلقائيًا فور بدء استقبال الزيارات المؤهلة.</p></section></div>; }


function getWebsiteDomain(url) {
  try { return new URL(url).hostname; } catch { return url; }
}

const periodOptions = ["7 Days", "30 Days"];

function useWebsiteAnalytics(websiteId) {
  const [state, setState] = useState({ loading: false, data: null, error: "" });
  useEffect(() => {
    if (!websiteId) { setState({ loading: false, data: null, error: "" }); return; }
    let cancelled = false;
    setState({ loading: true, data: null, error: "" });
    api.getWebsiteAnalytics(websiteId)
      .then(result => { if (!cancelled) setState({ loading: false, data: result, error: "" }); })
      .catch(error => { if (!cancelled) setState({ loading: false, data: null, error: error.message }); });
    return () => { cancelled = true; };
  }, [websiteId]);
  return state;
}

function buildRealChartPath(series, key, maxValue) {
  const width = 720; const height = 142; const xOffset = 20; const yOffset = 20;
  const values = series.length ? series.map(point => Number(point[key]) || 0) : [0, 0];
  const points = values.length > 1 ? values : [values[0], values[0]];
  return points.map((value, index) => {
    const x = xOffset + (index / (points.length - 1)) * width;
    const y = yOffset + height - (value / maxValue) * height;
    return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
}

function formatAnalyticsNumber(value) { return Number(value || 0).toLocaleString("en-US"); }
function formatAnalyticsMoney(value) { return "$" + Number(value || 0).toFixed(2); }

function AnalyticsMetric({ label, value, icon }) {
  return <article className="metric-card analytics-metric"><div className="metric-top"><span className="metric-icon"><MiniIcon name={icon} size={16} /></span><span className="metric-label">{label}</span></div><strong className="metric-value">{value}</strong></article>;
}

function WebsitePerformanceCard({ website, onDetails }) {
  const impressions = website.impressions || 0; const clicks = website.clicks || 0;
  const ctr = impressions > 0 ? `${((clicks / impressions) * 100).toFixed(2)}%` : "--";
  const metrics = [["Impressions", formatAnalyticsNumber(impressions)], ["Clicks", formatAnalyticsNumber(clicks)], ["CTR", ctr]];
  return <article className="website-analytics-card"><div className="website-analytics-card-header"><div className="website-analytics-identity"><strong>{website.name}</strong><span>{getWebsiteDomain(website.url)}</span></div><span className={"status-badge " + (website.status === "Active" ? "ready" : "pending")}>{website.status}</span></div><div className="website-analytics-metrics">{metrics.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div><button className="secondary-button website-details-button" type="button" onClick={() => onDetails(website.id)}><MiniIcon name="eye" size={15} />View Details</button></article>;
}

function WebsiteAnalyticsDetail({ website, websites, onSelectWebsite, onBack }) {
  const { loading, data, error } = useWebsiteAnalytics(website.id);
  const series = data?.series || [];
  const hasActivity = series.some(point => point.impressions > 0 || point.clicks > 0);
  const maxImpressions = Math.max(1, ...series.map(point => point.impressions || 0)) * 1.12;
  const maxClicks = Math.max(1, ...series.map(point => point.clicks || 0)) * 1.12;
  const summary = data?.summary || { impressions: website.impressions || 0, clicks: website.clicks || 0, ctr: "--", earnings: 0 };
  return <section className="website-analytics-detail">
    <div className="detail-header"><button className="link-button" type="button" onClick={onBack}><MiniIcon name="arrow" size={15} />Back to Analytics</button><label className="field analytics-select"><span>Website</span><select className="input select" value={website.id} onChange={event => onSelectWebsite(event.target.value)}><option value="all">All Websites</option>{websites.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label></div>
    <section className="light-panel selected-website-summary"><div><span className="eyebrow">WEBSITE DETAILS</span><h2>{website.name}</h2><p>{getWebsiteDomain(website.url)} · <span className="status-text-active">{website.status}</span></p></div></section>
    <section className="analytics-metric-grid detail-metrics">{[["Impressions", formatAnalyticsNumber(summary.impressions), "eye"], ["Clicks", formatAnalyticsNumber(summary.clicks), "trend"], ["CTR", summary.ctr, "chart"], ["Earnings", formatAnalyticsMoney(summary.earnings), "wallet"]].map(([label, value, icon]) => <AnalyticsMetric key={label} label={label} value={value} icon={icon} />)}</section>
    <section className="light-panel publisher-performance-panel">
      <div className="panel-heading"><div><span className="eyebrow">LAST 30 DAYS</span><h2>{website.name} performance</h2></div></div>
      <div className="chart-legend"><span><i className="legend-impressions" />Impressions</span><span><i className="legend-clicks" />Clicks</span></div>
      {loading ? <p className="muted-copy">Loading analytics…</p> : error ? <p className="field-error">{error}</p> : !hasActivity ? <div className="chart-empty-state"><span className="chart-empty-icon"><MiniIcon name="trend" size={18} /></span><strong>No activity yet</strong><span>This chart fills in automatically once your Universal Code starts serving real traffic.</span></div> : <div className="publisher-chart website-detail-chart"><svg viewBox="0 0 760 190" role="img" aria-label={`${website.name} performance chart`} preserveAspectRatio="none"><path d="M20 162H740M20 115H740M20 68H740M20 20H740" className="chart-grid-line" /><path d={buildRealChartPath(series, "impressions", maxImpressions)} className="publisher-chart-line impressions-line" /><path d={buildRealChartPath(series, "clicks", maxClicks)} className="publisher-chart-line clicks-line" /></svg></div>}
    </section>
  </section>;
}

function PublisherAnalyticsPage({ data, finance, onNavigate, selectedWebsiteId = "" }) {
  const [selectedId, setSelectedId] = useState(selectedWebsiteId);
  const websites = data.websites || [];
  useEffect(() => { if (selectedWebsiteId) setSelectedId(selectedWebsiteId); }, [selectedWebsiteId]);
  const selectedWebsite = websites.find(website => website.id === selectedId);

  const totals = websites.reduce((acc, website) => ({ impressions: acc.impressions + (website.impressions || 0), clicks: acc.clicks + (website.clicks || 0) }), { impressions: 0, clicks: 0 });
  const ctr = totals.impressions > 0 ? `${((totals.clicks / totals.impressions) * 100).toFixed(2)}%` : "--";
  const summaryMetrics = [["Impressions", formatAnalyticsNumber(totals.impressions), "eye"], ["Clicks", formatAnalyticsNumber(totals.clicks), "trend"], ["CTR", ctr, "chart"], ["Earnings", formatAnalyticsMoney(finance?.earned), "wallet"]];

  if (selectedWebsite) return <div className="workspace-page publisher-analytics"><PageHeader eyebrow="PUBLISHER / ANALYTICS" title="Analytics" description="Track your websites, ad performance, and earnings." /><WebsiteAnalyticsDetail website={selectedWebsite} websites={websites} onSelectWebsite={id => id === "all" ? setSelectedId("") : setSelectedId(id)} onBack={() => setSelectedId("")} /></div>;

  return <div className="workspace-page publisher-analytics">
    <PageHeader eyebrow="PUBLISHER / ANALYTICS" title="Analytics" description="Track your websites, ad performance, and earnings." />
    <section className="analytics-metric-grid publisher-analytics-metrics">{summaryMetrics.map(([label, value, icon]) => <AnalyticsMetric key={label} label={label} value={value} icon={icon} />)}</section>
    <section className="light-panel earnings-summary-panel"><div className="panel-heading"><div><span className="eyebrow">OVERVIEW</span><h2>Overview</h2></div></div><div className="earnings-summary-grid"><div><span>Available Earnings</span><strong>{formatAnalyticsMoney(finance?.available)}</strong></div><div><span>Pending Earnings</span><strong>{formatAnalyticsMoney(finance?.pending)}</strong></div><div><span>Total Earned</span><strong>{formatAnalyticsMoney(finance?.earned)}</strong></div><div><span>Total Withdrawn</span><strong>{formatAnalyticsMoney(finance?.withdrawn)}</strong></div></div></section>
    <section className="light-panel website-performance-panel"><div className="panel-heading"><div><span className="eyebrow">PUBLISHER INVENTORY</span><h2>Websites Performance</h2></div><button className="text-button" type="button" onClick={() => onNavigate("websites")}>Manage websites <MiniIcon name="arrow" size={14} /></button></div>{!websites.length ? <EmptyState icon="globe" title="No websites yet" description="Add a website to start receiving AdZora ads and analytics." action="Add Website" onAction={() => onNavigate("websites")} /> : <div className="website-analytics-grid">{websites.map(website => <WebsitePerformanceCard website={website} key={website.id} onDetails={setSelectedId} />)}</div>}</section>
  </div>;
}

function PublisherTransactions({ withdrawals }) {
  return <div className="workspace-page"><PageHeader title="Publisher Transactions" description="سجل منفصل لأرباح الناشر والتعديلات والسحوبات، دون خلطه بإنفاق المعلن." /><section className="light-panel data-panel"><div className="panel-heading"><div><span className="eyebrow">TRANSACTION HISTORY</span><h2>{withdrawals.length} records</h2></div></div>{!withdrawals.length ? <EmptyState icon="code" title="No transactions yet" description="ستظهر Earnings وAdjustments وWithdrawals هنا عند وجود بيانات." /> : <div className="data-list">{withdrawals.map(item => <div className="data-row" key={item.id}><div className="row-main"><span className="row-icon"><MiniIcon name="trend" /></span><div><strong>Withdrawal · {"$"}{Number(item.amount).toFixed(2)}</strong><small>{new Date(item.created_at).toLocaleDateString("en-US")}</small></div></div><span className="status-badge pending">{item.status}</span></div>)}</div>}</section></div>;
}

export default function PublisherWorkspace({ page, data, onNavigate, selectedWebsiteId = "", finance = { available: 0, pending: 0, earned: 0, withdrawn: 0, minimum: 50 }, withdrawals = [], onCreateWebsite, onCreateWithdrawal }) {
  const content = useMemo(() => page, [page]);
  const selectedWebsite = data.websites?.find(website => website.id === selectedWebsiteId);
  return <div className="publisher-workspace">
    {content === "websites" && <WebsitesPage data={data} onNavigate={onNavigate} onDetails={id => onNavigate("website-details", id)} onCreateWebsite={onCreateWebsite} />}
    {content === "website-details" && <WebsiteDetailPage website={selectedWebsite} onBack={() => onNavigate("websites")} onAnalytics={id => onNavigate("analytics", id)} />}
    {content === "ad-codes" && <AdCodesPage data={data} onNavigate={onNavigate} />}
    {content === "earnings" && <EarningsPage finance={finance} onNavigate={onNavigate} />}
    {content === "withdrawals" && <WalletWorkspace mode="withdrawal" requests={withdrawals} available={finance.available} minimum={finance.minimum} onSubmit={onCreateWithdrawal} />}
    {content === "transactions" && <PublisherTransactions withdrawals={withdrawals} />}
    {content === "analytics" && <PublisherAnalyticsPage data={data} finance={finance} onNavigate={onNavigate} selectedWebsiteId={selectedWebsiteId} />}
  </div>;
}
