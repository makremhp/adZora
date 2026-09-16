import { useMemo, useState } from "react";
import { DEPOSIT_CONFIG, PAYMENT_METHODS, WITHDRAWAL_CONFIG, formatMoney } from "./config";

function Icon({ name, size = 17 }) {
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" };
  const paths = {
    wallet: <><path d="M4 6h15a2 2 0 0 1 2 2v11H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14" /><path d="M16 13h5" /><circle cx="16" cy="13" r=".5" /></>,
    "arrow-down": <><path d="M12 5v14M6 13l6 6 6-6" /></>,
    "arrow-up": <><path d="M12 19V5M6 11l6-6 6 6" /></>,
    card: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h3" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 10v6M12 7.5h.01" /></>,
  };
  return <svg {...props}>{paths[name] || paths.info}</svg>;
}

function Field({ label, hint, error, children }) {
  return <label className="field wallet-field"><span>{label}</span>{children}{hint && !error && <small>{hint}</small>}{error && <small className="field-error">{error}</small>}</label>;
}

const EMPTY_FORM = {
  amount: "",
  cwalletIdentifier: "",
  binanceUid: "",
  walletConnected: false,
  network: "",
  depositAddress: "",
  txid: "",
  screenshot: "",
};

function methodLabel(methodId) {
  return PAYMENT_METHODS.find(method => method.id === methodId)?.label || methodId;
}

function MethodSelector({ value, onChange, mode }) {
  const available = mode === "deposit" ? DEPOSIT_CONFIG.methods : WITHDRAWAL_CONFIG.methods;
  return <div className="wallet-method-selector" role="radiogroup" aria-label={`${mode} method`}>
    {PAYMENT_METHODS.filter(method => available.includes(method.id)).map(method => <button key={method.id} type="button" role="radio" aria-checked={value === method.id} className={value === method.id ? "wallet-method active" : "wallet-method"} onClick={() => onChange(method.id)}>
      <span className="wallet-method-icon"><Icon name={method.icon} size={17} /></span>
      <span><strong>{method.label}</strong><small>{method.description}</small></span>
      {value === method.id && <Icon name="check" size={15} />}
    </button>)}
  </div>;
}

function PageHeader({ mode, onNavigate }) {
  const deposit = mode === "deposit";
  return <div className="workspace-page-header"><div><span className="eyebrow">{deposit ? "ADVERTISER / FUNDS" : "PUBLISHER / FUNDS"}</span><h1>{deposit ? "Deposit funds" : "Withdraw earnings"}</h1><p>{deposit ? "اختر طريقة الإيداع وأرسل طلبًا تجريبيًا للمراجعة. لا تتم زيادة الرصيد من الواجهة." : "اختر طريقة السحب وأرسل طلبًا تجريبيًا. لا يوجد تنفيذ أو تحويل أموال من الواجهة."}</p></div><span className="phase-chip">Frontend demo</span></div>;
}

function TonNotice({ mode, onConnect, connected }) {
  return <div className="wallet-sdk-note" role="status"><div><Icon name="info" size={17} /><span>{connected ? "TON wallet SDK is not connected in this demo." : "TON wallet connection will be available after SDK integration."}</span></div><button className="secondary-button" type="button" onClick={onConnect}>{connected ? "Connection unavailable" : "Connect TON Wallet"}</button></div>;
}

function RequestForm({ mode, method, form, setForm, onSubmit, error, onTonConnect, tonAttempted }) {
  const deposit = mode === "deposit";
  const config = deposit ? DEPOSIT_CONFIG : WITHDRAWAL_CONFIG;
  const update = (key, value) => setForm(previous => ({ ...previous, [key]: value }));
  return <section className="form-panel light-panel wallet-request-panel">
    <div className="panel-heading"><div><span className="eyebrow">{deposit ? "NEW DEPOSIT REQUEST" : "NEW WITHDRAWAL REQUEST"}</span><h2>{deposit ? "Request a deposit" : "Request a withdrawal"}</h2></div><span className="status-badge pending">Pending only</span></div>
    <div className="wallet-form-grid">
      <Field label="Amount" error={error?.amount}><input className="input" type="number" min="0" step="0.01" inputMode="decimal" value={form.amount} onChange={event => update("amount", event.target.value)} placeholder="0.00" /></Field>
      {method === "cwallet" && <Field label="Cwallet Account / Identifier" error={error?.cwalletIdentifier}><input className="input" value={form.cwalletIdentifier} onChange={event => update("cwalletIdentifier", event.target.value)} placeholder="Enter your Cwallet identifier" /></Field>}
      {method === "ton" && <div className="wallet-field-span"><TonNotice mode={mode} onConnect={onTonConnect} connected={tonAttempted} /></div>}
      {method === "binance" && deposit && <><Field label="Network" error={error?.network}><select className="input select" value={form.network} onChange={event => update("network", event.target.value)}><option value="">Select network</option>{config.networks.map(network => <option key={network} value={network}>{network}</option>)}</select></Field><Field label="Deposit Address" hint="Generated by the backend after integration"><input className="input" value={form.depositAddress} readOnly placeholder="Available after backend integration" /></Field><Field label="TXID / Transaction Hash" error={error?.txid}><input className="input" value={form.txid} onChange={event => update("txid", event.target.value)} placeholder="Paste the transaction hash" /></Field><Field label="Optional Screenshot" hint="Optional supporting evidence"><input className="input wallet-file-input" type="file" accept="image/*" onChange={event => update("screenshot", event.target.files?.[0]?.name || "")} />{form.screenshot && <small className="wallet-file-name">{form.screenshot}</small>}</Field></>}
      {method === "binance" && !deposit && <Field label="Binance ID / UID" error={error?.binanceUid}><input className="input" value={form.binanceUid} onChange={event => update("binanceUid", event.target.value)} placeholder="Enter recipient Binance UID" /></Field>}
    </div>
    {method === "cwallet" && <p className="wallet-help"><Icon name="info" size={15} />Your {deposit ? "deposit" : "withdrawal"} will remain pending until it is reviewed.</p>}
    {method === "ton" && <p className="wallet-help"><Icon name="info" size={15} />No fake wallet connection is created. The request remains a frontend demo until the SDK is integrated.</p>}
    {method === "binance" && !deposit && <p className="wallet-help"><Icon name="info" size={15} />The transaction reference is produced by the system after a real withdrawal; it is not requested from the recipient now.</p>}
    <div className="form-actions"><button className="primary-button" type="button" onClick={onSubmit}><Icon name={deposit ? "arrow-down" : "arrow-up"} size={16} />{deposit ? "Submit Deposit Request" : "Request Withdrawal"}</button></div>
  </section>;
}

