import { useMemo, useState } from "react";
import { AD_FORMATS, BANNER_SIZES, formatMoney } from "./config";

function Icon({ name, size = 17 }) {
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" };
  const paths = {
    plus: <><path d="M12 5v14M5 12h14" /></>,
    megaphone: <><path d="m3 11 18-5v12L3 14z" /><path d="M11 15v5M6 16l1.5 4" /></>,
    edit: <><path d="m4 16-.8 4.8L8 20l10.7-10.7a2.1 2.1 0 0 0-3-3zM14.5 7.5l2 2" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    arrow: <path d="m9 18 6-6-6-6" />,
    card: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h3" /></>,
    receipt: <><path d="M5 3h14v18l-3-2-4 2-4-2-3 2z" /><path d="M8 8h8M8 12h8M8 16h4" /></>,
    wallet: <><path d="M4 6h15a2 2 0 0 1 2 2v11H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14" /><path d="M16 13h5" /><circle cx="16" cy="13" r=".5" /></>,
  };
  return <svg {...props}>{paths[name] || paths.plus}</svg>;
}

function Field({ label, error, hint, children }) {
  return <label className="field"><span>{label}</span>{children}{hint && !error && <small>{hint}</small>}{error && <small className="field-error">{error}</small>}</label>;
}

function PageHeader({ title, description, action, onAction }) {
  return <div className="workspace-page-header"><div><span className="eyebrow">ADVERTISER WORKSPACE</span><h1>{title}</h1><p>{description}</p></div>{action && <button className="primary-button" type="button" onClick={onAction}><Icon name="plus" size={16} />{action}</button>}</div>;
}

function EmptyState({ title, description, action, onAction }) {
  return <section className="light-panel"><div className="empty-state"><span className="empty-state-icon"><Icon name="megaphone" size={25} /></span><h2>{title}</h2><p>{description}</p>{action && <button className="secondary-button" type="button" onClick={onAction}><Icon name="plus" size={16} />{action}</button>}</div></section>;
}

function FormatRequirements({ format, values, setValues, errors }) {
  const update = (key, value) => setValues(previous => ({ ...previous, [key]: value }));
  if (format === "banner") return <div className="form-grid"><Field label="Creative image" error={errors.image}><input className="input" value={values.image} onChange={event => update("image", event.target.value)} placeholder="creative-banner.jpg" /></Field><Field label="Banner size" error={errors.size}><select className="input select" value={values.size} onChange={event => update("size", event.target.value)}>{BANNER_SIZES.map(size => <option key={size}>{size}</option>)}</select></Field><Field label="Destination URL" error={errors.destination}><input className="input" value={values.destination} onChange={event => update("destination", event.target.value)} placeholder="https://example.com/offer" inputMode="url" /></Field><Field label="CTA"><input className="input" value={values.cta} onChange={event => update("cta", event.target.value)} placeholder="Learn more" /></Field></div>;
  if (format === "native" || format === "social") return <div className="form-grid"><Field label="Title" error={errors.title}><input className="input" value={values.title} onChange={event => update("title", event.target.value)} placeholder="A clear campaign headline" /></Field><Field label="Description"><input className="input" value={values.description} onChange={event => update("description", event.target.value)} placeholder="Short supporting copy" /></Field><Field label="Image / media" error={errors.media}><input className="input" value={values.media} onChange={event => update("media", event.target.value)} placeholder="creative-media.jpg" /></Field><Field label="CTA"><input className="input" value={values.cta} onChange={event => update("cta", event.target.value)} placeholder="Discover" /></Field><Field label="Destination URL" error={errors.destination}><input className="input" value={values.destination} onChange={event => update("destination", event.target.value)} placeholder="https://example.com" inputMode="url" /></Field></div>;
  if (format === "popup") return <div className="form-grid"><Field label="Creative content" error={errors.content}><textarea className="input textarea" value={values.content} onChange={event => update("content", event.target.value)} placeholder="Popup message or offer" /></Field><Field label="Destination URL" error={errors.destination}><input className="input" value={values.destination} onChange={event => update("destination", event.target.value)} placeholder="https://example.com" inputMode="url" /></Field><Field label="Popup presentation"><select className="input select" value={values.presentation} onChange={event => update("presentation", event.target.value)}><option>Centered modal</option><option>Corner notification</option><option>Full-screen takeover</option></select></Field></div>;
  if (format === "video") return <div className="form-grid"><Field label="Video file / placeholder" error={errors.video}><input className="input" value={values.video} onChange={event => update("video", event.target.value)} placeholder="campaign-video.mp4" /></Field><Field label="Thumbnail"><input className="input" value={values.thumbnail} onChange={event => update("thumbnail", event.target.value)} placeholder="thumbnail.jpg" /></Field><Field label="Destination URL" error={errors.destination}><input className="input" value={values.destination} onChange={event => update("destination", event.target.value)} placeholder="https://example.com" inputMode="url" /></Field><Field label="CTA"><input className="input" value={values.cta} onChange={event => update("cta", event.target.value)} placeholder="Watch now" /></Field></div>;
  return <div className="form-grid"><Field label="Link title / label" error={errors.title}><input className="input" value={values.title} onChange={event => update("title", event.target.value)} placeholder="Visit our website" /></Field><Field label="Destination URL" error={errors.destination}><input className="input" value={values.destination} onChange={event => update("destination", event.target.value)} placeholder="https://example.com" inputMode="url" /></Field></div>;
}

