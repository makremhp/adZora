import pg from "pg";
import { ApiError } from "./errors.js";
import { config, requireConfig } from "./config.js";

const { Pool } = pg;

export const pool = config.databaseUrl
  ? new Pool({
      connectionString: config.databaseUrl,
      ssl: process.env.PGSSLMODE === "disable" ? false : { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    })
  : null;

export function database() {
  requireConfig();
  if (!pool) throw new ApiError(503, "Database is not configured.");
  return pool;
}