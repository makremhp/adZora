import { Router } from "express";
import { query, withTransaction } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

// Every write here needs a human admin decision — nothing here is automatic. Create an
// admin by running: UPDATE users SET role = 'admin' WHERE email = 'you@example.com';
const router = Router();
router.use(requireAuth, requireRole("admin"));

router.get("/deposits/pending", async (req, res) => {
  const { rows } = await query(`SELECT * FROM deposits WHERE status = 'Pending' ORDER BY created_at ASC`);
  res.json({ deposits: rows });
});

router.get("/withdrawals/pending", async (req, res) => {
  const { rows } = await query(`SELECT * FROM withdrawals WHERE status = 'Pending' ORDER BY created_at ASC`);
  res.json({ withdrawals: rows });
});

router.post("/deposits/:id/:decision(approve|reject)", async (req, res) => {
  const status = req.params.decision === "approve" ? "Completed" : "Rejected";
  const result = await withTransaction(async (client) => {
    const deposit = await client.query(`UPDATE deposits SET status = $1, updated_at = now() WHERE id = $2 RETURNING *`, [status, req.params.id]);
    if (!deposit.rows.length) return null;
    await client.query(
      `UPDATE transactions SET status = $1 WHERE reference_type = 'deposit' AND reference_id = $2`,
      [status, req.params.id]
    );
    return deposit.rows[0];
  });
  if (!result) return res.status(404).json({ error: "Deposit not found." });
  res.json({ deposit: result });
});

router.post("/withdrawals/:id/:decision(approve|reject)", async (req, res) => {
  const status = req.params.decision === "approve" ? "Completed" : "Rejected";
  const result = await withTransaction(async (client) => {
    const withdrawal = await client.query(`UPDATE withdrawals SET status = $1, updated_at = now() WHERE id = $2 RETURNING *`, [status, req.params.id]);
    if (!withdrawal.rows.length) return null;
    await client.query(
      `UPDATE transactions SET status = $1 WHERE reference_type = 'withdrawal' AND reference_id = $2`,
      [status, req.params.id]
    );
    return withdrawal.rows[0];
  });
  if (!result) return res.status(404).json({ error: "Withdrawal not found." });
  res.json({ withdrawal: result });
});

router.put("/config/deposit-destinations", async (req, res) => {
  const value = req.body || {};
  await query(
    `INSERT INTO platform_config (key, value, updated_at) VALUES ('deposit_destinations', $1, now())
     ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = now()`,
    [JSON.stringify(value)]
  );
  res.json({ ok: true });
});

export default router;
