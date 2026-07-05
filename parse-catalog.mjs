// Builds catalog.js from multiple public API lists (raw fetch — never clone/fork).
// Sources: public-apis/public-apis, marcelscruz/public-apis, public-api-lists/public-api-lists, n0shake/Public-APIs
// Usage: node parse-catalog.mjs   (fetches all READMEs itself)
import { readFileSync, writeFileSync } from "fs";

const dataSrc = readFileSync(new URL("./data.js", import.meta.url), "utf8");
const { APIS } = new Function(dataSrc + ";return {APIS};")();
let tierMap = new Map();
try {
  const prev = readFileSync(new URL("./catalog.js", import.meta.url), "utf8");
  const { CATALOG } = new Function(prev + ";return {CATALOG};")();
  for (const r of CATALOG) if (r.t) tierMap.set(r.n.toLowerCase(), { t: r.t, tc: r.tc });
} catch {}
const host = u => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return ""; } };

const seenHost = new Set(APIS.map(a => host(a.docs)).filter(Boolean));
const seenName = new Set(APIS.map(a => a.n.toLowerCase()));

const SOURCES = [
  { id: "pa",  url: "https://raw.githubusercontent.com/public-apis/public-apis/master/README.md", kind: "table" },
  { id: "mc",  url: "https://raw.githubusercontent.com/marcelscruz/public-apis/main/README.md",  kind: "table" },
  { id: "pal", url: "https://raw.githubusercontent.com/public-api-lists/public-api-lists/master/README.md", kind: "table" },
  { id: "ns",  url: "https://raw.githubusercontent.com/n0shake/Public-APIs/master/README.md", kind: "bullet" },
  { id: "gql", url: "https://raw.githubusercontent.com/APIs-guru/graphql-apis/master/README.md", kind: "gqltable",
    def: { cat: "GraphQL", a: "unk", t: "free", tc: "m" } },
  { id: "llm", url: "https://raw.githubusercontent.com/cheahjs/free-llm-api-resources/main/README.md", kind: "headlink",
    def: { cat: "AI LLM Free Tiers", a: "key", t: "freemium", tc: "m", d: "LLM API with a free tier — models & limits in source list" } }
];

const rows = [];
let dupes = 0;

for (const src of SOURCES) {
  const md = await (await fetch(src.url)).text();
  let cat = null, added = 0;
  for (const line of md.split("\n")) {
    const h = line.match(/^#{2,4}\s+(.+)/);
    if (h && !(src.kind === "headlink" && /\[.+\]\(https?:/.test(line))) { cat = h[1].replace(/\[|\]\(.*\)/g, "").trim(); continue; }
    if (!cat || /index|table of contents/i.test(cat)) continue;

    let e = null;
    if (src.kind === "table") {
      const m = line.match(/^\|\s*\[([^\]]+)\]\(([^)]+)\)\s*\|\s*([^|]*)\|\s*([^|]*)\|\s*([^|]*)\|\s*([^|]*)/);
      if (m) {
        const a = m[4].replace(/`/g, "").trim().toLowerCase();
        e = { n: m[1].trim(), u: m[2].trim(), d: m[3].trim(),
              a: a === "no" || a === "" ? "none" : a.includes("oauth") ? "oauth" : a.includes("apikey") ? "key" : "other",
              h: m[5].trim().toLowerCase() === "yes", c: m[6].trim().toLowerCase(), cat };
      }
    } else if (src.kind === "bullet") {
      // 3-col table: | [**Name**](url) | Desc | Open/Trial |
      const m = line.match(/^\|\s*\[\*{0,2}([^\]*]+)\*{0,2}\]\(([^)]+)\)\s*\|\s*([^|]*)\|/);
      if (m) e = { n: m[1].trim(), u: m[2].trim(), d: m[3].trim(), a: "unk", h: m[2].startsWith("https"), c: "unknown", cat };
    } else if (src.kind === "gqltable") {
      // | PlainName | Desc | [Try it!](url) | [Docs](url)
      if (!line.startsWith("|") || line.includes("---")) continue;
      const cells = line.split("|").map(x => x.trim());
      const name = (cells[1] || "").replace(/\*+/g, "").trim();
      if (!name || name === "API" || name.startsWith("[")) continue;
      const links = [...line.matchAll(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g)];
      if (!links.length) continue;
      const docs = links.find(l => /docs|repo/i.test(l[1])) || links[0];
      e = { n: name, u: docs[2], d: (cells[2] || name).trim(), a: src.def.a, h: docs[2].startsWith("https"), c: "unknown", cat: src.def.cat };
      e.t = src.def.t; e.tc = src.def.tc;
    } else if (src.kind === "headlink") {
      // provider entries are headings: ### [Name](url)
      const m = line.match(/^#{2,4}\s+\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/);
      if (!m) continue;
      e = { n: m[1].trim(), u: m[2].trim(), d: src.def.d, a: src.def.a, h: m[2].startsWith("https"), c: "unknown", cat: src.def.cat };
      e.t = src.def.t; e.tc = src.def.tc;
    }
    if (!e) continue;

    const hk = host(e.u), nk = e.n.toLowerCase();
    if (seenName.has(nk) || (hk && seenHost.has(hk))) { dupes++; continue; }
    seenName.add(nk); if (hk) seenHost.add(hk);
    e.s = src.id;
    if (!e.t) {
      const prev = tierMap.get(e.n.toLowerCase());
      if (prev) { e.t = prev.t; e.tc = prev.tc; }
      else if (e.a === "none") { e.t = "free"; e.tc = "h"; }
    }
    rows.push(e); added++;
  }
  console.log(`${src.id}: +${added}`);
}

writeFileSync(new URL("./catalog.js", import.meta.url),
  "// Extended catalog — merged from public-apis, marcelscruz/public-apis, public-api-lists, n0shake (all MIT/CC, raw-fetched).\n" +
  "// Regenerate: node parse-catalog.mjs\n" +
  "const CATALOG = " + JSON.stringify(rows) + ";\n");
console.log(`catalog: ${rows.length} entries, ${[...new Set(rows.map(r => r.cat))].length} categories, ${dupes} deduped, untiered=${rows.filter(r => !r.t).length}`);
