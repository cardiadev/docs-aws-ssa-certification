/**
 * KK Transcript Extractor
 * ------------------------
 * Fetches the course structure, resolves each lesson's Vimeo video, pulls
 * the English caption VTT file via the Vimeo player config API, and saves
 * everything as JSON and/or Markdown.
 *
 * Pipeline:
 *   1. GET /api/courses/{slug}                        → module/lesson list
 *   2. GET /api/lessons/{id}?course={slug}            → video_url (Vimeo)
 *   3. GET player.vimeo.com/video/{vimeoId}/config    → VTT caption URL
 *   4. GET captions.vimeo.com/…                       → VTT content
 *   5. Parse VTT → plain text
 *
 * Usage:
 *   bun run transcripts                 process all, skip already-downloaded
 *   bun run transcripts -- 135           only lesson #135 (prompts if exists)
 *   bun run transcripts -- 10-50         lessons 10 through 50 (skip existing)
 *   bun run transcripts -- --force       re-download and overwrite all files
 *   bun run transcripts -- 135 --force   force-overwrite a single lesson
 *   DRY_RUN=1 bun run transcripts        list lessons, no downloads
 *
 * Configure via scripts/.env (copy from scripts/.env.example):
 *   KK_TOKEN          — required, Bearer token from browser DevTools
 *   KK_API_URL        — required, base API URL
 *   KK_SITE_URL       — required, site origin URL (used for auth headers)
 *   COURSE_SLUG       — defaults to "aws-solutions-architect-associate-certification"
 *   OUTPUT_DIR        — defaults to "scripts/output"
 *   OUTPUT_FORMAT     — "json" | "md" | "both" (default: "both")
 *   DRY_RUN           — "1" to list lessons only, no downloads
 */

import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

// ── Types ─────────────────────────────────────────────────────────────────────

interface LessonEntry {
  sectionTitle: string;
  lessonTitle: string;
  moduleId: string;
  lessonId: string;
}

interface TranscriptResult {
  index: number;
  section: string;
  lesson: string;
  moduleId: string;
  lessonId: string;
  vimeoId: string | null;
  transcript: string | null;
}

interface LessonRange { from: number; to: number }

interface VimeoTextTrack {
  id: number;
  lang: string;
  url: string;
  kind: string;
  label: string;
  default?: boolean;
}

interface VimeoConfig {
  request?: {
    text_tracks?: VimeoTextTrack[];
  };
}

// ── CLI args ─────────────────────────────────────────────────────────────────

const cliArgs   = process.argv.slice(2);
const FORCE     = cliArgs.includes('--force');
const lessonArg = cliArgs.find((a) => !a.startsWith('-'));

function parseLessonArg(arg?: string): LessonRange | null {
  if (!arg) return null;
  const range = arg.match(/^(\d+)-(\d+)$/);
  if (range) return { from: Number(range[1]), to: Number(range[2]) };
  const single = arg.match(/^(\d+)$/);
  if (single) { const n = Number(single[1]); return { from: n, to: n }; }
  console.error(`❌  Invalid lesson filter: "${arg}". Use a number (135) or range (10-50).`);
  process.exit(1);
}

const LESSON_FILTER = parseLessonArg(lessonArg);
const IS_SINGLE     = LESSON_FILTER !== null && LESSON_FILTER.from === LESSON_FILTER.to;

// ── Config ────────────────────────────────────────────────────────────────────

const TOKEN         = Bun.env.KK_TOKEN!;
const BASE_API      = Bun.env.KK_API_URL!;
const SITE_URL      = Bun.env.KK_SITE_URL!;
const COURSE_SLUG   = Bun.env.COURSE_SLUG   ?? 'aws-solutions-architect-associate-certification';
const OUTPUT_DIR    = join(import.meta.dir, '..', Bun.env.OUTPUT_DIR ?? 'scripts/output');
const FORMAT        = Bun.env.OUTPUT_FORMAT ?? 'both';
const DRY_RUN       = Bun.env.DRY_RUN === '1';
const DELAY_MS      = 400;

const missingVars = ['KK_TOKEN', 'KK_API_URL', 'KK_SITE_URL'].filter((k) => !Bun.env[k]);
if (missingVars.length) {
  console.error(`❌  Missing required env vars: ${missingVars.join(', ')}`);
  console.error('    Add them to scripts/.env (see scripts/.env.example)\n');
  process.exit(1);
}

// ── HTTP helpers ──────────────────────────────────────────────────────────────

const kkHeaders: HeadersInit = {
  accept: 'application/json, text/plain, */*',
  authorization: `Bearer ${TOKEN}`,
  origin: SITE_URL,
  referer: `${SITE_URL}/user/courses/${COURSE_SLUG}`,
  'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
};

// Vimeo player config — must look like it's coming from an embedded player
const vimeoHeaders: HeadersInit = {
  accept: 'application/json, text/html, */*',
  referer: `${SITE_URL}/`,
  origin: SITE_URL,
  'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
};

