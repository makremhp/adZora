import { useState } from "react";
import { AD_FORMATS, BANNER_SIZES } from "./config";

function MiniIcon({ name, size = 17 }) {
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" };
  const paths = {
    plus: <><path d="M12 5v14M5 12h14" /></>,
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18" /></>,
    layout: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M9 9v11" /></>,
    code: <><path d="m8 9-4 3 4 3M16 9l4 3-4 3M14 5l-4 14" /></>,
    edit: <><path d="m4 16-.8 4.8L8 20l10.7-10.7a2.1 2.1 0 0 0-3-3zM14.5 7.5l2 2" /></>,
    copy: <><rect x="8" y="8" width="11" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h2" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    pause: <><path d="M8 5v14M16 5v14" /></>,
    play: <path d="m8 5 11 7-11 7z" />,
    arrow: <path d="m9 18 6-6-6-6" />,
    external: <><path d="M14 5h5v5M19 5l-8 8" /><path d="M19 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4" /></>,
  };
  return <svg {...props}>{paths[name] || paths.plus}</svg>;
}

const inputDefaults = { name: "", url: "", category: "" };
const zoneDefaults = { name: "", websiteId: "", type: "banner", size: BANNER_SIZES[1] };

function PageHeader({ eyebrow, title, description, actionLabel, onAction, icon = "plus" }) {
  return <div className="workspace-page-header"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{actionLabel && <button className="primary-button" type="button" onClick={onAction}><MiniIcon name={icon} size={17} />{actionLabel}</button>}</div>;
}

function EmptyState({ icon, title, description, actionLabel, onAction }) {
  return <div className="empty-state"><span className="empty-state-icon"><MiniIcon name={icon} size={25} /></span><h2>{title}</h2><p>{description}</p>{actionLabel && <button className="secondary-button" type="button" onClick={onAction}><MiniIcon name="plus" size={16} />{actionLabel}</button>}</div>;
}

function Field({ label, hint, error, children }) {
  return <label className="field"><span>{label}</span>{children}{hint && !error && <small>{hint}</small>}{error && <small className="field-error">{error}</small>}</label>;
}

function WebsiteForm({ form, setForm, errors, onCancel, onSubmit }) {
  return <section className="form-panel light-panel"><div className="panel-heading"><div><span className="eyebrow">NEW INVENTORY SOURCE</span><h2>Add website</h2></div><button className="link-button" type="button" onClick={onCancel}>Cancel</button></div><div className="form-grid"><Field label="Website name" hint="A recognizable name for your team" error={errors.name}><input className="input" value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} placeholder="My news website" /></Field><Field label="Website URL" hint="Use an HTTPS address" error={errors.url}><input className="input" value={form.url} onChange={event => setForm({ ...form, url: event.target.value })} placeholder="https://example.com" inputMode="url" /></Field><Field label="Category" hint="Helps match relevant campaigns" error={errors.category}><select className="input select" value={form.category} onChange={event => setForm({ ...form, category: event.target.value })}><option value="">Select a category</option><option>News & Media</option><option>Technology</option><option>Entertainment</option><option>Business</option><option>Sports</option></select></Field></div><div className="form-actions"><button className="primary-button" type="button" onClick={onSubmit}><MiniIcon name="check" size={16} />Add website</button><button className="ghost-button" type="button" onClick={onCancel}>Cancel</button></div></section>;
}

function WebsitesPage({ data, setData, onNavigate, setNotice }) {
  const [showForm, setShowForm] = useState(data.websites.length === 0);
  const [form, setForm] = useState(inputDefaults);
  const [errors, setErrors] = useState({});
  const addWebsite = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Enter a website name.";
    if (!form.category) nextErrors.category = "Choose a category.";
    try { const parsed = new URL(form.url); if (parsed.protocol !== "https:") nextErrors.url = "Use a valid HTTPS URL."; } catch { nextErrors.url = "Enter a valid URL beginning with https://."; }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    const website = { id: "website-" + Date.now(), name: form.name.trim(), url: form.url.trim(), category: form.category, status: "Pending", zones: 0, impressions: 0, clicks: 0, revenue: "$0.00" };
    setData(previous => ({ ...previous, websites: [...previous.websites, website] }));
    setForm(inputDefaults); setErrors({}); setShowForm(false); setNotice("Website added. It is now pending review before ad zones go live.");
  };
  return <div className="workspace-page"><PageHeader eyebrow="PUBLISHER / INVENTORY" title="My Websites" description="أضف مصادر مخزونك الإعلاني، ثم اربط كل موقع بالمناطق الإعلانية المناسبة." actionLabel="Add Website" onAction={() => setShowForm(true)} />{showForm && <WebsiteForm form={form} setForm={setForm} errors={errors} onCancel={() => { setShowForm(false); setErrors({}); }} onSubmit={addWebsite} />}{!data.websites.length && !showForm ? <section className="light-panel"><EmptyState icon="globe" title="No websites yet" description="أضف أول موقع حتى تتمكن من إنشاء Ad Zone والحصول على Ad Code." actionLabel="Add Website" onAction={() => setShowForm(true)} /></section> : data.websites.length > 0 && <section className="light-panel data-panel"><div className="panel-heading"><div><span className="eyebrow">INVENTORY SOURCES</span><h2>{data.websites.length} website{data.websites.length === 1 ? "" : "s"}</h2></div><span className="result-count">{data.websites.length} result{data.websites.length === 1 ? "" : "s"}</span></div><div className="data-list">{data.websites.map(website => <div className="data-row" key={website.id}><div className="row-main"><span className="row-icon"><MiniIcon name="globe" /></span><div><strong>{website.name}</strong><small>{website.url}</small></div></div><div className="row-detail"><span className="row-label">Category</span><strong>{website.category}</strong></div><div className="row-detail"><span className="row-label">Ad zones</span><strong>{website.zones}</strong></div><span className="status-badge pending">{website.status}</span><button className="row-action" type="button" onClick={() => onNavigate("ad-zones")}><span>Manage zones</span><MiniIcon name="arrow" size={15} /></button></div>)}</div></section>}</div>;
}

