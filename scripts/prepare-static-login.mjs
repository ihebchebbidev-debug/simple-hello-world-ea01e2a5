import { mkdirSync, copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const dist = join(process.cwd(), "dist");
const source = join(dist, "login.html");
const targetDir = join(dist, "login");
const target = join(targetDir, "index.html");

if (existsSync(source)) {
  mkdirSync(targetDir, { recursive: true });
  copyFileSync(source, target);
  console.log("Prepared standalone /login page for static hosts.");
}
