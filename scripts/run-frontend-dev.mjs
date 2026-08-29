import { spawn } from "node:child_process";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const backendEnvironment = path.join(projectRoot, "backend", ".env");
const isWindows = process.platform === "win32";
const npmCommand = isWindows ? "npm.cmd" : "npm";
const startupTimeoutMs = 120_000;
const pollIntervalMs = 300;

function configuredPort() {
  if (process.env.PORT) {
    return process.env.PORT;
  }
  if (!fs.existsSync(backendEnvironment)) {
    return "3000";
  }
  const portLine = fs.readFileSync(backendEnvironment, "utf8")
    .split(/\r?\n/)
    .find((line) => line.startsWith("PORT="));
  return portLine?.slice("PORT=".length).trim() || "3000";
}

const healthUrl = `http://127.0.0.1:${configuredPort()}/api/health`;
const deadline = Date.now() + startupTimeoutMs;
let apiReady = false;

console.log(`[TGMS] Waiting for the API at ${healthUrl}...`);

while (Date.now() < deadline) {
  try {
    const response = await fetch(healthUrl, { signal: AbortSignal.timeout(2_000) });
    if (response.ok) {
      apiReady = true;
      break;
    }
  } catch {
    // The backend is still compiling, migrating, or opening its HTTP port.
  }
  await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
}

if (!apiReady) {
  console.error(`[TGMS] API did not become ready within ${startupTimeoutMs / 1000} seconds.`);
  process.exit(1);
}

console.log("[TGMS] API is ready. Starting Vite...");

const child = spawn(npmCommand, ["run", "dev", "--workspace", "frontend"], {
  cwd: projectRoot,
  env: process.env,
  shell: isWindows,
  stdio: "inherit",
});

let stopping = false;

function stop(signal) {
  if (stopping || child.exitCode !== null) {
    return;
  }
  stopping = true;
  child.kill(signal);
}

process.on("SIGINT", () => stop("SIGINT"));
process.on("SIGTERM", () => stop("SIGTERM"));

child.on("error", (error) => {
  console.error(`[TGMS] Unable to start Vite: ${error.message}`);
  process.exitCode = 1;
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.exitCode = signal === "SIGINT" ? 130 : 143;
    return;
  }
  process.exitCode = code ?? 1;
});
