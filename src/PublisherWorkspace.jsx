import { useMemo, useState } from "react";
import { AD_FORMATS, AD_ZONE_REQUIREMENTS, BANNER_SIZES, WEBSITE_TYPES } from "./config";

function MiniIcon({ name, size = 17 }) {
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" };
  const paths = {
    plus: <><path d="M12 5v14M5 12h14" /></>,
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18" /></>,
    layout: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M9 9v11" /></>,
    code: <><path d="m8 9-4 3 4 3M16 9l4 3-4 3M14 5l-4 14" /></>,
    image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9" r="1.5" /><path d="m21 15-5-5L5 20" /></>,
    chart: <><path d="M4 19V5M4 19h17" /><path d="m7 15 3-4 3 2 5-7" /></>,
    edit: <><path d="m4 16-.8 4.8L8 20l10.7-10.7a2.1 2.1 0 0 0-3-3zM14.5 7.5l2 2" /></>,
    copy: <><rect x="8" y="8" width="11" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h2" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    pause: <><path d="M8 5v14M16 5v14" /></>,
    play: <path d="m8 5 11 7-11 7z" />,
    arrow: <path d="m9 18 6-6-6-6" />,
    eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></>,
    wallet: <><path d="M4 6h15a2 2 0 0 1 2 2v11H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14" /><path d="M16 13h5" /><circle cx="16" cy="13" r=".5" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    trend: <><path d="M3 17 9 11l4 4 8-9" /><path d="M16 6h5v5" /></>,
  };
  return <svg {...props}>{paths[name] || paths.plus}</svg>;
}

function PageHeader({ title, description, action, onAction, icon = "plus" }) {
  return <div className="workspace-page-header"><div><span className="eyebrow">PUBLISHER / INVENTORY</span><h1>{title}</h1><p>{description}</p></div>{action && <button className="primary-button" type="button" onClick={onAction}><MiniIcon name={icon} size={17} />{action}</button>}</div>;
}

function EmptyState({ icon, title, description, action, onAction }) {
  return <div className="empty-state"><span className="empty-state-icon"><MiniIcon name={icon} size={25} /></span><h2>{title}</h2><p>{description}</p>{action && <button className="secondary-button" type="button" onClick={onAction}><MiniIcon name="plus" size={16} />{action}</button>}</div>;
}

function Field({ label, hint, error, children }) {
  return <label className="field"><span>{label}</span>{children}{hint && !error && <small>{hint}</small>}{error && <small className="field-error">{error}</small>}</label>;
}

const websiteDefaults = { name: "", url: "", category: "", description: "", status: "Pending" };
const zoneDefaults = { name: "", websiteId: "", format: "banner", size: BANNER_SIZES[1], description: "", status: "Draft", placement: "", title: "", imageRequired: "No", cta: "", popupType: "Centered", trigger: "On page load", frequency: "Once per session", aspect: "16:9", autoplay: "No", muted: "Yes", skip: "After 5 seconds", destination: "" };

function WebsiteForm({ form, setForm, errors, onCancel, onSubmit }) {
  const update = (key, value) => setForm(previous => ({ ...previous, [key]: value }));
  return <section className="form-panel light-panel"><div className="panel-heading"><div><span className="eyebrow">NEW INVENTORY SOURCE</span><h2>Add website</h2></div><button className="link-button" type="button" onClick={onCancel}>Cancel</button></div><div className="form-grid"><Field label="Website name" hint="A recognizable name for your team" error={errors.name}><input className="input" value={form.name} onChange={event => update("name", event.target.value)} placeholder="My news website" /></Field><Field label="Website URL" hint="Use an HTTPS address" error={errors.url}><input className="input" value={form.url} onChange={event => update("url", event.target.value)} placeholder="https://example.com" inputMode="url" /></Field><Field label="Website type" hint="Choose the audience category" error={errors.category}><div className="choice-grid website-type-choice">{WEBSITE_TYPES.map(type => <button className={form.category === type.label ? "choice-card selected" : "choice-card"} type="button" key={type.id} onClick={() => update("category", type.label)}><strong>{type.arabic}</strong><small>{type.description}</small><span className="selection-check"><MiniIcon name="check" size={14} /></span></button>)}</div></Field><Field label="Website description"><textarea className="input textarea" value={form.description} onChange={event => update("description", event.target.value)} placeholder="What kind of audience visits this site?" /></Field><Field label="Demo status"><select className="input select" value={form.status} onChange={event => update("status", event.target.value)}><option>Pending</option><option>Approved</option><option>Available</option></select></Field></div><div className="form-actions"><button className="primary-button" type="button" onClick={onSubmit}><MiniIcon name="check" size={16} />Add website</button><button className="ghost-button" type="button" onClick={onCancel}>Cancel</button></div></section>;
}