function ZoneForm({ form, setForm, websites, errors, onCancel, onSubmit }) {
  return <section className="form-panel light-panel"><div className="panel-heading"><div><span className="eyebrow">INVENTORY PLACEMENT</span><h2>Create ad zone</h2></div><button className="link-button" type="button" onClick={onCancel}>Cancel</button></div><div className="form-grid"><Field label="Zone name" hint="Make its placement obvious" error={errors.name}><input className="input" value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} placeholder="Homepage rectangle" /></Field><Field label="Website" error={errors.websiteId}><select className="input select" value={form.websiteId} onChange={event => setForm({ ...form, websiteId: event.target.value })}><option value="">Select a website</option>{websites.map(website => <option key={website.id} value={website.id}>{website.name}</option>)}</select></Field><Field label="Ad format"><select className="input select" value={form.type} onChange={event => setForm({ ...form, type: event.target.value })}>{AD_FORMATS.map(format => <option key={format.id} value={format.id}>{format.name}</option>)}</select></Field><Field label="Placement size" hint="More sizes can be added later"><select className="input select" value={form.size} onChange={event => setForm({ ...form, size: event.target.value })}>{BANNER_SIZES.map(size => <option key={size}>{size}</option>)}</select></Field></div><div className="form-actions"><button className="primary-button" type="button" onClick={onSubmit}><MiniIcon name="check" size={16} />Create ad zone</button><button className="ghost-button" type="button" onClick={onCancel}>Cancel</button></div></section>;
}

function AdZonesPage({ data, setData, onNavigate, setNotice }) {
  const [showForm, setShowForm] = useState(data.zones.length === 0 && data.websites.length > 0);
  const [form, setForm] = useState({ ...zoneDefaults, websiteId: data.websites[0]?.id || "" });
  const [errors, setErrors] = useState({});
  const addZone = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Enter a zone name.";
    if (!form.websiteId) nextErrors.websiteId = "Select a website.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    const zone = { id: "zone-" + Date.now(), name: form.name.trim(), websiteId: form.websiteId, type: form.type, size: form.size, status: "Draft", impressions: 0, clicks: 0, revenue: "$0.00" };
    setData(previous => ({ ...previous, zones: [...previous.zones, zone], websites: previous.websites.map(website => website.id === form.websiteId ? { ...website, zones: website.zones + 1 } : website) }));
    setForm({ ...zoneDefaults, websiteId: form.websiteId }); setErrors({}); setShowForm(false); setNotice("Ad zone created as Draft. Review it before requesting an ad code.");
  };
  if (!data.websites.length) return <div className="workspace-page"><PageHeader eyebrow="PUBLISHER / INVENTORY" title="Ad Zones" description="كل Ad Zone يمثل مكانًا محددًا يمكن أن تظهر فيه إعلانات AdZora." /><section className="light-panel"><EmptyState icon="layout" title="Add a website first" description="لا يمكن إنشاء منطقة إعلانية بدون ربطها بموقع واضح." actionLabel="Add Website" onAction={() => onNavigate("websites")} /></section></div>;
  return <div className="workspace-page"><PageHeader eyebrow="PUBLISHER / INVENTORY" title="Ad Zones" description="أنشئ وحدد أماكن الإعلانات داخل مواقعك، ثم اطلب الكود المناسب لكل Zone." actionLabel="Create Ad Zone" onAction={() => setShowForm(true)} />{showForm && <ZoneForm form={form} setForm={setForm} websites={data.websites} errors={errors} onCancel={() => { setShowForm(false); setErrors({}); }} onSubmit={addZone} />}{!data.zones.length && !showForm ? <section className="light-panel"><EmptyState icon="layout" title="No ad zones yet" description="أنشئ أول منطقة إعلانية ليصبح لديك Inventory قابل للربط." actionLabel="Create Ad Zone" onAction={() => setShowForm(true)} /></section> : data.zones.length > 0 && <section className="light-panel data-panel"><div className="panel-heading"><div><span className="eyebrow">PLACEMENTS</span><h2>{data.zones.length} ad zone{data.zones.length === 1 ? "" : "s"}</h2></div><span className="result-count">Website → Zone</span></div><div className="data-list">{data.zones.map(zone => { const website = data.websites.find(item => item.id === zone.websiteId); return <div className="data-row" key={zone.id}><div className="row-main"><span className="row-icon"><MiniIcon name="layout" /></span><div><strong>{zone.name}</strong><small>{website?.name || "Unknown website"} · {zone.size}</small></div></div><div className="row-detail"><span className="row-label">Format</span><strong>{AD_FORMATS.find(format => format.id === zone.type)?.name || zone.type}</strong></div><div className="row-detail"><span className="row-label">Revenue</span><strong>{zone.revenue}</strong></div><span className={zone.status === "Active" ? "status-badge active" : "status-badge draft"}>{zone.status}</span><div className="row-actions"><button className="row-action compact" type="button" onClick={() => setData(previous => ({ ...previous, zones: previous.zones.map(item => item.id === zone.id ? { ...item, status: item.status === "Active" ? "Paused" : "Active" } : item) }))}><MiniIcon name={zone.status === "Active" ? "pause" : "play"} size={14} />{zone.status === "Active" ? "Pause" : "Activate"}</button><button className="row-action compact" type="button" onClick={() => onNavigate("ad-codes")}><MiniIcon name="code" size={14} />Get code</button></div></div>; })}</div></section>}</div>;
}

