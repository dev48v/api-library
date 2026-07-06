# Contributing

Thanks for helping grow the API Library! Contributions are welcome — new APIs, corrected quotas, fixed links, or better descriptions.

## How to contribute

1. Fork the repo and create a branch.
2. Add or edit **one entry** in `data.js` (the curated list) — keep the diff small.
3. Open a PR with a short summary of what you added/changed.

## Entry format & naming

Add a new object to the `APIS` array in `data.js`, following this exact shape:

```js
{ id:"uniqueid", n:"Display Name", cat:"ai", cc:"US", tier:"freemium",
  auth:{t:"bearer"}, quota:"Free: 1,000 req/month",
  use:"One clear sentence on what the API does.",
  ep:{m:"GET", u:"https://api.example.com/v1/thing?q=demo"},
  docs:"https://docs.example.com" }
```

**Naming & field rules:**
- `id` — lowercase, no spaces, **unique** across the file (e.g. `openweathermap`).
- `n` — real product name, capitalized normally.
- `cat` — must be an existing key in `CATS` (`ai`, `search`, `geo`, `wx`, `fin`, `pay`, `comm`, `social`, `media`, `dev`, `data`, `store`, `util`, `india`).
- `cc` — ISO-3166 country of the company HQ, or `null` for global/community.
- `tier` — be **honest**: `free` (works at $0), `freemium` (free tier, real use costs), `paid` (no meaningful free tier).
- `auth.t` — `none` · `bearer` · `basic` · `header` (with `k:"Header-Name"`) · `query`.
- `quota` — the real free-tier limit, or "API key required" / "No free tier".
- `use` — one honest sentence. No marketing copy.
- `ep` — a working sample call (`m` method, `u` URL). Use `ep:null` if auth is OAuth/complex.
- `docs` — a live documentation URL (checked by `verify-docs.mjs`).

## Rules

- **No broken or placeholder links** — `docs` must return 200. Run `node verify-docs.mjs`.
- **Be honest about tier and auth.** Don't mark a paid API as free.
- **Self-submissions are allowed** if the entry is accurate, useful, and follows the format above — including unofficial/scraper APIs, as long as `use` states what it is plainly.
- **One entry per PR** keeps review fast.
- Government-of-India APIs are auto-synced from API Setu — no need to add those manually.

## Validate before submitting

```bash
node verify-docs.mjs     # all docs URLs alive
node -e "new Function(require('fs').readFileSync('data.js','utf8'))"   # data.js parses
```