function CampaignPreview({ format, values }) {
  const title = values.title || "Your campaign headline";
  if (format === "banner") return <div className="creative-format-preview banner-preview"><span>{values.image || "Banner creative"}</span><b>{values.cta || "Learn more"}</b></div>;
  if (format === "video") return <div className="creative-format-preview video-preview"><span>▶</span><small>{values.video || "Video player placeholder"}</small></div>;
  if (format === "popup") return <div className="creative-format-preview popup-preview"><strong>{values.content || "Popup offer content"}</strong><small>{values.presentation}</small></div>;
  if (format === "direct-link") return <div className="creative-format-preview link-preview"><strong>{values.title || "Sponsored link"}</strong><span>{values.destination || "https://example.com"}</span></div>;
  return <div className={"creative-format-preview " + format + "-preview"}><span className="preview-media">{values.media || "Media placeholder"}</span><strong>{title}</strong><small>{values.description || "Supporting campaign description"}</small><b>{values.cta || "Discover"}</b></div>;
}

const initialCreative = { image: "", media: "", title: "", description: "", cta: "", destination: "", size: BANNER_SIZES[1], content: "", presentation: "Centered modal", video: "", thumbnail: "" };

function CreateCampaign({ data, setData, onNavigate }) {
  const [form, setForm] = useState({ name: "", format: "banner", budget: "", ...initialCreative });
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState("");
  const format = form.format;
  const update = (key, value) => { setForm(previous => ({ ...previous, [key]: value })); setErrors(previous => ({ ...previous, [key]: "" })); };
  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Enter a campaign name.";
    if (!form.budget || Number(form.budget) <= 0) next.budget = "Enter a budget greater than zero.";
    if (format === "banner" && !form.image.trim()) next.image = "Add an image placeholder or file name.";
    if ((format === "native" || format === "social") && !form.title.trim()) next.title = "Add a title for this creative.";
    if ((format === "native" || format === "social") && !form.media.trim()) next.media = "Add the required image or media.";
    if (format === "popup" && !form.content.trim()) next.content = "Add the popup content.";
    if (format === "video" && !form.video.trim()) next.video = "Add a video placeholder or file name.";
    if (format === "direct-link" && !form.title.trim()) next.title = "Add a link label.";
    try { if (!form.destination || new URL(form.destination).protocol !== "https:") next.destination = "Use a valid HTTPS destination URL."; } catch { next.destination = "Use a valid HTTPS destination URL."; }
    return next;
  };
  const submit = () => {
    const next = validate(); setErrors(next);
    if (Object.keys(next).length) return;
    const campaign = { id: "campaign-" + Date.now(), name: form.name.trim(), format, budget: Number(form.budget), spend: 0, status: "Draft", createdAt: new Date().toLocaleDateString("en-US"), details: { ...form } };
    setData(previous => [...previous, campaign]); setNotice("Campaign saved as Draft. Delivery is not connected in this frontend demo.");
    setForm({ name: "", format: "banner", budget: "", ...initialCreative }); setErrors({});
  };
  return <div className="workspace-page"><PageHeader title="Create Campaign" description="أنشئ حملة ثم أضف المتطلبات المناسبة لصيغة الإعلان. هذه تجربة واجهة فقط ولا تطلق حملة حقيقية." /><div className="step-layout"><section className="form-panel light-panel"><div className="panel-heading"><div><span className="eyebrow">CAMPAIGN SETUP</span><h2>Campaign details</h2></div><span className="phase-chip">Frontend demo</span></div><div className="form-grid"><Field label="Campaign name" error={errors.name}><input className="input" value={form.name} onChange={event => update("name", event.target.value)} placeholder="Summer acquisition" /></Field><Field label="Ad format"><select className="input select" value={format} onChange={event => update("format", event.target.value)}>{AD_FORMATS.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field><Field label="Campaign budget" hint="Display value only" error={errors.budget}><input className="input" type="number" min="1" value={form.budget} onChange={event => update("budget", event.target.value)} placeholder="1000" /></Field></div><div className="subsection-heading"><span className="eyebrow">FORMAT REQUIREMENTS</span><h2>{AD_FORMATS.find(item => item.id === format)?.name}</h2></div><FormatRequirements format={format} values={form} setValues={setForm} errors={errors} /><div className="form-actions"><button className="primary-button" type="button" onClick={submit}><Icon name="check" size={16} />Save campaign draft</button><button className="ghost-button" type="button" onClick={() => onNavigate("campaigns")}>Cancel</button></div>{notice && <div className="notice" role="status">{notice}</div>}</section><aside className="light-panel preview-panel"><span className="eyebrow">CREATIVE PREVIEW</span><h2>Format-aware preview</h2><CampaignPreview format={format} values={form} /><p>المعاينة بصرية فقط. لا يوجد ad serving أو tracking حقيقي.</p></aside></div></div>;
}

