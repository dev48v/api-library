// Merges tier-result-*.json (agent verdicts) into catalog.js: adds t (free|freemium|paid) + tc (h|m|l).
// no-key entries are auto-tiered free. Usage: node merge-tiers.mjs <scratchpad-dir>
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";

const dir = process.argv[2];
const catSrc = readFileSync(new URL("./catalog.js", import.meta.url), "utf8");
const { CATALOG } = new Function(catSrc + ";return {CATALOG};")();

const verdicts = new Map();
for (const f of readdirSync(dir).filter(f => /^tier-result-\d+\.json$/.test(f))) {
  const arr = JSON.parse(readFileSync(join(dir, f), "utf8"));
  for (const v of arr) if (v.n && ["free","freemium","paid"].includes(v.t)) verdicts.set(v.n.toLowerCase(), v);
}

let auto = 0, agent = 0, missing = 0;
for (const r of CATALOG) {
  if (r.a === "none") { r.t = "free"; r.tc = "h"; auto++; continue; }
  const v = verdicts.get(r.n.toLowerCase());
  if (v) { r.t = v.t; r.tc = v.c || "m"; agent++; }
  else missing++;
}

const header = catSrc.split("const CATALOG")[0];
writeFileSync(new URL("./catalog.js", import.meta.url), header + "const CATALOG = " + JSON.stringify(CATALOG) + ";\n");
const dist = CATALOG.reduce((m, r) => (m[r.t || "untiered"] = (m[r.t || "untiered"] || 0) + 1, m), {});
console.log(`auto-free=${auto} agent-tiered=${agent} missing=${missing}`);
console.log("distribution:", JSON.stringify(dist));
