import { Router } from "express";
import { query } from "../db.js";
import { makeId } from "../utils/id.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { AD_FORMATS, PRICING_MODELS } from "../config/formats.js";
import { getAvailableBalance } from "./wallet.js";

const router = Router();
router.use(requireAuth, requireRole("advertiser"));

router.get("/", async (req, res) => {
  const { rows } = await query(
    `SELECT * FROM campaigns WHERE user_id = $1 ORDER BY created_at DESC`,
    [req.user.id]
  );
  res.json({ campaigns: rows });
});

router.post("/", async (req, res) => {
  const { name, format, budget, pricingModel, duration, targeting, creative } = req.body || {};

  if (!name || !name.trim()) return res.status(400).json({ error: "Campaign name is required." });
  if (!AD_FORMATS[format]) return res.status(400).json({ error: "Choose a valid ad format." });
  if (!PRICING_MODELS.includes(pricingModel)) return res.status(400).json({ error: "Choose a valid pricing model." });
  const budgetValue = Number(budget);
  if (!budgetValue || budgetValue <= 0) return res.status(400).json({ error: "Enter a campaign budget greater than 0." });
  const durationValue = Number(duration);
  if (!durationValue || durationValue <= 0) return res.status(400).json({ error: "Enter a campaign duration in days." });

  const available = await getAvailableBalance(req.user.id, "advertiser");
  if (budgetValue > available) {
    return res.status(400).json({ error: "Campaign budget exceeds your available balance. Add funds first." });
  }

  const id = makeId("cmp");
  const { rows } = await query(
    `INSERT INTO campaigns (id, user_id, name, format, status, budget, pricing_model, duration, targeting, creative)
     VALUES ($1, $2, $3, $4, 'Draft', $5, $6, $7, $8, $9)
     RETURNING *`,
    [id, req.user.id, name.trim(), format, budgetValue, pricingModel, durationValue, targeting || null, creative || {}]
  );
  res.status(201).json({ campaign: rows[0] });
});

router.patch("/:id", async (req, res) => {
  const allowedStatuses = ["Draft", "Active", "Paused", "Completed"];
  const { status } = req.body || {};
  if (!allowedStatuses.includes(status)) return res.status(400).json({ error: "Invalid status." });

  const { rows } = await query(
    `UPDATE campaigns SET status = $1, updated_at = now() WHERE id = $2 AND user_id = $3 RETURNING *`,
    [status, req.params.id, req.user.id]
  );
  if (!rows.length) return res.status(404).json({ error: "Campaign not found." });
  res.json({ campaign: rows[0] });
});

export default router;
