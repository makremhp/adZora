import { useMemo, useState } from "react";
import { AD_FORMATS, BANNER_SIZES, PRICING_MODELS, formatMoney } from "./config";

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
    upload: <><path d="M12 16V4M7 9l5-5 5 5" /><path d="M5 14v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5" /></>,
    image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9" r="1.5" /><path d="m21 15-5-5L5 20" /></>,
    video: <><rect x="3" y="5" width="14" height="14" rx="2" /><path d="m17 10 4-2v8l-4-2z" /></>,
  };
  return <svg {...props}>{paths[name] || paths.megaphone}</svg>;
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

const TYPE_OPTIONS = [
  { id: "banner", name: "Image / Banner", description: "صورة إعلانية ثابتة مع رابط وجهة." },
  { id: "video", name: "Video", description: "فيديو إعلاني مع معاينة والتحقق من الملف." },
  { id: "native", name: "Native", description: "إعلان مندمج مع المحتوى والعنوان والوصف." },
  { id: "social", name: "Social", description: "محتوى اجتماعي مع نص ووسائط وCTA." },
  { id: "popup", name: "Popup", description: "محتوى Popup اختياري مع وسائط ورابط." },
  { id: "direct-link", name: "Direct Link", description: "رابط مباشر فقط بدون رفع صورة أو فيديو." },
];

const INITIAL_FORM = {
  name: "", format: "banner", budget: "", pricingModel: "CPM", duration: "30", size: BANNER_SIZES[1],
  title: "", description: "", cta: "", destination: "", content: "", file: null, fileName: "", fileType: "", fileSize: 0,
  previewUrl: "", sourceFile: null, videoDuration: 0, videoWidth: 0, videoHeight: 0, mediaWidth: 0, mediaHeight: 0,
};

function formatSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return Math.max(1, Math.round(bytes / 1024)) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function getAcceptedTypes(format) {
  if (format === "banner" || format === "native") return ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (format === "video") return ["video/mp4", "video/webm", "video/quicktime"];
  if (format === "social" || format === "popup") return ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm", "video/quicktime"];
  return [];
}

function parseCreativeSize(value) {
  const match = String(value || "").trim().match(/(\d+)\s*[×xX]\s*(\d+)/);
  return match ? { width: Number(match[1]), height: Number(match[2]) } : null;
}

function resizeBannerImage(file, size) {
  return new Promise((resolve, reject) => {
    const dimensions = parseCreativeSize(size);
    if (!dimensions) { reject(new Error("Unsupported banner size")); return; }
    const sourceUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;
      const context = canvas.getContext("2d");
      const scale = Math.max(dimensions.width / image.naturalWidth, dimensions.height / image.naturalHeight);
      const drawWidth = image.naturalWidth * scale;
      const drawHeight = image.naturalHeight * scale;
      context.drawImage(image, (dimensions.width - drawWidth) / 2, (dimensions.height - drawHeight) / 2, drawWidth, drawHeight);
      canvas.toBlob(blob => {
        URL.revokeObjectURL(sourceUrl);
        if (!blob) { reject(new Error("Unable to resize image")); return; }
        const baseName = file.name.replace(/\\.[^.]+$/, "");
        const resizedFile = new File([blob], baseName + "-" + dimensions.width + "x" + dimensions.height + ".jpg", { type: "image/jpeg" });
        resolve({ file: resizedFile, previewUrl: URL.createObjectURL(resizedFile), width: dimensions.width, height: dimensions.height });
      }, "image/jpeg", 0.9);
    };
    image.onerror = () => { URL.revokeObjectURL(sourceUrl); reject(new Error("Unable to read image")); };
    image.src = sourceUrl;
  });
}

function mediaFrameStyle(form, format) {
  const dimensions = format === "banner" ? (parseCreativeSize(form.size) || { width: 320, height: 50 }) : form.mediaWidth && form.mediaHeight ? { width: form.mediaWidth, height: form.mediaHeight } : format === "video" ? { width: 16, height: 9 } : { width: 4, height: 3 };
  return { aspectRatio: dimensions.width + " / " + dimensions.height };
}

