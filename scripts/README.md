# Transcript Extractor

Pulls transcripts from the Learn API and saves them as JSON and/or Markdown.

## Setup

Export your Bearer token (copy it from the `Authorization` header in your browser's DevTools):

```bash
export _TOKEN="eyJhbGci..."
```

## Run

```bash
# Full extraction — JSON + Markdown
node scripts/extract-transcripts.mjs

# Only JSON
OUTPUT_FORMAT=json node scripts/extract-transcripts.mjs

# Only Markdown
OUTPUT_FORMAT=md node scripts/extract-transcripts.mjs

# Dry-run: list all lessons without downloading anything
DRY_RUN=1 node scripts/extract-transcripts.mjs

# Different course slug
COURSE_SLUG=another-course node scripts/extract-transcripts.mjs
```

## Output

| File | Description |
|---|---|
| `scripts/output/course-structure.json` | Raw course API response — inspect this first |
| `scripts/output/transcripts.json` | All transcripts in a structured array |
| `scripts/output/transcripts.md` | All transcripts in readable Markdown |
| `scripts/output/raw-lessons/*.json` | Per-lesson API response when no transcript field was detected |

## How it works

1. `GET /api/courses/{slug}` — fetches the full course tree (sections → lessons).
2. For each video lesson the script tries several API endpoint patterns for the transcript.
3. If the transcript field has an unexpected name or shape, check the files in
   `scripts/output/raw-lessons/` and update the `findTranscript()` function in the script.

## Troubleshooting

**"HTTP 401"** — your token expired. Log in to the platform, open DevTools → Network,
click any API call and copy the fresh `Authorization: Bearer …` header value.

**"0/N lessons have transcripts"** — the transcript is stored under a different key.  
Run once and check `scripts/output/raw-lessons/<lessonId>.json` to see the actual response,
then update the `findTranscript()` function accordingly.
