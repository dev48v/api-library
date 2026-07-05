// Builds catalog.js from the public-apis/public-apis README (fetched to _public-apis.md).
// Usage: curl -sL https://raw.githubusercontent.com/public-apis/public-apis/master/README.md -o _public-apis.md && node parse-catalog.mjs
import { readFileSync, writeFileSync } from "fs";

const md = readFileSync(new URL("./_public-apis.md", import.meta.url), "utf8");
const dataSrc = readFileSync(new URL("./data.js", import.meta.url), "utf8");
const { APIS } = new Function(dataSrc + ";return {APIS};")();

const host = u => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return ""; } };
const curatedHosts = new Set(APIS.map(a => host(a.docs)).filter(Boolean));
const curatedNames = new Set(APIS.map(a => a.n.toLowerCase()));

const rows = [];
let cat = null, dropped = 0;
for (const line of md.split("\n")) {
  const h = line.match(/^###\s+(.+)/);
  if (h) { cat = h[1].trim(); continue; }
  const m = line.match(/^\|\s*\[([^\]]+)\]\(([^)]+)\)\s*\|\s*([^|]*)\|\s*([^|]*)\|\s*([^|]*)\|\s*([^|]*)\|?/) ||
            line.match(/^\|\s*\[([^\]]+)\]\(([^)]+)\)\s*\|\s*([^|]*)\|\s*([^|]*)\|\s*([^|]*)\|\s*([^|]*)/);
  if (!m || !cat || cat.toLowerCase() === "index") continue;
  const [, name, url, desc, auth, https, cors] = m;
  const a = auth.replace(/`/g, "").trim().toLowerCase();
  if (curatedNames.has(name.toLowerCase()) || curatedHosts.has(host(url))) { dropped++; continue; }
  rows.push({
    n: name.trim(),
    u: url.trim(),
    d: desc.trim(),
    a: a === "no" || a === "" ? "none" : a.includes("oauth") ? "oauth" : a.includes("apikey") ? "key" : "other",
    h: https.trim().toLowerCase() === "yes",
    c: cors.trim().toLowerCase(),
    cat
  });
}

const cats = [...new Set(rows.map(r => r.cat))];
writeFileSync(new URL("./catalog.js", import.meta.url),
  "// Extended catalog — parsed from github.com/public-apis/public-apis (MIT). Regenerate: parse-catalog.mjs\n" +
  "const CATALOG = " + JSON.stringify(rows) + ";\n");
console.log(`catalog: ${rows.length} entries, ${cats.length} categories, ${dropped} deduped (already curated)`);