function RequestList({ mode, requests }) {
  const deposit = mode === "deposit";
  return <section className="light-panel data-panel wallet-request-list"><div className="panel-heading"><div><span className="eyebrow">{deposit ? "DEPOSIT STATUS" : "WITHDRAWAL STATUS"}</span><h2>Recent requests</h2></div><span className="result-count">{requests.length} records</span></div>{!requests.length ? <div className="wallet-empty"><Icon name="clock" size={22} /><strong>No requests yet</strong><span>New requests will start as Pending and require review.</span></div> : <div className="data-list">{requests.map(request => <article className="data-row wallet-request-row" key={request.id}><div className="row-main"><span className="row-icon"><Icon name={deposit ? "arrow-down" : "arrow-up"} /></span><div><strong>{methodLabel(request.method)} · {formatMoney(request.amount)}</strong><small>{request.createdAt} · {request.network || request.destination || "Demo request"}</small></div></div><span className="status-badge pending">{request.status}</span></article>)}</div>}</section>;
}

export default function WalletWorkspace({ mode = "deposit", requests = [], setRequests = () => {}, available = 0 }) {
  const deposit = mode === "deposit";
  const [method, setMethod] = useState(deposit ? DEPOSIT_CONFIG.methods[0] : WITHDRAWAL_CONFIG.methods[0]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState("");
  const [tonAttempted, setTonAttempted] = useState(false);
  const config = deposit ? DEPOSIT_CONFIG : WITHDRAWAL_CONFIG;
  const heading = useMemo(() => deposit ? "Deposit" : "Withdrawal", [deposit]);

  const changeMethod = nextMethod => { setMethod(nextMethod); setForm(previous => ({ ...EMPTY_FORM, amount: previous.amount })); setErrors({}); setNotice(""); setTonAttempted(false); };
  const connectTon = () => { setTonAttempted(true); setNotice("TON wallet connection will be available after SDK integration."); };
  const submit = () => {
    const next = {};
    const amount = Number(form.amount);
    if (!amount || amount <= 0) next.amount = "Enter a valid amount.";
    if (!deposit && amount < config.minimumAmount) next.amount = `Minimum withdrawal is ${formatMoney(config.minimumAmount)}.`;
    if (!deposit && amount > available) next.amount = "The amount exceeds the demo available earnings.";
    if (method === "cwallet" && !form.cwalletIdentifier.trim()) next.cwalletIdentifier = "Enter a Cwallet account or identifier.";
    if (method === "binance" && deposit && !form.network) next.network = "Select a network.";
    if (method === "binance" && deposit && !form.txid.trim()) next.txid = "Enter the transaction hash.";
    if (method === "binance" && !deposit && !form.binanceUid.trim()) next.binanceUid = "Enter the Binance ID / UID.";
    setErrors(next);
    if (Object.keys(next).length) return;
    const request = {
      id: `demo-${mode}-${Date.now()}`,
      type: mode,
      method,
      amount,
      currency: config.currency,
      status: config.status,
      createdAt: new Date().toLocaleString("en-US"),
      destination: method === "cwallet" ? form.cwalletIdentifier.trim() : method === "binance" ? (deposit ? form.depositAddress.trim() : form.binanceUid.trim()) : "TON wallet pending SDK integration",
      txid: deposit && method === "binance" ? form.txid.trim() : "",
      screenshot: deposit && method === "binance" ? form.screenshot : "",
      network: deposit && method === "binance" ? form.network : method === "ton" ? "TON" : "",
    };
    setRequests(previous => [request, ...previous]);
    setForm(EMPTY_FORM);
    setErrors({});
    setNotice(`${heading} request created as Pending. No balance was changed.`);
  };

  return <div className="workspace-page wallet-workspace"><PageHeader mode={mode} /><section className="wallet-method-panel light-panel"><div className="panel-heading"><div><span className="eyebrow">{deposit ? "DEPOSIT METHODS" : "WITHDRAWAL METHODS"}</span><h2>Choose a method</h2></div><span className="phase-chip">Demo state only</span></div><MethodSelector mode={mode} value={method} onChange={changeMethod} />{!deposit && <div className="withdrawal-availability"><span>Available demo earnings</span><strong>{formatMoney(available)}</strong><small>Minimum withdrawal: {formatMoney(WITHDRAWAL_CONFIG.minimumAmount)}</small></div>}</section>{notice && <div className="notice wallet-notice" role="status"><span>{notice}</span><button type="button" onClick={() => setNotice("")} aria-label="Dismiss notice">×</button></div>}<RequestForm mode={mode} method={method} form={form} setForm={setForm} onSubmit={submit} error={errors} onTonConnect={connectTon} tonAttempted={tonAttempted} /><RequestList mode={mode} requests={requests} /></div>;
}