function WebsitesPage({ data, setData, onNavigate, setNotice }) {
  const [showForm, setShowForm] = useState(data.websites.length === 0);
  const [form, setForm] = useState(websiteDefaults);
  const [errors, setErrors] = useState({});
  const addWebsite = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Enter a website name.";
    if (!form.category) next.category = "Choose a category.";
    try { if (new URL(form.url).protocol !== "https:") next.url = "Use a valid HTTPS URL."; } catch { next.url = "Enter a valid URL beginning with https://."; }
    setErrors(next); if (Object.keys(next).length) return;
    const website = { ...form, id: "website-" + Date.now(), name: form.name.trim(), url: form.url.trim(), zones: 0, impressions: 0, clicks: 0, revenue: "$0.00" };
    setData(previous => ({ ...previous, websites: [...previous.websites, website] }));
    setForm(websiteDefaults); setErrors({}); setShowForm(false); setNotice("Website added. It is now ready for the next Ad Zone step.");
  };
  return <div className="workspace-page"><PageHeader title="My Websites" description="أضف مصادر مخزونك الإعلاني، ثم اربط كل موقع بالمناطق الإعلانية المناسبة." action="Add Website" onAction={() => setShowForm(true)} />{showForm && <WebsiteForm form={form} setForm={setForm} errors={errors} onCancel={() => { setShowForm(false); setErrors({}); }} onSubmit={addWebsite} />}{!data.websites.length && !showForm ? <section className="light-panel"><EmptyState icon="globe" title="No websites yet" description="أضف أول موقع حتى تتمكن من إنشاء Ad Zone والحصول على Ad Code." action="Add Website" onAction={() => setShowForm(true)} /></section> : data.websites.length > 0 && <section className="light-panel data-panel"><div className="panel-heading"><div><span className="eyebrow">INVENTORY SOURCES</span><h2>{data.websites.length} website{data.websites.length === 1 ? "" : "s"}</h2></div><span className="result-count">{data.websites.length} result{data.websites.length === 1 ? "" : "s"}</span></div><div className="data-list">{data.websites.map(website => <div className="data-row" key={website.id}><div className="row-main"><span className="row-icon"><MiniIcon name="globe" /></span><div><strong>{website.name}</strong><small>{website.url}</small></div></div><div className="row-detail"><span className="row-label">Category</span><strong>{website.category}</strong></div><div className="row-detail"><span className="row-label">Ad zones</span><strong>{website.zones}</strong></div><span className="status-badge pending">{website.status}</span><button className="row-action" type="button" onClick={() => onNavigate("ad-zones")}><span>Manage zones</span><MiniIcon name="arrow" size={15} /></button></div>)}</div></section>}</div>;
}

function ZonePreview({ form }) {
  const format = form.format;
  if (format === "banner") return <div className="zone-preview banner-zone-preview" style={{ aspectRatio: form.size === "728×90" || form.size === "970×250" ? "4 / 1" : "3 / 2" }}><span>Banner placement</span><b>{form.size}</b></div>;
  if (format === "native") return <div className="zone-preview native-zone-preview"><span className="preview-media">Image</span><strong>{form.title || "Native content title"}</strong><small>{form.placement || "In-feed placement"}</small><b>{form.cta || "Read more"}</b></div>;
  if (format === "social") return <div className="zone-preview social-zone-preview"><span className="preview-media">Social media</span><strong>{form.title || "Social ad title"}</strong><small>{form.placement || "Social-style placement"}</small><b>{form.cta || "Learn more"}</b></div>;
  if (format === "popup") return <div className="zone-preview popup-zone-preview"><strong>Popup preview</strong><small>{form.popupType} · {form.trigger}</small><b>{form.frequency}</b></div>;
  if (format === "video") return <div className="zone-preview video-zone-preview"><span>▶</span><strong>Video player</strong><small>{form.aspect} · {form.muted === "Yes" ? "Muted" : "Sound on"}</small></div>;
  return <div className="zone-preview direct-zone-preview"><strong>Direct Link</strong><small>{form.destination || "Destination / redirect behavior"}</small><b>Visit destination</b></div>;
}

function DynamicZoneFields({ form, setForm, errors }) {
  const update = (key, value) => setForm(previous => ({ ...previous, [key]: value }));
  if (form.format === "banner") return <Field label="Banner size" error={errors.size}><select className="input select" value={form.size} onChange={event => update("size", event.target.value)}>{BANNER_SIZES.map(size => <option key={size}>{size}</option>)}</select></Field>;
  if (form.format === "native") return <><Field label="Placement style" error={errors.placement}><select className="input select" value={form.placement} onChange={event => update("placement", event.target.value)}><option value="">Select placement</option><option>In-feed card</option><option>Article recommendation</option><option>Sidebar module</option></select></Field><Field label="Title / content expectation"><input className="input" value={form.title} onChange={event => update("title", event.target.value)} placeholder="Native title area" /></Field><Field label="Image required"><select className="input select" value={form.imageRequired} onChange={event => update("imageRequired", event.target.value)}><option>Yes</option><option>No</option></select></Field><Field label="CTA requirement"><input className="input" value={form.cta} onChange={event => update("cta", event.target.value)} placeholder="Read more" /></Field></>;
  if (form.format === "social") return <><Field label="Social placement" error={errors.placement}><select className="input select" value={form.placement} onChange={event => update("placement", event.target.value)}><option value="">Select placement</option><option>Feed post</option><option>Story-style</option><option>Community module</option></select></Field><Field label="Title / content"><input className="input" value={form.title} onChange={event => update("title", event.target.value)} placeholder="Social title area" /></Field><Field label="Media requirement"><select className="input select" value={form.imageRequired} onChange={event => update("imageRequired", event.target.value)}><option>Required</option><option>Optional</option></select></Field><Field label="CTA"><input className="input" value={form.cta} onChange={event => update("cta", event.target.value)} placeholder="Discover" /></Field></>;
  if (form.format === "popup") return <><Field label="Popup type"><select className="input select" value={form.popupType} onChange={event => update("popupType", event.target.value)}><option>Centered</option><option>Corner notification</option><option>Full-screen</option></select></Field><Field label="Trigger / placement"><select className="input select" value={form.trigger} onChange={event => update("trigger", event.target.value)}><option>On page load</option><option>After scroll</option><option>On exit intent</option></select></Field><Field label="Frequency setting"><select className="input select" value={form.frequency} onChange={event => update("frequency", event.target.value)}><option>Once per session</option><option>Once per day</option><option>Every visit</option></select></Field></>;
  if (form.format === "video") return <><Field label="Video placement"><select className="input select" value={form.placement} onChange={event => update("placement", event.target.value)}><option>In-stream</option><option>Out-stream</option><option>Player overlay</option></select></Field><Field label="Aspect / size"><select className="input select" value={form.aspect} onChange={event => update("aspect", event.target.value)}><option>16:9</option><option>4:3</option><option>1:1</option></select></Field><Field label="Autoplay"><select className="input select" value={form.autoplay} onChange={event => update("autoplay", event.target.value)}><option>No</option><option>Yes</option></select></Field><Field label="Muted presentation"><select className="input select" value={form.muted} onChange={event => update("muted", event.target.value)}><option>Yes</option><option>No</option></select></Field><Field label="Skip option"><select className="input select" value={form.skip} onChange={event => update("skip", event.target.value)}><option>After 5 seconds</option><option>After 10 seconds</option><option>Not skippable</option></select></Field></>;
  return <><Field label="Destination / redirect behavior"><textarea className="input textarea" value={form.destination} onChange={event => update("destination", event.target.value)} placeholder="Explain where the visitor is sent" /></Field><Field label="Placement explanation"><textarea className="input textarea" value={form.placement} onChange={event => update("placement", event.target.value)} placeholder="Where will the link appear?" /></Field></>;
}

