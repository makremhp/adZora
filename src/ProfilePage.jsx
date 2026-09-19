import { useState } from "react";
import { useNotifications } from "./NotificationSystem";
import { api } from "./api";

function ProfileIcon({ name, size = 18 }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" };
  const paths = {
    user: <><circle cx="12" cy="8" r="3.2" /><path d="M5 20a7 7 0 0 1 14 0" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>,
    lock: <><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    shield: <><path d="M12 3 4 6v5c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6z" /><path d="m8 12 2.5 2.5L16 9" /></>,
    alert: <><path d="M10.3 4.8 2.8 18a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3l-7.5-13.2a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 16.5h.01" /></>,
  };
  return <svg {...common}>{paths[name] || paths.user}</svg>;
}

const ROLE_LABELS = { publisher: "Publisher", advertiser: "Advertiser" };

function initialsFor(name) {
  return name.split(/\s+/).filter(Boolean).map(part => part[0]).join("").slice(0, 2).toUpperCase() || "A";
}

function ProfileFact({ label, children }) {
  return <div className="profile-fact"><span>{label}</span><strong>{children}</strong></div>;
}

export default function ProfilePage({ workspace, user }) {
  const { notify } = useNotifications();
  const role = ROLE_LABELS[workspace] || ROLE_LABELS.publisher;
  const email = user?.email || "";
  const [displayName, setDisplayName] = useState(user?.displayName || email.split("@")[0] || "Account Holder");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  const saveProfile = async () => {
    if (!displayName.trim()) return;
    setSaving(true);
    try {
      await api.updateProfile(displayName.trim());
      setEditing(false);
      notify("Profile updated successfully", "success");
    } catch (error) {
      notify(error.message || "Could not update your profile.", "error");
    } finally {
      setSaving(false);
    }
  };
  const cancelProfileEdit = () => {
    setEditing(false);
    setDisplayName(user?.displayName || email.split("@")[0] || "Account Holder");
  };
  const savePassword = async () => {
    if (newPassword.length < 8) { notify("New password must be at least 8 characters.", "error"); return; }
    setPasswordSaving(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setPasswordOpen(false);
      notify("Your password has been updated.", "success");
    } catch (error) {
      notify(error.message || "Could not update your password.", "error");
    } finally {
      setPasswordSaving(false);
    }
  };

  return <div className="workspace-page profile-page">
    <div className="workspace-page-header">
      <div><span className="eyebrow">ACCOUNT / PROFILE</span><h1>Profile</h1><p>Keep your identity and essential account details in one place.</p></div>
      </div>

    <section className="profile-hero light-panel" aria-label="Profile identity">
      <div className="profile-avatar profile-avatar-fallback" data-testid="profile-avatar" aria-label="Profile avatar">{initialsFor(displayName)}</div>
      <div className="profile-hero-copy">
        <span className="eyebrow">ACCOUNT HOLDER</span>
        <h2 data-testid="text-profile-display-name">{displayName}</h2>
        <p>{email}</p>
        <div className="profile-hero-meta"><span>{role}</span><span className="status-text-active">Active</span></div>
      </div>
      <span className="status-badge active">Active</span>
    </section>

    <section className="profile-section light-panel">
      <div className="panel-heading">
        <div><span className="eyebrow">PERSONAL INFORMATION</span><h2>Personal Information</h2></div>
        {!editing && <button className="secondary-button" type="button" onClick={() => setEditing(true)} data-testid="button-edit-profile"><ProfileIcon name="user" size={15} />Edit Profile</button>}
      </div>
      <div className="profile-form-grid profile-personal-grid">
        <label className="field"><span>Display Name</span><input className="input" value={displayName} readOnly={!editing} onChange={event => setDisplayName(event.target.value)} data-testid="input-profile-display-name" /></label>
        <label className="field"><span>Email</span><input className="input" type="email" value={email} readOnly data-testid="input-profile-email" /></label>
        <ProfileFact label="Workspace role">{role}</ProfileFact>
      </div>
      {editing && <div className="form-actions profile-form-actions"><button className="primary-button" type="button" onClick={saveProfile} disabled={saving} data-testid="button-save-profile"><ProfileIcon name="shield" size={15} />{saving ? "Saving…" : "Save Changes"}</button><button className="ghost-button" type="button" onClick={cancelProfileEdit} data-testid="button-cancel-profile">Cancel</button></div>}
      
    </section>

    <section className="profile-section light-panel">
      <div className="panel-heading"><div><span className="eyebrow">SECURITY</span><h2>Basic security</h2></div><ProfileIcon name="lock" size={18} /></div>
      <div className="security-row">
        <div className="security-row-icon"><ProfileIcon name="lock" size={17} /></div>
        <div><strong>Password</strong><span>••••••••</span></div>
        <button className="secondary-button" type="button" onClick={() => setPasswordOpen(previous => !previous)} data-testid="button-change-password"><ProfileIcon name="lock" size={15} />Change Password</button>
      </div>
      {passwordOpen && <div className="password-editor">
        <label className="field"><span>Current Password</span><input className="input" type="password" value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} data-testid="input-current-password" /></label>
        <label className="field"><span>New Password</span><input className="input" type="password" value={newPassword} onChange={event => setNewPassword(event.target.value)} placeholder="At least 8 characters" data-testid="input-new-password" /></label>
        <button className="ghost-button" type="button" onClick={savePassword} disabled={passwordSaving} data-testid="button-save-password">{passwordSaving ? "Saving…" : "Save Password"}</button>
      </div>}
      <div className="profile-security-note"><ProfileIcon name="shield" size={16} /><span>Password changes take effect immediately and sign out your other sessions.</span></div>
    </section>
  </div>;
}