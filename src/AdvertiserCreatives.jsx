import { useEffect, useRef, useState } from "react";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm"];

function UploadIcon({ name, size = 22 }) {
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" };
  const paths = {
    upload: <><path d="M12 16V4M7 9l5-5 5 5" /><path d="M5 14v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5" /></>,
    image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9" r="1.5" /><path d="m21 15-5-5L5 20" /></>,
    video: <><rect x="3" y="5" width="14" height="14" rx="2" /><path d="m17 10 4-2v8l-4-2z" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    trash: <><path d="M4 7h16M10 11v6M14 11v6" /><path d="m6 7 1 13h10l1-13M9 7V4h6v3" /></>,
  };
  return <svg {...props}>{paths[name] || paths.upload}</svg>;
}

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return Math.max(1, Math.round(bytes / 1024)) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function CreativePreview({ creative }) {
  if (creative.type.startsWith("video/")) return <video className="creative-preview-media" src={creative.previewUrl} controls muted preload="metadata" />;
  return <img className="creative-preview-media" src={creative.previewUrl} alt={creative.name} />;
}

function CreativeCard({ creative, onRemove }) {
  return <article className="creative-card light-panel"><div className="creative-card-preview"><CreativePreview creative={creative} /><span className="creative-type">{creative.type.startsWith("video/") ? "VIDEO" : "IMAGE"}</span></div><div className="creative-card-body"><div className="creative-card-title"><div><strong>{creative.name}</strong><small>{formatSize(creative.size)} · {creative.createdAt}</small></div><span className="status-badge ready">Ready</span></div><p>Blob preview محفوظ في جلسة المتصفح فقط حتى يتم توصيل storage API.</p><button className="row-action" type="button" onClick={() => onRemove(creative.id)}><UploadIcon name="trash" size={15} />Remove</button></div></article>;
}

export default function AdvertiserCreatives({ data, setData }) {
  const inputRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => () => { if (selected?.previewUrl) URL.revokeObjectURL(selected.previewUrl); }, [selected]);

  const selectFile = (file) => {
    setError(""); setNotice("");
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) { setError("Supported files: JPG, PNG, WEBP, GIF, MP4, or WEBM."); return; }
    if (file.size > MAX_FILE_SIZE) { setError("The creative must be 10 MB or smaller."); return; }
    if (selected?.previewUrl) URL.revokeObjectURL(selected.previewUrl);
    const blob = new Blob([file], { type: file.type });
    setSelected({ file, blob, name: file.name, type: file.type, size: file.size, previewUrl: URL.createObjectURL(blob) });
  };

  const uploadBlob = async () => {
    if (!selected) { setError("Choose a creative file first."); return; }
    setError(""); setNotice(""); setIsUploading(true);
    const payload = new FormData();
    payload.append("creative", selected.blob, selected.name);
    await new Promise(resolve => setTimeout(resolve, 450));
    setData(previous => [...previous, { id: "creative-" + Date.now(), name: selected.name, type: selected.type, size: selected.size, previewUrl: selected.previewUrl, createdAt: new Date().toLocaleDateString("en-US") }]);
    setSelected(null); setIsUploading(false); setNotice("Blob prepared and added to the creative library. Storage API connection is the next backend step.");
  };

  const removeCreative = (id) => setData(previous => { const item = previous.find(creative => creative.id === id); if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl); return previous.filter(creative => creative.id !== id); });
  const handleDrop = (event) => { event.preventDefault(); setIsDragging(false); selectFile(event.dataTransfer.files?.[0]); };

  return <div className="workspace-page creatives-page"><div className="workspace-page-header"><div><span className="eyebrow">ADVERTISER / CREATIVE LIBRARY</span><h1>Creatives</h1><p>ارفع صورة أو فيديو كـBlob، راجعه قبل ربطه بحملة، ولا نعتبره جاهزًا للإنتاج قبل توصيل التخزين الحقيقي.</p></div><span className="phase-chip">Phase 3 · Blob-ready UI</span></div>{notice && <div className="notice" role="status"><span>{notice}</span><button type="button" onClick={() => setNotice("")}>×</button></div>}<section className="creative-upload-grid"><div className={isDragging ? "upload-dropzone is-dragging" : "upload-dropzone"} onDragOver={event => { event.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={handleDrop}><span className="upload-icon"><UploadIcon name="upload" size={27} /></span><h2>Upload creative</h2><p>اسحب الملف هنا أو اختره من جهازك. الحد الأقصى 10 MB.</p><button className="secondary-button" type="button" onClick={() => inputRef.current?.click()}><UploadIcon name="upload" size={16} />Choose file</button><input ref={inputRef} className="sr-only" type="file" accept={ACCEPTED_TYPES.join(",")} onChange={event => selectFile(event.target.files?.[0])} /><small>JPG · PNG · WEBP · GIF · MP4 · WEBM</small></div><div className="blob-contract light-panel"><span className="eyebrow">BLOB UPLOAD CONTRACT</span><h2>Safe frontend boundary</h2><ol><li>Validate type and size in the browser.</li><li>Create a Blob preview without exposing secrets.</li><li>Keep the creative as Draft/Ready until storage API responds.</li></ol><span className="contract-note">No fake production URL is generated.</span></div></section>{error && <div className="field-error upload-error" role="alert">{error}</div>}{selected && <section className="selected-creative light-panel"><div className="selected-preview"><CreativePreview creative={selected} /></div><div className="selected-info"><span className="eyebrow">READY TO UPLOAD</span><h2>{selected.name}</h2><p>{selected.type} · {formatSize(selected.size)}</p><div className="form-actions"><button className="primary-button" type="button" disabled={isUploading} onClick={uploadBlob}><UploadIcon name={isUploading ? "upload" : "check"} size={16} />{isUploading ? "Preparing blob…" : "Add to library"}</button><button className="ghost-button" type="button" disabled={isUploading} onClick={() => setSelected(null)}>Cancel</button></div></div></section>}{!data.length ? <section className="light-panel"><div className="empty-state"><span className="empty-state-icon"><UploadIcon name="image" size={25} /></span><h2>No creatives yet</h2><p>أضف أول مادة إعلانية لتصبح جاهزة لخطوة إنشاء الحملة.</p></div></section> : <section className="creative-library"><div className="panel-heading"><div><span className="eyebrow">LIBRARY</span><h2>{data.length} creative{data.length === 1 ? "" : "s"}</h2></div><span className="result-count">Browser session demo</span></div><div className="creative-grid">{data.map(creative => <CreativeCard key={creative.id} creative={creative} onRemove={removeCreative} />)}</div></section>}</div>;
}