function ZoneForm({ form, setForm, websites, errors, onCancel, onReview }) {
  const update = (key, value) => setForm(previous => ({ ...previous, [key]: value }));
  return <section className="form-panel light-panel"><div className="panel-heading"><div><span className="eyebrow">INVENTORY PLACEMENT</span><h2>Create ad zone</h2></div><button className="link-button" type="button" onClick={onCancel}>Cancel</button></div><div className="form-grid"><Field label="Zone name" hint="Make its placement obvious" error={errors.name}><input className="input" value={form.name} onChange={event => update("name", event.target.value)} placeholder="Homepage rectangle" /></Field><Field label="Website" error={errors.websiteId}><select className="input select" value={form.websiteId} onChange={event => update("websiteId", event.target.value)}><option value="">Select a website</option>{websites.map(website => <option key={website.id} value={website.id}>{website.name}</option>)}</select></Field><Field label="Ad format"><select className="input select" value={form.format} onChange={event => setForm(previous => ({ ...previous, format: event.target.value, size: BANNER_SIZES[1], placement: "", title: "", cta: "" }))}>{AD_FORMATS.map(format => <option key={format.id} value={format.id}>{format.name}</option>)}</select></Field><Field label="Zone description"><textarea className="input textarea" value={form.description} onChange={event => update("description", event.target.value)} placeholder="Describe the placement for campaign matching." /></Field><Field label="Status"><select className="input select" value={form.status} onChange={event => update("status", event.target.value)}><option>Draft</option><option>Pending</option><option>Available</option></select></Field></div><div className="subsection-heading"><span className="eyebrow">FORMAT-SPECIFIC SETTINGS</span><h2>{AD_FORMATS.find(item => item.id === form.format)?.name}</h2></div><div className="dynamic-fields"><DynamicZoneFields form={form} setForm={setForm} errors={errors} /></div><div className="zone-preview-panel"><div><span className="eyebrow">LIVE PREVIEW</span><h2>Placement preview</h2><p>معاينة بصرية تقريبية حسب الصيغة والإعدادات الحالية.</p></div><ZonePreview form={form} /></div><div className="form-actions"><button className="primary-button" type="button" onClick={onReview}><MiniIcon name="check" size={16} />Review ad zone</button><button className="ghost-button" type="button" onClick={onCancel}>Cancel</button></div></section>;
}

function ZoneReview({ form, websites, onBack, onConfirm }) {
  const website = websites.find(item => item.id === form.websiteId);
  return <section className="form-panel light-panel review-panel"><div className="panel-heading"><div><span className="eyebrow">FINAL REVIEW</span><h2>Review ad zone</h2></div><button className="link-button" type="button" onClick={onBack}>Edit</button></div><div className="review-grid"><div className="review-facts"><span><b>Website</b>{website?.name || "Not selected"}</span><span><b>Zone name</b>{form.name}</span><span><b>Format</b>{AD_FORMATS.find(item => item.id === form.format)?.name}</span><span><b>Size / placement</b>{form.size || form.placement || form.aspect || "Configured"}</span><span><b>Status</b>{form.status}</span><span><b>Description</b>{form.description || "No description"}</span></div><ZonePreview form={form} /></div><div className="form-actions"><button className="primary-button" type="button" onClick={onConfirm}><MiniIcon name="check" size={16} />Confirm & create</button><button className="ghost-button" type="button" onClick={onBack}>Back to edit</button></div></section>;
}

function SimpleFormatPreview({ format, size }) {
  const preview = { format: format.id, size, title: format.name, placement: "مساحة إعلانية جاهزة", cta: "اكتشف المزيد", destination: "وجهة الإعلان" };
  return <ZonePreview form={preview} />;
}

function FormatRequirementsStep({ formatId, values, setValues, error }) {
  const update = (key, value) => setValues(previous => ({ ...previous, [key]: value }));
  const requirements = AD_ZONE_REQUIREMENTS[formatId];
  const inspectFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const isVideo = formatId === "video";
    const validType = isVideo ? ["video/mp4", "video/webm"].includes(file.type) : file.type.startsWith("image/");
    const maxBytes = isVideo ? 20 * 1024 * 1024 : 5 * 1024 * 1024;
    if (!validType) { update("fileError", isVideo ? "Upload an MP4 or WebM video." : "Upload a JPG, PNG, WEBP, or GIF image."); return; }
    if (file.size > maxBytes) { update("fileError", `The file must be smaller than ${isVideo ? "20 MB" : "5 MB"}.`); return; }
    if (!isVideo) { setValues(previous => ({ ...previous, file, fileName: file.name, fileSize: file.size, fileError: "" })); return; }
    const objectUrl = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      const duration = video.duration;
      URL.revokeObjectURL(objectUrl);
      if (duration < 5 || duration > 60) { update("fileError", "Video duration must be between 5 and 60 seconds."); return; }
      setValues(previous => ({ ...previous, file, fileName: file.name, fileSize: file.size, duration: Math.round(duration), fileError: "" }));
    };
    video.onerror = () => { URL.revokeObjectURL(objectUrl); update("fileError", "We could not read this video. Try another MP4 or WebM file."); };
    video.src = objectUrl;
  };
  return <section className="light-panel requirements-panel">
    <div className="panel-heading"><div><span className="eyebrow">FORMAT REQUIREMENTS</span><h2>{requirements.title}</h2><p className="requirements-summary">{requirements.summary}</p></div><span className="phase-chip">Required</span></div>
    {["native", "social"].includes(formatId) && <><label className="field"><span>Creative image</span><div className="file-choice"><input id="publisher-media-upload" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={inspectFile} /><label htmlFor="publisher-media-upload" className="file-choice-button"><MiniIcon name="image" size={18} />{values.fileName ? "Change image" : "Choose image"}</label><span>{values.fileName || "JPG, PNG, WEBP, or GIF · up to 5 MB"}</span></div></label><label className="field"><span>{formatId === "social" ? "Social headline" : "Content title"}</span><input className="input" value={values.title} onChange={event => update("title", event.target.value)} placeholder={formatId === "social" ? "A short social-style headline" : "A natural content title"} /></label></>}
    {formatId === "video" && <label className="field"><span>Video creative</span><div className="file-choice video-file-choice"><input id="publisher-video-upload" type="file" accept="video/mp4,video/webm" onChange={inspectFile} /><label htmlFor="publisher-video-upload" className="file-choice-button"><MiniIcon name="chart" size={18} />{values.fileName ? "Change video" : "Choose video"}</label><span>{values.fileName || "MP4 or WebM · up to 20 MB · 5–60 seconds"}</span>{values.duration && <small>Detected duration: {values.duration} seconds · {(values.fileSize / (1024 * 1024)).toFixed(1)} MB</small>}</div></label>}
    {["popup", "direct-link"].includes(formatId) && <label className="field"><span>{formatId === "popup" ? "Popup message" : "Destination URL"}</span>{formatId === "popup" ? <textarea className="input textarea" value={values.title} onChange={event => update("title", event.target.value)} placeholder="Write the short offer visitors will see." /> : <input className="input" value={values.destination} onChange={event => update("destination", event.target.value)} placeholder="https://example.com/offer" inputMode="url" />}</label>}
    {formatId === "popup" && <label className="field"><span>Destination URL</span><input className="input" value={values.destination} onChange={event => update("destination", event.target.value)} placeholder="https://example.com/offer" inputMode="url" /></label>}
    {(error || values.fileError) && <small className="field-error requirements-error">{error || values.fileError}</small>}
  </section>;
}

