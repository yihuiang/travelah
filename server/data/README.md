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
  trending.json    ← ALL platforms merged (API uses this)
  trending-locales.json
  import-stats.json
```

## Adding more RedNote CSVs

1. Put new file in `MediaCrawler/data/xhs/csv/`
2. Add path to `DEFAULT_BATCHES` in `import-trending.mjs`, **or** run:
   ```bash
   node scripts/import-trending.mjs path/to/new_batch.csv
   ```
3. Run `npm run import:trending` — all batches merge into **`platforms/xhs.json`**, then into **`trending.json`**.

Duplicates across batches are removed by `platform` + `note_id`.

## Adding another platform (TikTok, etc.)

1. Add crawler CSV for that platform
2. Create an import script (copy `import-trending.mjs`, use dy adapter when ready)
3. Write **`platforms/dy.json`**
4. Re-run import or a merge step — **`trending.json`** picks up every `platforms/*.json` automatically

Each post includes `sourceLabel` and `sourceIcon` for the Explore UI.
