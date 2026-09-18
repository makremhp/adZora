import { useNotifications } from "./NotificationSystem";

function DetailIcon({ name, size = 17 }) {
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" };
  const paths = {
    arrow: <path d="m15 18-6-6 6-6" />,
    copy: <><rect x="8" y="8" width="11" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h2" /></>,
    trend: <><path d="M3 17 9 11l4 4 8-9" /><path d="M16 6h5v5" /></>,
    eye: <><path d="M2.5 12s3.5-5 9.5-5 9.5 5 9.5 5-3.5 5-9.5 5-9.5-5-9.5-5Z" /><circle cx="12" cy="12" r="2.2" /></>,
    wallet: <><path d="M4 6h15a2 2 0 0 1 2 2v11H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14" /><path d="M16 13h5" /><circle cx="16" cy="13" r=".5" /></>,
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18" /></>,
    check: <path d="m5 12 4 4L19 6" />,
  };
  return <svg {...props}>{paths[name] || paths.globe}</svg>;
}

function getDomain(url) {
  try { return new URL(url).hostname; } catch { return url; }
}

function codeFor(website) {
  return `<!-- AdZora Universal Code -->\n<script src="https://ad-zora.vercel.app/ad.js" data-adzora-website="${website.id}" async></script>`;
}

function buildStats(website) {
  const impressions = website.impressions || 0;
  const clicks = website.clicks || 0;
  const earnings = website.earnings || 0;
  const ctr = impressions ? `${((clicks / impressions) * 100).toFixed(2)}%` : "--";
  return [["Impressions", impressions.toLocaleString("en-US"), "eye"], ["Clicks", clicks.toLocaleString("en-US"), "trend"], ["CTR", ctr, "trend"], ["Earnings", `$${earnings.toFixed(2)}`, "wallet"]];
}

export default function WebsiteDetailPage({ website, websiteIndex = 0, onBack, onAnalytics }) {
  const { notify } = useNotifications();
  if (!website) return <div className="workspace-page"><section className="light-panel"><div className="empty-state"><span className="empty-state-icon"><DetailIcon name="globe" size={25} /></span><h2>Website not found</h2><p>Select a website from your publisher inventory to view its details.</p><button className="secondary-button" type="button" onClick={onBack}>Back to Websites</button></div></section></div>;
  const code = codeFor(website);
  const domain = getDomain(website.url);
  const copy = async (value, message) => {
    try { await navigator.clipboard.writeText(value); notify(message, "success"); } catch { notify("Copy is unavailable in this browser.", "error"); }
  };
  return <div className="workspace-page website-detail-page">
    <div className="workspace-page-header"><div><button className="link-button detail-back-button" type="button" onClick={onBack}><DetailIcon name="arrow" size={15} />Back to Websites</button><h1>{website.name}</h1><p className="website-domain">{domain}</p></div><button className="secondary-button" type="button" onClick={() => onAnalytics(website.id)}><DetailIcon name="trend" size={16} />View Analytics</button></div>
    <section className="light-panel website-detail-summary"><div><h2>{website.name}</h2><p className="website-long-domain">{website.url}</p></div><div className="website-summary-facts"><span><small>Status</small><strong className={website.status === "Active" ? "status-text-active" : "status-text-pending"}>{website.status || "Pending"}</strong></span><span><small>Date Added</small><strong>{website.dateAdded || "—"}</strong></span></div></section>
    {website.status !== "Active" && <section className="light-panel status-explainer-panel"><DetailIcon name="globe" size={16} /><div><strong>{website.status || "Pending"}</strong><p>Waiting for verification. Add the AdZora Universal Code to your website, then verify it to start receiving eligible ads.</p></div></section>}
     <section className="light-panel website-code-panel"><div className="panel-heading"><div><span className="eyebrow">UNIVERSAL ADZORA CODE</span><h2>One code for this website</h2></div><span className="status-badge ready">Universal</span></div><p className="muted-copy">Paste this code into your website. AdZora handles eligible campaign selection after the tracking endpoint is connected.</p><pre className="code-box website-detail-code"><code>{code}</code></pre><div className="code-actions"><button className="primary-button" type="button" onClick={() => copy(code, "Ad code copied successfully")}><DetailIcon name="copy" size={16} />Copy Code</button></div></section>
    {website.directLink && <section className="light-panel website-code-panel"><div className="panel-heading"><div><span className="eyebrow">DIRECT LINK</span><h2>Optional direct link</h2></div></div><div className="direct-link-value">{website.directLink}</div><div className="code-actions"><button className="secondary-button" type="button" onClick={() => copy(website.directLink, "Direct link copied.")}><DetailIcon name="copy" size={16} />Copy Link</button></div></section>}
    <section className="analytics-metric-grid website-detail-stats">{buildStats(website, websiteIndex).map(([label, value, icon]) => <article className="metric-card analytics-metric" key={label}><div className="metric-top"><span className="metric-icon"><DetailIcon name={icon} size={16} /></span><span className="metric-label">{label}</span></div><strong className="metric-value">{value}</strong><span className="metric-hint">This website</span></article>)}</section>
  </div>;
}