import "dotenv/config";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pg from "pg";

const { Pool } = pg;
const PORT = Number(process.env.PORT || 4000);
const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_TTL = process.env.JWT_EXPIRES_IN || "30d";
const DATABASE_URL = process.env.DATABASE_URL;
const pool = DATABASE_URL
  ? new Pool({
      connectionString: DATABASE_URL,
      ssl: process.env.PGSSLMODE === "disable" ? false : { rejectUnauthorized: false },
    })
  : null;

if (!DATABASE_URL || !JWT_SECRET) {
  console.warn("AdZora API is not configured. Set DATABASE_URL and JWT_SECRET before starting the server.");
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, "../dist");
const jsonHeaders = { "Content-Type": "application/json; charset=utf-8" };

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function send(response, status, body) {
  response.writeHead(status, jsonHeaders);
  response.end(JSON.stringify(body));
}

function errorMessage(error) {
  if (error?.code === "23505") return "An account with that email already exists.";
  if (error?.code === "23503") return "The requested record no longer exists.";
  return error instanceof Error ? error.message : "Request failed.";
}

function requireConfiguration() {
  const missing = [];
  if (!DATABASE_URL) missing.push("DATABASE_URL");
  if (!JWT_SECRET) missing.push("JWT_SECRET");
  if (missing.length) {
    throw new ApiError(503, `API is not configured. Missing: ${missing.join(", ")}.`);
  }
}

function requireDatabase() {
  requireConfiguration();
  if (!pool) throw new ApiError(503, "Database is not configured.");
  return pool;
}

async function readJson(request) {
  let raw = "";
  for await (const chunk of request) {
    raw += chunk;
    if (raw.length > 12 * 1024 * 1024) throw new Error("Request body is too large.");
  }
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    throw new ApiError(400, "Request body must be valid JSON.");
  }
}

