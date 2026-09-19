import { Router } from "express";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/payment-destinations", requireAuth, async (req, res) => {
  const { rows } = await query(`SELECT value FROM platform_config WHERE key = 'deposit_destinations'`);
  res.json({ destinations: rows[0]?.value || {} });
});

export default router;
