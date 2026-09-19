import crypto from "node:crypto";

// Produces short, URL-safe, collision-resistant ids like "web_9f2ac1b3c4d5e6f7"
export function makeId(prefix) {
  const random = crypto.randomBytes(9).toString("base64url");
  return `${prefix}_${random}`;
}