function CampaignsPage({ data, onNavigate }) {
  if (!data.length) return <div className="workspace-page"><PageHeader title="Campaigns" description="راجع مسودات الحملات وميزانيتها وحالتها." action="Create Campaign" onAction={() => onNavigate("create-campaign")} /><EmptyState title="No campaigns yet" description="ابدأ بحملة جديدة، ثم راجع متطلبات الـcreative قبل أي ربط إنتاجي." action="Create Campaign" onAction={() => onNavigate("create-campaign")} /></div>;
  return <div className="workspace-page"><PageHeader title="Campaigns" description="كل الحملات هنا تخص ميزانية المعلن، وليست أرباح الناشر." action="Create Campaign" onAction={() => onNavigate("create-campaign")} /><section className="light-panel data-panel"><div className="panel-heading"><div><span className="eyebrow">CAMPAIGN INVENTORY</span><h2>{data.length} campaign{data.length === 1 ? "" : "s"}</h2></div><span className="result-count">Demo state</span></div><div className="data-list">{data.map(campaign => <div className="data-row campaign-row" key={campaign.id}><div className="row-main"><span className="row-icon"><Icon name="megaphone" /></span><div><strong>{campaign.name}</strong><small>{campaign.format} · {campaign.createdAt}</small></div></div><div className="row-detail"><span className="row-label">Budget</span><strong>{formatMoney(campaign.budget)}</strong></div><div className="row-detail"><span className="row-label">Spend</span><strong>{formatMoney(campaign.spend)}</strong></div><span className="status-badge draft">{campaign.status}</span><button className="row-action" type="button" onClick={() => onNavigate("create-campaign")}><Icon name="edit" size={14} />Edit draft</button></div>)}</div></section></div>;
}

