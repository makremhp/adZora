import "dotenv/config";
import { ApiError } from "./errors.js";

export const config = {
  port: Number(process.env.API_PORT || process.env.PORT || 4000),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || process.env.SESSION_SECRET,
  tokenTtl: process.env.JWT_EXPIRES_IN || "30d",
  clientOrigin: process.env.CLIENT_ORIGIN || "*",
};

export function requireConfig() {
  const missing = [];
  if (!config.databaseUrl) missing.push("DATABASE_URL");
  if (!config.jwtSecret) missing.push("JWT_SECRET or SESSION_SECRET");
  if (missing.length) {
    throw new ApiError(503, `API is not configured. Missing: ${missing.join(", ")}.`);
  }
}