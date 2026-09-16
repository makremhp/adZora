import { useState } from "react";
import { useNotifications } from "./NotificationSystem";

function SettingsIcon({ name, size = 18 }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" };
  const paths = {
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18" /></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" /></>,
    monitor: <><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8M12 17v4" /></>,
    alert: <><path d="M10.3 4.8 2.8 18a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3l-7.5-13.2a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 16.5h.01" /></>,
    trash: <><path d="M4 7h16M10 11v6M14 11v6" /><path d="m6 7 1 13h10l1-13M9 7V4h6v3" /></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M14 4h5v16h-5" /></>,
    arrow: <path d="m9 18 6-6-6-6" />,
  };
  return <svg {...common}>{paths[name] || paths.monitor}</svg>;
}

function ConfirmDialog({ title, description, confirmLabel, danger = false, onCancel, onConfirm }) {
  return <div className="modal-backdrop settings-dialog-backdrop" role="presentation" onMouseDown={event => event.target === event.currentTarget && onCancel()}>
    <section className="confirm-dialog light-panel" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
      <div className="confirm-dialog-icon"><SettingsIcon name={danger ? "alert" : "logout"} size={20} /></div>
      <h2 id="confirm-dialog-title">{title}</h2>
      <p>{description}</p>
      <div className="confirm-dialog-actions">
        <button className="ghost-button" type="button" onClick={onCancel} data-testid="button-cancel-settings-dialog">Cancel</button>
        <button className={danger ? "danger-button" : "primary-button"} type="button" onClick={onConfirm} data-testid="button-confirm-settings-dialog">{confirmLabel}</button>
      </div>
    </section>
  </div>;
}

function SettingsSection({ icon, eyebrow, title, description, children, className = "" }) {
  return <section className={`settings-section ${className}`}>
    <div className="settings-section-heading">
      <span className="settings-section-icon"><SettingsIcon name={icon} size={17} /></span>
      <div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2><p>{description}</p></div>
    </div>
    {children}
  </section>;
}

export default function SettingsPage({ workspace, publisherData, setPublisherData, onNavigate, onLogout }) {
  const { notify } = useNotifications();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [pendingWebsite, setPendingWebsite] = useState(null);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const websites = publisherData?.websites || [];
  const isPublisher = workspace === "publisher";

  const deleteWebsite = () => {
    if (!pendingWebsite) return;
    setPublisherData(previous => ({
      ...previous,
      websites: previous.websites.filter(website => website.id !== pendingWebsite.id),
    }));
    notify("Website deleted successfully", "success", 3500, "The website was removed from this demo account.");
    setPendingWebsite(null);
  };

  const confirmLogout = () => {
    setLogoutOpen(false);
    onLogout();
  };

  return <div className="workspace-page settings-page">
    <div className="workspace-page-header">
      <div><span className="eyebrow">ACCOUNT / SETTINGS</span><h1>Settings</h1><p>Control app preferences, connected websites, and this browser session.</p></div>
      <span className="phase-chip">Frontend demo</span>
    </div>

    <div className="settings-layout">
      <SettingsSection icon="bell" eyebrow="PREFERENCES" title="Notifications" description="Choose whether this demo workspace shows action notifications.">
        <div className="settings-row">
          <div className="settings-row-copy"><strong>Enable Notifications</strong><span>This preference is kept in frontend state and is not saved to a server.</span></div>
          <button className={notificationsEnabled ? "toggle-button is-on" : "toggle-button"} type="button" role="switch" aria-checked={notificationsEnabled} onClick={() => setNotificationsEnabled(previous => !previous)} data-testid="button-toggle-notifications"><span /></button>
        </div>
      </SettingsSection>

      <SettingsSection icon="globe" eyebrow="PUBLISHER ACCOUNT" title="Website Management" description="Manage the websites connected to your publisher account.">
        {!isPublisher ? <div className="settings-empty"><SettingsIcon name="globe" size={22} /><strong>Publisher websites are managed in the Publisher workspace.</strong><button className="link-button" type="button" onClick={() => onNavigate("overview")}>Switch to Publisher</button></div> : websites.length === 0 ? <div className="settings-empty"><SettingsIcon name="globe" size={22} /><strong>No websites connected yet.</strong><span>Add a website from the Websites page to manage it here.</span><button className="secondary-button" type="button" onClick={() => onNavigate("websites")}><SettingsIcon name="globe" size={15} />Add Website</button></div> : <div className="settings-website-list">{websites.map(website => <article className="settings-website" key={website.id}>
          <div className="settings-website-info"><span className="settings-website-icon"><SettingsIcon name="globe" size={17} /></span><div><strong>{website.name}</strong><span>{website.url}</span></div><span className="status-badge pending">{website.status || "Pending"}</span></div>
          <div className="settings-website-actions"><button className="ghost-button" type="button" onClick={() => onNavigate("website-details", website.id)}><SettingsIcon name="arrow" size={15} />View Details</button><button className="danger-button" type="button" onClick={() => setPendingWebsite(website)}><SettingsIcon name="trash" size={15} />Delete Website</button></div>
        </article>)}</div>}
      </SettingsSection>

      <SettingsSection icon="monitor" eyebrow="SESSION" title="Current Session" description="Review the active browser session and leave the demo workspace when needed.">
        <div className="settings-row">
          <div className="settings-row-copy"><strong>Active Session</strong><span>This is a local demo session. Authentication and session revocation are not connected.</span></div>
          <span className="settings-status">Demo session</span>
        </div>
        <div className="settings-row settings-row-last">
          <div className="settings-row-copy"><strong>Log Out</strong><span>Return to the AdZora landing screen.</span></div>
          <button className="ghost-button" type="button" onClick={() => setLogoutOpen(true)}><SettingsIcon name="logout" size={15} />Log Out</button>
        </div>
      </SettingsSection>

      <SettingsSection icon="alert" eyebrow="ACCOUNT ACTIONS" title="Account Actions" description="These controls are intentionally not simulated in the frontend demo." className="settings-danger">
        <div className="settings-row">
          <div className="settings-row-copy"><strong>Deactivate Account</strong><span>Account actions require server-side authentication.</span></div>
          <button className="danger-button" type="button" onClick={() => notify("Account action is not available", "warning", 3500, "Server-side authentication is required.")} data-testid="button-deactivate-account"><SettingsIcon name="alert" size={15} />Deactivate Account</button>
        </div>
        <div className="settings-row settings-row-last">
          <div className="settings-row-copy"><strong>Delete Account</strong><span>The demo will not hide or delete the account from frontend state.</span></div>
          <button className="danger-button" type="button" onClick={() => notify("Account action is not available", "warning", 3500, "Server-side authentication is required.")} data-testid="button-delete-account"><SettingsIcon name="trash" size={15} />Delete Account</button>
        </div>
      </SettingsSection>
    </div>

    {pendingWebsite && <ConfirmDialog title="Delete this website?" description={`${pendingWebsite.name} · ${pendingWebsite.url} — This action cannot be undone in this demo state.`} confirmLabel="Delete Website" danger onCancel={() => setPendingWebsite(null)} onConfirm={deleteWebsite} />}
    {logoutOpen && <ConfirmDialog title="Log out of AdZora?" description="You will return to the existing AdZora landing screen." confirmLabel="Log Out" onCancel={() => setLogoutOpen(false)} onConfirm={confirmLogout} />}
  </div>;
}