function tokenFor(user) {
  requireConfiguration();
  return jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

async function currentUser(request) {
  const database = requireDatabase();
  const header = request.headers.authorization || "";
  if (!header.startsWith("Bearer ")) throw new Error("Authentication required.");
  const payload = jwt.verify(header.slice(7), JWT_SECRET);
  const result = await database.query(
    "SELECT id, email, role, display_name AS \"displayName\", created_at AS \"createdAt\" FROM users WHERE id = $1",
    [payload.sub],
  );
  if (!result.rows[0]) throw new Error("Account not found.");
  return result.rows[0];
}

function normalizeWebsite(row) {
  return { ...row, dateAdded: new Date(row.createdAt).toLocaleDateString("en-US") };
}

function normalizeRequest(row) {
  return {
    ...row,
    amount: Number(row.amount),
    createdAt: new Date(row.createdAt).toLocaleString("en-US"),
    paymentDestination: row.destination,
  };
}

async function handleApi(request, response, pathname) {
  if (request.method === "GET" && pathname.replace(/\/+$/, "") === "/api/health") {
    const ready = Boolean(DATABASE_URL && JWT_SECRET);
    return send(response, ready ? 200 : 503, {
      ok: ready,
      service: "adzora-api",
      database: Boolean(DATABASE_URL),
      authentication: Boolean(JWT_SECRET),
    });
  }

  const body = request.method === "GET" || request.method === "DELETE" ? {} : await readJson(request);
  const parts = pathname.replace(/^\/api\/?/, "").split("/").filter(Boolean);

  if (request.method === "POST" && parts.join("/") === "auth/signup") {
    const database = requireDatabase();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const role = body.role === "advertiser" ? "advertiser" : "publisher";
    if (!email.includes("@") || password.length < 8) return send(response, 400, { error: "Use a valid email and a password of at least 8 characters." });
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await database.query(
      "INSERT INTO users (email, password_hash, role, display_name) VALUES ($1, $2, $3, $4) RETURNING id, email, role, display_name AS \"displayName\", created_at AS \"createdAt\"",
      [email, passwordHash, role, email.split("@")[0]],
    );
    const user = result.rows[0];
    return send(response, 201, { token: tokenFor(user), user });
  }

  if (request.method === "POST" && parts.join("/") === "auth/login") {
    const database = requireDatabase();
    const email = String(body.email || "").trim().toLowerCase();
    const result = await database.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(String(body.password || ""), user.password_hash))) return send(response, 401, { error: "Email or password is incorrect." });
    return send(response, 200, { token: tokenFor(user), user: { id: user.id, email: user.email, role: user.role, displayName: user.display_name, createdAt: user.created_at } });
  }

  const user = await currentUser(request);
  if (request.method === "POST" && parts.join("/") === "auth/logout") return send(response, 200, { ok: true });
  if (request.method === "GET" && parts.join("/") === "auth/me") return send(response, 200, { user });
  if (request.method === "PATCH" && parts.join("/") === "auth/me") {
    const displayName = String(body.displayName || "").trim();
    if (!displayName) return send(response, 400, { error: "Display name is required." });
    const result = await pool.query("UPDATE users SET display_name = $1 WHERE id = $2 RETURNING id, email, role, display_name AS \"displayName\", created_at AS \"createdAt\"", [displayName, user.id]);
    return send(response, 200, { user: result.rows[0] });
  }
  if (request.method === "POST" && parts.join("/") === "auth/change-password") {
    const result = await pool.query("SELECT password_hash FROM users WHERE id = $1", [user.id]);
    if (!(await bcrypt.compare(String(body.currentPassword || ""), result.rows[0].password_hash))) return send(response, 400, { error: "Current password is incorrect." });
    if (String(body.newPassword || "").length < 8) return send(response, 400, { error: "New password must be at least 8 characters." });
    await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [await bcrypt.hash(body.newPassword, 12), user.id]);
    return send(response, 200, { ok: true });
  }

  if (parts[0] === "websites") {
    if (request.method === "GET" && parts.length === 1) {
      const result = await pool.query("SELECT id, name, url, status, impressions, clicks, created_at AS \"createdAt\" FROM websites WHERE user_id = $1 ORDER BY created_at DESC", [user.id]);
      return send(response, 200, { websites: result.rows.map(normalizeWebsite) });
    }
    if (request.method === "POST" && parts.length === 1) {
      const name = String(body.name || "").trim();
      const url = String(body.url || "").trim();
      if (!name || !/^https:\/\//i.test(url)) return send(response, 400, { error: "A name and HTTPS URL are required." });
      const result = await pool.query("INSERT INTO websites (user_id, name, url) VALUES ($1, $2, $3) RETURNING id, name, url, status, impressions, clicks, created_at AS \"createdAt\"", [user.id, name, url]);
      return send(response, 201, { website: normalizeWebsite(result.rows[0]) });
    }
    const websiteId = parts[1];
    if (request.method === "DELETE" && websiteId) {
      await pool.query("DELETE FROM websites WHERE id = $1 AND user_id = $2", [websiteId, user.id]);
      return send(response, 200, { ok: true });
    }
    if (request.method === "GET" && parts[2] === "code") return send(response, 200, { code: `<!-- AdZora Universal Code -->\n<script src="/ad.js" data-adzora-website="${websiteId}" async></script>` });
    if (request.method === "GET" && parts[2] === "analytics") {
      const result = await pool.query("SELECT id, name, url, status, impressions, clicks FROM websites WHERE id = $1 AND user_id = $2", [websiteId, user.id]);
      if (!result.rows[0]) return send(response, 404, { error: "Website not found." });
      return send(response, 200, { analytics: { ...result.rows[0], ctr: result.rows[0].impressions ? result.rows[0].clicks / result.rows[0].impressions : 0, earnings: 0, series: { impressions: [], clicks: [], earnings: [] }, formats: {} } });
    }
  }

  if (parts[0] === "campaigns") {
    if (request.method === "GET" && parts.length === 1) {
      const result = await pool.query("SELECT id, name, format, status, budget, pricing_model AS \"pricingModel\", duration, targeting, creative, created_at AS \"createdAt\" FROM campaigns WHERE user_id = $1 ORDER BY created_at DESC", [user.id]);
      return send(response, 200, { campaigns: result.rows.map(row => ({ ...row, budget: Number(row.budget) })) });
    }
    if (request.method === "POST" && parts.length === 1) {
      const required = ["name", "format", "budget", "pricingModel", "duration", "creative"];
      if (required.some(key => body[key] === undefined || body[key] === null)) return send(response, 400, { error: "Campaign data is incomplete." });
      const result = await pool.query(
        "INSERT INTO campaigns (user_id, name, format, budget, pricing_model, duration, targeting, creative) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, name, format, status, budget, pricing_model AS \"pricingModel\", duration, targeting, creative, created_at AS \"createdAt\"",
        [user.id, body.name, body.format, Number(body.budget), body.pricingModel, Number(body.duration), body.targeting || "", body.creative],
      );
      return send(response, 201, { campaign: { ...result.rows[0], budget: Number(result.rows[0].budget) } });
    }
    if (request.method === "PATCH" && parts[1]) {
      const result = await pool.query("UPDATE campaigns SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING id, status", [body.status, parts[1], user.id]);
      return send(response, result.rows[0] ? 200 : 404, result.rows[0] || { error: "Campaign not found." });
    }
  }

  if (parts[0] === "wallet") {
    if (request.method === "GET" && parts[1] === "summary") {
      const result = await pool.query(
        `SELECT
          COALESCE(SUM(CASE WHEN type = 'deposit' AND status = 'Completed' THEN amount ELSE 0 END), 0) AS deposited,
          COALESCE(SUM(CASE WHEN type = 'withdrawal' AND status = 'Completed' THEN amount ELSE 0 END), 0) AS withdrawn,
          COALESCE(SUM(CASE WHEN type = 'withdrawal' AND status = 'Pending' THEN amount ELSE 0 END), 0) AS pending_withdrawals
         FROM wallet_requests WHERE user_id = $1`,
        [user.id],
      );
      const row = result.rows[0];
      return send(response, 200, { available: 0, pending: Number(row.pending_withdrawals), earned: 0, withdrawn: Number(row.withdrawn), deposited: Number(row.deposited), reserved: 0, spent: 0, minimum: 50 });
    }
    if (request.method === "GET" && parts[1] === "transactions") {
      const result = await pool.query("SELECT id, type, method, amount, currency, status, network, destination, invoice_id AS \"invoiceId\", created_at AS \"createdAt\" FROM wallet_requests WHERE user_id = $1 ORDER BY created_at DESC", [user.id]);
      return send(response, 200, { transactions: result.rows.map(normalizeRequest) });
    }
    if (request.method === "GET" && ["withdrawals", "deposits"].includes(parts[1])) {
      const type = parts[1] === "withdrawals" ? "withdrawal" : "deposit";
      const result = await pool.query("SELECT id, type, invoice_id AS \"invoiceId\", method, amount, currency, status, network, destination, txid, proof, created_at AS \"createdAt\" FROM wallet_requests WHERE user_id = $1 AND type = $2 ORDER BY created_at DESC", [user.id, type]);
      return send(response, 200, { requests: result.rows.map(normalizeRequest) });
    }
    if (request.method === "POST" && ["withdrawals", "deposits"].includes(parts[1])) {
      const type = parts[1] === "withdrawals" ? "withdrawal" : "deposit";
      const result = await pool.query(
        "INSERT INTO wallet_requests (user_id, type, invoice_id, method, amount, currency, network, destination, txid, proof) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id, type, invoice_id AS \"invoiceId\", method, amount, currency, status, network, destination, txid, proof, created_at AS \"createdAt\"",
        [user.id, type, body.invoiceId || null, body.method, Number(body.amount), body.currency, body.network || "", body.destination || body.paymentDestination || "", body.txid || "", body.screenshot || null],
      );
      return send(response, 201, { request: normalizeRequest(result.rows[0]) });
    }
  }

  if (request.method === "GET" && parts.join("/") === "config/payment-destinations") {
    return send(response, 200, { destinations: { web3: { address: "", network: "BNB Smart Chain (BEP20)" }, cwallet: { accountId: "" }, binance: { depositId: 0 } } });
  }
  return send(response, 404, { error: "Route not found." });
}

