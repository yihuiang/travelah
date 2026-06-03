# Travelah data folder

## Why CSV becomes JSON?

| Format | Who uses it | Why |
|--------|-------------|-----|
| **CSV** | MediaCrawler export | Raw scrape, easy to inspect in Excel |
| **JSON** | Travelah API + website | Fast to load in Node, nested fields, no SQL yet |

The import script **reads CSV → cleans → writes JSON**. The website never reads CSV directly.

## Where is cleaning done?

All cleaning logic lives in:

- **`server/scripts/lib/xhs-pipeline.mjs`** — RedNote rules (text, likes, dedupe, state, categories)
- **`server/scripts/import-trending.mjs`** — runs cleaning on each CSV batch, then saves files

## File layout

```
data/
  platforms/
    xhs.json       ← RedNote only (malaysia + penang + future xhs CSVs merged here)
    dy.json        ← TikTok (add when you have dy CSV + import script)
  merged-data.json ← ALL platforms merged (API uses this)
  trending-locales.json
  import-stats.json
```

## Adding more RedNote CSVs

1. Put new file in `MediaCrawler/data/xhs/csv/`
2. Add path to `DEFAULT_BATCHES` in `import-trending.mjs`, **or** run:
   ```bash
   node scripts/import-trending.mjs path/to/new_batch.csv
   ```
3. Run `npm run import:trending` — all batches merge into **`platforms/xhs.json`**, then into **`merged-data.json`**.

Duplicates across batches are removed by `platform` + `note_id`.

## Adding another platform (TikTok, etc.)

1. Add crawler CSV for that platform
2. Create an import script (copy `import-trending.mjs`, use dy adapter when ready)
3. Write **`platforms/dy.json`**
4. Re-run import or a merge step — **`merged-data.json`** picks up every `platforms/*.json` automatically

Each post includes `sourceLabel` and `sourceIcon` for the Explore UI.

## MongoDB

After import, load data into local MongoDB (Compass: `mongodb://127.0.0.1:27017`):

```bash
cd server
npm run seed:mongodb
```

Creates database **`travelah`**, collection **`posts`**. The API reads MongoDB first, falls back to `merged-data.json` if Mongo is down.

### Users (profiles)

```bash
npm run seed:users
```

Creates collection **`users`** from `users.seed.json`. Passwords are **hashed** in MongoDB (`passwordHash` only — never plain text).

| Field | Description |
|-------|-------------|
| `_id` | Custom string ID (`U01`, `U02`, …) — MongoDB primary key |
| `username` | Unique login name (lowercase) |
| `passwordHash` | bcrypt hash (set via seed or register) |
| `email` | Optional, unique |
| `displayName` | Shown on profile page |
| `avatarUrl` | Profile image URL |
| `memberSince` | Account start date |
| `preferences` | `{ pace, focus, dining }` |
| `settings` | `{ language, currency }` |
| `savedItineraries` | Array of saved trip cards |

Demo account after seed: **username** `esterling` / **password** `travelah123`

API:

- `POST /api/auth/register` — create account
- `POST /api/auth/login` — returns `{ user, token }`
- `GET /api/profile/:username` — public profile (no password)
- `GET /api/profile/me` — requires `Authorization: Bearer <token>`

### Places (NLP)

```bash
cd nlp
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download zh_core_web_sm
python extract_places.py
cd ../server
npm run seed:places
```

Creates **`places.json`** and collection **`travelah.places`** (`P01`, `P02`, …).

| Field | Description |
|-------|-------------|
| `_id` | Place ID (`P01`, …) |
| `name` | Extracted place name |
| `state` | Most common state from linked posts |
| `categories` | Merged from related posts |
| `totalLikes` | Sum of linked posts' `likesScore` |
| `postCount` / `postIds` | Related posts for detail page |
| `coverImage` | Image from highest-liked related post |