function MediaPreview({ form, format, compact = false }) {
  const frameStyle = mediaFrameStyle(form, format);
  if (!form.previewUrl) return <div className={compact ? "campaign-media-placeholder compact" : "campaign-media-placeholder"}><Icon name={format === "video" ? "video" : "image"} size={compact ? 22 : 28} /></div>;
  return <div className={compact ? "creative-media-card compact" : "creative-media-card"} style={frameStyle}>{form.fileType.startsWith("video/") ? <video className="campaign-media-preview" src={form.previewUrl} controls muted preload="metadata" /> : <img className="campaign-media-preview" src={form.previewUrl} alt={form.title || "Campaign creative"} />}</div>;
}

function MediaUpload({ form, format, error, optional, onChange }) {
  const accepts = getAcceptedTypes(format);
  if (!accepts.length) return null;
  return <div className="campaign-media-field"><div className="file-choice"><input id="campaign-creative-upload" type="file" accept={accepts.join(",")} onChange={onChange} /><label htmlFor="campaign-creative-upload" className="file-choice-button"><Icon name={format === "video" ? "video" : "upload"} size={17} />{form.fileName ? "Change media" : "Upload " + (format === "video" ? "video" : "media")}</label><span>{form.fileName || (optional ? "Optional media · " : "") + accepts.map(item => item.split("/")[1].toUpperCase()).join(", ")}</span></div>{form.fileName && <div className="campaign-upload-preview"><MediaPreview form={form} format={format} compact /><strong className="campaign-preview-title">{form.title}</strong></div>}{error && <small className="field-error">{error}</small>}</div>;
}

function CreativeFields({ format, form, update, errors, onMedia, onBannerSize }) {
  if (format === "banner") return <div className="form-grid"><Field label="Upload Image" error={errors.media}><MediaUpload form={form} format={format} error={errors.media} onChange={onMedia} /></Field><Field label="Ad Title" error={errors.title}><input className="input" value={form.title} onChange={event => update("title", event.target.value)} placeholder="A clear campaign headline" /></Field><Field label="Destination URL" error={errors.destination}><input className="input" value={form.destination} onChange={event => update("destination", event.target.value)} placeholder="https://example.com/offer" inputMode="url" /></Field><Field label="Ad size"><select className="input select" value={form.size} onChange={event => onBannerSize(event.target.value)}>{BANNER_SIZES.map(size => <option key={size}>{size}</option>)}</select><small>سيتم قص الصورة وتغيير حجمها تلقائيًا إلى {form.size}.</small></Field></div>;
  if (format === "video") return <div className="form-grid"><Field label="Upload Video" error={errors.media}><MediaUpload form={form} format={format} error={errors.media} onChange={onMedia} /><small>MP4, WebM, or MOV · up to 50 MB · 1–60 seconds · minimum 320×180</small></Field><Field label="Ad Title" error={errors.title}><input className="input" value={form.title} onChange={event => update("title", event.target.value)} placeholder="A clear video campaign headline" /></Field><Field label="Destination URL" error={errors.destination}><input className="input" value={form.destination} onChange={event => update("destination", event.target.value)} placeholder="https://example.com" inputMode="url" /></Field></div>;
  if (format === "native") return <div className="form-grid"><Field label="Image" error={errors.media}><MediaUpload form={form} format={format} error={errors.media} onChange={onMedia} /></Field><Field label="Title" error={errors.title}><input className="input" value={form.title} onChange={event => update("title", event.target.value)} placeholder="Native content title" /></Field><Field label="Description"><textarea className="input textarea" value={form.description} onChange={event => update("description", event.target.value)} placeholder="Short supporting description" /></Field><Field label="CTA"><input className="input" value={form.cta} onChange={event => update("cta", event.target.value)} placeholder="Read more" /></Field><Field label="Destination URL" error={errors.destination}><input className="input" value={form.destination} onChange={event => update("destination", event.target.value)} placeholder="https://example.com" inputMode="url" /></Field></div>;
  if (format === "social") return <div className="form-grid"><Field label="Image / Media" error={errors.media}><MediaUpload form={form} format={format} error={errors.media} onChange={onMedia} /></Field><Field label="Text" error={errors.content}><textarea className="input textarea" value={form.content} onChange={event => update("content", event.target.value)} placeholder="Write the social ad text" /></Field><Field label="CTA"><input className="input" value={form.cta} onChange={event => update("cta", event.target.value)} placeholder="Discover" /></Field><Field label="Destination URL" error={errors.destination}><input className="input" value={form.destination} onChange={event => update("destination", event.target.value)} placeholder="https://example.com" inputMode="url" /></Field></div>;
  if (format === "popup") return <div className="form-grid"><Field label="Popup media / URL"><MediaUpload form={form} format={format} optional onChange={onMedia} /></Field><Field label="Popup content" error={errors.content}><textarea className="input textarea" value={form.content} onChange={event => update("content", event.target.value)} placeholder="Write the popup offer visitors will see" /></Field><Field label="Destination URL" error={errors.destination}><input className="input" value={form.destination} onChange={event => update("destination", event.target.value)} placeholder="https://example.com" inputMode="url" /></Field></div>;
  return <div className="form-grid"><Field label="Destination URL" error={errors.destination}><input className="input" value={form.destination} onChange={event => update("destination", event.target.value)} placeholder="https://example.com/offer" inputMode="url" /></Field><div className="direct-link-note"><Icon name="check" size={17} /><span>Direct Link campaigns do not require an image or video.</span></div></div>;
}