function serveStatic(request, response, pathname) {
  const requested = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const filePath = path.resolve(distPath, requested);
  if (!filePath.startsWith(distPath) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    const fallback = path.join(distPath, "index.html");
    if (fs.existsSync(fallback)) {
      response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      return fs.createReadStream(fallback).pipe(response);
    }
    response.writeHead(404);
    return response.end("Build the frontend with npm run build first.");
  }
  const contentType = requested.endsWith(".html") ? "text/html; charset=utf-8" : requested.endsWith(".js") ? "text/javascript; charset=utf-8" : requested.endsWith(".css") ? "text/css; charset=utf-8" : "application/octet-stream";
  response.writeHead(200, { "Content-Type": contentType });
  fs.createReadStream(filePath).pipe(response);
}

const server = http.createServer(async (request, response) => {
  response.setHeader("Access-Control-Allow-Origin", process.env.CLIENT_ORIGIN || "*");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  if (request.method === "OPTIONS") return send(response, 204, {});
  const pathname = new URL(request.url, `http://${request.headers.host || "localhost"}`).pathname;
  try {
    if (pathname.startsWith("/api/")) return await handleApi(request, response, pathname);
    return serveStatic(request, response, pathname);
  } catch (error) {
    console.error(error);
    const status = error?.status || (error?.name === "JsonWebTokenError" || error?.name === "TokenExpiredError" ? 401 : 500);
    return send(response, status, { error: errorMessage(error) });
  }
});

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  server.listen(PORT, () => console.log(`AdZora API listening on port ${PORT}`));
}

export { handleApi };