import { spawn } from "node:child_process";

const apiPort = process.env.API_PORT || "4000";
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const apiEnvironment = { ...process.env, API_PORT: apiPort, PORT: apiPort };
const frontendEnvironment = { ...process.env, API_PORT: apiPort };

const api = spawn(process.execPath, ["server/index.js"], {
  env: apiEnvironment,
  stdio: "inherit",
});
const frontend = spawn(npmCommand, ["run", "vite"], {
  env: frontendEnvironment,
  stdio: "inherit",
});

let shuttingDown = false;
function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  api.kill(signal);
  frontend.kill(signal);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

api.on("exit", (code, signal) => {
  if (!shuttingDown) {
    shuttingDown = true;
    frontend.kill("SIGTERM");
    process.exitCode = code ?? (signal ? 1 : 0);
  }
});

frontend.on("exit", (code, signal) => {
  if (!shuttingDown) {
    shuttingDown = true;
    api.kill("SIGTERM");
    process.exitCode = code ?? (signal ? 1 : 0);
  }
});