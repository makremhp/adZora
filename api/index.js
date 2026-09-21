import { handleApi } from "../server/index.js";

export default async function handler(request, response) {
  response.setHeader("Access-Control-Allow-Origin", process.env.CLIENT_ORIGIN || "*");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");

  if (request.method === "OPTIONS") {
    response.writeHead(204);
    return response.end();
  }

  const url = new URL(request.url || "/", `https://${request.headers.host || "localhost"}`);
  const pathname = url.pathname.startsWith("/api/") ? url.pathname : `/api${url.pathname === "/" ? "" : url.pathname}`;

  try {
    return await handleApi(request, response, pathname);
  } catch (error) {
    console.error(error);
    const status = error?.status || (error?.name === "JsonWebTokenError" || error?.name === "TokenExpiredError" ? 401 : 500);
    response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
    return response.end(JSON.stringify({ error: error instanceof Error ? error.message : "Request failed." }));
  }
}