import { Router } from "express";
import { query, withTransaction } from "../db.js";
import { makeId } from "../utils/id.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { WITHDRAWAL_MINIMUM, DEPOSIT_MINIMUM, PAYMENT_METHODS } from "../config/formats.js";

const router = Router();

// ---- Balance calculation --------------------------------------------------
// Every number here is derived from the transactions ledger. Nothing is hardcoded.
// Transaction types used: 'earning' (publisher, credit), 'withdrawal' (publisher, debit),
// 'deposit' (advertiser, credit), 'reserve' (advertiser, debit — committed to a campaign),
// 'spend' (advertiser, debit — actually consumed by delivered ad events).
export async function getAvailableBalance(userId, role) {
  if (role === "publisher") {
    const { rows } = await query(
      `SELECT
         COALESCE(SUM(amount) FILTER (WHERE type = 'earning' AND status = 'Completed'), 0) AS earned,
         COALESCE(SUM(amount) FILTER (WHERE type = 'withdrawal' AND status IN ('Completed','Pending')), 0) AS withdrawn_or_pending
       FROM transactions WHERE user_id = $1`,
      [userId]
    );
    return Number(rows[0].earned) - Number(rows[0].withdrawn_or_pending);
  }
  const { rows } = await query(
    `SELECT
       COALESCE(SUM(amount) FILTER (WHERE type = 'deposit' AND status = 'Completed'), 0) AS deposited,
       COALESCE(SUM(amount) FILTER (WHERE type IN ('reserve','spend') AND status = 'Completed'), 0) AS committed
     FROM transactions WHERE user_id = $1`,
    [userId]
  );
  return Number(rows[0].deposited) - Number(rows[0].committed);
}

router.get("/summary", requireAuth, async (req, res) => {
  if (req.user.role === "publisher") {
    const { rows } = await query(
      `SELECT
         COALESCE(SUM(amount) FILTER (WHERE type = 'earning' AND status = 'Completed'), 0) AS earned,
         COALESCE(SUM(amount) FILTER (WHERE type = 'earning' AND status = 'Pending'), 0) AS pending,
         COALESCE(SUM(amount) FILTER (WHERE type = 'withdrawal' AND status = 'Completed'), 0) AS withdrawn,
         COALESCE(SUM(amount) FILTER (WHERE type = 'withdrawal' AND status = 'Pending'), 0) AS withdrawal_pending
       FROM transactions WHERE user_id = $1`,
      [req.user.id]
    );
    const r = rows[0];
    const available = Number(r.earned) - Number(r.withdrawn) - Number(r.withdrawal_pending);
    return res.json({
      available: Number(available.toFixed(2)),
      pending: Number(r.pending),
      earned: Number(r.earned),
      withdrawn: Number(r.withdrawn),
      minimumWithdrawal: WITHDRAWAL_MINIMUM,
    });
  }

  const { rows } = await query(
    `SELECT
       COALESCE(SUM(amount) FILTER (WHERE type = 'deposit' AND status = 'Completed'), 0) AS deposited,
       COALESCE(SUM(amount) FILTER (WHERE type = 'reserve' AND status = 'Completed'), 0) AS reserved,
       COALESCE(SUM(amount) FILTER (WHERE type = 'spend' AND status = 'Completed'), 0) AS spent
     FROM transactions WHERE user_id = $1`,
    [req.user.id]
  );
  const r = rows[0];
  const available = Number(r.deposited) - Number(r.reserved) - Number(r.spent);
  res.json({
    available: Number(available.toFixed(2)),
    reserved: Number(r.reserved),
    spent: Number(r.spent),
    deposited: Number(r.deposited),
    minimumDeposit: DEPOSIT_MINIMUM,
  });
});

router.get("/transactions", requireAuth, async (req, res) => {
  const { rows } = await query(
    `SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 200`,
    [req.user.id]
  );
  res.json({ transactions: rows });
});

