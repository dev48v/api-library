# 📡 API Library

A curated library of **120 APIs worth knowing** (+ **1,953-entry tiered catalog** merged from 4 public lists) — real free-tier quotas, auth type, country of origin, and copy-paste **curl / JS fetch / Python** calls for every one.

**Live:** deployed on Vercel · single static page, no build step. Sister site of [MCP Directory](https://github.com/dev48v/mcp-directory).

## What's in a card

- **Flag** — company/org HQ country (🌐 = global/community project)
- **Auth badge** — no key / API key / basic auth
- **Tier** — 🆓 Free (works at $0) · 🔑 Freemium (free tier, real usage costs) · 💎 Paid
- **🎁 Quota** — the actual free-tier limit (e.g. "100 emails/day", "2,500 req/day")
- **Call it** — working sample request in curl, fetch and Python with copy buttons

## Categories

AI & LLM · Search & News · Maps & Geo · Weather · Finance & Crypto · Payments · Email & Messaging · Social & Content · Images & Media · Dev & Code · Open Data & Science · Storage & BaaS · Utilities · 🇮🇳 India

## Structure

| File | Purpose |
|---|---|
| `index.html` | The whole site — tabs, search, filters, snippet generator |
| `data.js` | Curated API data (source of truth) |
| `verify-docs.mjs` | Checks every docs link is alive |
| `catalog.js` | Extended catalog, generated — 1,953 tiered entries |
| `merge-tiers.mjs` | Merges tier verdicts into catalog.js |
| `parse-catalog.mjs` | Rebuilds catalog.js from public-apis README (fetch raw, no clone) |

## Updating

```bash
node verify-docs.mjs   # validate all docs URLs
```

Add an API: append an entry to `APIS` in `data.js` (field comments at the top), run the verify script.

## Submit an API

Open an [issue](../../issues/new) with: name, docs URL, what it does, free-tier quota, auth type, HQ country.