function SimpleAdFlow({ websites, setData, onCancel, onNavigate, setNotice }) {
  const [step, setStep] = useState(websites.length === 1 ? "format" : "website");
  const [websiteId, setWebsiteId] = useState(websites.length === 1 ? websites[0].id : "");
  const [formatId, setFormatId] = useState("banner");
  const [size, setSize] = useState(BANNER_SIZES[1]);
  const [requirements, setRequirements] = useState({ file: null, fileName: "", fileSize: 0, duration: 0, title: "", destination: "", fileError: "" });
  const [requirementsError, setRequirementsError] = useState("");
  const [copied, setCopied] = useState(false);
  const [createdZoneId, setCreatedZoneId] = useState("");
  const website = websites.find(item => item.id === websiteId);
  const format = AD_FORMATS.find(item => item.id === formatId) || AD_FORMATS[0];
  const needsSize = formatId === "banner";
  const needsRequirements = formatId !== "banner";
  const code = "<!-- AdZora ad code -->\n<script data-adzora-zone=\"" + createdZoneId + "\" data-adzora-format=\"" + formatId + "\" async></script>";

  const chooseFormat = (nextFormat) => {
    setFormatId(nextFormat);
    setSize(nextFormat === "banner" ? BANNER_SIZES[1] : "");
    setRequirements({ file: null, fileName: "", fileSize: 0, duration: 0, title: "", destination: "", fileError: "" });
    setRequirementsError("");
  };
  const validateRequirements = () => {
    if (["native", "social"].includes(formatId) && !requirements.file) return "Choose an image for this ad format.";
    if (["native", "social", "popup"].includes(formatId) && !requirements.title.trim()) return "Add the required title or message.";
    if (["popup", "direct-link"].includes(formatId)) {
      try { if (!requirements.destination || new URL(requirements.destination).protocol !== "https:") return "Use a valid HTTPS destination URL."; } catch { return "Use a valid HTTPS destination URL."; }
    }
    if (formatId === "video" && !requirements.file) return "Choose a video before continuing.";
    if (formatId === "video" && (!requirements.duration || requirements.fileError)) return requirements.fileError || "The video must be between 5 and 60 seconds.";
    return "";
  };
  const continueToConfirm = () => {
    const error = needsRequirements ? validateRequirements() : "";
    setRequirementsError(error);
    if (!error) setStep("confirm");
  };
  const confirm = () => {
    const id = "zone-" + Date.now();
    const error = needsRequirements ? validateRequirements() : "";
    if (error) { setRequirementsError(error); setStep("requirements"); return; }
    const zone = { ...zoneDefaults, id, name: `${format.name} placement`, websiteId, format: formatId, size: needsSize ? size : "", title: requirements.title, destination: requirements.destination, requirements: { fileName: requirements.fileName, fileSize: requirements.fileSize, duration: requirements.duration }, status: "Draft", createdAt: new Date().toLocaleDateString("en-US"), impressions: 0, clicks: 0, revenue: "$0.00" };
    setData(previous => ({ ...previous, zones: [...previous.zones, zone], websites: previous.websites.map(item => item.id === websiteId ? { ...item, zones: item.zones + 1 } : item) }));
    setCreatedZoneId(id);
    setStep("code");
    setNotice("Ad code generated. It is a frontend demo snippet and is not connected to live serving.");
  };
  const copyCode = async () => {
    try { await navigator.clipboard.writeText(code); setCopied(true); setNotice("Code copied."); setTimeout(() => setCopied(false), 1800); } catch { setNotice("Copy is unavailable in this browser. Select the code manually."); }
  };

  if (!websites.length) return <div className="workspace-page"><PageHeader title="Add advertisement" description="أضف موقعًا أولًا حتى تتمكن من إنشاء أول مساحة إعلانية." /><section className="light-panel"><EmptyState icon="globe" title="No website added yet" description="أضف موقعك، ثم عد إلى هذه الخطوة لاختيار نوع الإعلان." action="Add Website" onAction={() => onNavigate("websites")} /></section></div>;

  return <div className="workspace-page simple-ad-flow">
    <div className="workspace-page-header"><div><span className="eyebrow">PUBLISHER / SIMPLE SETUP</span><h1>{step === "code" ? "Your Ad Code Is Ready" : "Add advertisement"}</h1><p>{step === "code" ? "انسخ الكود وضعه في المكان الذي تريد أن يظهر فيه الإعلان على موقعك." : "اختر موقعًا، ثم نوع الإعلان، واحصل على الكود دون إعدادات تقنية معقدة."}</p></div><button className="ghost-button" type="button" onClick={onCancel}>Cancel</button></div>
    {step !== "code" && <div className="flow-progress" aria-label="Progress"><span className={step === "website" ? "active" : "done"}>01 <small>الموقع</small></span><i /><span className={step === "format" ? "active" : "done"}>02 <small>نوع الإعلان</small></span><i /><span className={step === "size" || step === "requirements" ? "active" : step === "confirm" ? "done" : ""}>03 <small>{needsSize ? "الحجم" : "المتطلبات"}</small></span><i /><span className={step === "confirm" ? "active" : ""}>04 <small>التأكيد</small></span></div>}
    {step === "website" && <section className="light-panel selection-panel"><div className="panel-heading"><div><span className="eyebrow">STEP 1</span><h2>Choose your website</h2></div><span className="phase-chip">Required</span></div><div className="selection-grid website-selection">{websites.map(item => <button className={websiteId === item.id ? "selection-card selected" : "selection-card"} type="button" key={item.id} onClick={() => setWebsiteId(item.id)}><span className="selection-icon"><MiniIcon name="globe" /></span><span><strong>{item.name}</strong><small>{item.url}</small></span><em>{item.status}</em><span className="selection-check"><MiniIcon name="check" size={15} /></span></button>)}</div><div className="form-actions"><button className="primary-button" type="button" disabled={!websiteId} onClick={() => setStep("format")}>Continue <MiniIcon name="arrow" size={16} /></button></div></section>}
    {step === "format" && <section className="light-panel selection-panel"><div className="panel-heading"><div><span className="eyebrow">STEP 2</span><h2>Choose an ad format</h2></div><button className="link-button" type="button" onClick={() => setStep("website")}>Change website</button></div><div className="selected-context"><MiniIcon name="globe" size={15} /><span>{website?.name} · {website?.url}</span></div><div className="selection-grid format-selection">{AD_FORMATS.map(item => <button className={formatId === item.id ? "selection-card format-selection-card selected" : "selection-card format-selection-card"} type="button" key={item.id} onClick={() => chooseFormat(item.id)}><span className="format-card-preview"><MiniIcon name={item.id === "banner" ? "layout" : item.id === "video" ? "chart" : item.id === "direct-link" ? "code" : item.id === "popup" ? "megaphone" : "image"} size={22} /></span><strong>{item.name}</strong><small>{AD_ZONE_REQUIREMENTS[item.id].summary}</small><span className="selection-check"><MiniIcon name="check" size={15} /></span></button>)}</div><div className="form-actions"><button className="primary-button" type="button" onClick={() => setStep(needsSize ? "size" : "requirements")}>Continue <MiniIcon name="arrow" size={16} /></button></div></section>}
    {step === "size" && <section className="light-panel selection-panel"><div className="panel-heading"><div><span className="eyebrow">STEP 3</span><h2>Choose a banner size</h2></div><button className="link-button" type="button" onClick={() => setStep("format")}>Change format</button></div><div className="selection-grid size-selection">{BANNER_SIZES.map(item => <button className={size === item ? "selection-card size-card selected" : "selection-card size-card"} type="button" key={item} onClick={() => setSize(item)}><span className="size-preview" style={{ aspectRatio: item.replace("×", " / ") }} /><strong>{item}</strong><small>Banner placement</small><span className="selection-check"><MiniIcon name="check" size={15} /></span></button>)}</div><div className="form-actions"><button className="primary-button" type="button" onClick={() => setStep("confirm")}>Review selection <MiniIcon name="arrow" size={16} /></button></div></section>}
    {step === "requirements" && <><FormatRequirementsStep formatId={formatId} values={requirements} setValues={setRequirements} error={requirementsError} /><div className="selection-panel-flow-actions"><button className="ghost-button" type="button" onClick={() => setStep("format")}>Change format</button><button className="primary-button" type="button" onClick={continueToConfirm}>Continue <MiniIcon name="arrow" size={16} /></button></div></>}
    {step === "confirm" && <section className="light-panel selection-panel confirm-simple-panel"><div className="panel-heading"><div><span className="eyebrow">STEP 4</span><h2>Confirm your ad setup</h2></div><button className="link-button" type="button" onClick={() => setStep(needsSize ? "size" : "requirements")}>Edit</button></div><div className="simple-review"><span><b>Website</b>{website?.url}</span><span><b>Format</b>{format.name}</span>{needsSize && <span><b>Size</b>{size}</span>}{requirements.fileName && <span><b>File</b>{requirements.fileName}</span>}{requirements.duration > 0 && <span><b>Duration</b>{requirements.duration} seconds</span>}</div><SimpleFormatPreview format={format} size={size} /><div className="form-actions"><button className="primary-button" type="button" onClick={confirm}><MiniIcon name="check" size={16} />Confirm & get code</button><button className="ghost-button" type="button" onClick={onCancel}>Cancel</button></div></section>}
    {step === "code" && <section className="light-panel code-ready-panel"><div className="code-ready-mark"><MiniIcon name="check" size={26} /></div><h2>Your Ad Code Is Ready</h2><p>1. انسخ الكود  ·  2. ألصقه في المكان المطلوب  ·  3. احفظ موقعك</p><div className="simple-review"><span><b>Website</b>{website?.url}</span><span><b>Format</b>{format.name}</span>{needsSize && <span><b>Size</b>{size}</span>}{requirements.fileName && <span><b>File</b>{requirements.fileName}</span>}</div><pre className="code-box"><code>{code}</code></pre><div className="code-actions"><button className="primary-button" type="button" onClick={copyCode}><MiniIcon name={copied ? "check" : "copy"} size={16} />{copied ? "Code copied" : "Copy code"}</button><button className="ghost-button" type="button" onClick={onCancel}>Done</button></div><small className="demo-note">Frontend demo only. Live ad serving will be connected when the delivery API is implemented.</small></section>}
  </div>;
}