// ---- Deposits (advertiser adds funds) -------------------------------------
router.post("/deposits", requireAuth, requireRole("advertiser"), async (req, res) => {
  const { amount, method, network, txid, proof } = req.body || {};
  const value = Number(amount);
  if (!value || value < DEPOSIT_MINIMUM) {
    return res.status(400).json({ error: `Minimum deposit is $${DEPOSIT_MINIMUM}.` });
  }
  if (!PAYMENT_METHODS.deposit.includes(method)) {
    return res.status(400).json({ error: "Choose a valid deposit method." });
  }

  const destRow = await query(`SELECT value FROM platform_config WHERE key = 'deposit_destinations'`);
  const destinations = destRow.rows[0]?.value || {};
  const destination = destinations[method];

  const result = await withTransaction(async (client) => {
    const depositId = makeId("dep");
    const invoiceId = makeId("inv");
    await client.query(
      `INSERT INTO deposits (id, user_id, invoice_id, method, amount, currency, payment_destination, network, txid, proof, status)
       VALUES ($1,$2,$3,$4,$5,'USD',$6,$7,$8,$9,'Pending')`,
      [depositId, req.user.id, invoiceId, method, value, JSON.stringify(destination || {}), network || null, txid || null, proof ? JSON.stringify(proof) : null]
    );
    const txnId = makeId("txn");
    await client.query(
      `INSERT INTO transactions (id, user_id, type, direction, amount, currency, status, reference_type, reference_id)
       VALUES ($1,$2,'deposit','credit',$3,'USD','Pending','deposit',$4)`,
      [txnId, req.user.id, value, depositId]
    );
    return { depositId, invoiceId };
  });

  res.status(201).json({
    deposit: { id: result.depositId, invoiceId: result.invoiceId, amount: value, method, status: "Pending" },
    message: "Deposit request submitted. It will be reviewed and your balance updated once confirmed.",
  });
});

// ---- Withdrawals (publisher cashes out earnings) --------------------------
router.post("/withdrawals", requireAuth, requireRole("publisher"), async (req, res) => {
  const { amount, method, destination, network } = req.body || {};
  const value = Number(amount);
  if (!value || value < WITHDRAWAL_MINIMUM) {
    return res.status(400).json({ error: `Minimum withdrawal is $${WITHDRAWAL_MINIMUM}.` });
  }
  if (!PAYMENT_METHODS.withdrawal.includes(method)) {
    return res.status(400).json({ error: "Choose a valid withdrawal method." });
  }

  const available = await getAvailableBalance(req.user.id, "publisher");
  if (value > available) {
    return res.status(400).json({ error: "The amount exceeds your available earnings." });
  }

  const result = await withTransaction(async (client) => {
    const withdrawalId = makeId("wdl");
    await client.query(
      `INSERT INTO withdrawals (id, user_id, method, amount, currency, destination, network, status)
       VALUES ($1,$2,$3,$4,'USD',$5,$6,'Pending')`,
      [withdrawalId, req.user.id, method, value, destination || null, network || null]
    );
    const txnId = makeId("txn");
    await client.query(
      `INSERT INTO transactions (id, user_id, type, direction, amount, currency, status, reference_type, reference_id)
       VALUES ($1,$2,'withdrawal','debit',$3,'USD','Pending','withdrawal',$4)`,
      [txnId, req.user.id, value, withdrawalId]
    );
    return { withdrawalId };
  });

  res.status(201).json({
    withdrawal: { id: result.withdrawalId, amount: value, method, status: "Pending" },
    message: "Your withdrawal request has been submitted and is now pending review.",
  });
});

router.get("/withdrawals", requireAuth, requireRole("publisher"), async (req, res) => {
  const { rows } = await query(`SELECT * FROM withdrawals WHERE user_id = $1 ORDER BY created_at DESC`, [req.user.id]);
  res.json({ withdrawals: rows });
});

router.get("/deposits", requireAuth, requireRole("advertiser"), async (req, res) => {
  const { rows } = await query(`SELECT * FROM deposits WHERE user_id = $1 ORDER BY created_at DESC`, [req.user.id]);
  res.json({ deposits: rows });
});

export default router;
