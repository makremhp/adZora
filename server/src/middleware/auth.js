import jwt from "jsonwebtoken";
import { query } from "../db.js";

const JWT_SECRET = process.env.JWT_SECRET;

export function signToken(user, sessionId) {
  return jwt.sign({ sub: user.id, email: user.email, role: user.role, sid: sessionId }, JWT_SECRET, {
    expiresIn: "30d",
  });
}

// Requires a valid Bearer token AND a live session row (so logout / revocation works).
export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Missing authorization token." });

    const payload = jwt.verify(token, JWT_SECRET);

    const { rows } = await query(
      `SELECT s.id AS session_id, u.id, u.email, u.role
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.id = $1 AND s.expires_at > now()`,
      [payload.sid]
    );

    if (!rows.length) return res.status(401).json({ error: "Session expired. Please log in again." });

    req.user = { id: rows[0].id, email: rows[0].email, role: rows[0].role };
    req.sessionId = rows[0].session_id;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}

export function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ error: `This action requires the ${role} role.` });
    }
    next();
  };
}
