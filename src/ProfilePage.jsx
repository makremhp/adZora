import { useState } from "react";
import { useNotifications } from "./NotificationSystem";

function ProfileIcon({ name, size = 18 }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" };
  const paths = {
    user: <><circle cx="12" cy="8" r="3.2" /><path d="M5 20a7 7 0 0 1 14 0" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>,
    lock: <><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    shield: <><path d="M12 3 4 6v5c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6z" /><path d="m8 12 2.5 2.5L16 9" /></>,
    monitor: <><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8M12 17v4" /></>,
    alert: <><path d="M10.3 4.8 2.8 18a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3l-7.5-13.2a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 16.5h.01" /></>,
    trash: <><path d="M4 7h16M10 11v6M14 11v6" /><path d="m6 7 1 13h10l1-13M9 7V4h6v3" /></>,
  };
  return <svg {...common}>{paths[name] || paths.user}</svg>;
}

const ROLE_LABELS = { publisher: "Publisher", advertiser: "Advertiser" };

export default function ProfilePage({ workspace }) {
  const { notify } = useNotifications();
  const role = ROLE_LABELS[workspace] || ROLE_LABELS.publisher;
  const [profile, setProfile] = useState({ displayName: "AdZora Demo", email: "demo@adzora.local" });
  const [editing, setEditing] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [password, setPassword] = useState("");
  const accountIdentifier = "demo-account";
  const avatarNumber = Array.from(accountIdentifier).reduce((total, character) => total + character.charCodeAt(0), 0) % 70 + 1;
  const [avatarFailed, setAvatarFailed] = useState(false);

  const updateProfile = (key, value) => setProfile(previous => ({ ...previous, [key]: value }));
  const saveProfile = () => {
    setEditing(false);
    notify("Profile updated successfully", "success");
  };

  return <div className="workspace-page profile-page">
    <div className="workspace-page-header">
      <div><span className="eyebrow">ACCOUNT / PROFILE</span><h1>Profile</h1><p>Manage your account information and security.</p></div>
      <span className="phase-chip">Frontend demo</span>
    </div>

    <section className="profile-hero light-panel">
       <div className="profile-avatar" aria-label="Profile avatar">{avatarFailed ? profile.displayName.split(/\s+/).map(part => part[0]).join("").slice(0, 2).toUpperCase() : <img src={`https://i.pravatar.cc/176?img=${avatarNumber}`} alt="" onError={() => setAvatarFailed(true)} />}</div>
       <div className="profile-hero-copy"><span className="eyebrow">ACCOUNT HOLDER</span><h2 data-testid="text-profile-display-name">{profile.displayName}</h2><p>{profile.email}</p><div className="profile-hero-meta"><span>{role}</span><span className="status-text-active">Active</span></div></div>
      <span className="status-badge active">Active</span>
    </section>

    <section className="profile-section light-panel">
      <div className="panel-heading"><div><span className="eyebrow">PERSONAL INFORMATION</span><h2>Personal Information</h2></div>{!editing && <button className="secondary-button" type="button" onClick={() => setEditing(true)} data-testid="button-edit-profile"><ProfileIcon name="user" size={15} />Edit Profile</button>}</div>
      <div className="profile-form-grid">
        <label className="field"><span>Display Name</span><input className="input" value={profile.displayName} readOnly={!editing} onChange={event => updateProfile("displayName", event.target.value)} data-testid="input-profile-display-name" /></label>
        <label className="field"><span>Email</span><input className="input" type="email" value={profile.email} readOnly={!editing} onChange={event => updateProfile("email", event.target.value)} data-testid="input-profile-email" /></label>
        <div className="profile-fact"><span>Role</span><strong>{role}</strong></div>
        <div className="profile-fact"><span>Account Status</span><strong className="status-text-active">Active</strong></div>
        <div className="profile-fact"><span>Member Since</span><strong>Demo workspace</strong></div>
      </div>
      {editing && <div className="form-actions profile-form-actions"><button className="primary-button" type="button" onClick={saveProfile} data-testid="button-save-profile"><ProfileIcon name="shield" size={15} />Save Changes</button><button className="ghost-button" type="button" onClick={() => { setEditing(false); setProfile({ displayName: "AdZora Demo", email: "demo@adzora.local" }); }} data-testid="button-cancel-profile">Cancel</button></div>}
      <p className="profile-demo-note">Changes are kept in React state for this demo and are not saved to a server.</p>
    </section>

    <section className="profile-section light-panel">
      <div className="panel-heading"><div><span className="eyebrow">ACCOUNT</span><h2>Account</h2></div><ProfileIcon name="user" size={18} /></div>
      <div className="profile-facts-grid">
        <div className="profile-fact"><span>Account ID</span><strong>Not available in demo</strong></div>
        <div className="profile-fact"><span>Role</span><strong>{role}</strong></div>
        <div className="profile-fact"><span>Account Status</span><strong className="status-text-active">Active</strong></div>
        <div className="profile-fact"><span>Member Since</span><strong>Demo workspace</strong></div>
      </div>
    </section>

    <section className="profile-section light-panel">
      <div className="panel-heading"><div><span className="eyebrow">SECURITY</span><h2>Security</h2></div><ProfileIcon name="lock" size={18} /></div>
      <div className="security-row"><div className="security-row-icon"><ProfileIcon name="lock" size={17} /></div><div><strong>Password</strong><span>••••••••</span></div><button className="secondary-button" type="button" onClick={() => setPasswordOpen(previous => !previous)} data-testid="button-change-password">Change Password</button></div>
      {passwordOpen && <div className="password-editor"><label className="field"><span>New Password</span><input className="input" type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="At least 6 characters" data-testid="input-new-password" /></label><button className="ghost-button" type="button" onClick={() => { setPassword(""); setPasswordOpen(false); notify("Password changes require server-side authentication.", "info"); }} data-testid="button-save-password">Save Password</button></div>}
      <div className="security-row session-row"><div className="security-row-icon"><ProfileIcon name="monitor" size={17} /></div><div><strong>Sessions</strong><span>Session management will be available when authentication is connected.</span></div></div>
    </section>

    <section className="profile-section danger-zone">
      <div className="panel-heading"><div><span className="eyebrow">DANGER ZONE</span><h2>Account actions</h2></div><ProfileIcon name="alert" size={18} /></div>
      <p>These demo controls do not change or delete application state.</p>
      <div className="danger-actions"><button className="danger-button" type="button" onClick={() => notify("Account actions require server-side authentication.", "warning")} data-testid="button-deactivate-account"><ProfileIcon name="alert" size={15} />Deactivate Account</button><button className="danger-button" type="button" onClick={() => notify("Account actions require server-side authentication.", "warning")} data-testid="button-delete-account"><ProfileIcon name="trash" size={15} />Delete Account</button></div>
    </section>
  </div>;
}