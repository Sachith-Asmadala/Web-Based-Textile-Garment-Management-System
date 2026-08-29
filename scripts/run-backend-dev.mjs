import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const backendDirectory = path.join(projectRoot, "backend");
const isWindows = process.platform === "win32";
const wrapper = isWindows ? "mvnw.cmd" : "./mvnw";

const child = spawn(wrapper, ["clean", "spring-boot:run"], {
  cwd: backendDirectory,
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
  console.error(`[TGMS] Unable to start the Maven wrapper: ${error.message}`);
  process.exitCode = 1;
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.exitCode = signal === "SIGINT" ? 130 : 143;
    return;
  }
  process.exitCode = code ?? 1;
});