function CampaignPreview({ form }) {
  return <div className={"campaign-preview-card " + form.format}><div className="campaign-preview-media"><MediaPreview form={form} format={form.format} compact /></div>{form.title && <strong className="campaign-preview-title">{form.title}</strong>}</div>;
}

function CreateCampaign({ data, setData, onNavigate }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState("");
  const format = form.format;
  const update = (key, value) => { setForm(previous => ({ ...previous, [key]: value })); setErrors(previous => ({ ...previous, [key]: "" })); };
  const updateBannerSize = async nextSize => {
    setForm(previous => ({ ...previous, size: nextSize }));
    setErrors(previous => ({ ...previous, size: "" }));
    const sourceFile = form.sourceFile || form.file;
    if (format !== "banner" || !sourceFile) return;
    try {
      const resized = await resizeBannerImage(sourceFile, nextSize);
      setForm(previous => ({ ...previous, size: nextSize, file: resized.file, fileName: resized.file.name, fileType: resized.file.type, fileSize: resized.file.size, previewUrl: resized.previewUrl, mediaWidth: resized.width, mediaHeight: resized.height }));
      setErrors(previous => ({ ...previous, media: "" }));
    } catch { setErrors(previous => ({ ...previous, media: "The image could not be resized for the selected banner size." })); }
  };
  const chooseFormat = nextFormat => { setForm(previous => ({ ...previous, format: nextFormat, pricingModel: nextFormat === "direct-link" ? "CPC" : nextFormat === "video" ? "CPV" : "CPM", file: null, fileName: "", fileType: "", fileSize: 0, previewUrl: "", videoDuration: 0, videoWidth: 0, videoHeight: 0, mediaWidth: 0, mediaHeight: 0, sourceFile: null })); setErrors({}); };
  const handleMedia = async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    const accepted = getAcceptedTypes(format);
    const maxSize = format === "video" ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (!accepted.includes(file.type)) { setErrors(previous => ({ ...previous, media: "Unsupported file type for this ad format." })); event.target.value = ""; return; }
    if (file.size > maxSize) { setErrors(previous => ({ ...previous, media: "The file is too large. Maximum size is " + (format === "video" ? "50 MB" : "10 MB") + "." })); event.target.value = ""; return; }
    let prepared = { file, previewUrl: URL.createObjectURL(file), width: 0, height: 0 };
    if (format === "banner") {
      try { const resized = await resizeBannerImage(file, form.size); URL.revokeObjectURL(prepared.previewUrl); prepared = resized; }
      catch { setErrors(previous => ({ ...previous, media: "The image could not be resized for the selected banner size." })); event.target.value = ""; return; }
    }
    const nextMedia = { file: prepared.file, fileName: prepared.file.name, fileType: prepared.file.type, fileSize: prepared.file.size, previewUrl: prepared.previewUrl, sourceFile: file, videoDuration: 0, videoWidth: 0, videoHeight: 0, mediaWidth: prepared.width, mediaHeight: prepared.height };
    if (file.type.startsWith("video/")) {
      const probe = document.createElement("video");
      probe.preload = "metadata";
      probe.onloadedmetadata = () => {
        const duration = probe.duration;
        const width = probe.videoWidth;
        const height = probe.videoHeight;
        if (!Number.isFinite(duration) || duration < 1 || duration > 60) setErrors(previous => ({ ...previous, media: "Video duration must be between 1 and 60 seconds." }));
        else if (width < 320 || height < 180) setErrors(previous => ({ ...previous, media: "Video dimensions must be at least 320×180 pixels." }));
        else setErrors(previous => ({ ...previous, media: "" }));
        setForm(previous => ({ ...previous, ...nextMedia, videoDuration: duration, videoWidth: width, videoHeight: height, mediaWidth: width, mediaHeight: height }));
      };
      probe.onerror = () => setErrors(previous => ({ ...previous, media: "The video metadata could not be read. Choose a valid advertising video." }));
      probe.src = prepared.previewUrl;
    } else if (file.type.startsWith("image/")) { const image = new Image(); image.onload = () => setForm(previous => ({ ...previous, ...nextMedia, mediaWidth: image.naturalWidth, mediaHeight: image.naturalHeight })); image.src = prepared.previewUrl; } else { setForm(previous => ({ ...previous, ...nextMedia })); setErrors(previous => ({ ...previous, media: "" })); }
    event.target.value = "";
  };
  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Enter a campaign name.";
    if (!form.budget || Number(form.budget) <= 0) next.budget = "Enter a budget greater than zero.";
    if (!form.duration || Number(form.duration) <= 0) next.duration = "Enter a valid campaign duration.";
    if (["banner", "video", "native", "social"].includes(format) && !form.file) next.media = "Upload the creative required for this ad format.";
    if (format === "video" && form.file && (!form.videoDuration || form.videoDuration < 1 || form.videoDuration > 60 || form.videoWidth < 320 || form.videoHeight < 180)) next.media = "Choose a valid video between 1–60 seconds and at least 320×180 pixels.";
    if (["banner", "video", "native"].includes(format) && !form.title.trim()) next.title = "Add an ad title.";
    if (format === "social" && !form.content.trim()) next.content = "Add the social ad text.";
    if (format === "popup" && !form.content.trim()) next.content = "Add the popup content.";
    try { if (!form.destination || new URL(form.destination).protocol !== "https:") next.destination = "Use a valid HTTPS destination URL."; } catch { next.destination = "Use a valid HTTPS destination URL."; }
    return next;
  };
  const submit = () => {
    const next = validate(); setErrors(next); if (Object.keys(next).length) return;
    const campaign = { id: "campaign-" + Date.now(), name: form.name.trim(), format, budget: Number(form.budget), pricingModel: form.pricingModel, duration: Number(form.duration), spend: 0, status: "Draft", createdAt: new Date().toLocaleDateString("en-US"), creative: { type: format, fileName: form.fileName, fileType: form.fileType, fileSize: form.fileSize, previewUrl: form.previewUrl, videoDuration: form.videoDuration, width: form.mediaWidth, height: form.mediaHeight, title: form.title, description: form.description, text: form.content, cta: form.cta, destination: form.destination, size: form.size } };
    setData(previous => [...previous, campaign]); setNotice("Campaign and Creative saved as Draft. The Ad Server can match it to eligible publisher inventory when delivery is connected."); setForm(INITIAL_FORM); setErrors({});
  };
  const pricingOptions = PRICING_MODELS.filter(item => !item.future && (format === "video" ? ["CPV", "CPM", "CPC"].includes(item.id) : format === "direct-link" ? ["CPC", "CPA"].includes(item.id) : ["CPM", "CPC", "CPA"].includes(item.id)));
  return <div className="workspace-page"><PageHeader title="Create Campaign" description="المعلن يختار نوع الإعلان ويرفع الـCreative ويحدد إعدادات الحملة. الناشر لا يتدخل في هذه الخطوة." /><div className="step-layout"><section className="form-panel light-panel"><div className="panel-heading"><div><span className="eyebrow">STEP 1 · ADVERTISER CREATIVE</span><h2>Choose the ad type</h2></div><span className="phase-chip">Creative belongs to advertiser</span></div><div className="selection-grid format-selection advertiser-format-selection">{TYPE_OPTIONS.map(item => <button className={format === item.id ? "selection-card format-selection-card selected" : "selection-card format-selection-card"} type="button" key={item.id} onClick={() => chooseFormat(item.id)}><span className="format-card-preview"><Icon name={item.id === "video" ? "video" : item.id === "direct-link" ? "arrow" : item.id === "popup" ? "megaphone" : "image"} size={22} /></span><strong>{item.name}</strong><small>{item.description}</small><span className="selection-check"><Icon name="check" size={15} /></span></button>)}</div><div className="subsection-heading"><span className="eyebrow">CAMPAIGN DETAILS</span><h2>{TYPE_OPTIONS.find(item => item.id === format)?.name}</h2></div><div className="form-grid"><Field label="Campaign name" error={errors.name}><input className="input" value={form.name} onChange={event => update("name", event.target.value)} placeholder="Summer acquisition" /></Field><Field label="Campaign Duration (days)" error={errors.duration}><select className="input select" value={form.duration} onChange={event => update("duration", event.target.value)}>{[7, 14, 30, 60, 90].map(days => <option key={days} value={days}>{days} days</option>)}</select></Field></div><CreativeFields format={format} form={form} update={update} errors={errors} onMedia={handleMedia} onBannerSize={updateBannerSize} /><div className="subsection-heading"><span className="eyebrow">CAMPAIGN SETTINGS</span><h2>Budget and pricing</h2></div><div className="form-grid"><Field label="Budget" hint="Display value only" error={errors.budget}><input className="input" type="number" min="1" value={form.budget} onChange={event => update("budget", event.target.value)} placeholder="1000" /></Field><Field label="Pricing Model"><select className="input select" value={form.pricingModel} onChange={event => update("pricingModel", event.target.value)}>{pricingOptions.map(item => <option key={item.id} value={item.id}>{item.label} · {item.description}</option>)}</select></Field></div><div className="form-actions"><button className="primary-button" type="button" onClick={submit}><Icon name="check" size={16} />Save campaign and creative</button><button className="ghost-button" type="button" onClick={() => onNavigate("campaigns")}>Cancel</button></div>{notice && <div className="notice" role="status">{notice}</div>}</section><aside className="light-panel preview-panel"><span className="eyebrow">LIVE CREATIVE PREVIEW</span><h2>{TYPE_OPTIONS.find(item => item.id === format)?.name}</h2><CampaignPreview form={form} /><p>المعاينة تتغير حسب نوع الإعلان. يتم حفظ الـCreative مع الحملة، ثم يتولى Ad Server المطابقة مع مواقع الناشرين.</p></aside></div></div>;
}