function ZoneDetails({ zone, website, onBack, onEdit, onCode }) {
  return <div className="workspace-page"><PageHeader title="Ad Zone details" description="راجع إعدادات المنطقة قبل ربطها بكود الإعلان." action="Back to Ad Zones" onAction={onBack} icon="arrow" /><section className="detail-layout"><div className="light-panel"><div className="panel-heading"><div><span className="eyebrow">ZONE DETAILS</span><h2>{zone.name}</h2></div><span className="status-badge draft">{zone.status}</span></div><div className="detail-facts"><span><b>Website</b>{website?.name || "Unknown website"}</span><span><b>Format</b>{AD_FORMATS.find(item => item.id === zone.format)?.name || zone.format}</span><span><b>Size / placement</b>{zone.size || zone.placement || zone.aspect || "Configured"}</span><span><b>Created</b>{zone.createdAt}</span><span><b>Identifier</b><code>{zone.id}</code></span></div><p className="detail-description">{zone.description || "No additional description."}</p><div className="form-actions"><button className="primary-button" type="button" onClick={onEdit}><MiniIcon name="edit" size={15} />Edit zone</button><button className="secondary-button" type="button" onClick={onCode}><MiniIcon name="code" size={15} />Go to Ad Codes</button></div></div><div className="light-panel preview-panel"><span className="eyebrow">PREVIEW</span><ZonePreview form={zone} /></div></section></div>;
}

