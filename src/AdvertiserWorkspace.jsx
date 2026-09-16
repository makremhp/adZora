import { useEffect, useMemo, useRef, useState } from "react";
import { PRICING_MODELS, formatMoney } from "./config";
function Icon({ name, size = 17 }) { const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" }; const paths = { plus: <><path d="M12 5v14M5 12h14" /></>, megaphone: <><path d="m3 11 18-5v12L3 14z" /><path d="M11 15v5M6 16l1.5 4" /></>, image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9" r="1.5" /><path d="m21 15-5-5L5 20" /></>, video: <><rect x="3" y="5" width="14" height="14" rx="2" /><path d="m17 10 4-2v8l-4-2z" /></>, check: <path d="m5 12 4 4L19 6" />, upload: <><path d="M12 16V4M7 9l5-5 5 5" /><path d="M5 14v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5" /></>, shield: <><path d="M12 3 4 6v5c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6z" /><path d="m8 12 2.5 2.5L16 9" /></> }; return <svg {...props}>{paths[name] || paths.megaphone}</svg>; }
function Field({ label, error, hint, children }) { return <label className="field"><span>{label}</span>{children}{hint && !error && <small>{hint}</small>}{error && <small className="field-error">{error}</small>}</label>; }
function PageHeader({ title, description, action, onAction }) { return <div className="workspace-page-header"><div><span className="eyebrow">ADVERTISER WORKSPACE</span><h1>{title}</h1><p>{description}</p></div>{action && <button className="primary-button" type="button" onClick={onAction}><Icon name="plus" size={16} />{action}</button>}</div>; }
const TYPES = [{ id: "native", name: "Native", description: "صورة وعنوان ووصف داخل المحتوى", icon: "image" }, { id: "social", name: "Social", description: "منشور اجتماعي كامل بعناصر ثابتة", icon: "megaphone" }, { id: "video", name: "Video", description: "فيديو مع تشغيل تلقائي وزر إغلاق", icon: "video" }];
const INITIAL = { name: "", format: "native", budget: "", pricingModel: "CPM", duration: "30", targeting: "", title: "", description: "", cta: "Learn more", brandName: "", username: "", text: "", destination: "", file: null, fileName: "", fileType: "", previewUrl: "", profileFile: null, profileFileName: "", profileFileType: "", profileUrl: "", postFile: null, postFileName: "", postFileType: "", postUrl: "" };
function hasRequiredMedia(form) { return form.format === "social" ? Boolean(form.profileFile && form.postFile) : Boolean(form.file); }
export function detectAdFont(text = "") { return /[\u0600-\u06FF]/.test(String(text)) ? "\"Tajawal\", sans-serif" : "\"Inter\", Arial, sans-serif"; }

function FormatVisual({ type }) {
  const visuals = {
    native: <><rect x="7" y="7" width="27" height="34" rx="4" /><path d="M39 14h43M39 23h34M39 32h25" /><path d="M43 38h19" /></>,
    social: <><rect x="7" y="5" width="78" height="38" rx="7" /><circle cx="18" cy="13" r="3.5" /><path d="M26 13h22M14 23h63M14 28h63" /><path d="M15 36h4M23 36h4M31 36h4" /></>,
    video: <><rect x="7" y="7" width="78" height="34" rx="6" /><path d="m42 15 13 9-13 9z" /><path d="M16 36h29M58 36h16" /></>,
  };
  return <span className={`format-card-visual format-card-visual-${type}`} aria-hidden="true"><svg viewBox="0 0 92 48">{visuals[type]}</svg></span>;
}