function CampaignsPage({ data, onNavigate }) {
  if (!data.length) return <div className="workspace-page"><PageHeader title="Campaigns" description="راجع الحملات والـCreatives والميزانيات والحالات." action="Create Campaign" onAction={() => onNavigate("create-campaign")} /><EmptyState title="No campaigns yet" description="ابدأ باختيار نوع الإعلان ورفع الـCreative الخاص بحملتك." action="Create Campaign" onAction={() => onNavigate("create-campaign")} /></div>;
  return <div className="workspace-page"><PageHeader title="Campaigns" description="كل Creative محفوظ هنا مع حملته، بينما يتولى Ad Server التوزيع على المخزون المؤهل." action="Create Campaign" onAction={() => onNavigate("create-campaign")} /><section className="light-panel data-panel"><div className="panel-heading"><div><span className="eyebrow">CAMPAIGN INVENTORY</span><h2>{data.length} campaign{data.length === 1 ? "" : "s"}</h2></div><span className="result-count">Draft state</span></div><div className="data-list">{data.map(campaign => <div className="data-row campaign-row" key={campaign.id}><div className="row-main"><span className="row-icon"><Icon name="megaphone" /></span><div><strong>{campaign.name}</strong><small>{TYPE_OPTIONS.find(item => item.id === campaign.format)?.name || campaign.format} · {campaign.creative?.fileName || "No file"}</small></div></div><div className="row-detail"><span className="row-label">Budget</span><strong>{formatMoney(campaign.budget)}</strong></div><div className="row-detail"><span className="row-label">Pricing / Duration</span><strong>{campaign.pricingModel} · {campaign.duration}d</strong></div><span className="status-badge draft">{campaign.status}</span><button className="row-action" type="button" onClick={() => onNavigate("create-campaign")}><Icon name="edit" size={14} />New draft</button></div>)}</div></section></div>;
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
