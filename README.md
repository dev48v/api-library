# 📡 API Library

**5,000+ APIs in one place.** Live: **https://api-library-two.vercel.app** — a single static page, no build step. Sister site of [MCP Directory](https://github.com/dev48v/mcp-directory).

Three layers:

1. **120+ hand-curated APIs** — real free-tier quotas, auth type, country flag, and copy-paste **curl / JS fetch / Python** calls for every one.
2. **2,077-API tiered catalog** — merged from 6 public lists (public-apis, marcelscruz, public-api-lists, n0shake, APIs-guru GraphQL, cheahjs free-LLM); every entry auto-classified free / freemium / paid.
3. **India government directory** — the full [API Setu](https://apisetu.gov.in) catalog: **2,822 publishers · 8,769 APIs**, browsable by Use Case, Organization Type, Category and Location (with state maps), Setu-style faceted filtering.

## What's in a curated card

- **Flag** — company/org HQ country (🌐 = global/community)
- **Auth badge** — no key / API key / basic auth
- **Tier** — 🆓 Free (works at $0) · 🔑 Freemium (free tier, real usage costs) · 💎 Paid
- **🎁 Quota** — the actual free-tier limit (e.g. "100 emails/day")
- **Call it** — working curl / fetch / Python sample with copy buttons

## Categories

AI & LLM · Search & News · Maps & Geo · Weather · Finance & Crypto · Payments · Email & Messaging · Social & Content · Images & Media · Dev & Code · Open Data & Science · Storage & BaaS · Utilities · 🇮🇳 India

## Structure

| File | Purpose |
|---|---|
| `index.html` | The whole site — tabs, search, filters, snippet generator, India gov browser |
| `data.js` | Curated API data (source of truth) |
| `catalog.js` | Extended tiered catalog, generated (~2,077 entries) |
| `india-gov.js` | API Setu government directory (2,822 publishers + state map paths), generated |
| `parse-catalog.mjs` | Rebuilds `catalog.js` from the 6 public lists (raw fetch, no clone) |
| `merge-tiers.mjs` | Merges tier verdicts into `catalog.js` |
| `verify-docs.mjs` | Checks every curated docs link is alive |

## Contributing

New APIs, fixed quotas/links and better descriptions are welcome. See **[CONTRIBUTING.md](CONTRIBUTING.md)** for the entry format and naming rules, then open a PR (one entry per PR). Self-submissions are fine if accurate and format-following. Licensed **MIT** — see [LICENSE](LICENSE).
