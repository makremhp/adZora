import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import bcrypt from "bcryptjs";
import { config } from "./config.js";
import { ApiError } from "./errors.js";
import { database } from "./db.js";
import { currentUser, login, signup } from "./auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, "../dist");
const jsonHeaders = { "Content-Type": "application/json; charset=utf-8" };

function send(response, status, body) {
  response.writeHead(status, jsonHeaders);
  response.end(JSON.stringify(body));
}

function errorMessage(error) {
  if (error?.code === "23505") return "An account with that email already exists.";
  if (error?.code === "23503") return "The requested record no longer exists.";
  return error instanceof Error ? error.message : "Request failed.";
}

async function readJson(request) {
  let raw = "";
  for await (const chunk of request) {
    raw += chunk;
    if (raw.length > 12 * 1024 * 1024) throw new ApiError(413, "Request body is too large.");
  }
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    throw new ApiError(400, "Request body must be valid JSON.");
  }
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
  const cleanPath = pathname.replace(/\/+$/, "") || "/";
  if (request.method === "GET" && cleanPath === "/api/health") {
    const ready = Boolean(config.databaseUrl && config.jwtSecret);
    return send(response, ready ? 200 : 503, {
      ok: ready,
      service: "adzora-api",
      database: Boolean(config.databaseUrl),
      authentication: Boolean(config.jwtSecret),
    });
  }

  const body = request.method === "GET" || request.method === "DELETE" ? {} : await readJson(request);
  const parts = cleanPath.replace(/^\/api\/?/, "").split("/").filter(Boolean);
  const route = parts.join("/");

  if (request.method === "POST" && route === "auth/signup") return send(response, 201, await signup(body));
  if (request.method === "POST" && route === "auth/login") return send(response, 200, await login(body));

  const user = await currentUser(request);
  const db = database();

  if (request.method === "POST" && route === "auth/logout") return send(response, 200, { ok: true });
  if (request.method === "GET" && route === "auth/me") return send(response, 200, { user });
  if (request.method === "PATCH" && route === "auth/me") {
    const displayName = String(body.displayName || "").trim();
    if (!displayName) return send(response, 400, { error: "Display name is required." });
    const result = await db.query(
      `UPDATE users SET display_name = $1 WHERE id = $2
       RETURNING id, email, role, display_name AS "displayName", created_at AS "createdAt"`,
      [displayName, user.id],
    );
    return send(response, 200, { user: result.rows[0] });
  }
  if (request.method === "POST" && route === "auth/change-password") {
    const result = await db.query("SELECT password_hash FROM users WHERE id = $1", [user.id]);
    if (!(await bcrypt.compare(String(body.currentPassword || ""), result.rows[0].password_hash))) {
      return send(response, 400, { error: "Current password is incorrect." });
    }
    if (String(body.newPassword || "").length < 8) {
      return send(response, 400, { error: "New password must be at least 8 characters." });
    }
    await db.query("UPDATE users SET password_hash = $1 WHERE id = $2", [await bcrypt.hash(String(body.newPassword), 12), user.id]);
    return send(response, 200, { ok: true });
  }

  if (parts[0] === "websites") {
    if (request.method === "GET" && parts.length === 1) {
      const result = await db.query(
        `SELECT id, name, url, status, impressions, clicks, created_at AS "createdAt"
         FROM websites WHERE user_id = $1 ORDER BY created_at DESC`,
        [user.id],
      );
      return send(response, 200, { websites: result.rows.map(normalizeWebsite) });
    }
    if (request.method === "POST" && parts.length === 1) {
      const name = String(body.name || "").trim();
      const url = String(body.url || "").trim();
      if (!name || !/^https:\/\//i.test(url)) return send(response, 400, { error: "A name and HTTPS URL are required." });
      const result = await db.query(
        `INSERT INTO websites (user_id, name, url)
         VALUES ($1, $2, $3)
         RETURNING id, name, url, status, impressions, clicks, created_at AS "createdAt"`,
        [user.id, name, url],
      );
      return send(response, 201, { website: normalizeWebsite(result.rows[0]) });
    }
    const websiteId = parts[1];
    if (request.method === "DELETE" && websiteId) {
      await db.query("DELETE FROM websites WHERE id = $1 AND user_id = $2", [websiteId, user.id]);
      return send(response, 200, { ok: true });
    }
    if (request.method === "GET" && parts[2] === "code") {
      return send(response, 200, { code: `<!-- AdZora Universal Code -->\n<script src="/ad.js" data-adzora-website="${websiteId}" async></script>` });
    }
    if (request.method === "GET" && parts[2] === "analytics") {
      const result = await db.query(
        "SELECT id, name, url, status, impressions, clicks FROM websites WHERE id = $1 AND user_id = $2",
        [websiteId, user.id],
      );
      if (!result.rows[0]) return send(response, 404, { error: "Website not found." });
      const website = result.rows[0];
      return send(response, 200, {
        analytics: {
          ...website,
          ctr: website.impressions ? website.clicks / website.impressions : 0,
          earnings: 0,
          series: { impressions: [], clicks: [], earnings: [] },
          formats: {},
        },
      });
    }
  }

  if (parts[0] === "campaigns") {
    if (request.method === "GET" && parts.length === 1) {
      const result = await db.query(
        `SELECT id, name, format, status, budget, pricing_model AS "pricingModel",
                duration, targeting, creative, created_at AS "createdAt"
         FROM campaigns WHERE user_id = $1 ORDER BY created_at DESC`,
        [user.id],
      );
      return send(response, 200, { campaigns: result.rows.map(row => ({ ...row, budget: Number(row.budget) })) });
    }
    if (request.method === "POST" && parts.length === 1) {
      const required = ["name", "format", "budget", "pricingModel", "duration", "creative"];
      if (required.some(key => body[key] === undefined || body[key] === null)) {
        return send(response, 400, { error: "Campaign data is incomplete." });
      }
      const result = await db.query(
        `INSERT INTO campaigns
          (user_id, name, format, budget, pricing_model, duration, targeting, creative)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, name, format, status, budget, pricing_model AS "pricingModel",
                   duration, targeting, creative, created_at AS "createdAt"`,
        [user.id, body.name, body.format, Number(body.budget), body.pricingModel, Number(body.duration), body.targeting || "", body.creative],
      );
      return send(response, 201, { campaign: { ...result.rows[0], budget: Number(result.rows[0].budget) } });
    }
    if (request.method === "PATCH" && parts[1]) {
      const result = await db.query(
        "UPDATE campaigns SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING id, status",
        [body.status, parts[1], user.id],
      );
      return send(response, result.rows[0] ? 200 : 404, result.rows[0] || { error: "Campaign not found." });
    }
  }

  if (parts[0] === "wallet") {
    if (request.method === "GET" && parts[1] === "summary") {
      const result = await db.query(
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
      const result = await db.query(
        `SELECT id, type, method, amount, currency, status, network, destination,
                invoice_id AS "invoiceId", created_at AS "createdAt"
         FROM wallet_requests WHERE user_id = $1 ORDER BY created_at DESC`,
        [user.id],
      );
      return send(response, 200, { transactions: result.rows.map(normalizeRequest) });
    }
    if (request.method === "GET" && ["withdrawals", "deposits"].includes(parts[1])) {
      const type = parts[1] === "withdrawals" ? "withdrawal" : "deposit";
      const result = await db.query(
        `SELECT id, type, invoice_id AS "invoiceId", method, amount, currency, status,
                network, destination, txid, proof, created_at AS "createdAt"
         FROM wallet_requests WHERE user_id = $1 AND type = $2 ORDER BY created_at DESC`,
        [user.id, type],
      );
      return send(response, 200, { requests: result.rows.map(normalizeRequest) });
    }
    if (request.method === "POST" && ["withdrawals", "deposits"].includes(parts[1])) {
      const type = parts[1] === "withdrawals" ? "withdrawal" : "deposit";
      const result = await db.query(
        `INSERT INTO wallet_requests
          (user_id, type, invoice_id, method, amount, currency, network, destination, txid, proof)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id, type, invoice_id AS "invoiceId", method, amount, currency, status,
                   network, destination, txid, proof, created_at AS "createdAt"`,
        [user.id, type, body.invoiceId || null, body.method, Number(body.amount), body.currency, body.network || "", body.destination || body.paymentDestination || "", body.txid || "", body.screenshot || null],
      );
      return send(response, 201, { request: normalizeRequest(result.rows[0]) });
    }
  }

  if (request.method === "GET" && route === "config/payment-destinations") {
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
  const contentType = requested.endsWith(".html")
    ? "text/html; charset=utf-8"
    : requested.endsWith(".js")
      ? "text/javascript; charset=utf-8"
      : requested.endsWith(".css")
        ? "text/css; charset=utf-8"
        : "application/octet-stream";
  response.writeHead(200, { "Content-Type": contentType });
  fs.createReadStream(filePath).pipe(response);
}

const server = http.createServer(async (request, response) => {
  response.setHeader("Access-Control-Allow-Origin", config.clientOrigin);
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
  server.listen(config.port, () => console.log(`AdZora API listening on port ${config.port}`));
}

export { handleApi };