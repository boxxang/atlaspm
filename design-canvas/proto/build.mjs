/* Builds design-canvas/atlaspm-prototype.html from the template and the three JSON
   payloads. `</` is escaped to `<\/` so nothing inside the data can close the
   <script> tag; JSON reads the escape back as a plain slash. */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const read = f => readFileSync(join(here, f), "utf8");
const safe = t => t.replace(/<\//g, "<\\/");

const out = read("app.template.html")
  .replace("/*__ACTS__*/", () => safe(read("activities.json")))
  .replace("/*__SEED__*/", () => safe(read("seed.json")))
  .replace("/*__STG__*/",  () => safe(read("stages.json")));

const dest = join(here, "..", "atlaspm-prototype.html");
writeFileSync(dest, out);
console.log("wrote", dest, out.length, "bytes");