function AdZonesPage({ data, setData, onNavigate, setNotice }) {
  const [showForm, setShowForm] = useState(data.zones.length === 0 && data.websites.length > 0);
  const [form, setForm] = useState({ ...zoneDefaults, websiteId: data.websites[0]?.id || "" });
  const [errors, setErrors] = useState({});
  const [reviewing, setReviewing] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const selectedZone = data.zones.find(zone => zone.id === selectedId);
  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Enter a zone name.";
    if (!form.websiteId) next.websiteId = "Select a website.";
    if (["native", "social"].includes(form.format) && !form.placement) next.placement = "Choose a placement style.";
    if (form.format === "direct-link" && !form.destination) next.destination = "Describe the destination behavior.";
    return next;
  };
  const openCreate = () => { setForm(previous => ({ ...zoneDefaults, websiteId: previous.websiteId || data.websites[0]?.id || "" })); setErrors({}); setReviewing(false); setShowForm(true); };
  const review = () => { const next = validate(); setErrors(next); if (!Object.keys(next).length) setReviewing(true); };
  const create = () => {
    const zone = { ...form, id: "zone-" + Date.now(), createdAt: new Date().toLocaleDateString("en-US"), impressions: 0, clicks: 0, revenue: "$0.00" };
    setData(previous => ({ ...previous, zones: [...previous.zones, zone], websites: previous.websites.map(website => website.id === form.websiteId ? { ...website, zones: website.zones + 1 } : website) }));
    setForm({ ...zoneDefaults, websiteId: form.websiteId }); setErrors({}); setReviewing(false); setShowForm(false); setNotice("Ad zone created successfully. Review the details before requesting a placeholder code.");
  };
  if (!data.websites.length) return <div className="workspace-page"><PageHeader title="Ad Zones" description="كل Ad Zone يمثل مكانًا محددًا يمكن أن تظهر فيه إعلانات AdZora." /><section className="light-panel"><EmptyState icon="layout" title="Add a website first" description="لا يمكن إنشاء منطقة إعلانية بدون ربطها بموقع واضح." action="Add Website" onAction={() => onNavigate("websites")} /></section></div>;
  if (showForm) return <SimpleAdFlow websites={data.websites} setData={setData} onCancel={() => setShowForm(false)} onNavigate={onNavigate} setNotice={setNotice} />;
  if (selectedZone) return <ZoneDetails zone={selectedZone} website={data.websites.find(item => item.id === selectedZone.websiteId)} onBack={() => setSelectedId("")} onEdit={() => { setForm(selectedZone); setSelectedId(""); setReviewing(false); setShowForm(true); }} onCode={() => onNavigate("ad-codes")} />;
  return <div className="workspace-page"><PageHeader title="Ad Zones" description="اختر موقعًا ونوع الإعلان لتحصل على كود جاهز، مع الاحتفاظ ببنية Ad Zone الحالية." action="Add Advertisement" onAction={openCreate} />{!data.zones.length ? <section className="light-panel"><EmptyState icon="layout" title="No ad zones yet" description="أضف إعلانك الأول باتباع الخطوات البسيطة من اختيار الموقع إلى الحصول على الكود." action="Add Advertisement" onAction={openCreate} /></section> : <section className="light-panel data-panel"><div className="panel-heading"><div><span className="eyebrow">PLACEMENTS</span><h2>{data.zones.length} ad zone{data.zones.length === 1 ? "" : "s"}</h2></div><span className="result-count">Website → Zone</span></div><div className="data-list">{data.zones.map(zone => { const website = data.websites.find(item => item.id === zone.websiteId); return <div className="data-row" key={zone.id}><div className="row-main"><span className="row-icon"><MiniIcon name="layout" /></span><div><strong>{zone.name}</strong><small>{website?.name || "Unknown website"} · {zone.size || zone.placement || zone.aspect}</small></div></div><div className="row-detail"><span className="row-label">Format</span><strong>{AD_FORMATS.find(item => item.id === zone.format)?.name}</strong></div><div className="row-detail"><span className="row-label">Revenue</span><strong>{zone.revenue}</strong></div><span className="status-badge draft">{zone.status}</span><div className="row-actions"><button className="row-action compact" type="button" onClick={() => setData(previous => ({ ...previous, zones: previous.zones.map(item => item.id === zone.id ? { ...item, status: item.status === "Available" ? "Pending" : "Available" } : item) }))}><MiniIcon name={zone.status === "Available" ? "pause" : "play"} size={14} />{zone.status === "Available" ? "Pause" : "Activate"}</button><button className="row-action compact" type="button" onClick={() => setSelectedId(zone.id)}><MiniIcon name="eye" size={14} />Details</button><button className="row-action compact" type="button" onClick={() => onNavigate("ad-codes")}><MiniIcon name="code" size={14} />Get code</button></div></div>; })}</div></section>}</div>;
}