async function fetchJSON<T>(url: string, headers: HeadersInit): Promise<T> {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
  return res.json() as Promise<T>;
}

async function fetchText(url: string, headers?: HeadersInit): Promise<string> {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
  return res.text();
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function lessonFileName(index: number, sectionTitle: string, lessonTitle: string, lessonId: string): string {
  return `${String(index).padStart(3, '0')}-${slugify(sectionTitle)}-${slugify(lessonTitle)}-${lessonId}.json`;
}

// ── VTT parser ────────────────────────────────────────────────────────────────

/**
 * Parse a WebVTT string into plain text, removing timecodes and tags,
 * deduplicating consecutive repeated lines, and collapsing whitespace.
 */
function parseVTT(vtt: string): string {
  const lines = vtt.split('\n');
  const textLines: string[] = [];
  const tagRe = /<[^>]+>/g;

  let inCue = false;
  for (const raw of lines) {
    const line = raw.trim();
    // Blank lines or known header tokens reset cue state
    if (!line || line === 'WEBVTT' || line.startsWith('NOTE') || line.startsWith('STYLE')) {
      inCue = false;
      continue;
    }
    // Timecode line — any line containing ' --> '
    if (line.includes(' --> ')) {
      inCue = true;
      continue;
    }
    // Skip anything before the first cue (identifiers, metadata)
    if (!inCue) continue;

    const text = line.replace(tagRe, '').trim();
    if (text) textLines.push(text);
  }

  // Deduplicate consecutive identical lines (VTT often repeats for overlap regions)
  const deduped = textLines.filter((l, i) => l !== textLines[i - 1]);
  return deduped.join(' ').replace(/\s{2,}/g, ' ').trim();
}

// ── Vimeo helpers ─────────────────────────────────────────────────────────────

function extractVimeoId(url: string): string | null {
  // Handles: https://vimeo.com/12345678?share=copy  or  https://player.vimeo.com/video/12345678
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1] : null;
}

async function getVimeoTranscript(vimeoId: string): Promise<string | null> {
  const configUrl = `https://player.vimeo.com/video/${vimeoId}/config`;
  let config: VimeoConfig;
  try {
    config = await fetchJSON<VimeoConfig>(configUrl, vimeoHeaders);
  } catch {
    return null;
  }

  const tracks = config?.request?.text_tracks;
  if (!tracks?.length) return null;

  // Prefer English, then the default track, then the first one
  const track =
    tracks.find((t) => t.lang === 'en-US' || t.lang === 'en') ??
    tracks.find((t) => t.default) ??
    tracks[0];

  if (!track?.url) return null;

  try {
    const vtt = await fetchText(track.url);
    return parseVTT(vtt);
  } catch {
    return null;
  }
}

// ── Course helpers ────────────────────────────────────────────────────────────

