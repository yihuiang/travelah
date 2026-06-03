# Travelah NLP — place extraction

Extracts place names from cleaned posts using [spaCy](https://spacy.io/) + RedNote rules (`📍`, address patterns).

## Setup (once)

```bash
cd nlp
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r requirements.txt
python -m spacy download zh_core_web_sm
```

## Run

```bash
cd nlp
.venv\Scripts\activate
python extract_places.py              # all posts
python extract_places.py --limit 50   # quick test
```

**Output:** `server/data/places.json` + `places-extract-stats.json`

**Next:** `cd server && npm run seed:places` (when added) → MongoDB `travelah.places`
