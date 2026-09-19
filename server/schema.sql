-- AdZora backend schema (Postgres / Neon).
-- This mirrors what is already provisioned on the connected Neon project.
-- Safe to re-run: every statement is idempotent.

CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'publisher',
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS websites (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  url text NOT NULL,
  status text NOT NULL DEFAULT 'Pending',
  impressions integer NOT NULL DEFAULT 0,
  clicks integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS campaigns (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  format text NOT NULL,
  status text NOT NULL DEFAULT 'Draft',
  budget numeric NOT NULL,
  pricing_model text NOT NULL,
  duration integer NOT NULL,
  targeting text,
  creative jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS deposits (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invoice_id text NOT NULL UNIQUE,
  method text NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  payment_destination text,
  network text,
  txid text,
  proof jsonb,
  status text NOT NULL DEFAULT 'Pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS withdrawals (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  method text NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  destination text,
  network text,
  status text NOT NULL DEFAULT 'Pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transactions (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL,
  direction text NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'Pending',
  reference_type text,
  reference_id text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS analytics_events (
  id text PRIMARY KEY,
  user_id text,
  website_id text REFERENCES websites(id) ON DELETE CASCADE,
  campaign_id text REFERENCES campaigns(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  value numeric NOT NULL DEFAULT 0,
  metadata jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS platform_config (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_websites_user ON websites(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_user ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_deposits_user ON deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user ON withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_website ON analytics_events(website_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

INSERT INTO platform_config (key, value) VALUES
  ('deposit_destinations', '{"web3": {"address": "", "network": "BNB Smart Chain (BEP20)"}, "cwallet": {"accountId": ""}, "binance": {"depositId": 0, "networks": {}}}'::jsonb)
ON CONFLICT (key) DO NOTHING;