function flattenLessons(course: unknown): LessonEntry[] {
  const results: LessonEntry[] = [];
  const c = course as Record<string, unknown>;

  const topLevel =
    (c.modules ??
     c.sections ??
     (c.data as Record<string, unknown>)?.modules ??
     []) as Record<string, unknown>[];

  for (const section of topLevel) {
    const sectionTitle = (section.title ?? section.name ?? 'Untitled Section') as string;
    const moduleId     = (section.id ?? section._id ?? '') as string;
    const lessons      = (section.lessons ?? section.topics ?? []) as Record<string, unknown>[];

    for (const lesson of lessons) {
      const lessonTitle = (lesson.title ?? lesson.name ?? 'Untitled Lesson') as string;
      const lessonId    = (lesson.id ?? lesson._id ?? '') as string;
      const type        = (lesson.type ?? '') as string;

      if (/video/i.test(type) && lessonId) {
        results.push({ sectionTitle, lessonTitle, moduleId, lessonId });
      }
    }
  }
  return results;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const LESSONS_DIR = join(OUTPUT_DIR, 'lessons');
  await mkdir(LESSONS_DIR, { recursive: true });

  // 1. Fetch course structure
  console.log('\n📚  Fetching course structure …');
  const course = await fetchJSON<unknown>(`${BASE_API}/courses/${COURSE_SLUG}`, kkHeaders);

  await Bun.write(
    join(OUTPUT_DIR, 'course-structure.json'),
    JSON.stringify(course, null, 2),
  );
  console.log(`✅  Course structure saved.`);

  // 2. Flatten video lessons
  const lessons = flattenLessons(course);
  const total   = lessons.length;

  if (LESSON_FILTER) {
    const label = IS_SINGLE ? `#${LESSON_FILTER.from}` : `#${LESSON_FILTER.from}–${LESSON_FILTER.to}`;
    console.log(`\n🎬  Found ${total} lesson(s). Filtering to ${label}.\n`);
  } else {
    console.log(`\n🎬  Found ${total} video lesson(s).\n`);
  }

  if (DRY_RUN) {
    for (let i = 0; i < lessons.length; i++) {
      const num = i + 1;
      if (LESSON_FILTER && (num < LESSON_FILTER.from || num > LESSON_FILTER.to)) continue;
      const l = lessons[i];
      console.log(`  [${num}/${total}] ${l.sectionTitle} › ${l.lessonTitle}`);
    }
    console.log('\nDry-run complete. No transcripts downloaded.');
    return;
  }

  // 3. Process each lesson
  let processed = 0;
  let skipped   = 0;

  for (let i = 0; i < lessons.length; i++) {
    const num = i + 1;

    // Apply lesson number filter
    if (LESSON_FILTER && (num < LESSON_FILTER.from || num > LESSON_FILTER.to)) continue;

    const { sectionTitle, lessonTitle, moduleId, lessonId } = lessons[i];
    const lessonFile = join(LESSONS_DIR, lessonFileName(num, sectionTitle, lessonTitle, lessonId));
    const prefix     = `  [${num}/${total}] ${sectionTitle} › ${lessonTitle}`;

    // Check if already downloaded
    const exists = await Bun.file(lessonFile).exists();
    if (exists && !FORCE) {
      if (IS_SINGLE) {
        // Single lesson: ask interactively
        const answer = prompt(`${prefix}\n  ⚠️  Already downloaded. Override? (y/N) `);
        if (answer?.toLowerCase() !== 'y') {
          console.log(`${prefix} … ⏭️  skipped`);
          skipped++;
          continue;
        }
      } else {
        console.log(`${prefix} … ⏭️  already downloaded`);
        skipped++;
        continue;
      }
    }

    process.stdout.write(`${prefix} … `);

    let vimeoId: string | null    = null;
    let transcript: string | null = null;

    try {
      const detail = await fetchJSON<{ video_url?: string }>(
        `${BASE_API}/lessons/${lessonId}?course=${COURSE_SLUG}`,
        kkHeaders,
      );
      if (detail.video_url) vimeoId = extractVimeoId(detail.video_url);
      if (vimeoId)          transcript = await getVimeoTranscript(vimeoId);
    } catch {
      // Non-fatal — record null
    }

    const result: TranscriptResult = {
      index: num,
      section: sectionTitle,
      lesson: lessonTitle,
      moduleId,
      lessonId,
      vimeoId,
      transcript,
    };

    // Write individual lesson file immediately
    await Bun.write(lessonFile, JSON.stringify(result, null, 2));
    console.log(transcript ? '✅' : `⚠️  no transcript${vimeoId ? '' : ' (no video_url)'}`);
    processed++;

    await sleep(DELAY_MS);
  }

  console.log(`\n  Processed: ${processed}  |  Skipped: ${skipped}\n`);

  // 4. Assemble combined output from ALL downloaded individual files (preserves order)
  const allResults: TranscriptResult[] = [];
  for (let i = 0; i < lessons.length; i++) {
    const { lessonId: lid, sectionTitle: st, lessonTitle: lt } = lessons[i];
    const lessonFile = join(LESSONS_DIR, lessonFileName(i + 1, st, lt, lid));
    if (await Bun.file(lessonFile).exists()) {
      const data = await Bun.file(lessonFile).json<TranscriptResult>();
      allResults.push(data);
    }
  }

  if (allResults.length === 0) {
    console.log('ℹ️  No lessons downloaded yet — skipping combined file generation.\n');
    return;
  }

  if (FORMAT === 'json' || FORMAT === 'both') {
    const outPath = join(OUTPUT_DIR, 'transcripts.json');
    await Bun.write(outPath, JSON.stringify(allResults, null, 2));
    console.log(`📄  JSON → ${outPath}  (${allResults.length}/${total} lessons)`);
  }

  if (FORMAT === 'md' || FORMAT === 'both') {
    let md = `# AWS Solutions Architect Associate — Transcripts\n\n`;
    md += `> Generated ${new Date().toISOString()} — ${allResults.length}/${total} lessons downloaded\n\n`;

    let currentSection = '';
    for (const item of allResults) {
      if (item.section !== currentSection) {
        currentSection = item.section;
        md += `\n## ${currentSection}\n\n`;
      }
      md += `### ${item.lesson}\n\n`;
      md += item.transcript
        ? `${item.transcript.trim()}\n\n`
        : `_Transcript not available._\n\n`;
      md += `---\n\n`;
    }

    const outPath = join(OUTPUT_DIR, 'transcripts.md');
    await Bun.write(outPath, md);
    console.log(`📄  Markdown → ${outPath}`);
  }

  const withTranscript = allResults.filter((r) => r.transcript).length;
  console.log(`\n✨  Done! ${withTranscript}/${allResults.length} downloaded lessons have transcripts.\n`);
}

main().catch((err: Error) => {
  console.error('\n❌  Fatal error:', err.message);
  process.exit(1);
});

