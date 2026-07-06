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


// Hand-curated India additions (global lists are West-heavy; user demand 2026-07-07)
const INDIA_EXTRA = [
  ["API Setu","https://apisetu.gov.in","Government of India API marketplace — 1,000+ APIs: KYC, transport, education, health","key","free"],
  ["Bhashini","https://bhashini.gov.in","GoI language AI — translation, TTS, ASR across 22 Indian languages","key","free"],
  ["CoWIN Public API","https://www.cowin.gov.in","Vaccination centers, slots and certificates (public endpoints)","none","free"],
  ["ABDM Sandbox","https://sandbox.abdm.gov.in","Ayushman Bharat Digital Mission — health ID, records, registries","key","free"],
  ["Bhuvan (ISRO)","https://bhuvan.nrsc.gov.in","ISRO geoportal — satellite imagery, thematic maps, geoprocessing APIs","key","free"],
  ["GST e-Invoice Sandbox","https://einv-apisandbox.nic.in","NIC e-invoicing APIs — IRN generation, e-way bills (sandbox)","key","free"],
  ["Zerodha Kite Connect","https://kite.trade","Trading API — orders, portfolio, live market data (free for personal use)","key","freemium"],
  ["Upstox API","https://upstox.com/developer/","Free trading + market data API with websockets","key","free"],
  ["Angel One SmartAPI","https://smartapi.angelbroking.com","Free trading API — equities, F&O, live feeds","key","free"],
  ["DhanHQ API","https://dhanhq.co","Free trading API for equities, F&O with live market feed","key","free"],
  ["Fyers API","https://myapi.fyers.in","Trading + historical data API, free for Fyers users","key","free"],
  ["Instamojo","https://docs.instamojo.com","Payment links + gateway for Indian SMBs (fees per txn)","key","freemium"],
  ["PayU India","https://docs.payu.in","Payment gateway — cards, UPI, netbanking, EMI (fees per txn)","key","freemium"],
  ["PhonePe PG","https://developer.phonepe.com","PhonePe payment gateway + UPI intent APIs (fees per txn)","key","freemium"],
  ["Paytm Payments","https://developer.paytm.com","Paytm gateway, payouts, subscriptions (fees per txn)","key","freemium"],
  ["Juspay","https://juspay.io","Enterprise payment orchestration + UPI infra (HyperSDK)","key","paid"],
  ["Surepass","https://surepass.io","KYC/verification APIs — Aadhaar, PAN, GST, DL, bank account","key","paid"],
  ["IDfy","https://www.idfy.com","Identity verification + background checks APIs","key","paid"],
  ["Digio","https://www.digio.in","eSign, eStamp, eNACH mandates and digital KYC","key","paid"],
  ["Sarvam AI","https://docs.sarvam.ai","Indian LLMs + speech APIs — Indic languages, free credits to start","key","freemium"],
  ["Krutrim Cloud","https://cloud.olakrutrim.com","Ola's Indian LLM + GPU cloud APIs","key","freemium"],
  ["AI4Bharat","https://ai4bharat.iitm.ac.in","Open Indic AI — IndicTrans translation, IndicWhisper ASR models & APIs","none","free"],
  ["Reverie","https://revup.reverieinc.com","Indian language APIs — translation, transliteration, TTS, ASR","key","freemium"],
  ["Ola Maps","https://maps.olakrutrim.com","India-first maps — geocoding, routing, tiles (free tier)","key","freemium"],
  ["Roanuz Cricket","https://www.cricketapi.com","Ball-by-ball cricket data — IPL, international, fantasy points","key","freemium"],
  ["CricketData.org","https://cricketdata.org","Free cricket API — 100 req/day free tier, live scores","key","freemium"],
  ["EntitySport","https://www.entitysport.com","Cricket, kabaddi and football data APIs for Indian sports","key","paid"],
  ["Prokerala APIs","https://api.prokerala.com","Panchang, horoscope, muhurat, pincode and calendar APIs","key","freemium"],
  ["Shiprocket","https://apidocs.shiprocket.in","Shipping aggregator API — 25+ couriers, COD, tracking","key","freemium"],
  ["Delhivery","https://www.delhivery.com","Logistics APIs — shipment creation, tracking, serviceability (B2B)","key","paid"],
  ["Flipkart Seller API","https://seller.flipkart.com/api-docs","Marketplace seller APIs — listings, orders, returns","key","freemium"],
  ["eRail API","https://api.erail.in","Indian Railways — trains between stations, live status, PNR","key","free"],
  ["Indian Rail API","https://indianrailapi.com","Train schedules, live running status, seat availability, PNR status","key","freemium"],
  ["AadhaarAPI","https://aadhaarapi.com","Aadhaar-based eKYC, offline KYC and verification APIs","key","paid"]
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

let inAdded = 0;
for (const [n, u, d, a, t] of INDIA_EXTRA) {
  const hk = host(u), nk = n.toLowerCase();
  if (seenName.has(nk) || (hk && seenHost.has(hk))) { dupes++; continue; }
  seenName.add(nk); if (hk) seenHost.add(hk);
  rows.push({ n, u, d, a, h: u.startsWith("https"), c: "unknown", cat: "India", s: "in", t, tc: "h", ind: 1 });
  inAdded++;
}
console.log(`in (India extra): +${inAdded}`);

// permanent India tagging — survives rebuilds
const IN_RX = /india|indian|aadhaar|upi|ifsc|pincode|bhagavad|hindi|bollywood|isro|vedic|konkan|panchang|nse|railways?.*india|erail/i;
let tagged = 0;
for (const r of rows) if (!r.ind && IN_RX.test(r.n + " " + r.d + " " + r.u)) { r.ind = 1; tagged++; }
console.log(`india regex-tagged: +${tagged} (total ind: ${rows.filter(r => r.ind).length})`);

writeFileSync(new URL("./catalog.js", import.meta.url),
  "// Extended catalog — merged from public-apis, marcelscruz/public-apis, public-api-lists, n0shake (all MIT/CC, raw-fetched).\n" +
  "// Regenerate: node parse-catalog.mjs\n" +
  "const CATALOG = " + JSON.stringify(rows) + ";\n");
console.log(`catalog: ${rows.length} entries, ${[...new Set(rows.map(r => r.cat))].length} categories, ${dupes} deduped, untiered=${rows.filter(r => !r.t).length}`);