function AdCodesPage({ data, onNavigate, setNotice }) {
  const [copiedId, setCopiedId] = useState("");
  const copyCode = async (zone) => {
    const code = "<!-- AdZora placeholder for " + zone.name + " -->\n<script data-adzora-zone=\"" + zone.id + "\" async></script>";
    try { await navigator.clipboard.writeText(code); setCopiedId(zone.id); setNotice("Placeholder code copied. It is not production serving code yet."); setTimeout(() => setCopiedId(""), 1800); } catch { setNotice("Copy is unavailable in this browser. Select the code manually."); }
  };
  return <div className="workspace-page"><PageHeader eyebrow="PUBLISHER / INVENTORY" title="Ad Codes" description="العلاقة واضحة: Website → Ad Zone → Ad Code → Advertising inventory." />{!data.zones.length ? <section className="light-panel"><EmptyState icon="code" title="No ad codes yet" description="أنشئ Ad Zone أولًا، ثم سيظهر هنا الكود المرتبط به." actionLabel="Create Ad Zone" onAction={() => onNavigate("ad-zones")} /></section> : <div className="code-list">{data.zones.map(zone => { const website = data.websites.find(item => item.id === zone.websiteId); return <section className="light-panel code-card" key={zone.id}><div className="code-card-heading"><div className="row-main"><span className="row-icon"><MiniIcon name="code" /></span><div><strong>{zone.name}</strong><small>{website?.name || "Unknown website"} · {zone.size}</small></div></div><span className={zone.status === "Active" ? "status-badge active" : "status-badge draft"}>{zone.status}</span></div><div className="code-note"><strong>Placeholder state</strong><span>Serving code will be connected when the delivery API is implemented. Do not install this snippet in production yet.</span></div><pre className="code-box"><code>{"<!-- AdZora placeholder for " + zone.name + " -->" + String.fromCharCode(10) + '<script data-adzora-zone="' + zone.id + '" async></script>'}</code></pre><div className="code-actions"><button className="primary-button" type="button" onClick={() => copyCode(zone)}><MiniIcon name={copiedId === zone.id ? "check" : "copy"} size={16} />{copiedId === zone.id ? "Copied" : "Copy placeholder"}</button><button className="ghost-button" type="button" onClick={() => onNavigate("ad-zones")}><MiniIcon name="edit" size={16} />Manage zone</button></div></section>; })}</div>}</div>;
}

export default function PublisherWorkspace({ page, data, setData, onNavigate }) {
  const [notice, setNotice] = useState("");
  return <div className="publisher-workspace">{notice && <div className="notice" role="status"><span>{notice}</span><button type="button" onClick={() => setNotice("")}>×</button></div>}{page === "websites" && <WebsitesPage data={data} setData={setData} onNavigate={onNavigate} setNotice={setNotice} />}{page === "ad-zones" && <AdZonesPage data={data} setData={setData} onNavigate={onNavigate} setNotice={setNotice} />}{page === "ad-codes" && <AdCodesPage data={data} onNavigate={onNavigate} setNotice={setNotice} />}</div>;
}