function AdCodesPage({ data, onNavigate, setNotice }) {
  const [copiedId, setCopiedId] = useState("");
  const copyCode = async zone => {
    const code = "<!-- AdZora placeholder for " + zone.name + " -->\n<script data-adzora-zone=\"" + zone.id + "\" async></script>";
    try { await navigator.clipboard.writeText(code); setCopiedId(zone.id); setNotice("Placeholder code copied. It is not production serving code yet."); setTimeout(() => setCopiedId(""), 1800); } catch { setNotice("Copy is unavailable in this browser. Select the code manually."); }
  };
  return <div className="workspace-page"><PageHeader title="Ad Codes" description="العلاقة واضحة: Website → Ad Zone → Ad Code → Advertising inventory." />{!data.zones.length ? <section className="light-panel"><EmptyState icon="code" title="No ad codes yet" description="أنشئ Ad Zone أولًا، ثم سيظهر هنا الكود المرتبط به." action="Create Ad Zone" onAction={() => onNavigate("ad-zones")} /></section> : <div className="code-list">{data.zones.map(zone => { const website = data.websites.find(item => item.id === zone.websiteId); return <section className="light-panel code-card" key={zone.id}><div className="code-card-heading"><div className="row-main"><span className="row-icon"><MiniIcon name="code" /></span><div><strong>{zone.name}</strong><small>{website?.name || "Unknown website"} · {zone.size || zone.placement || zone.aspect}</small></div></div><span className="status-badge draft">{zone.status}</span></div><div className="code-note"><strong>Placeholder state</strong><span>Serving code will be connected when the delivery API is implemented. Do not install this snippet in production yet.</span></div><pre className="code-box"><code>{"<!-- AdZora placeholder for " + zone.name + " -->" + String.fromCharCode(10) + '<script data-adzora-zone="' + zone.id + '" async></script>'}</code></pre><div className="code-actions"><button className="primary-button" type="button" onClick={() => copyCode(zone)}><MiniIcon name={copiedId === zone.id ? "check" : "copy"} size={16} />{copiedId === zone.id ? "Copied" : "Copy placeholder"}</button><button className="ghost-button" type="button" onClick={() => onNavigate("ad-zones")}><MiniIcon name="edit" size={16} />Manage zone</button></div></section>; })}</div>}</div>;
}

const DEMO_FINANCE = { available: 125, pending: 32.5, earned: 642.5, withdrawn: 485, minimum: 50 };

function FinanceMetrics({ finance }) {
  const metrics = [["Available Earnings", finance.available, "wallet"], ["Pending Earnings", finance.pending, "clock"], ["Total Earned", finance.earned, "trend"], ["Withdrawn", finance.withdrawn, "arrow-up"]];
  return <section className="metric-grid financial-metrics">{metrics.map(([label, value, icon]) => <article className="metric-card" key={label}><div className="metric-top"><span className="metric-icon"><MiniIcon name={icon} size={16} /></span><span className="metric-label">{label}</span></div><strong className="metric-value">${value.toFixed(2)}</strong><span className="metric-hint">Demo display value</span></article>)}</section>;
}

function EarningsPage({ finance, onNavigate }) {
  return <div className="workspace-page"><PageHeader title="Publisher Earnings" description="تابع الأرباح المتاحة والمعلّقة والإجمالي المسجل. هذه الأرقام تجريبية وليست محاسبة فعلية." action="Withdraw earnings" onAction={() => onNavigate("withdrawals")} icon="arrow" /><FinanceMetrics finance={finance} /><section className="dashboard-grid finance-lower-grid"><section className="light-panel"><div className="panel-heading"><div><span className="eyebrow">PERFORMANCE SUPPORT</span><h2>Revenue signals</h2></div></div><div className="finance-signal-list"><span><b>eCPM</b><strong>$2.40</strong><small>Demo estimate</small></span><span><b>RPM</b><strong>$1.85</strong><small>Demo estimate</small></span><span><b>Impressions</b><strong>0</strong><small>No live traffic</small></span><span><b>Clicks</b><strong>0</strong><small>No live traffic</small></span></div></section><section className="light-panel"><div className="panel-heading"><div><span className="eyebrow">NEXT STEP</span><h2>Withdrawals</h2></div></div><div className="finance-callout"><strong>Available now: ${finance.available.toFixed(2)}</strong><p>Minimum withdrawal is ${finance.minimum.toFixed(2)}. Payment processing is not connected.</p><button className="secondary-button" type="button" onClick={() => onNavigate("withdrawals")}><MiniIcon name="arrow" size={15} />Start a demo withdrawal</button></div></section></section></div>;
}

