import { Router } from "express";
import bcrypt from "bcryptjs";
import { query } from "../db.js";
import { makeId } from "../utils/id.js";
import { signToken, requireAuth } from "../middleware/auth.js";

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SESSION_DAYS = 30;

async function createSession(userId) {
  const sessionId = makeId("ses");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await query(`INSERT INTO sessions (id, user_id, expires_at) VALUES ($1, $2, $3)`, [
    sessionId,
    userId,
    expiresAt,
  ]);
  return sessionId;
}

router.post("/signup", async (req, res) => {
  try {
    const { email, password, role } = req.body || {};

    if (!email || !EMAIL_RE.test(email)) {
      return res.status(400).json({ error: "Enter a valid email address." });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters." });
    }
    const normalizedRole = role === "advertiser" ? "advertiser" : "publisher";

    const existing = await query(`SELECT id FROM users WHERE email = $1`, [email.toLowerCase()]);
    if (existing.rows.length) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const userId = makeId("usr");
    await query(
      `INSERT INTO users (id, email, password_hash, role) VALUES ($1, $2, $3, $4)`,
      [userId, email.toLowerCase(), passwordHash, normalizedRole]
    );

    const sessionId = await createSession(userId);
    const user = { id: userId, email: email.toLowerCase(), role: normalizedRole, displayName: null };
    const token = signToken(user, sessionId);

    res.status(201).json({ token, user });
  } catch (error) {
    console.error("signup error", error);
    res.status(500).json({ error: "Could not create the account. Try again." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const { rows } = await query(
      `SELECT id, email, password_hash, role, display_name FROM users WHERE email = $1`,
      [String(email).toLowerCase()]
    );
    if (!rows.length) return res.status(401).json({ error: "Invalid email or password." });

    const match = await bcrypt.compare(password, rows[0].password_hash);
    if (!match) return res.status(401).json({ error: "Invalid email or password." });

    const sessionId = await createSession(rows[0].id);
    const user = { id: rows[0].id, email: rows[0].email, role: rows[0].role, displayName: rows[0].display_name };
    const token = signToken(user, sessionId);

    res.json({ token, user });
  } catch (error) {
    console.error("login error", error);
    res.status(500).json({ error: "Could not log in. Try again." });
  }
});

router.post("/logout", requireAuth, async (req, res) => {
  await query(`DELETE FROM sessions WHERE id = $1`, [req.sessionId]);
  res.json({ ok: true });
});

router.get("/me", requireAuth, async (req, res) => {
  const { rows } = await query(`SELECT id, email, role, display_name FROM users WHERE id = $1`, [req.user.id]);
  if (!rows.length) return res.status(404).json({ error: "Account not found." });
  res.json({ user: { id: rows[0].id, email: rows[0].email, role: rows[0].role, displayName: rows[0].display_name } });
});

router.patch("/me", requireAuth, async (req, res) => {
  const { displayName } = req.body || {};
  if (typeof displayName !== "string" || !displayName.trim()) {
    return res.status(400).json({ error: "Enter a display name." });
  }
  const { rows } = await query(
    `UPDATE users SET display_name = $1, updated_at = now() WHERE id = $2 RETURNING id, email, role, display_name`,
    [displayName.trim().slice(0, 80), req.user.id]
  );
  res.json({ user: { id: rows[0].id, email: rows[0].email, role: rows[0].role, displayName: rows[0].display_name } });
});

router.post("/change-password", requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: "New password must be at least 8 characters." });
  }
  const { rows } = await query(`SELECT password_hash FROM users WHERE id = $1`, [req.user.id]);
  const match = await bcrypt.compare(currentPassword || "", rows[0].password_hash);
  if (!match) return res.status(401).json({ error: "Current password is incorrect." });

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await query(`UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2`, [passwordHash, req.user.id]);
  // Invalidate every other session so a leaked password can't keep an old token alive.
  await query(`DELETE FROM sessions WHERE user_id = $1 AND id != $2`, [req.user.id, req.sessionId]);
  res.json({ ok: true });
});

export default router;
