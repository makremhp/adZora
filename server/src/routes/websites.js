import { Router } from "express";
import { query } from "../db.js";
import { makeId } from "../utils/id.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth, requireRole("publisher"));

function isValidHttpsUrl(value) {
  try {
    const normalized = value.startsWith("http") ? value : `https://${value}`;
    const parsed = new URL(normalized);
    return parsed.protocol === "https:" && parsed.hostname.includes(".") ? parsed.toString() : null;
  } catch {
    return null;
  }
}

router.get("/", async (req, res) => {
  const { rows } = await query(
    `SELECT id, name, url, status, impressions, clicks, created_at, updated_at
     FROM websites WHERE user_id = $1 ORDER BY created_at DESC`,
    [req.user.id]
  );
  res.json({ websites: rows });
});

router.post("/", async (req, res) => {
  const { name, url } = req.body || {};
  if (!name || !name.trim()) return res.status(400).json({ error: "Website name is required." });
  const normalizedUrl = url ? isValidHttpsUrl(url.trim()) : null;
  if (!normalizedUrl) return res.status(400).json({ error: "Enter a valid HTTPS website address." });

  const id = makeId("web");
  const { rows } = await query(
    `INSERT INTO websites (id, user_id, name, url, status)
     VALUES ($1, $2, $3, $4, 'Pending')
     RETURNING id, name, url, status, impressions, clicks, created_at, updated_at`,
    [id, req.user.id, name.trim(), normalizedUrl]
  );
  res.status(201).json({ website: rows[0] });
});

router.get("/:id", async (req, res) => {
  const { rows } = await query(`SELECT * FROM websites WHERE id = $1 AND user_id = $2`, [
    req.params.id,
    req.user.id,
  ]);
  if (!rows.length) return res.status(404).json({ error: "Website not found." });
  res.json({ website: rows[0] });
});

router.delete("/:id", async (req, res) => {
  const { rows } = await query(
    `DELETE FROM websites WHERE id = $1 AND user_id = $2 RETURNING id`,
    [req.params.id, req.user.id]
  );
  if (!rows.length) return res.status(404).json({ error: "Website not found." });
  res.json({ ok: true });
});

router.get("/:id/code", async (req, res) => {
  const { rows } = await query(`SELECT id FROM websites WHERE id = $1 AND user_id = $2`, [
    req.params.id,
    req.user.id,
  ]);
  if (!rows.length) return res.status(404).json({ error: "Website not found." });
  const snippet = `<!-- AdZora Universal Code -->\n<script src="https://ad-zora.vercel.app/ad.js" data-adzora-website="${rows[0].id}" async></script>`;
  res.json({ code: snippet });
});

// Real analytics, aggregated from recorded ad-server events. Returns zeroed/empty
// results until actual traffic has been tracked via POST /api/track/event — no
// synthetic numbers are ever generated here.
router.get("/:id/analytics", async (req, res) => {
  const website = await query(`SELECT * FROM websites WHERE id = $1 AND user_id = $2`, [
    req.params.id,
    req.user.id,
  ]);
  if (!website.rows.length) return res.status(404).json({ error: "Website not found." });

  const totals = await query(
    `SELECT
       COUNT(*) FILTER (WHERE event_type = 'impression') AS impressions,
       COUNT(*) FILTER (WHERE event_type = 'click') AS clicks,
       COALESCE(SUM(value) FILTER (WHERE event_type IN ('impression','click','view')), 0) AS earnings
     FROM analytics_events WHERE website_id = $1`,
    [req.params.id]
  );

  const daily = await query(
    `SELECT date_trunc('day', occurred_at) AS day,
            COUNT(*) FILTER (WHERE event_type = 'impression') AS impressions,
            COUNT(*) FILTER (WHERE event_type = 'click') AS clicks,
            COALESCE(SUM(value), 0) AS earnings
     FROM analytics_events
     WHERE website_id = $1 AND occurred_at > now() - interval '30 days'
     GROUP BY 1 ORDER BY 1 ASC`,
    [req.params.id]
  );

  const impressions = Number(totals.rows[0].impressions);
  const clicks = Number(totals.rows[0].clicks);

  res.json({
    website: website.rows[0],
    summary: {
      impressions,
      clicks,
      ctr: impressions > 0 ? `${((clicks / impressions) * 100).toFixed(2)}%` : "--",
      earnings: Number(totals.rows[0].earnings),
    },
    series: daily.rows.map((row) => ({
      day: row.day,
      impressions: Number(row.impressions),
      clicks: Number(row.clicks),
      earnings: Number(row.earnings),
    })),
  });
});

export default router;