function WithdrawalsPage({ finance, withdrawals, setFinance, setWithdrawals, setNotice }) {
  const [step, setStep] = useState("form");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Bank transfer (demo)");
  const [error, setError] = useState("");
  const [created, setCreated] = useState(null);
  const validate = () => {
    const numeric = Number(amount);
    if (!amount || Number.isNaN(numeric) || numeric <= 0) return "Enter a withdrawal amount greater than zero.";
    if (numeric < finance.minimum) return `Minimum withdrawal is $${finance.minimum.toFixed(2)}.`;
    if (numeric > finance.available) return `Amount cannot exceed available earnings of $${finance.available.toFixed(2)}.`;
    return "";
  };
  const review = () => { const next = validate(); setError(next); if (!next) setStep("confirm"); };
  const confirm = () => {
    const withdrawal = { id: "withdrawal-" + Date.now(), amount: Number(amount), method, status: "Pending", date: new Date().toLocaleDateString("en-US") };
    setFinance(previous => ({ ...previous, available: previous.available - withdrawal.amount }));
    setWithdrawals(previous => [...previous, withdrawal]);
    setCreated(withdrawal); setStep("success"); setNotice("Withdrawal request saved as Pending in demo state.");
  };
  if (step === "success") return <div className="workspace-page"><PageHeader title="Withdrawal submitted" description="تم حفظ الطلب كحالة Pending فقط. لا يوجد تحويل مالي حقيقي." /><section className="light-panel success-panel"><span className="success-mark"><MiniIcon name="check" size={25} /></span><h2>Pending withdrawal</h2><p>${created.amount.toFixed(2)} via {created.method}</p><div className="detail-facts"><span><b>Status</b>Pending</span><span><b>Date</b>{created.date}</span></div><button className="secondary-button" type="button" onClick={() => { setStep("form"); setAmount(""); }}>Create another demo request</button></section></div>;
  if (step === "confirm") return <div className="workspace-page"><PageHeader title="Confirm withdrawal" description="راجع المبلغ وطريقة الدفع التجريبية قبل إنشاء الطلب." /><section className="light-panel confirm-panel"><div className="review-facts"><span><b>Amount</b>${Number(amount).toFixed(2)}</span><span><b>Payment method</b>{method}</span><span><b>Remaining available</b>${(finance.available - Number(amount)).toFixed(2)}</span><span><b>Processing</b>Demo / not connected</span></div><div className="form-actions"><button className="primary-button" type="button" onClick={confirm}><MiniIcon name="check" size={16} />Confirm request</button><button className="ghost-button" type="button" onClick={() => setStep("form")}>Back to edit</button></div></section></div>;
  return <div className="workspace-page"><PageHeader title="Withdrawals" description="Available Earnings → Withdraw → Amount → Payment method → Confirmation. هذه واجهة تجريبية فقط." /><section className="withdraw-layout"><section className="form-panel light-panel"><div className="panel-heading"><div><span className="eyebrow">NEW WITHDRAWAL</span><h2>Request payout</h2></div><span className="phase-chip">Demo only</span></div><div className="withdraw-balance"><span>Available Earnings</span><strong>${finance.available.toFixed(2)}</strong><small>Minimum withdrawal: ${finance.minimum.toFixed(2)}</small></div><div className="form-grid"><Field label="Amount" error={error}><input className="input" type="number" min={finance.minimum} max={finance.available} step="0.01" value={amount} onChange={event => { setAmount(event.target.value); setError(""); }} placeholder={finance.minimum.toFixed(2)} /></Field><Field label="Payment method"><select className="input select" value={method} onChange={event => setMethod(event.target.value)}><option>Bank transfer (demo)</option><option>PayPal (demo)</option><option>Manual review (demo)</option></select></Field></div><div className="notice" role="status">No payment provider is connected. This request never moves money.</div><button className="primary-button" type="button" onClick={review}><MiniIcon name="arrow" size={16} />Review withdrawal</button></section><section className="light-panel"><div className="panel-heading"><div><span className="eyebrow">WITHDRAWAL STATUS</span><h2>Recent requests</h2></div><span className="result-count">{withdrawals.length} records</span></div>{!withdrawals.length ? <EmptyState icon="arrow" title="No withdrawals yet" description="بعد تأكيد أول طلب تجريبي سيظهر هنا بحالة Pending." /> : <div className="data-list">{withdrawals.map(item => <div className="data-row compact-finance-row" key={item.id}><div className="row-main"><span className="row-icon"><MiniIcon name="arrow" /></span><div><strong>${item.amount.toFixed(2)}</strong><small>{item.method}</small></div></div><div className="row-detail"><span className="row-label">Date</span><strong>{item.date}</strong></div><span className="status-badge pending">{item.status}</span></div>)}</div>}</section></section></div>;
}

function PublisherTransactions({ withdrawals }) {
  return <div className="workspace-page"><PageHeader title="Publisher Transactions" description="سجل منفصل لأرباح الناشر والتعديلات والسحوبات، دون خلطه بإنفاق المعلن." /><section className="light-panel data-panel"><div className="panel-heading"><div><span className="eyebrow">TRANSACTION HISTORY</span><h2>{withdrawals.length} records</h2></div><span className="result-count">Demo state</span></div>{!withdrawals.length ? <EmptyState icon="code" title="No transactions yet" description="ستظهر Earnings وAdjustments وWithdrawals هنا عند وجود بيانات تجريبية." /> : <div className="data-list">{withdrawals.map(item => <div className="data-row compact-finance-row" key={item.id}><div className="row-main"><span className="row-icon"><MiniIcon name="arrow" /></span><div><strong>Withdrawal · ${item.amount.toFixed(2)}</strong><small>{item.method}</small></div></div><div className="row-detail"><span className="row-label">Date</span><strong>{item.date}</strong></div><span className="status-badge pending">{item.status}</span></div>)}</div>}<div className="transaction-types"><span className="format-chip">Earnings<small>Demo</small></span><span className="format-chip">Adjustments<small>Demo</small></span><span className="format-chip">Withdrawals<small>{withdrawals.length}</small></span></div></section></div>;
}

export default function PublisherWorkspace({ page, data, setData, onNavigate, finance = DEMO_FINANCE, setFinance = () => {}, withdrawals = [], setWithdrawals = () => {} }) {
  const [notice, setNotice] = useState("");
  const content = useMemo(() => page, [page]);
  return <div className="publisher-workspace">{notice && <div className="notice" role="status"><span>{notice}</span><button type="button" onClick={() => setNotice("")}>×</button></div>}{content === "websites" && <WebsitesPage data={data} setData={setData} onNavigate={onNavigate} setNotice={setNotice} />}{content === "ad-zones" && <AdZonesPage data={data} setData={setData} onNavigate={onNavigate} setNotice={setNotice} />}{content === "ad-codes" && <AdCodesPage data={data} onNavigate={onNavigate} setNotice={setNotice} />}{content === "earnings" && <EarningsPage finance={finance} onNavigate={onNavigate} />}{content === "withdrawals" && <WithdrawalsPage finance={finance} withdrawals={withdrawals} setFinance={setFinance} setWithdrawals={setWithdrawals} setNotice={setNotice} />}{content === "transactions" && <PublisherTransactions withdrawals={withdrawals} />}</div>;
}