function TypeSelector({ value, onChange }) {
  return <div className="ad-type-selector" role="radiogroup" aria-label="Ad format">
    {TYPES.map(item => <button type="button" role="radio" aria-checked={value === item.id} key={item.id} className={value === item.id ? "ad-type-option active" : "ad-type-option"} onClick={() => onChange(item.id)}>
      <span className="ad-type-option-top"><span className="ad-type-icon"><Icon name={item.icon} size={18} /></span>{value === item.id && <span className="ad-type-selected"><Icon name="check" size={13} />Selected</span>}</span>
      <FormatVisual type={item.id} />
      <span className="ad-type-copy"><strong>{item.name}</strong><small>{item.description}</small></span>
    </button>)}
  </div>;
}
function MediaField({ form, update, error, kind = "file", label, accept }) { const prefix = kind === "file" ? "" : kind; const inputId = "campaign-" + (prefix || "main") + "-file"; const fileKey = prefix ? prefix + "File" : "file"; const nameKey = prefix ? prefix + "FileName" : "fileName"; const typeKey = prefix ? prefix + "FileType" : "fileType"; const urlKey = prefix ? prefix + "Url" : "previewUrl"; const isVideo = form.format === "video"; const resolvedAccept = accept || (isVideo ? "video/mp4,video/webm,video/quicktime" : "image/jpeg,image/png,image/webp,image/gif"); const onFile = event => { const file = event.target.files?.[0]; if (!file) return; update({ [fileKey]: file, [nameKey]: file.name, [typeKey]: file.type, [urlKey]: URL.createObjectURL(file) }); }; return <Field label={label || (isVideo ? "Upload Video" : "Upload Image")} error={error} hint="Frontend preview only. Storage API is not connected."><div className="upload-control"><span className="upload-control-icon"><Icon name={isVideo ? "video" : "image"} size={20} /></span><label className="upload-control-button" htmlFor={inputId}>{isVideo ? "Choose video" : "Choose image"}</label><input id={inputId} className="sr-only" type="file" accept={resolvedAccept} onChange={onFile} /><span className="upload-file-name">{form[nameKey] || "No file selected"}</span></div></Field>; }
function ContentFields({ form, update, errors }) {
  const format = form.format;
  return <div className="form-grid">
    {format === "social" ? <><MediaField form={form} update={update} kind="profile" label="Profile Image" accept="image/jpeg,image/png,image/webp,image/gif" error={errors.profileFile} /><MediaField form={form} update={update} kind="post" label="Post Image" accept="image/jpeg,image/png,image/webp,image/gif" error={errors.postFile} /></> : <MediaField form={form} update={update} error={errors.file} label={format === "video" ? "Video" : "Image"} />}
    <Field label="Destination URL" error={errors.destination}><input className="input" type="url" value={form.destination} onChange={event => update({ destination: event.target.value })} placeholder="https://example.com/offer" /></Field>
    {format === "native" && <><Field label="Title" error={errors.title}><input className="input" value={form.title} onChange={event => update({ title: event.target.value })} placeholder="Sponsored headline" /></Field><Field label="Description" error={errors.description}><textarea className="input textarea" value={form.description} onChange={event => update({ description: event.target.value })} placeholder="Explain the offer briefly" /></Field><Field label="CTA" hint="Optional — defaults to Learn More"><input className="input" value={form.cta} onChange={event => update({ cta: event.target.value })} placeholder="Learn more" /></Field></>}
    {format === "social" && <><Field label="Account / Brand Name" error={errors.brandName}><input className="input" value={form.brandName} onChange={event => update({ brandName: event.target.value })} placeholder="Your Brand" /></Field><Field label="Username" error={errors.username}><input className="input" value={form.username} onChange={event => update({ username: event.target.value })} placeholder="@yourbrand" /></Field><Field label="Post Text" error={errors.text}><textarea className="input textarea" value={form.text} onChange={event => update({ text: event.target.value })} placeholder="Write the sponsored post text" /></Field></>}
    {format === "video" && <Field label="Title" error={errors.title}><input className="input" value={form.title} onChange={event => update({ title: event.target.value })} placeholder="Video campaign" /></Field>}
  </div>;
}

const FIXED_BEHAVIOR_NOTES = {
  native: ["Sponsored label, image sizing, and CTA styling are fixed by AdZora — not advertiser-editable."],
  social: ["Like, Comment, Share, Save, the like count, views, and the ADZORA badge are fixed AdZora elements.", "Clicking the ad opens the destination URL, then the ad hides automatically after 5 seconds."],
  video: ["Autoplay, sound request, loop, and the close button are controlled by AdZora.", "Sound follows the browser's autoplay policy — the advertiser cannot force sound on."],
};
function BehaviorFields({ format }) {
  return <div className="behavior-grid">{(FIXED_BEHAVIOR_NOTES[format] || []).map(note => <div className="behavior-note" key={note}>{note}</div>)}</div>;
}

