import { useMemo, useState } from "react";
import { formatMoney } from "./config";

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

const websiteDefaults = { name: "", url: "", status: "Pending" };

function WebsiteForm({ form, setForm, errors, onCancel, onSubmit }) {
  const update = (key, value) => setForm(previous => ({ ...previous, [key]: value }));
  return <section className="form-panel light-panel"><div className="panel-heading"><div><span className="eyebrow">PUBLISHER / WEBSITE</span><h2>Add website</h2></div><button className="link-button" type="button" onClick={onCancel}>Cancel</button></div><p className="form-intro">أضف اسم موقعك ورابطه فقط. سيحصل الموقع بعد ذلك على Universal AdZora Code، بينما يتولى Ad Server اختيار الإعلان المناسب تلقائيًا.</p><div className="form-grid"><Field label="Website Name" error={errors.name}><input className="input" value={form.name} onChange={event => update("name", event.target.value)} placeholder="My website" /></Field><Field label="Website URL" hint="Use a full HTTPS address" error={errors.url}><input className="input" type="url" value={form.url} onChange={event => update("url", event.target.value)} placeholder="https://example.com" inputMode="url" autoComplete="url" /></Field></div><div className="form-actions"><button className="primary-button" type="button" onClick={onSubmit}><MiniIcon name="check" size={16} />Add website</button><button className="ghost-button" type="button" onClick={onCancel}>Cancel</button></div></section>;
}

function WebsitesPage({ data, setData, onNavigate, setNotice }) {
  const [showForm, setShowForm] = useState(data.websites.length === 0);
  const [form, setForm] = useState(websiteDefaults);
  const [errors, setErrors] = useState({});
  const addWebsite = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Enter a website name.";
    const normalizedUrl = form.url.trim().startsWith("http") ? form.url.trim() : "https://" + form.url.trim();
    try { const parsedUrl = new URL(normalizedUrl); if (parsedUrl.protocol !== "https:" || !parsedUrl.hostname.includes(".")) next.url = "Enter a valid HTTPS website address."; } catch { next.url = "Enter a valid HTTPS website address."; }
    setErrors(next); if (Object.keys(next).length) return;
    const website = { id: "website-" + Date.now(), name: form.name.trim(), url: new URL(normalizedUrl).toString(), status: "Pending", zones: 0, impressions: 0, clicks: 0, revenue: "$0.00" };
    setData(previous => ({ ...previous, websites: [...previous.websites, website] })); setForm(websiteDefaults); setErrors({}); setShowForm(false); setNotice("Website added. Your Universal AdZora Code is ready.");
  };
  return <div className="workspace-page"><PageHeader title="My Websites" description="أضف Website Name وWebsite URL فقط. لا يختار الناشر نوع الإعلان أو الـCreative." action="Add Website" onAction={() => setShowForm(true)} />{showForm && <WebsiteForm form={form} setForm={setForm} errors={errors} onCancel={() => { setShowForm(false); setErrors({}); }} onSubmit={addWebsite} />}{!data.websites.length && !showForm ? <section className="light-panel"><EmptyState icon="globe" title="No websites yet" description="أضف موقعك للحصول على Universal AdZora Code." action="Add Website" onAction={() => setShowForm(true)} /></section> : data.websites.length > 0 && <section className="light-panel data-panel"><div className="panel-heading"><div><span className="eyebrow">PUBLISHER WEBSITES</span><h2>{data.websites.length} website{data.websites.length === 1 ? "" : "s"}</h2></div><span className="result-count">Universal code ready</span></div><div className="data-list">{data.websites.map(website => <div className="data-row" key={website.id}><div className="row-main"><span className="row-icon"><MiniIcon name="globe" /></span><div><strong>{website.name}</strong><small>{website.url}</small></div></div><span className="status-badge pending">{website.status}</span><button className="row-action" type="button" onClick={() => onNavigate("ad-codes")}><span>Get Universal Code</span><MiniIcon name="arrow" size={15} /></button></div>)}</div></section>}</div>;
}

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
  return <div className="publisher-workspace">{notice && <div className="notice" role="status"><span>{notice}</span><button type="button" onClick={() => setNotice("")}>×</button></div>}{content === "websites" && <WebsitesPage data={data} setData={setData} onNavigate={onNavigate} setNotice={setNotice} />}{content === "ad-codes" && <AdCodesPage data={data} onNavigate={onNavigate} setNotice={setNotice} />}{content === "earnings" && <EarningsPage finance={finance} onNavigate={onNavigate} />}{content === "withdrawals" && <WithdrawalsPage finance={finance} withdrawals={withdrawals} setFinance={setFinance} setWithdrawals={setWithdrawals} setNotice={setNotice} />}{content === "transactions" && <PublisherTransactions withdrawals={withdrawals} />}</div>;
}