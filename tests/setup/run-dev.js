import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });

import { spawn } from "child_process";
import path from "path";

const nextCli = path.resolve(process.cwd(), "node_modules/next/dist/bin/next");

const child = spawn(process.execPath, [nextCli, "dev", "--port", "3000"], {
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code) => {
  process.exit(code || 0);
});
