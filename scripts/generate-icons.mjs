import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "public", "icons");
mkdirSync(outDir, { recursive: true });

// Minimal valid PNG (1x1 black) — placeholder; replace with branded assets later
const png1x1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64"
);

writeFileSync(join(outDir, "icon-192.png"), png1x1);
writeFileSync(join(outDir, "icon-512.png"), png1x1);
writeFileSync(join(outDir, "..", "favicon.ico"), png1x1);

console.log("Icons generated in public/icons/");
