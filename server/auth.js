import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { database } from "./db.js";
import { ApiError } from "./errors.js";
import { config, requireConfig } from "./config.js";

function publicUser(row) {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    displayName: row.displayName ?? row.display_name,
    createdAt: row.createdAt ?? row.created_at,
  };
}

function issueToken(user) {
  requireConfig();
  return jwt.sign({ sub: user.id, role: user.role }, config.jwtSecret, { expiresIn: config.tokenTtl });
}

export async function signup(body) {
  const db = database();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const role = body.role === "advertiser" ? "advertiser" : "publisher";
  if (!email.includes("@") || password.length < 8) {
    throw new ApiError(400, "Use a valid email and a password of at least 8 characters.");
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const result = await db.query(
    `INSERT INTO users (email, password_hash, role, display_name)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, role, display_name AS "displayName", created_at AS "createdAt"`,
    [email, passwordHash, role, email.split("@")[0]],
  );
  const user = publicUser(result.rows[0]);
  return { token: issueToken(user), user };
}

export async function login(body) {
  const db = database();
  const email = String(body.email || "").trim().toLowerCase();
  const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
  const row = result.rows[0];
  if (!row || !(await bcrypt.compare(String(body.password || ""), row.password_hash))) {
    throw new ApiError(401, "Email or password is incorrect.");
  }
  const user = publicUser(row);
  return { token: issueToken(user), user };
}

export async function currentUser(request) {
  const db = database();
  const header = request.headers.authorization || "";
  if (!header.startsWith("Bearer ")) throw new ApiError(401, "Authentication required.");
  const payload = jwt.verify(header.slice(7), config.jwtSecret);
  const result = await db.query(
    `SELECT id, email, role, display_name AS "displayName", created_at AS "createdAt"
     FROM users WHERE id = $1`,
    [payload.sub],
  );
  if (!result.rows[0]) throw new ApiError(401, "Account not found.");
  return publicUser(result.rows[0]);
}