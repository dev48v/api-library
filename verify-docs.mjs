// Verifies every docs URL in data.js is alive. Usage: node verify-docs.mjs
import { readFileSync } from "fs";

const data = readFileSync(new URL("./data.js", import.meta.url), "utf8");
const urls = [...new Set([...data.matchAll(/docs:\s*"([^"]+)"/g)].map(m => m[1]))];
const dead = [], warn = [];

await Promise.all(urls.map(async url => {
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) api-library-check" }
    });
    if (res.status === 404 || res.status === 410) dead.push(`${res.status} ${url}`);
    else if (res.status >= 500) warn.push(`${res.status} ${url}`);
  } catch (e) {
    dead.push(`ERR(${e.cause?.code || e.name}) ${url}`);
  }
}));

console.log(`checked ${urls.length} docs URLs`);
if (warn.length) { console.log("WARN (5xx, likely transient):"); warn.forEach(u => console.log("  " + u)); }
if (dead.length) { console.log("DEAD:"); dead.forEach(u => console.log("  " + u)); process.exit(1); }
console.log("all alive");
