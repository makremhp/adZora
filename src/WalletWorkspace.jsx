import { useEffect, useRef, useState } from "react";
import { BNB_NETWORK, DEPOSIT_CONFIG, PAYMENT_ASSETS, PAYMENT_METHODS, WITHDRAWAL_CONFIG, formatMoney } from "./config";
import { useNotifications } from "./NotificationSystem";
import { api } from "./api";

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
    copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
    upload: <><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" /></>,
    x: <path d="M6 6l12 12M18 6 6 18" />,
    receipt: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2Z" /><path d="M9 8h6M9 12h6" /></>,
  };
  return <svg {...props}>{paths[name] || paths.info}</svg>;
}

function Field({ label, hint, error, children }) {
  return <label className="field wallet-field"><span>{label}</span>{children}{hint && !error && <small>{hint}</small>}{error && <small className="field-error">{error}</small>}</label>;
}

function methodLabel(methodId) {
  const method = PAYMENT_METHODS.find(item => item.id === methodId);
  const asset = PAYMENT_ASSETS[methodId];
  return method ? `${method.label}${asset ? ` · ${asset}` : ""}` : methodId;
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

function PageHeader({ mode }) {
  const deposit = mode === "deposit";
  return <div className="workspace-page-header"><div><span className="eyebrow">{deposit ? "ADVERTISER / FUNDS" : "PUBLISHER / FUNDS"}</span><h1>{deposit ? "Deposit funds" : "Withdraw earnings"}</h1><p>{deposit ? "اختر طريقة الإيداع، راجع الفاتورة، وأرسل طلبك للمراجعة." : "اختر طريقة السحب وأرسل طلبك للمراجعة."}</p></div></div>;
}

function RequestList({ mode, requests }) {
  const deposit = mode === "deposit";
  return <section className="light-panel data-panel wallet-request-list"><div className="panel-heading"><div><span className="eyebrow">{deposit ? "DEPOSIT STATUS" : "WITHDRAWAL STATUS"}</span><h2>Recent requests</h2></div><span className="result-count">{requests.length} records</span></div>{!requests.length ? <div className="wallet-empty"><Icon name="clock" size={22} /><strong>No requests yet</strong><span>New requests will start as Pending and require review.</span></div> : <div className="data-list">{requests.map(request => { const createdAt = request.createdAt || (request.created_at ? new Date(request.created_at).toLocaleString("en-US") : ""); const invoiceId = request.invoiceId || request.invoice_id; const destinationLabel = request.network || request.paymentDestination || request.payment_destination || request.destination || "Pending review"; return <article className="data-row wallet-request-row" key={request.id}><div className="row-main"><span className="row-icon"><Icon name={deposit ? "arrow-down" : "arrow-up"} /></span><div><strong>{methodLabel(request.method)} · {formatMoney(request.amount)}</strong><small>{invoiceId ? `${invoiceId} · ` : ""}{createdAt} · {destinationLabel}</small></div></div><span className="status-badge pending">{request.status}</span></article>; })}</div>}</section>;
}

/* ---------------------------------------------------------------------- */
/* Withdrawal — unchanged behavior. Platform sends money to the user's    */
/* destination after Admin review. Do not mix this with the deposit flow. */
/* ---------------------------------------------------------------------- */

const EMPTY_WITHDRAWAL_FORM = { amount: "", cwalletIdentifier: "", binanceUid: "" };

function TonNotice({ onConnect, connected }) {
  return <div className="wallet-sdk-note" role="status"><div><Icon name="info" size={17} /><span>{connected ? "TON wallet connection is being set up." : "TON wallet connection will be available soon."}</span></div><button className="secondary-button" type="button" onClick={onConnect}>{connected ? "Connection unavailable" : "Connect TON Wallet"}</button></div>;
}

function WithdrawalForm({ method, form, setForm, onSubmit, error, onTonConnect, tonAttempted, submitting = false }) {
  const update = (key, value) => setForm(previous => ({ ...previous, [key]: value }));
  return <section className="form-panel light-panel wallet-request-panel">
    <div className="panel-heading"><div><span className="eyebrow">NEW WITHDRAWAL REQUEST</span><h2>Request a withdrawal</h2></div><span className="status-badge pending">Pending only</span></div>
    <div className="wallet-form-grid">
      <Field label="Amount" error={error?.amount}><input className="input" type="number" min="0" step="0.01" inputMode="decimal" value={form.amount} onChange={event => update("amount", event.target.value)} placeholder="0.00" /></Field>
      {method === "cwallet" && <Field label="Cwallet Account / Identifier" error={error?.cwalletIdentifier}><input className="input" value={form.cwalletIdentifier} onChange={event => update("cwalletIdentifier", event.target.value)} placeholder="Enter your Cwallet identifier" /></Field>}
      {method === "ton" && <div className="wallet-field-span"><TonNotice onConnect={onTonConnect} connected={tonAttempted} /></div>}
      {method === "binance" && <Field label="Binance ID / UID" error={error?.binanceUid}><input className="input" value={form.binanceUid} onChange={event => update("binanceUid", event.target.value)} placeholder="Enter recipient Binance UID" /></Field>}
    </div>
    {method === "cwallet" && <p className="wallet-help"><Icon name="info" size={15} />Your withdrawal will remain pending until it is reviewed.</p>}
    {method === "ton" && <p className="wallet-help"><Icon name="info" size={15} />You will be notified once direct TON wallet connection is available.</p>}
    {method === "binance" && <p className="wallet-help"><Icon name="info" size={15} />The transaction reference is produced by the system after a real withdrawal; it is not requested from the recipient now.</p>}
    <div className="form-actions"><button className="primary-button" type="button" onClick={onSubmit} disabled={submitting}><Icon name="arrow-up" size={16} />{submitting ? "Submitting…" : "Request Withdrawal"}</button></div>
  </section>;
}

function WithdrawalWorkspace({ requests, available, minimum, onSubmit }) {
  const { notify } = useNotifications();
  const [method, setMethod] = useState(WITHDRAWAL_CONFIG.methods[0]);
  const [form, setForm] = useState(EMPTY_WITHDRAWAL_FORM);
  const [errors, setErrors] = useState({});
  const [tonAttempted, setTonAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const minimumAmount = minimum ?? WITHDRAWAL_CONFIG.minimumAmount;

  const changeMethod = nextMethod => { setMethod(nextMethod); setForm(previous => ({ ...EMPTY_WITHDRAWAL_FORM, amount: previous.amount })); setErrors({}); setTonAttempted(false); };
  const connectTon = () => { setTonAttempted(true); notify("TON wallet connection will be available after SDK integration.", "info"); };

  const submit = async () => {
    if (submitting) return;
    const next = {};
    const amount = Number(form.amount);
    if (!amount || amount <= 0) next.amount = "Enter a valid amount.";
    if (amount < minimumAmount) next.amount = `Minimum withdrawal is ${formatMoney(minimumAmount)}.`;
    if (amount > available) next.amount = "The amount exceeds your available earnings.";
    if (method === "cwallet" && !form.cwalletIdentifier.trim()) next.cwalletIdentifier = "Enter a Cwallet account or identifier.";
    if (method === "binance" && !form.binanceUid.trim()) next.binanceUid = "Enter the Binance ID / UID.";
    setErrors(next);
    if (Object.keys(next).length) return;

    const destination = method === "cwallet" ? form.cwalletIdentifier.trim() : method === "binance" ? form.binanceUid.trim() : "TON wallet pending SDK integration";
    const network = method === "ton" ? "TON" : "";

    setSubmitting(true);
    try {
      await onSubmit({ amount, method, destination, network });
      setForm(EMPTY_WITHDRAWAL_FORM);
      setErrors({});
      notify("Withdrawal request submitted and is now pending review.", "success");
    } catch (error) {
      notify(error.message || "Could not submit the withdrawal request.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return <div className="workspace-page wallet-workspace">
    <PageHeader mode="withdrawal" />
    <section className="wallet-method-panel light-panel">
      <div className="panel-heading"><div><span className="eyebrow">WITHDRAWAL METHODS</span><h2>Choose a method</h2></div></div>
      <MethodSelector mode="withdrawal" value={method} onChange={changeMethod} />
      <div className="withdrawal-availability"><span>Available Earnings</span><strong>{formatMoney(available)}</strong><small>Minimum withdrawal: {formatMoney(minimumAmount)}</small></div>
    </section>
    <WithdrawalForm method={method} form={form} setForm={setForm} onSubmit={submit} error={errors} onTonConnect={connectTon} tonAttempted={tonAttempted} submitting={submitting} />
    <RequestList mode="withdrawal" requests={requests} />
  </div>;
}

/* ---------------------------------------------------------------------- */
/* Deposit — invoice-based flow. The user always sends money TO the       */
/* platform's own destination; never to a value the user typed in.        */
/* ---------------------------------------------------------------------- */

const PROOF_MIME_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const PROOF_MAX_BYTES = 8 * 1024 * 1024;

function generateInvoiceId() {
  const stamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `INV-${stamp}-${random}`;
}

function validateProofFile(file) {
  if (!file) return "Upload a screenshot of your payment as proof.";
  if (!PROOF_MIME_TYPES.includes(file.type)) return "Only PNG, JPG, JPEG, or WEBP images are accepted.";
  if (file.size > PROOF_MAX_BYTES) return "That image is too large. Maximum size is 8 MB.";
  return "";
}

function resolveDepositDestination(method, destinations) {
  if (!destinations) return "";
  if (method === "web3") return destinations.web3?.address || "";
  if (method === "cwallet") return destinations.cwallet?.accountId || "";
  if (method === "binance") return destinations.binance?.depositId || "";
  return "";
}

function useObjectUrl(file) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    if (!file) { setUrl(""); return undefined; }
    const nextUrl = URL.createObjectURL(file);
    setUrl(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [file]);
  return url;
}

function CopyButton({ value }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => { if (timerRef.current) window.clearTimeout(timerRef.current); }, []);

  const copy = async () => {
    if (!value) return;
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(value);
    } catch {
      // Clipboard access can fail silently (unsupported browser, permissions); the user can still select and copy manually.
    }
    setCopied(true);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setCopied(false), 1800);
  };

  return <button type="button" className={copied ? "invoice-copy-button copied" : "invoice-copy-button"} onClick={copy} disabled={!value}>
    <Icon name={copied ? "check" : "copy"} size={13} />{copied ? "Copied" : "Copy"}
  </button>;
}

function InvoiceRow({ label, value, copyable }) {
  return <div className="invoice-row"><b>{label}</b><span>{value}</span>{copyable ? <CopyButton value={value} /> : <span />}</div>;
}

function ProofUpload({ file, error, onSelect, onRemove }) {
  const previewUrl = useObjectUrl(file);
  const inputId = "deposit-proof-upload";
  return <div className="field wallet-field wallet-field-span">
    <span>Upload Payment Proof</span>
    <div className={error ? "proof-upload-box has-error" : "proof-upload-box"}>
      {previewUrl ? <>
        <img className="proof-upload-preview" src={previewUrl} alt="Payment proof preview" />
        <button type="button" className="proof-upload-remove" onClick={onRemove}><Icon name="x" size={12} />Remove</button>
      </> : <label htmlFor={inputId} className="proof-upload-placeholder">
        <Icon name="upload" size={24} />
        <strong>Upload Payment Proof</strong>
        <small>PNG · JPG · WEBP, up to 8 MB</small>
      </label>}
      <input id={inputId} className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" onChange={event => onSelect(event.target.files?.[0] || null)} />
    </div>
    {error && <small className="field-error">{error}</small>}
  </div>;
}

const EMPTY_DEPOSIT_FORM = { amount: "", network: BNB_NETWORK, txid: "", proofFile: null };

function DepositWorkspace({ requests, onSubmit }) {
  const { notify } = useNotifications();
  const [method, setMethod] = useState(DEPOSIT_CONFIG.methods[0]);
  const [form, setForm] = useState(EMPTY_DEPOSIT_FORM);
  const [errors, setErrors] = useState({});
  const [invoiceId, setInvoiceId] = useState(generateInvoiceId);
  const [submitting, setSubmitting] = useState(false);
  const [lastSubmitted, setLastSubmitted] = useState(null);
  const [destinations, setDestinations] = useState(null);

  useEffect(() => {
    api.paymentDestinations().then(({ destinations: value }) => setDestinations(value)).catch(() => setDestinations({}));
  }, []);

  const update = (key, value) => setForm(previous => ({ ...previous, [key]: value }));

  const changeMethod = nextMethod => {
    setMethod(nextMethod);
    setForm(previous => ({ ...EMPTY_DEPOSIT_FORM, amount: previous.amount, network: BNB_NETWORK }));
    setErrors({});
    setInvoiceId(generateInvoiceId());
  };

  const amountValue = Number(form.amount);
  const amountValid = form.amount.trim() !== "" && Number.isFinite(amountValue) && amountValue >= DEPOSIT_CONFIG.minimumAmount;
  const invoiceUnlocked = amountValid;
  const destination = resolveDepositDestination(method, destinations);
  const destinationAvailable = invoiceUnlocked && Boolean(destination);
  const needsTxid = Boolean(DEPOSIT_CONFIG.requireTxid[method]);
  const needsScreenshot = Boolean(DEPOSIT_CONFIG.requireScreenshot[method]);

  const submit = async () => {
    if (submitting) return;
    const next = {};
    if (!amountValid) next.amount = form.amount.trim() === "" ? "Enter a valid amount." : `Minimum deposit is ${formatMoney(DEPOSIT_CONFIG.minimumAmount)}.`;
    if (invoiceUnlocked && !destinationAvailable) next.destination = "Deposit address is currently unavailable.";
    if (invoiceUnlocked && destinationAvailable && needsTxid && !form.txid.trim()) next.txid = "Enter the transaction ID / hash.";
    if (invoiceUnlocked && destinationAvailable && needsScreenshot) {
      const proofError = validateProofFile(form.proofFile);
      if (proofError) next.proof = proofError;
    }
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      // No object-storage backend is wired up yet, so only the proof file's metadata is sent —
      // the binary itself stays on the user's device until a real upload endpoint exists.
      await onSubmit({
        amount: amountValue,
        method,
        network: method === "web3" || method === "binance" ? BNB_NETWORK : "",
        txid: needsTxid ? form.txid.trim() : "",
        proof: form.proofFile ? { name: form.proofFile.name, type: form.proofFile.type, size: form.proofFile.size } : null,
      });
      setLastSubmitted({ invoiceId, status: "Pending" });
      setForm(EMPTY_DEPOSIT_FORM);
      setErrors({});
      setInvoiceId(generateInvoiceId());
      notify("Deposit request submitted and is now pending review.", "success");
    } catch (error) {
      notify(error.message || "Could not submit the deposit request.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return <div className="workspace-page wallet-workspace">
    <PageHeader mode="deposit" />

    {lastSubmitted && <div className="notice">
      <span><strong>Deposit request submitted</strong> — Invoice <span style={{ direction: "ltr", display: "inline-block" }}>{lastSubmitted.invoiceId}</span> is now Pending Review.</span>
      <button type="button" onClick={() => setLastSubmitted(null)} aria-label="Dismiss">×</button>
    </div>}

    <section className="wallet-method-panel light-panel">
      <div className="panel-heading"><div><span className="eyebrow">DEPOSIT METHODS</span><h2>Choose a method</h2></div></div>
      <MethodSelector mode="deposit" value={method} onChange={changeMethod} />
    </section>

    <section className="form-panel light-panel wallet-request-panel">
      <div className="panel-heading"><div><span className="eyebrow">NEW DEPOSIT REQUEST</span><h2>Request a deposit</h2></div><span className="status-badge pending">Pending only</span></div>

      <div className="wallet-form-grid">
        <Field label="Amount" error={errors.amount} hint={!errors.amount ? `Minimum deposit: ${formatMoney(DEPOSIT_CONFIG.minimumAmount)}` : undefined}>
          <input className="input" type="number" min="0" step="0.01" inputMode="decimal" value={form.amount} onChange={event => update("amount", event.target.value)} placeholder="0.00" />
        </Field>
        {(method === "web3" || method === "binance") && <Field label="Network">
          <input className="input" value={BNB_NETWORK} readOnly />
        </Field>}
      </div>

      {invoiceUnlocked && !destinationAvailable && <p className="invoice-unavailable"><Icon name="info" size={14} /> Deposit address is currently unavailable. Submitting is disabled until the platform destination is configured.</p>}

      {invoiceUnlocked && destinationAvailable && <div className="deposit-invoice">
        <div className="invoice-head">
          <div><span className="eyebrow">INVOICE</span><span className="invoice-head-id">Invoice #{invoiceId}</span></div>
          <span className="status-badge pending">Pending Payment</span>
        </div>

        <div className="invoice-rows">
          <InvoiceRow label="Amount" value={formatMoney(amountValue)} />
          <InvoiceRow label="Payment Method" value={methodLabel(method)} />
          <InvoiceRow label="Asset" value={PAYMENT_ASSETS[method] || DEPOSIT_CONFIG.currency} />
           {(method === "web3" || method === "binance") && <InvoiceRow label="Network" value={BNB_NETWORK} />}
          <InvoiceRow label="Payment Destination" value={destination} copyable />
        </div>

        <ol className="invoice-instructions">
          <li>Send the exact amount shown above.</li>
          <li>Complete the payment to the destination shown above.</li>
          {needsTxid && <li>Enter the transaction ID / hash below.</li>}
          <li>Upload your payment proof screenshot.</li>
          <li>Submit the deposit request for review.</li>
        </ol>

        {needsTxid && <div className="wallet-form-grid">
          <Field label="Transaction ID / Hash" error={errors.txid}>
            <input className="input" value={form.txid} onChange={event => update("txid", event.target.value)} placeholder="Paste the transaction ID" />
          </Field>
        </div>}

        <ProofUpload file={form.proofFile} error={errors.proof} onSelect={file => update("proofFile", file)} onRemove={() => update("proofFile", null)} />

        <p className="wallet-help"><Icon name="info" size={15} />Your balance is only updated after this request is reviewed and approved — it will not increase automatically.</p>

        <div className="form-actions">
          <button className="primary-button" type="button" onClick={submit} disabled={submitting}>
            <Icon name="arrow-down" size={16} />{submitting ? "Submitting…" : "Submit Deposit Request"}
          </button>
        </div>
      </div>}
    </section>

    <RequestList mode="deposit" requests={requests} />
  </div>;
}

export default function WalletWorkspace({ mode = "deposit", requests = [], available = 0, minimum, onSubmit = async () => {} }) {
  if (mode === "deposit") return <DepositWorkspace requests={requests} onSubmit={onSubmit} />;
  return <WithdrawalWorkspace requests={requests} available={available} minimum={minimum} onSubmit={onSubmit} />;
}