function SocialActionIcon({ name }) {
  const paths = {
    like: <path d="M20.8 8.5c0 5.5-8.8 10.2-8.8 10.2S3.2 14 3.2 8.5A4.5 4.5 0 0 1 12 6.2a4.5 4.5 0 0 1 8.8 2.3Z" />,
    comment: <path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.8 8.8 0 0 1-4.1-1L4 19l1-3.4A7.2 7.2 0 0 1 4.5 12 7.5 7.5 0 0 1 12 4.5a7.5 7.5 0 0 1 8 7Z" />,
    share: <><path d="M21 3 10 14" /><path d="m21 3-7 18-4-7-7-4Z" /></>,
    save: <path d="M6 4.5A2.5 2.5 0 0 1 8.5 2h7A2.5 2.5 0 0 1 18 4.5V21l-6-3-6 3Z" />,
    views: <><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.5" /></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

// Official AdZora ad components. This is the single source of truth: the same
// markup that renders here in the Live Preview is what a delivered ad uses.
function NativeAd({ image, title, description, cta, destinationUrl }) {
  const open = () => { if (destinationUrl) window.open(destinationUrl, "_blank", "noopener,noreferrer"); };
  return <div className="adzora-native" data-url={destinationUrl || undefined} role="link" tabIndex={0} onClick={open} onKeyDown={event => (event.key === "Enter" || event.key === " ") && open()}>
    {image ? <img src={image} alt="Native Advertisement" /> : <div className="adzora-native-media-placeholder"><Icon name="image" size={27} /><span>Ad image</span></div>}
    <div className="adzora-native-info">
      <div className="adzora-native-sponsored">Sponsored</div>
      <h3 style={{ fontFamily: detectAdFont(title) }}>{title || "Your advertisement title"}</h3>
      <p style={{ fontFamily: detectAdFont(description) }}>{description || "Advertisement description will appear here."}</p>
      <a href={destinationUrl || "#"} className="adzora-native-cta" style={{ fontFamily: detectAdFont(cta) }} target="_blank" rel="noopener noreferrer" onClick={event => event.stopPropagation()}>{cta || "Learn More"}</a>
    </div>
  </div>;
}

function SocialAd({ profileImage, postImage, brandName, username, text, destinationUrl }) {
  const [hidden, setHidden] = useState(false);
  const hideTimer = useRef(null);
  useEffect(() => { setHidden(false); if (hideTimer.current) clearTimeout(hideTimer.current); hideTimer.current = null; }, [profileImage, postImage, brandName, username, text, destinationUrl]);
  useEffect(() => () => { if (hideTimer.current) clearTimeout(hideTimer.current); }, []);
  const open = () => {
    if (!destinationUrl || hideTimer.current) return;
    window.open(destinationUrl, "_blank", "noopener,noreferrer");
    hideTimer.current = setTimeout(() => setHidden(true), 5000);
  };
  if (hidden) return <div className="adzora-social-hidden-note"><span>The ad closed 5 seconds after the click, as AdZora always does.</span><button className="ghost-button" type="button" onClick={() => { setHidden(false); hideTimer.current = null; }}>Reset preview</button></div>;
  return <div className="adzora-social" data-url={destinationUrl || undefined} role="link" tabIndex={0} onClick={open} onKeyDown={event => (event.key === "Enter" || event.key === " ") && open()}>
    <div className="adzora-social-header">
      {profileImage ? <img className="adzora-social-avatar" src={profileImage} alt="Profile" /> : <span className="adzora-social-avatar-placeholder">A</span>}
      <div className="adzora-social-account"><strong style={{ fontFamily: detectAdFont(brandName) }}>{brandName || "Your Brand"}</strong><span style={{ fontFamily: detectAdFont(username) }}>{username || "@yourbrand"}</span></div>
      <div className="adzora-social-brand">ADZORA</div>
    </div>
    {postImage ? <img className="adzora-social-media" src={postImage} alt="Social Post" /> : <div className="adzora-social-media-placeholder"><Icon name="image" size={27} /><span>Post image</span></div>}
    <div className="adzora-social-actions">
      <button type="button" aria-label="Like" onClick={event => event.stopPropagation()}><SocialActionIcon name="like" /></button>
      <button type="button" aria-label="Comment" onClick={event => event.stopPropagation()}><SocialActionIcon name="comment" /></button>
      <button type="button" aria-label="Share" onClick={event => event.stopPropagation()}><SocialActionIcon name="share" /></button>
      <button type="button" className="adzora-social-save" aria-label="Save" onClick={event => event.stopPropagation()}><SocialActionIcon name="save" /></button>
    </div>
    <div className="adzora-social-stats">1,248 likes</div>
    <div className="adzora-social-views"><SocialActionIcon name="views" /><span>8,421 views</span></div>
    <div className="adzora-social-caption"><b style={{ fontFamily: detectAdFont(brandName) }}>{brandName || "Your Brand"}</b><span style={{ fontFamily: detectAdFont(text) }}>{text || "Your sponsored post text will appear here."}</span><span className="adzora-social-sponsored">Sponsored · Learn more</span></div>
  </div>;
}

function VideoAd({ videoUrl, videoType, title }) {
  const videoRef = useRef(null);
  const [closed, setClosed] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [showClose, setShowClose] = useState(false);
  useEffect(() => {
    setClosed(false);
    setAutoplayBlocked(false);
    setShowClose(false);
    if (!videoUrl) return undefined;
    const timer = window.setTimeout(() => setShowClose(true), 6000);
    return () => window.clearTimeout(timer);
  }, [videoUrl]);
  useEffect(() => {
    if (closed || !videoUrl || !videoRef.current) return undefined;
    const video = videoRef.current;
    let cancelled = false;
    const attemptPlay = () => {
      const playPromise = video.play();
      if (playPromise?.catch) playPromise.catch(error => {
        if (!cancelled && error?.name === "NotAllowedError") setAutoplayBlocked(true);
      });
    };
    attemptPlay();
    video.addEventListener("loadeddata", attemptPlay);
    return () => { cancelled = true; video.removeEventListener("loadeddata", attemptPlay); };
  }, [closed, videoUrl]);
  const close = () => { videoRef.current?.pause(); setClosed(true); };
  const playWithSound = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    const playPromise = video.play();
    if (playPromise?.then) playPromise.then(() => setAutoplayBlocked(false)).catch(error => {
      if (error?.name === "NotAllowedError") setAutoplayBlocked(true);
    });
  };
  if (closed) return <div className="ad-preview-closed-note"><span>Closed — the close button always pauses and hides the AdZora video ad.</span><button className="ghost-button" type="button" onClick={() => setClosed(false)}>Reset preview</button></div>;
  return <div className="adzora-autoplay">
    {videoUrl ? <><video ref={videoRef} autoPlay loop playsInline preload="auto"><source src={videoUrl} type={videoType || "video/mp4"} /></video><span className="adzora-video-brand">AdZora</span><span className="adzora-video-title" style={{ fontFamily: detectAdFont(title) }}>{title || "Video campaign"}</span>{autoplayBlocked && <button type="button" className="adzora-autoplay-sound" onClick={event => { event.stopPropagation(); playWithSound(); }}>تشغيل الصوت</button>}{showClose && <button type="button" className="adzora-autoplay-close" aria-label="Close advertisement" onClick={close}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg></button>}</> : <div className="adzora-video-placeholder"><Icon name="video" size={30} /><span>Video preview</span></div>}
  </div>;
}

function Preview({ form }) {
  if (form.format === "native") return <div className="ad-preview live-preview-shell"><NativeAd image={form.previewUrl} title={form.title} description={form.description} cta={form.cta} destinationUrl={form.destination} /></div>;
  if (form.format === "social") return <div className="ad-preview live-preview-shell"><SocialAd profileImage={form.profileUrl} postImage={form.postUrl} brandName={form.brandName} username={form.username} text={form.text} destinationUrl={form.destination} /></div>;
  return <div className="ad-preview live-preview-shell"><VideoAd videoUrl={form.previewUrl && form.fileType.startsWith("video") ? form.previewUrl : ""} videoType={form.fileType} title={form.title} /></div>;
}

function CreateCampaign({ data, setData, onNavigate }) {
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const update = patch => setForm(previous => ({ ...previous, ...patch }));
  const changeFormat = format => update({ format, file: null, fileName: "", fileType: "", previewUrl: "", profileFile: null, profileFileName: "", profileFileType: "", profileUrl: "", postFile: null, postFileName: "", postFileType: "", postUrl: "", destination: "" });
  const submit = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Enter a campaign name.";
    if (!form.destination.trim()) next.destination = "Enter a destination URL."; else { try { const url = new URL(form.destination); if (!["http:", "https:"].includes(url.protocol)) next.destination = "Use an HTTP or HTTPS destination."; } catch { next.destination = "Enter a valid destination URL."; } }
    if (!form.budget || Number(form.budget) <= 0) next.budget = "Add a campaign budget.";
    if (!hasRequiredMedia(form)) { if (form.format === "social") { next.profileFile = "Select a profile image."; next.postFile = "Select a post image."; } else next.file = "Select a media file for this format."; }
    if (form.format === "native") { if (!form.title.trim()) next.title = "Enter a title."; if (!form.description.trim()) next.description = "Enter a description."; }
    if (form.format === "social") { if (!form.brandName.trim()) next.brandName = "Enter an account or brand name."; if (!form.username.trim()) next.username = "Enter a username."; if (!form.text.trim()) next.text = "Enter the post text."; }
    if (form.format === "video" && !form.title.trim()) next.title = "Enter a title.";
    setErrors(next);
    if (Object.keys(next).length) return;
    const campaign = { id: "campaign-" + Date.now(), name: form.name.trim(), format: form.format, status: "Draft", budget: Number(form.budget), pricingModel: form.pricingModel, duration: Number(form.duration) || 30, targeting: form.targeting || "All eligible publishers", creative: { fileName: form.fileName, fileType: form.fileType, previewUrl: form.previewUrl, profileFileName: form.profileFileName, profileUrl: form.profileUrl, postFileName: form.postFileName, postUrl: form.postUrl, title: form.title, description: form.description, brandName: form.brandName, username: form.username, text: form.text, cta: form.cta, destination: form.destination }, createdAt: new Date().toISOString() };
    setData(previous => [campaign, ...previous]);
    onNavigate("campaigns");
  };
  return <div className="workspace-page campaign-builder">
    <PageHeader title="Create Campaign" description="اختر Native أو Social أو Video؛ ستظهر فقط الحقول المناسبة للصيغة. كل صيغة لها متطلبات عرض واضحة." action="View Campaigns" onAction={() => onNavigate("campaigns")} />
    <section className="light-panel form-section"><div className="panel-heading"><div><span className="eyebrow">1 / AD FORMAT</span><h2>What are you promoting?</h2></div><span className="phase-chip">3 formats only</span></div><TypeSelector value={form.format} onChange={changeFormat} /></section>
    <section className="light-panel form-section"><div className="panel-heading"><div><span className="eyebrow">2 / CAMPAIGN</span><h2>Campaign settings</h2></div></div><div className="form-grid"><Field label="Campaign Name" error={errors.name}><input className="input" value={form.name} onChange={event => update({ name: event.target.value })} placeholder="Summer launch" /></Field><Field label="Campaign Budget" error={errors.budget}><input className="input" type="number" min="1" value={form.budget} onChange={event => update({ budget: event.target.value })} placeholder="500" /></Field><Field label="Pricing Model"><select className="input select" value={form.pricingModel} onChange={event => update({ pricingModel: event.target.value })}>{PRICING_MODELS.filter(item => !item.future).map(item => <option key={item.id}>{item.id}</option>)}</select></Field><Field label="Campaign Duration (days)"><input className="input" type="number" min="1" value={form.duration} onChange={event => update({ duration: event.target.value })} /></Field><Field label="Targeting" hint="Optional: country, device, audience, or publisher rules"><input className="input" value={form.targeting} onChange={event => update({ targeting: event.target.value })} placeholder="All eligible publishers" /></Field></div></section>
    <section className="light-panel form-section"><div className="panel-heading"><div><span className="eyebrow">3 / CREATIVE</span><h2>{TYPES.find(item => item.id === form.format)?.name} content</h2></div><span className="phase-chip">Format-specific</span></div><ContentFields form={form} update={update} errors={errors} /></section>
     <section className="light-panel form-section"><div className="panel-heading"><div><span className="eyebrow">4 / AD BEHAVIOR</span><h2>Fixed by AdZora</h2></div></div><BehaviorFields format={form.format} /></section>
     <section className="light-panel preview-panel"><div className="panel-heading"><div><span className="eyebrow">LIVE PREVIEW</span><h2>Creative preview</h2></div><span className="phase-chip">Responsive</span></div><Preview form={form} /></section>
    <section className="light-panel form-section tracking-roadmap"><div className="panel-heading"><div><span className="eyebrow">5 / TRACKING</span><h2>Events prepared for the Ad Server</h2></div></div><div className="event-chip-list"><span>Impression</span><span>Click</span><span>Video View</span><span>Video Completion</span></div><p className="muted-copy">هذه أسماء الأحداث في نموذج الواجهة فقط. لا تعتمد الأرباح أو الإحصائيات على localStorage، ولا يوجد endpoint حقيقي حتى الآن.</p><div className="form-actions"><button className="primary-button" type="button" onClick={submit}><Icon name="check" size={16} />Save Campaign Draft</button><button className="ghost-button" type="button" onClick={() => onNavigate("campaigns")}>Cancel</button></div></section>
  </div>;
}

