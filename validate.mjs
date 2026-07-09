// PR validator — checks data.js entries against the CONTRIBUTING.md schema.
// Run by .github/workflows/validate.yml on every PR; exits 1 on any violation.
import { readFileSync } from "fs";

const src = readFileSync(new URL("./data.js", import.meta.url), "utf8");
let APIS, CATS;
try {
  ({ APIS, CATS } = new Function(src + ";return {APIS,CATS};")());
} catch (e) {
  console.error("❌ data.js does not parse as JavaScript:\n   " + e.message);
  process.exit(1);
}

const TIERS = ["free", "freemium", "paid"];
const AUTHT = ["none", "bearer", "basic", "header", "query"];
const errs = [], warns = [], ids = new Set();

APIS.forEach((a, i) => {
  const at = `#${i + 1} "${a.n || a.id || "?"}"`;
  for (const f of ["id", "n", "cat", "tier", "auth", "quota", "use"])
    if (a[f] === undefined || a[f] === "") errs.push(`${at}: missing required field \`${f}\``);
  if (a.id) {
    if (!/^[a-z0-9-]+$/.test(a.id)) errs.push(`${at}: \`id\` must be lowercase letters/digits/dashes only`);
    if (ids.has(a.id)) errs.push(`${at}: duplicate \`id\` "${a.id}"`);
    ids.add(a.id);
  }
  if (a.cat && !CATS[a.cat]) errs.push(`${at}: \`cat\` "${a.cat}" is not a valid category (see CATS)`);
  if (a.tier && !TIERS.includes(a.tier)) errs.push(`${at}: \`tier\` must be one of ${TIERS.join(" / ")}`);
  if (a.auth && !AUTHT.includes(a.auth.t)) errs.push(`${at}: \`auth.t\` must be one of ${AUTHT.join(" / ")}`);
  if (a.auth && a.auth.t === "header" && !a.auth.k) errs.push(`${at}: \`auth.t:"header"\` needs a header name \`k\``);
  if (!("cc" in a)) errs.push(`${at}: missing \`cc\` (2-letter country code, or null for global)`);
  else if (a.cc !== null && !/^[A-Za-z]{2}$/.test(a.cc)) warns.push(`${at}: \`cc\` should be a 2-letter code or null`);
  if (!("docs" in a)) errs.push(`${at}: missing \`docs\` URL`);
  else if (a.docs && !/^https?:\/\//.test(a.docs)) errs.push(`${at}: \`docs\` must start with http(s)://`);
  if (!("ep" in a)) warns.push(`${at}: no \`ep\` sample call (use ep:null if auth is complex)`);
  if (a.use && a.use.length > 200) warns.push(`${at}: \`use\` is long (${a.use.length} chars) — keep it one sentence`);
});

const ok = errs.length === 0;
const lines = [];
lines.push(`## ${ok ? "✅" : "❌"} Contribution check — ${APIS.length} curated APIs`);
if (errs.length) { lines.push(`\n**${errs.length} error(s)** — must fix before merge:`); errs.forEach(e => lines.push(`- ❌ ${e}`)); }
if (warns.length) { lines.push(`\n**${warns.length} warning(s):**`); warns.forEach(w => lines.push(`- ⚠️ ${w}`)); }
if (ok && !warns.length) lines.push(`\nAll entries follow [CONTRIBUTING.md](../CONTRIBUTING.md). 🎉`);
const out = lines.join("\n");
console.log(out);
if (process.env.GITHUB_STEP_SUMMARY) {
  try { const fs = await import("fs"); fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, out + "\n"); } catch {}
}
process.exit(ok ? 0 : 1);