function FinancialPage({ kind }) {
  const advertiser = kind !== "transactions";
  const metrics = advertiser ? [["Available Balance", "$0.00"], ["Reserved Balance", "$0.00"], ["Total Spent", "$0.00"], ["Total Deposited", "$0.00"]] : [["Available Earnings", "$0.00"], ["Pending Earnings", "$0.00"], ["Total Earned", "$0.00"], ["Withdrawn", "$0.00"]];
  const rows = advertiser ? ["Deposits", "Campaign spend", "Refund / credit"] : ["Earnings", "Adjustments", "Withdrawals"];
  return <div className="workspace-page"><PageHeader title={advertiser ? (kind === "balance" ? "Balance" : kind === "deposits" ? "Deposit funds" : "Billing & Transactions") : "Publisher transactions"} description={advertiser ? "الأرقام المعروضة تجريبية فقط. لا توجد معالجة دفع أو محاسبة حقيقية." : "سجل منفصل لأرباح الناشر والتعديلات والسحوبات."} />{kind === "deposits" && <section className="form-panel light-panel"><div className="form-grid"><Field label="Deposit amount"><input className="input" type="number" min="1" placeholder="500" /></Field><Field label="Payment method"><select className="input select"><option>Demo card placeholder</option><option>Manual review</option></select></Field></div><div className="notice" role="status">Deposit UI only — payment processing is intentionally out of scope.</div><button className="primary-button" type="button">Continue demo deposit</button></section>}<section className="metric-grid financial-metrics">{metrics.map(([label, value]) => <article className="metric-card" key={label}><span className="metric-label">{label}</span><strong className="metric-value">{value}</strong><span className="metric-hint">Demo display value</span></article>)}</section>{kind !== "balance" && kind !== "deposits" && <section className="light-panel data-panel transaction-panel"><div className="panel-heading"><div><span className="eyebrow">HISTORY</span><h2>{advertiser ? "Advertiser billing history" : "Publisher transaction history"}</h2></div><span className="result-count">0 records</span></div><div className="empty-state compact-empty"><Icon name="receipt" size={25} /><h2>No transactions yet</h2><p>ستظهر {advertiser ? "الإيداعات ومصروفات الحملات" : "الأرباح والتعديلات والسحوبات"} هنا مع بقاء كل مساحة مالية منفصلة.</p></div><div className="transaction-types">{rows.map(row => <span className="format-chip" key={row}>{row}<small>0 records</small></span>)}</div></section>}</div>;
}

export default function AdvertiserWorkspace({ page, data, setData, onNavigate }) {
  const content = useMemo(() => page, [page]);
  if (content === "campaigns") return <CampaignsPage data={data} onNavigate={onNavigate} />;
  if (content === "create-campaign") return <CreateCampaign data={data} setData={setData} onNavigate={onNavigate} />;
  if (["balance", "deposits", "billing", "transactions"].includes(content)) return <FinancialPage kind={content} />;
  return <div className="workspace-page"><PageHeader title={content === "reports" ? "Reports" : "Analytics"} description="هذه الشاشة ستتصل ببيانات الأداء بعد إضافة مصدر بيانات حقيقي." /><EmptyState title="No data yet" description="لا توجد بيانات أداء في وضع الواجهة التجريبي. أنشئ حملة أولًا لتجهيز نقطة الربط التالية." action="Create Campaign" onAction={() => onNavigate("create-campaign")} /></div>;
}