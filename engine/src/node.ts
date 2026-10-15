import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { Reader } from "./data.js";

/** Node only: reads data files from a folder. */
export const dirReader = (dir: string): Reader => (file) => {
  const p = join(dir, file);
  return existsSync(p) ? readFileSync(p, "utf8") : undefined;
};