function CampaignsPage({ data, onNavigate }) { return <div className="workspace-page"><PageHeader title="Campaigns" description="كل حملة تفصل Creative عن Behavior وBudget وTargeting حتى يختار Ad Server الإعلان المؤهل فقط." action="Create Campaign" onAction={() => onNavigate("create-campaign")} />{!data.length ? <section className="light-panel"><div className="empty-state"><span className="empty-state-icon"><Icon name="megaphone" size={25} /></span><h2>No campaigns yet</h2><p>ابدأ بحملة، اختر نوع الإعلان، ثم استخدم المعاينة قبل الحفظ.</p><button className="secondary-button" type="button" onClick={() => onNavigate("create-campaign")}><Icon name="plus" size={16} />Create Campaign</button></div></section> : <section className="light-panel data-panel"><div className="panel-heading"><div><span className="eyebrow">CAMPAIGN LIBRARY</span><h2>{data.length} campaign{data.length === 1 ? "" : "s"}</h2></div><span className="result-count">Draft state</span></div><div className="data-list">{data.map(campaign => <div className="data-row campaign-row" key={campaign.id}><div className="row-main"><span className="row-icon"><Icon name={campaign.format === "video" ? "video" : "megaphone"} /></span><div><strong>{campaign.name}</strong><small>{TYPES.find(item => item.id === campaign.format)?.name || campaign.format} · {campaign.creative?.postFileName || campaign.creative?.fileName || "No media"}</small></div></div><div className="row-detail"><span className="row-label">Budget</span><strong>{formatMoney(campaign.budget)}</strong></div><div className="row-detail"><span className="row-label">Pricing / Duration</span><strong>{campaign.pricingModel} · {campaign.duration}d</strong></div><span className="status-badge draft">{campaign.status}</span></div>)}</div></section>}</div>; }
function FinancialPage({ kind }) { const labels = kind === "balance" ? ["Available Balance", "Reserved Balance", "Total Spent", "Total Deposited"] : ["Available Balance", "Campaign Spend", "Pending Review", "Total Deposited"]; return <div className="workspace-page"><PageHeader title={kind === "deposits" ? "Deposit funds" : kind === "balance" ? "Balance" : "Billing & Transactions"} description="الأرقام تجريبية فقط. لا توجد معالجة دفع أو محاسبة حقيقية متصلة." />{kind === "deposits" && <section className="form-panel light-panel"><div className="form-grid"><Field label="Deposit amount"><input className="input" type="number" min="1" placeholder="500" /></Field><Field label="Payment method"><select className="input select"><option>Demo card placeholder</option><option>Manual review</option></select></Field></div><div className="notice">Deposit UI only — payment processing is out of scope.</div></section>}<section className="metric-grid financial-metrics">{labels.map(label => <article className="metric-card" key={label}><span className="metric-label">{label}</span><strong className="metric-value">$0.00</strong><span className="metric-hint">Frontend demo value</span></article>)}</section><section className="light-panel data-panel"><div className="empty-state compact-empty"><Icon name="shield" size={25} /><h2>No financial records yet</h2><p>سيتم ربط الإيداعات والإنفاق والتقارير بمصدر محاسبي حقيقي في مرحلة Backend.</p></div></section></div>; }
export default function AdvertiserWorkspace({ page, data, setData, onNavigate }) { const content = useMemo(() => page, [page]); if (content === "campaigns") return <CampaignsPage data={data} onNavigate={onNavigate} />; if (content === "create-campaign") return <CreateCampaign data={data} setData={setData} onNavigate={onNavigate} />; if (["balance", "deposits", "billing", "transactions"].includes(content)) return <FinancialPage kind={content} />; return <div className="workspace-page"><PageHeader title={content === "reports" ? "Reports" : "Analytics"} description="هذه الشاشة ستتصل ببيانات الأداء بعد إضافة مصدر بيانات حقيقي." /><section className="light-panel"><div className="empty-state"><span className="empty-state-icon"><Icon name="shield" size={25} /></span><h2>No data yet</h2><p>لا توجد بيانات أداء في وضع الواجهة التجريبي. أنشئ حملة أولًا لتجهيز نقطة الربط التالية.</p><button className="secondary-button" type="button" onClick={() => onNavigate("create-campaign")}><Icon name="plus" size={16} />Create Campaign</button></div></section></div>; }
