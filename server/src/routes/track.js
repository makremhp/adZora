import { Router } from "express";
import { query, withTransaction } from "../db.js";
import { makeId } from "../utils/id.js";
import { AD_FORMATS } from "../config/formats.js";

// This is the integration boundary for a real ad-serving script (the "AdZora Universal
// Code" embedded on a publisher's website). It is intentionally the ONLY place money
// enters the system on the publisher side — every dollar in `transactions` traces back to
// an event recorded here, a deposit reviewed by an admin, or a manual admin adjustment.
// No demo or seeded revenue is ever inserted anywhere else in this codebase.
const router = Router();

const EVENT_TYPES = ["impression", "click", "view"];

router.post("/event", async (req, res) => {
  const { websiteId, campaignId, eventType, grossValue } = req.body || {};

  if (!EVENT_TYPES.includes(eventType)) return res.status(400).json({ error: "Invalid event type." });

  const website = await query(`SELECT id, user_id FROM websites WHERE id = $1`, [websiteId]);
  if (!website.rows.length) return res.status(404).json({ error: "Unknown website." });

  let publisherShare = 0;
  let campaignOwnerId = null;
  const gross = Number(grossValue) || 0;

  if (campaignId) {
    const campaign = await query(`SELECT id, user_id, format, status FROM campaigns WHERE id = $1`, [campaignId]);
    if (!campaign.rows.length) return res.status(404).json({ error: "Unknown campaign." });
    if (campaign.rows[0].status !== "Active") return res.status(400).json({ error: "Campaign is not active." });
    campaignOwnerId = campaign.rows[0].user_id;
    const share = AD_FORMATS[campaign.rows[0].format]?.share.publisher ?? 0;
    publisherShare = Number((gross * share).toFixed(6));
  }

  await withTransaction(async (client) => {
    const eventId = makeId("evt");
    await client.query(
      `INSERT INTO analytics_events (id, website_id, campaign_id, event_type, value)
       VALUES ($1,$2,$3,$4,$5)`,
      [eventId, websiteId, campaignId || null, eventType, publisherShare]
    );

    if (eventType === "impression") {
      await client.query(`UPDATE websites SET impressions = impressions + 1, updated_at = now() WHERE id = $1`, [websiteId]);
    }
    if (eventType === "click") {
      await client.query(`UPDATE websites SET clicks = clicks + 1, updated_at = now() WHERE id = $1`, [websiteId]);
    }

    if (campaignId && publisherShare > 0) {
      const earningTxnId = makeId("txn");
      await client.query(
        `INSERT INTO transactions (id, user_id, type, direction, amount, currency, status, reference_type, reference_id, metadata)
         VALUES ($1,$2,'earning','credit',$3,'USD','Pending','analytics_event',$4,$5)`,
        [earningTxnId, website.rows[0].user_id, publisherShare, eventId, JSON.stringify({ websiteId, campaignId, eventType })]
      );

      const spendTxnId = makeId("txn");
      await client.query(
        `INSERT INTO transactions (id, user_id, type, direction, amount, currency, status, reference_type, reference_id, metadata)
         VALUES ($1,$2,'spend','debit',$3,'USD','Completed','analytics_event',$4,$5)`,
        [spendTxnId, campaignOwnerId, gross, eventId, JSON.stringify({ websiteId, campaignId, eventType })]
      );
    }
  });

  res.status(201).json({ ok: true });
});

export default router;
